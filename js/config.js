// -----------------------------------------------------
// SUPABASE CONFIGURATION
// -----------------------------------------------------
// If you want to use Real Cloud Storage for unlimited Videos:
// 1. Create a project at https://supabase.com
// 2. Paste your project URL and ANON KEY below.
// 3. Create a Storage Bucket named 'evidence'.
// 4. Create a Table named 'reports'.

const SUPABASE_CONFIG = {
    url: "https://tmmiddkngctrbiwijzkj.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtbWlkZGtuZ2N0cmJpd2lqemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMTExMDQsImV4cCI6MjA4NjU4NzEwNH0.pxMoBngtcKsIAWLNOtjUIPwAkfa2Lb50K1Mpm-ADjnE",
    bucket: "evidence",
    table: "reports"
};

// Auto-detect mode
const IS_CLOUD_MODE = SUPABASE_CONFIG.url !== "YOUR_SUPABASE_URL" && SUPABASE_CONFIG.key.length > 20;

if (IS_CLOUD_MODE) {
    console.log("✅ CLOUD MODE ACTIVE: Using Supabase");
} else {
    console.warn("⚠️ DEMO MODE ACTIVE: Using LocalStorage (5MB Limit)");
}
