document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('emergency-container');
    const alertCount = document.getElementById('alert-count');
    const mediaContainer = document.getElementById('evidence-media');
    const detailsContainer = document.getElementById('evidence-details');
    const modal = document.getElementById('evidence-modal');

    // Login Elements
    const loginSection = document.getElementById('police-login');
    const dashboardSection = document.getElementById('police-dashboard');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    let currentCaseID = null;

    // Login Logic
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('police-id').value;
        const pass = document.getElementById('police-pass').value;

        if (id === 'police' && pass === 'secure911') {
            loginSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            loadEmergencies();
            // Start Auto-refresh only after login
            setInterval(loadEmergencies, 5000);
        } else {
            alert('Unauthorized Access. Invalid Credentials.');
        }
    });

    logoutBtn.addEventListener('click', () => {
        dashboardSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        window.location.reload(); // Reset state
    });

    async function loadEmergencies() {
        // Fetch all reports
        const reports = await Database.fetchReports();

        // Filter ONLY active EMG cases
        const emergencies = reports.filter(r =>
            r.caseID && r.caseID.startsWith('EMG') &&
            ['SUBMITTED', 'POLICE_DISPATCHED', 'INVESTIGATING'].includes(r.status)
        );

        alertCount.textContent = emergencies.length;

        if (emergencies.length === 0) {
            container.innerHTML = `
                <div class="glass-panel" style="grid-column: 1/-1; text-align: center; padding: 40px; opacity: 0.5;">
                    <i data-lucide="shield-check" style="width: 48px; height: 48px; color: #00ff00;"></i>
                    <p>No Active Emergencies. All Cleared.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = ''; // Clear

        emergencies.forEach(emg => {
            const card = document.createElement('div');
            card.className = 'glass-panel emergency-card';

            const timeAgo = Math.floor((new Date() - new Date(emg.timestamp)) / 60000); // mins

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <h3 style="margin: 0; color: #ff4d4d;">${emg.caseID}</h3>
                    <span class="pulse-dot"></span>
                </div>
                <div style="font-size: 0.9rem; margin-bottom: 10px; color: #ccc;">
                    <strong>BUS:</strong> ${emg.busNumber}<br>
                    <strong>TYPE:</strong> ${emg.incidentType}<br>
                    <strong>TIME:</strong> ${timeAgo} mins ago
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 5px; border-radius: 4px; font-size: 0.8rem;">
                    ${emg.description || 'No description provided.'}
                </div>
                
                <div class="action-bar">
                    <button class="primary-btn small" onclick="viewEvidence('${emg.caseID}')" style="font-size: 0.8rem; padding: 8px 12px;">
                        <i data-lucide="eye"></i> View Evidence (${emg.fileCount || 0})
                    </button>
                    <button class="danger-btn small" onclick="quickDispatch('${emg.caseID}')" style="font-size: 0.8rem; padding: 8px 12px;">
                        <i data-lucide="radio"></i> Dispatch
                    </button>
                </div>
                <div style="margin-top: 10px; font-weight: bold; color: ${emg.status === 'POLICE_DISPATCHED' ? '#ffff00' : '#ff4d4d'}">
                    STATUS: ${emg.status}
                </div>
            `;

            container.appendChild(card);
        });

        lucide.createIcons();
    }

    // Expose functions globally for HTML onclicks
    window.viewEvidence = async (id) => {
        currentCaseID = id;
        const reports = await Database.fetchReports();
        const report = reports.find(r => r.caseID === id);

        if (!report) return;

        // --- FAKE REPORT ANALYSIS ---
        const submissionTime = new Date(report.timestamp);
        const incidentTime = report.incidentTime ? new Date(report.incidentTime) : submissionTime;
        const timeDiffMins = Math.abs((submissionTime - incidentTime) / 60000);

        let trustScore = 100;
        let warnings = [];

        // 1. Time Check
        if (incidentTime > new Date(submissionTime.getTime() + 60000)) { // Future event? (allow 1 min drift)
            trustScore -= 50;
            warnings.push("Incident time is in the future.");
        } else if (timeDiffMins > 24 * 60) {
            trustScore -= 10;
            warnings.push("Delayed reporting (>24h).");
        }

        // 2. Evidence Check
        if (!report.files || report.files.length === 0) {
            trustScore -= 30;
            warnings.push("No visual evidence provided.");
        }

        // 3. Description Check
        if (report.description.length < 10) {
            trustScore -= 20;
            warnings.push("Description lacks detail.");
        }

        // 4. Spam Check (Simulated: check if same bus reported < 10 mins ago by anyone)
        const recentReports = reports.filter(r =>
            r.busNumber === report.busNumber &&
            r.caseID !== report.caseID &&
            Math.abs((new Date(r.timestamp) - submissionTime) / 60000) < 10
        );
        if (recentReports.length > 2) {
            // Could be mass reporting (good) or spam attack (bad). 
            // Context differs, but let's flag high volume.
            warnings.push(`High volume alerts for bus ${report.busNumber}.`);
        }

        let trustLevel = "HIGH";
        let trustColor = "#2ecc71"; // green
        if (trustScore < 70) { trustLevel = "MEDIUM"; trustColor = "#f1c40f"; }
        if (trustScore < 40) { trustLevel = "LOW - SUSPICIOUS"; trustColor = "#ff4d4d"; }

        // Populate details with Analysis
        detailsContainer.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
                <h3>INCIDENT DETAILS</h3>
                <div style="text-align:right; border: 1px solid ${trustColor}; padding: 5px 10px; border-radius: 4px;">
                    <small style="color:${trustColor}">CREDIBILITY SCORE</small><br>
                    <strong style="color:${trustColor}; font-size: 1.2rem;">${trustScore}% (${trustLevel})</strong>
                </div>
            </div>
            
            ${warnings.length > 0 ? `<div style="background: rgba(255,0,0,0.1); padding: 10px; margin: 10px 0; border-left: 3px solid red; font-size: 0.9rem; color: #ffaaa5;">⚠️ <strong>Analysis Flags:</strong><br>${warnings.join('<br>')}</div>` : ''}

            <p><strong>CASE ID:</strong> ${report.caseID}</p>
            <p><strong>BUS:</strong> ${report.busNumber}</p>
            <p><strong>TYPE:</strong> ${report.incidentType}</p>
            <p><strong>INCIDENT TIME:</strong> ${incidentTime.toLocaleString()}</p>
            <p><strong>REPORTED:</strong> ${submissionTime.toLocaleString()}</p>
            <p><strong>DESC:</strong> ${report.description}</p>
        `;

        // Populate Media
        mediaContainer.innerHTML = '';
        if (report.files && report.files.length > 0) {
            report.files.forEach(file => {
                const div = document.createElement('div');
                div.style.marginBottom = '20px';

                if (file.data) {
                    // Render Image
                    if (file.type.startsWith('image/')) {
                        div.innerHTML = `
                            <strong>${file.name}</strong><br>
                            <img src="${file.data}" style="max-width: 100%; border: 1px solid #555; margin-top: 5px; border-radius: 4px;">
                        `;
                    }
                    // Render Video (Playable)
                    else if (file.type.startsWith('video/')) {
                        div.innerHTML = `
                            <strong>${file.name}</strong><br>
                            <video controls style="width: 100%; max-height: 400px; border: 1px solid #555; margin-top: 5px; border-radius: 4px; background: #000;">
                                <source src="${file.data}" type="${file.type}">
                                Your browser does not support the video tag.
                            </video>
                            <div style="font-size: 0.8rem; margin-top: 5px;">
                                <span style="color: #ffcc00;"><i data-lucide="clock"></i> Incident Time: ${incidentTime.toLocaleString()}</span>
                                <span style="float: right;"><a href="${file.data}" download="${file.name}" style="color: #ccc; text-decoration: underline;">Download Video</a></span>
                            </div>
                        `;
                    }
                    // Render Audio (Playable)
                    else if (file.type.startsWith('audio/')) {
                        div.innerHTML = `
                            <strong>${file.name}</strong><br>
                            <audio controls style="width: 100%; margin-top: 5px;">
                                <source src="${file.data}" type="${file.type}">
                                Your browser does not support the audio element.
                            </audio>
                            <div style="font-size: 0.8rem; color: #ffcc00; margin-top: 5px;">
                                <i data-lucide="clock"></i> Incident Time Stamp: ${incidentTime.toLocaleString()}
                            </div>
                        `;
                    }
                    else {
                        // fallback
                        div.innerHTML = `
                            <strong>${file.name}</strong><br>
                            <a href="${file.data}" download="${file.name}" style="color: #ff4d4d; text-decoration: underline;">Download File</a>
                        `;
                    }
                } else {
                    // No data (too large)
                    div.innerHTML = `
                        <strong>${file.name}</strong><br>
                        <span style="color: #888; font-style: italic;">${file.note || 'File not available in demo previews'}</span>
                    `;
                }
                mediaContainer.appendChild(div);
            });
        } else {
            mediaContainer.innerHTML = '<p style="color: #888;">No evidence media attached.</p>';
        }

        modal.classList.remove('hidden');
    };

    window.updateStatus = async (status) => {
        if (!currentCaseID) return;

        const success = await Database.updateStatus(currentCaseID, status);

        if (success) {
            alert(`Case ${currentCaseID} Updated: ${status}`);
            modal.classList.add('hidden');
            loadEmergencies(); // Refresh grid
        }
    };

    window.quickDispatch = async (id) => {
        currentCaseID = id; // Set context
        await updateStatus('POLICE_DISPATCHED');
    };

    // Initial Load - Removed, handled by Login now
});
