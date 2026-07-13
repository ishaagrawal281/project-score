# Document Vault (DigiLocker Inspired)

A secure digital document vault inspired by DigiLocker and Google Drive. Users can upload, organize, manage, and securely share documents with expiring links.

## Team Members

### Member 1 (Project Admin)
* **Name:** Aryan Patil
* **Technical strength:** Authentication and cloud storage

### Member 2
* **Name:** Isha Agrawal
* **Technical strength:** DevOps and Frontend (UI)

### Member 3
* **Name:** Gauri Mhetre
* **Technical strength:** Document management

## Working Agreements
* **PR review turnaround:** Within same day
* **How we handle blockers:** Raise in standup immediately
* **Standup format we'll use:** Yesterday / Today / Blockers (each person)
* **Primary team channel:** WhatsApp group
* **One thing our team commits to this sprint:** We will submit our own PR everyday. We will not let any blocker sit for more than one day.

---

# Architecture & Features

This project is built using a modern full-stack web architecture:
1. **Frontend**: React (Vite) SPA styled with Vanilla CSS (implementing modern design variables like soft shadows, glassmorphism, responsive grids, and micro-animations).
2. **Backend**: Node.js + Express.js API server.
3. **Database**: MySQL schema storing User data, Folder trees, File metadata, and Expiring Shared tokens.
4. **Storage**: Direct upload abstraction to Google Cloud Storage, with an **automatic local storage fallback** (`backend/uploads/`) if GCS variables are omitted.

---

# Installation & Local Setup

### Step 1: Database Setup
1. Open your local MySQL CLI or server administration tool (e.g. Workbench).
2. Run the SQL initialization script found in [schema.sql](file:///c:/Users/GAURI/Vault/S116-0726-wipcube-tgnm-digilocker-vault/schema.sql):
   ```sql
   SOURCE c:/Users/GAURI/Vault/S116-0726-wipcube-tgnm-digilocker-vault/schema.sql;
   ```
   *This creates the database `document_vault` and all required tables: `users`, `folders`, `documents`, and `share_links`.*

### Step 2: Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Configure environment variables in `.env` (a pre-filled `.env` file has been created, adjust DB username/password if needed):
   * [backend/.env](file:///c:/Users/GAURI/Vault/S116-0726-wipcube-tgnm-digilocker-vault/backend/.env)
3. Run the development server (runs nodemon on port 5000):
   ```bash
   npm run dev
   ```

### Step 3: Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Start the Vite React development server (runs on port 5173):
   ```bash
   npm run dev
   ```

---

# File Validation Rules

* **Allowed Formats**: `.pdf`, `.jpg`, `.jpeg`, `.png`, `.docx` (checked on both frontend UI drop zones and backend multer validations).
* **Blocked Formats**: `.exe`, `.zip`, `.apk`, `.bat`, `.js` (explicitly rejected).
* **Maximum Size**: 10 MB per file (enforced in frontend indicators and backend size limit filters).

---

# Google Cloud Storage Configuration

- Project Scaffolding
- Defining User Personas

## Progress Update

Frontend Setup

- Created the frontend/ folder to house the React application.
- Implemented the Login Screen as the first user interface of the Document Vault.
- Established the initial frontend structure for future feature development.
