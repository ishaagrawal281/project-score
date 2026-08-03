# 📁 DigiLocker Document Vault

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Backend-Express.js%204-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2015-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%207-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary%20%2F%20Local-blueviolet?style=for-the-badge&logo=cloudinary)](https://cloudinary.com/)
[![Docker](https://img.shields.io/badge/Deployment-Docker%20Compose-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

A enterprise-grade, secure digital document vault inspired by DigiLocker and Google Drive. Built with Next.js, Express, PostgreSQL, Prisma, and Cloud Storage abstractions.

---

## 🎯 Problem Statement

DigiLocker requires a modern document vault solution where files are uploaded directly to cloud storage, documents are accessible via an infinite-scrolling interface, uploads are subject to strict type and size restrictions (<= 10 MB), and users can generate secure, expiring shareable links for temporary file access.

### Key Requirements Addressed
1. **Direct Cloud Storage Uploads**: Resilient upload architecture using Cloudinary with automatic local disk fallback (`backend/uploads/`).
2. **Strict Validation & Security**: Hard limit of **10 MB per file** and strict MIME/extension whitelist (`.pdf`, `.jpg`, `.jpeg`, `.png`, `.docx`). Executable and archived extensions (`.exe`, `.zip`, `.apk`, `.bat`, `.js`) are strictly rejected.
3. **Expiring Shareable Links**: Generate public access tokens with customizable TTL (`10m`, `1h`, `24h`), automatic server-side expiration checks, and lazy garbage collection.
4. **Infinite Scroll Pagination**: Document lists fetch seamlessly using browser `IntersectionObserver` and offset-based pagination (`limit=20`).

---

## ✨ Features

- 🔐 **JWT Authentication & Security**: Secure user signup, login, password hashing via bcryptjs, and stateless JWT authorization.
- 📁 **Hierarchical Folder Management**: Full CRUD operations for nested folders with move, rename, delete, and path navigation.
- 📄 **Document Preview & Operations**: In-app viewer modal for PDF and image preview, move files between directories, search query filtering, and single-click downloading.
- ⏳ **Expiring Time-Bound Share Links**: Share documents via temporary URLs without giving permanent access. Expired tokens return standard HTTP 410 Gone status.
- ⚡ **Infinite Scrolling**: Smooth document stream loading using Next.js client components and high-performance paginated backend queries.
- 🐳 **Full Dockerization**: One-command development environment setup with Docker Compose orchestrating PostgreSQL database, backend service, and frontend web server.

---

## 🏗️ System Architecture

### High-Level Architecture

```mermaid
graph TD
    Client["Client Browser (Next.js 14 App Router)"]
    API["Express.js REST API Server"]
    Auth["JWT / Bcrypt Authentication Middleware"]
    Validation["File Validation Middleware (10MB / Type Whitelist)"]
    StorageService["Storage Abstraction Layer"]
    Cloudinary["Cloudinary Cloud Storage"]
    LocalStorage["Local Disk Fallback (/uploads)"]
    Prisma["Prisma ORM"]
    DB[(PostgreSQL Database)]

    Client -->|HTTP / JSON API Requests| API
    API --> Auth
    Auth --> Validation
    Validation --> StorageService
    StorageService -->|Primary| Cloudinary
    StorageService -->|Fallback| LocalStorage
    API --> Prisma
    Prisma --> DB
```

---

## 🔄 Workflow Diagrams

### 1. Document Upload & Validation Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as Next.js Client
    participant Middleware as Express Validation Middleware
    participant Storage as Storage Service
    participant Cloud as Cloudinary Storage
    participant DB as PostgreSQL (Prisma)

    User->>Frontend: Drag & Drop File (PDF/Image/Docx)
    Frontend->>Frontend: Client Validation (Size <= 10MB, Extension check)
    Frontend->>Middleware: POST /api/documents/upload (Multipart FormData + JWT)
    Middleware->>Middleware: Verify JWT, Check size (<= 10MB) & Mimetype
    alt File Invalid (> 10MB or Forbidden Extension)
        Middleware-->>Frontend: 400 Bad Request (Validation Error)
        Frontend-->>User: Display Toast Error Alert
    else Validation Passed
        Middleware->>Storage: uploadFile(buffer)
        alt Cloudinary Active
            Storage->>Cloud: Upload Stream
            Cloud-->>Storage: Secure Cloud URL
        else Cloudinary Inactive / Fails
            Storage->>Storage: Save to backend/uploads/
            Storage-->>Storage: Return local relative URL
        end
        Storage->>DB: Document.create({ userId, folderId, filename, cloudUrl, size })
        DB-->>Frontend: 201 Created (Document Record)
        Frontend-->>User: Update Document List & Show Success Toast
    end
```

### 2. Expiring Share Link Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Document Owner
    actor Visitor as Public Link Viewer
    participant API as Express Share Controller
    participant DB as ShareLink Table (DB)
    participant Client as Frontend (/share/[token])

    Owner->>API: POST /api/share/:documentId { expiry: "10m" | "1h" | "24h" }
    API->>API: Generate Cryptographic UUID Token & Calculate Expiry Date
    API->>DB: ShareLink.create({ documentId, token, expiresAt })
    DB-->>Owner: 201 Created (sharePath: /share/:token)
    
    Visitor->>Client: Navigate to /share/:token
    Client->>API: GET /api/share/:token
    API->>DB: ShareLink.deleteExpired() (Lazy Cleanup)
    API->>DB: ShareLink.findByToken(token)
    alt Link Not Found or Revoked
        DB-->>API: null
        API-->>Client: 404 Not Found
    else Link Expired (now > expiresAt)
        API-->>Client: 410 Gone ("This link has expired.")
        Client-->>Visitor: Show "Link Expired" Error Screen
    else Link Valid
        API-->>Client: 200 OK (Document details & Cloud URL)
        Client-->>Visitor: Render Public File Preview & Download Button
    end
```

---

## 🗄️ Database Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ FOLDERS : owns
    USERS ||--o{ DOCUMENTS : owns
    FOLDERS ||--o{ FOLDERS : contains
    FOLDERS ||--o{ DOCUMENTS : contains
    DOCUMENTS ||--o{ SHARE_LINKS : has

    USERS {
        int id PK
        string name
        string email UK
        string password
        string provider
        datetime createdAt
        datetime updatedAt
    }

    FOLDERS {
        int id PK
        int userId FK
        int parentId FK
        string name
        datetime createdAt
        datetime updatedAt
    }

    DOCUMENTS {
        int id PK
        int userId FK
        int folderId FK
        string filename
        string cloudUrl
        string fileType
        int size
        datetime uploadedAt
        datetime updatedAt
    }

    SHARE_LINKS {
        int id PK
        int documentId FK
        string token UK
        datetime expiresAt
        datetime createdAt
    }
```

---

## 💻 Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router) | Client-side UI, App Router, SSR/CSR rendering |
| **Styling & UI** | CSS Modules / Vanilla CSS & Lucide Icons | Responsive layout, theme variables, glassmorphism UI |
| **Backend API** | Node.js & Express.js | REST API Server, routing, file handling middleware |
| **Database & ORM** | PostgreSQL 15 & Prisma ORM | Relational schema, auto-migrations, seed scripts |
| **File Storage** | Cloudinary API + Local Disk Fallback | Cloud document hosting with local filesystem backup |
| **Authentication** | JSON Web Tokens (JWT) & bcryptjs | Stateless authorization and password hashing |
| **Containerization** | Docker & Docker Compose | Multi-container orchestration (`db`, `backend`, `frontend`) |

---

## 📁 Repository Structure

```text
S116-0726-wipcube-tgnm-digilocker-vault/
├── backend/
│   ├── config/             # Database connection & Prisma initialization
│   ├── controllers/        # Request handlers (auth, document, folder, share)
│   ├── middleware/         # Auth verification, upload validation, error handlers
│   ├── models/             # Database queries & Prisma abstraction
│   ├── prisma/             # Schema definitions, migrations, seed script
│   ├── routes/             # API endpoints definitions
│   ├── services/           # Cloudinary & local storage abstraction service
│   ├── utils/              # Token generators & helpers
│   ├── Dockerfile          # Backend container file
│   ├── server.js           # Express app entrypoint
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router (dashboard, login, register, share)
│   │   ├── components/     # UI components (DocumentList, DocumentViewer, Modals)
│   │   ├── context/        # Auth Context state
│   │   ├── hooks/          # Custom hooks (e.g. useInputModal)
│   │   └── styles/         # Global design system & theme variables
│   ├── Dockerfile          # Frontend container file
│   └── package.json
├── docs/
│   └── schema.sql          # Raw SQL schema definition
├── docker-compose.yml      # Orchestration file for DB, backend, frontend
├── README.md               # Project documentation
└── .env.example            # Environment template file
```

---

## 🚀 API Endpoint Reference

| Category | HTTP Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/signup` | No | Register a new user account |
| **Auth** | `POST` | `/api/login` | No | Authenticate user & return JWT token |
| **Auth** | `GET` | `/api/profile` | Yes | Get authenticated user profile details |
| **Folders** | `GET` | `/api/folders` | Yes | Get directory folder tree for user |
| **Folders** | `POST` | `/api/folders` | Yes | Create a new folder directory |
| **Folders** | `PUT` | `/api/folders/:id` | Yes | Rename an existing folder |
| **Folders** | `DELETE` | `/api/folders/:id` | Yes | Delete a folder and contents |
| **Documents**| `GET` | `/api/documents` | Yes | List paginated documents (`page`, `limit`, `folderId`, `search`) |
| **Documents**| `POST` | `/api/documents/upload` | Yes | Upload document (10MB limit, Whitelisted types) |
| **Documents**| `PUT` | `/api/documents/:id/move` | Yes | Move document to target folder |
| **Documents**| `DELETE` | `/api/documents/:id` | Yes | Delete document from storage and database |
| **Share** | `POST` | `/api/share/:documentId` | Yes | Generate expiring share link (`10m`, `1h`, `24h`) |
| **Share** | `GET` | `/api/share/:token` | No | Retrieve public document via token |

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/document_vault?schema=public"
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:3000

# Optional: Cloudinary Cloud Storage Configuration
# If omitted, system seamlessly defaults to local disk storage (backend/uploads/)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend Configuration (`frontend/.env.local`)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
```

---

## 🛠️ Local Setup & Run Guide

### Option 1: Docker Compose Setup (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/kalviumcommunity/S116-0726-wipcube-tgnm-digilocker-vault.git
   cd S116-0726-wipcube-tgnm-digilocker-vault
   ```
2. Start all services using Docker Compose:
   ```bash
   docker-compose up --build
   ```
3. Access the applications:
   - **Frontend App**: `http://localhost:3000`
   - **Backend API**: `http://localhost:5000`
   - **PostgreSQL Database**: `localhost:5433`

---

### Option 2: Manual Local Setup

#### 1. Database Setup
Make sure PostgreSQL is installed and running. Create a database named `document_vault`.

#### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npx prisma db seed   # Optional: Seed initial demo data
npm run dev
```
Backend will start on `http://localhost:5000`.

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:3000`.

---

## 📋 File Validation & Rules Summary

- 📄 **Allowed File Types**: `.pdf`, `.jpg`, `.jpeg`, `.png`, `.docx`
- 🚫 **Blocked File Extensions**: `.exe`, `.zip`, `.apk`, `.bat`, `.js`
- ⚖️ **Maximum File Size**: **10 MB** (10,485,760 bytes)
- ⏰ **Share Link Expiry Options**: 10 Minutes (`10m`), 1 Hour (`1h`), 24 Hours (`24h`)

---

## 👥 Team Members & Credits

- **Aryan Patil** (Project Admin) - Authentication, Cloud Storage, Architecture
- **Isha Agrawal** - DevOps, Containerization, Frontend UI & UX
- **Gauri Mhetre** - Document Management, Folder Hierarchy & API Integrations

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
