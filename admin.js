document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const loginSection = document.getElementById('admin-login');
    const dashboardSection = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const reportsBody = document.getElementById('reports-body');
    const stats = {
        total: document.getElementById('stat-total'),
        emergency: document.getElementById('stat-emergency'),
        pending: document.getElementById('stat-pending')
    };

    // Modal Elements
    const modal = document.getElementById('report-modal');
    const closeModal = document.getElementById('close-modal');
    const saveChangesBtn = document.getElementById('save-report-changes');
    const modalIds = {
        title: document.getElementById('modal-case-id'),
        status: document.getElementById('modal-status'),
        type: document.getElementById('modal-type'),
        bus: document.getElementById('modal-bus'),
        time: document.getElementById('modal-time'),
        desc: document.getElementById('modal-desc'),
        files: document.getElementById('modal-files')
    };

    let currentIncidentId = null;

    // Database
    async function getReports() {
        return await Database.fetchReports();
    }

    async function saveStatus(id, status) {
        return await Database.updateStatus(id, status);
    }

    // Login Logic
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('admin-id').value;
        const pass = document.getElementById('admin-pass').value;

        if (id === 'admin' && pass === 'admin123') {
            loginSection.classList.remove('active');
            loginSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            dashboardSection.classList.add('active');
            await renderDashboard();
        } else {
            alert('Invalid Credentials. Try admin / admin123');
        }
    });

    logoutBtn.addEventListener('click', () => {
        dashboardSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        loginSection.classList.add('active');
    });

    document.getElementById('reset-db-btn').addEventListener('click', () => {
        if (confirm("Are you sure? This will delete all reports and uploaded files.")) {
            localStorage.removeItem('sheride_reports');
            renderDashboard();
            alert("Database reset.");
        }
    });

    // Dashboard Rendering
    async function renderDashboard(filter = 'all') {
        const reports = await getReports();
        reportsBody.innerHTML = '';

        // Update Stats
        stats.total.textContent = reports.length;
        stats.emergency.textContent = reports.filter(r => r.caseID.startsWith('EMG')).length;
        stats.pending.textContent = reports.filter(r => r.status === 'SUBMITTED').length;

        // Apply Filter
        let filtered = reports;
        if (filter === 'emergency') filtered = reports.filter(r => r.caseID.startsWith('EMG'));
        if (filter === 'pending') filtered = reports.filter(r => r.status === 'SUBMITTED');
        if (filter === 'resolved') filtered = reports.filter(r => ['RESOLVED', 'FALSE_ALARM'].includes(r.status));

        // Render Rows
        filtered.forEach(report => {
            const tr = document.createElement('tr');
            const date = new Date(report.timestamp).toLocaleString();

            let statusClass = 'status-badge';
            if (report.status === 'SUBMITTED') statusClass += ' status-pending';
            if (report.status === 'POLICE_DISPATCHED') statusClass += ' status-emergency';
            if (report.status === 'RESOLVED') statusClass += ' status-resolved';

            tr.innerHTML = `
                <td><strong>${report.caseID}</strong></td>
                <td>${date}</td>
                <td>${report.incidentType}</td>
                <td>${report.busNumber}</td>
                <td><span class="${statusClass}">${report.status}</span></td>
                <td>
                    <button class="view-btn" data-id="${report.caseID}">View</button>
                </td>
            `;
            reportsBody.appendChild(tr);
        });

        // Add Listeners to View Buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => openModal(btn.dataset.id));
        });
    }

    // Modal Logic
    async function openModal(caseId) {
        const reports = await getReports();
        const report = reports.find(r => r.caseID === caseId);
        if (!report) return;

        currentIncidentId = caseId;
        modalIds.title.textContent = `Case #${caseId}`;
        modalIds.status.value = report.status;
        modalIds.type.textContent = report.incidentType || 'N/A';
        modalIds.bus.textContent = report.busNumber || 'N/A';

        const date = new Date(report.timestamp);
        modalIds.time.textContent = date.toLocaleString();

        const incidentTime = report.incidentTime ? new Date(report.incidentTime) : new Date(report.timestamp);

        modalIds.desc.textContent = report.description || 'No description provided.';

        // Populate Media
        modalIds.files.innerHTML = '';
        if (report.files && report.files.length > 0) {
            report.files.forEach(file => {
                const div = document.createElement('div');
                div.style.marginBottom = '20px';
                div.className = 'glass-panel'; // reusing style
                div.style.padding = '10px';

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
                                <span style="color: #ff007a;"><i data-lucide="clock"></i> Incident Time: ${incidentTime.toLocaleString()}</span>
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
                            <div style="font-size: 0.8rem; color: #ff007a; margin-top: 5px;">
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
                    div.innerHTML = `
                        <strong>${file.name}</strong><br>
                        <span style="color: #888; font-style: italic;">${file.note || 'File not available'}</span>
                    `;
                }
                modalIds.files.appendChild(div);
            });
        } else {
            modalIds.files.innerHTML = "No files attached.";
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');

        // Refresh icons inside modal if needed
        if (window.lucide) lucide.createIcons();
    }

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });

    saveChangesBtn.addEventListener('click', async () => {
        const newStatus = modalIds.status.value;
        const success = await saveStatus(currentIncidentId, newStatus);

        if (success) {
            await renderDashboard(); // Re-render table
            modal.classList.add('hidden');
            alert(`Case ${currentIncidentId} updated to ${newStatus}`);
        }
    });

    // Expose filter function globally
    window.filterReports = renderDashboard;
});
