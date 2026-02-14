document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const sections = {
        landing: document.getElementById('landing-page'),
        screening: document.getElementById('screening-step'),
        form: document.getElementById('complaint-form-step'),
        emergency: document.getElementById('emergency-check-step'),
        confirmation: document.getElementById('confirmation-step'),
        police: document.getElementById('police-alert-step')
    };

    const buttons = {
        start: document.getElementById('start-report-btn'),
        screenYes: document.getElementById('screening-yes-btn'),
        screenNo: document.getElementById('screening-no-btn'),
        emergencyYes: document.getElementById('emergency-yes-btn'),
        emergencyNo: document.getElementById('emergency-no-btn'),
        home: document.getElementById('home-btn'),
        home2: document.getElementById('home-btn-2')
    };

    const form = document.getElementById('report-form');
    const fileInput = document.getElementById('evidence-upload');
    // Ensure we are selecting the hidden input inside the label if the ID is on the label (it's not, based on index.html)
    // ID evidence-upload is on the input itself. Correct.
    const fileListDisplay = document.getElementById('file-list');

    // State
    let reportData = {};

    // Navigation Helper
    function showSection(sectionId) {
        Object.values(sections).forEach(sec => {
            sec.classList.remove('active');
            sec.classList.add('hidden');
        });
        sections[sectionId].classList.remove('hidden');
        // Trigger reflow for animation
        void sections[sectionId].offsetWidth;
        sections[sectionId].classList.add('active');
    }

    // Event Listeners

    // 1. Landing -> Screening
    buttons.start.addEventListener('click', () => {
        showSection('screening');
    });

    // 2. Screening Logic
    buttons.screenYes.addEventListener('click', () => {
        showSection('form');
    });

    buttons.screenNo.addEventListener('click', () => {
        alert("This portal is dedicated to harassment reporting. For other inquiries, please visit the main transport website.");
        location.reload();
    });

    // 3. File Upload Handling
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        let valid = true;
        // Limit: 50MB for Cloud Mode, 2.5MB for Demo Mode
        const limit = (typeof IS_CLOUD_MODE !== 'undefined' && IS_CLOUD_MODE) ? 50000000 : 2500000;
        const msg = (typeof IS_CLOUD_MODE !== 'undefined' && IS_CLOUD_MODE) ? "50MB (Cloud)" : "2.5MB (Demo)";

        if (files.length > 0) {
            for (let f of files) {
                if (f.size > limit) {
                    alert(`File "${f.name}" is too large for this mode (${(f.size / 1000000).toFixed(1)}MB). Limit is ${msg}.`);
                    fileInput.value = ""; // Clear
                    fileListDisplay.innerHTML = "";
                    valid = false;
                    break;
                }
            }
            if (valid) {
                fileListDisplay.innerHTML = `<p style="margin-top: 10px; color: var(--secondary);">${files.length} file(s) ready</p>`;

                // Auto-detect Incident Time from File Metadata
                try {
                    const lastMod = files[0].lastModified;
                    if (lastMod) {
                        const fileDate = new Date(lastMod);
                        // Adjust to local timezone string for input
                        fileDate.setMinutes(fileDate.getMinutes() - fileDate.getTimezoneOffset());
                        const timeString = fileDate.toISOString().slice(0, 16);

                        const timeInput = document.getElementById('incident-time');
                        if (timeInput) {
                            timeInput.value = timeString;
                            // Add a small visual cue
                            const label = document.querySelector('label[for="incident-time"]');
                            if (label) label.innerHTML = `Time of Incident <span style="color:var(--primary); font-size:0.8em;">(Auto-set from video)</span>`;
                            console.log(`[Auto-Sync] Time set to ${timeString}`);
                        }
                    }
                } catch (err) {
                    console.log("Could not extract date from file", err);
                }
            }
        }
    });

    // 4. Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const files = fileInput.files;
        const processedFiles = [];

        // Convert files to Base64 for demo persistence
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Limit increased to 3MB for short video demos (Warning: LocalStorage has ~5MB total limit usually)
                if ((file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) && file.size < 3000000) {
                    try {
                        const base64 = await readFileAsBase64(file);
                        processedFiles.push({
                            name: file.name,
                            type: file.type,
                            data: base64
                        });
                    } catch (err) {
                        console.error("File processing failed", err);
                    }
                } else {
                    processedFiles.push({
                        name: file.name,
                        type: file.type,
                        data: null, // Too large or not image
                        note: "File stored on secure server (Preview unavailable in demo)"
                    });
                }
            }
        }

        // Collect Data
        reportData = {
            busNumber: document.getElementById('bus-number').value,
            incidentType: document.getElementById('incident-type').value,
            incidentTime: document.getElementById('incident-time').value,
            description: document.getElementById('description').value,
            timestamp: new Date().toISOString(),
            files: processedFiles,
            fileCount: files.length
        };

        console.log("Form Data Captured:", reportData);

        // Move to Emergency Check
        showSection('emergency');
    });

    // Auto-fill time on load
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const timeString = now.toISOString().slice(0, 16);
    const incidentTimeInput = document.getElementById('incident-time');
    if (incidentTimeInput) incidentTimeInput.value = timeString;

    // 5. Emergency Check Logic

    // CASE A: EMERGENCY
    buttons.emergencyYes.addEventListener('click', () => {
        // Simulate Police Alert
        const caseID = generateCaseID('EMG');
        saveReport({ ...reportData, status: 'POLICE_DISPATCHED', caseID });

        document.getElementById('emergency-id-display').textContent = caseID;
        showSection('police');

        // Simulate backend API call
        console.log(`[SYSTEM] POLICE ALERT TRIGGERED FOR CASE ${caseID}`);
    });

    // CASE B: STANDARD REPORT
    buttons.emergencyNo.addEventListener('click', () => {
        // Standard Submission
        const caseID = generateCaseID('RPT');
        saveReport({ ...reportData, status: 'SUBMITTED', caseID });

        document.getElementById('case-id-display').textContent = caseID;
        showSection('confirmation');

        // Simulate backend API call
        console.log(`[SYSTEM] Report submitted to Authorities. Case ${caseID}`);
    });

    // Return Home
    [buttons.home, buttons.home2].forEach(btn => {
        btn.addEventListener('click', () => {
            location.reload();
        });
    });

    // Helpers
    function generateCaseID(prefix) {
        const random = Math.random().toString(36).substr(2, 6).toUpperCase();
        const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        return `${prefix}-${date}-${random}`;
    }

    async function saveReport(data) {
        // Use Abstraction Layer (Supabase OR LocalStorage)
        // We pass the RAW fileInput files if needed for cloud upload, but in this demo flow
        // we've already seemingly processed them. For Supabase, we need the raw files.
        // Let's attach the raw files to the data object temporarily for the DB layer to handle if needed.

        try {
            const rawFiles = fileInput.files;
            await Database.submitReport(data, rawFiles);

            // Success UI handled by caller usually, but here we just log
            // console.log("Report Saved via DB Layer");
        } catch (e) {
            console.error("Save Failed:", e);
            alert("Error Saving Report: " + e.message);
        }
    }

    // Auto-init icons if added dynamically (though mostly static here)
    if (window.lucide) {
        lucide.createIcons();
    }
});

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
