<p align="center">
  <img width="1280" height="640" alt="image" src="https://github.com/user-attachments/assets/c9315342-5337-4c49-8b4e-36baa4ee88b8" />

</p>

# SheRide Safe 🎯

## Basic Details

### Team Name: Queen Bees.

### Team Members
- Member 1: [Anjana VP] - [Kannur University Mangattuparamba Campus]
- Member 2: [Fathimathul Hiba M] - [Kannur University Mangattuparamba Campus]

### Hosted Project Link
[https://fathimathulhiba-m.github.io/SheRide-Safe/]

### Project Description
SheRide Safe is a secure, anonymous digital reporting system designed to combat harassment on public transport. It empowers victims and witnesses to report incidents with verified multimedia evidence and connects them directly to authorities for rapid response.

### The Problem statement
Harassment on public transport often goes unreported due to fear of identity exposure, lack of concrete evidence, and cumbersome reporting processes. Additionally, authorities struggle to prioritize genuine threats amidst false alarms, leading to delayed responses for critical incidents.

### The Solution
We developed a comprehensive web platform that bridges the gap between commuters and the police. SheRide Safe allows users to file verified reports with smart "Fake Report Detection" algorithms. It features a dedicated Police Dashboard that prioritizes emergencies based on credibility scores and analyzes evidence metadata (like video timestamps) to ensure rapid, data-driven action.

---

## Technical Details

### Technologies/Components Used

**For Software:**
- **Languages used:** HTML5, CSS3, JavaScript (Vanilla)
- **Frameworks/Libraries:** Lucide Icons (for UI), Supabase JS Client (for Database & Storage)
- **Backend Infrastructure:** Supabase (PostgreSQL Database, Cloud Storage Buckets)
- **Tools used:** VS Code, Git, Python (for local testing)

---

## Features

- **Anonymous & Verified Reporting:** Users can report incidents without revealing their identity publicly, while the system verifies validity using data heuristics.
- **Smart Evidence Collection:** Supports photo, video, and audio uploads with automatic metadata extraction to sync incident time with video creation time.
- **Fake Report Detection:** AI-simulated logic flags reports with future timestamps, lack of evidence, or suspicious patterns, assigning a "Credibility Score" (High/Medium/Low).
- **Real-Time Police Dispatch:** A dedicated portal for authorities (`police.html`) to view emergency alerts, review evidence instantly without downloading, and dispatch units.

---

## Implementation

### For Software:

#### Installation
```bash
# Clone the repository
git clone https://github.com/your-repo/sheride-safe.git

# Navigate to the directory
cd sheride-safe
```

#### Run
You can run the project locally using a simple HTTP server (Python is recommended for testing):
```bash
# Windows
run_server.bat

# OR using Python manually
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

---

## Project Documentation

### Screenshots

<img width="1918" height="840" alt="Screenshot 2026-02-14 195245" src="https://github.com/user-attachments/assets/6b02c5ae-560d-4afb-a73b-9ed4689ef3de" />

*The landing page provides quick access to emergency reporting.*
<img width="1919" height="834" alt="Screenshot 2026-02-14 195814" src="https://github.com/user-attachments/assets/71b5e84c-ca71-468f-97c8-9fc164464afb" />

*Users can securely upload evidence and input details with auto-synced timestamps.*
<img width="1919" height="833" alt="Screenshot 2026-02-14 200305" src="https://github.com/user-attachments/assets/0db0125e-a573-414a-97ee-f3983fe8f94f" />


*The Police Dispatch Portal showing active emergencies and credibility analysis.*
<img width="1919" height="832" alt="Screenshot 2026-02-14 200528" src="https://github.com/user-attachments/assets/a6aa420f-12bf-44ea-8fac-9e08c8a3eff8" />

### Diagrams

**System Architecture:**
![Architecture Diagram](https://via.placeholder.com/600x400?text=System+Architecture)
*The Frontend (HTML/JS) connects directly to Supabase for secure data and file storage, utilizing distinct logic layers for Users, Admins, and Police.*

---

## Additional Documentation

### API Logic (Database Layer)

The project uses a custom abstraction layer (`db.js`) to handle data interactions, enabling a seamless switch between **Local Demo Mode** and **Cloud Mode**.

**Core Functions:**
- `submitReport(data, files)`: Handles file uploads to Supabase Storage buckets and inserts metadata into the `reports` table.
- `fetchReports()`: Retrieves reports ordered by timestamp for the dashboards.
- `updateStatus(caseID, status)`: Allows authorities to change report states (e.g., INVESTIGATING, RESOLVED).

---

## AI Tools Used

**Tool Used:** Cursor (AI Pair Programmer) & ChatGPT

**Purpose:** 
- Accelerated the development of the "Fake Report Detection" logic.
- Generated the glassmorphism CSS design system.
- Assisted in writing the Supabase SQL setup scripts and Row Level Security policies.

**Key Prompts Used:**
- "Create a JavaScript function to analyze report credibility based on timestamp differences."
- "Write a SQL policy for Supabase that allows anonymous inserts but restricts updates to admins."
- "Refactor the file upload logic to support video metadata extraction."

**Percentage of AI-generated code:** Approximately 40% (Logic acceleration & CSS), 60% (Human Architecture & Business Logic).

---

## Team Contributions

- **Anjana VP:** Designed the User Interface (UI/UX), implemented the Frontend Reporting flow, and created the "SheRide Safe" brand identity.
- **Fathimathul Hiba M:** Developed the Backend Logic (`db.js`, `script.js`), integrated Supabase, and built the Police Dispatch & Admin Portals.

---

## License

This project is licensed under the **MIT License**.

The MIT License is a permissive license that is short and to the point. It lets people do anything they want with your code as long as they provide attribution back to you and don’t hold you liable.

---

Made with ❤️ at TinkerHub
