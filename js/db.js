// Initialise Supabase Client if Config is Valid
let supaClient = null;
if (IS_CLOUD_MODE && window.supabase) {
    try {
        supaClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
    } catch (err) {
        console.error("Supabase Init Failed:", err);
    }
}

const Database = {
    // 1. Submit Report
    submitReport: async (data, files) => {
        if (IS_CLOUD_MODE && supaClient) {
            // A. Supabase Workflow

            // 1. Upload Files
            const uploadedUrls = [];
            for (const file of files) {
                const uniqueName = `${Date.now()}-${file.name}`;
                const { data: uploadData, error } = await supaClient.storage
                    .from(SUPABASE_CONFIG.bucket)
                    .upload(`cases/${uniqueName}`, file);

                if (error) {
                    console.error("Upload Error:", error);
                    continue;
                }

                // Get Public URL
                const { data: urlData } = supaClient.storage
                    .from(SUPABASE_CONFIG.bucket)
                    .getPublicUrl(`cases/${uniqueName}`);

                uploadedUrls.push({
                    name: file.name,
                    type: file.type,
                    data: urlData.publicUrl,
                    note: "Stored in Supabase Cloud"
                });
            }

            // 2. Insert Row
            const dbData = { ...data, files: uploadedUrls };
            const { error: insertError } = await supaClient
                .from(SUPABASE_CONFIG.table)
                .insert([dbData]);

            if (insertError) throw insertError;
            return true;

        } else {
            // B. LocalStorage Workflow
            // Process files to Base64 (simulated in script.js already passed as data/files)
            // But here, 'files' argument is actually raw file objects in cloud mode, but processed objects in local mode.
            // Let's assume 'data.files' already contains processed base64 for local mode.

            const reports = JSON.parse(localStorage.getItem('sheride_reports') || '[]');
            reports.push(data);
            try {
                localStorage.setItem('sheride_reports', JSON.stringify(reports));
                return true;
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    throw new Error("Local Storage Full based on 5MB limit. Please clear checks.");
                }
                throw e;
            }
        }
    },

    // 2. Fetch Reports
    fetchReports: async () => {
        if (IS_CLOUD_MODE && supaClient) {
            const { data, error } = await supaClient
                .from(SUPABASE_CONFIG.table)
                .select('*')
                .order('timestamp', { ascending: false });

            if (error) {
                console.error("Fetch Error:", error);
                return [];
            }
            return data;
        } else {
            return JSON.parse(localStorage.getItem('sheride_reports') || '[]');
        }
    },

    // 3. Update Status
    updateStatus: async (caseID, status) => {
        if (IS_CLOUD_MODE && supaClient) {
            const { error } = await supaClient
                .from(SUPABASE_CONFIG.table)
                .update({ status: status })
                .eq('caseID', caseID);

            if (error) {
                console.error("Update Error:", error);
                return false;
            }
            return true;
        } else {
            const reports = JSON.parse(localStorage.getItem('sheride_reports') || '[]');
            const index = reports.findIndex(r => r.caseID === caseID);
            if (index !== -1) {
                reports[index].status = status;
                localStorage.setItem('sheride_reports', JSON.stringify(reports));
                return true;
            }
            return false;
        }
    },

    // 4. Clear Data
    clearData: async () => {
        if (IS_CLOUD_MODE) {
            alert("Cannot reset Cloud Database from this demo button (Security restriction). Use Supabase Dashboard.");
        } else {
            localStorage.removeItem('sheride_reports');
            alert("Local Demo Data Cleared.");
            location.reload();
        }
    }
};
