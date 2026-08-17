# 🏗️ High-Level Design (HLD)
## DigiLocker Document Vault — System Architecture

---

> **Revision**: 1.0 | **Date**: August 17, 2026  
> **Architecture Style**: Three-Tier Monolithic (Frontend → REST API → RDBMS)

---

## 1. System Overview

DigiLocker Document Vault is a cloud-native document management system built on a three-tier architecture:

1. **Presentation Tier** — Next.js 14 (App Router) with React client components
2. **Application Tier** — Express.js REST API with middleware pipeline
3. **Data Tier** — PostgreSQL 15 with Prisma ORM and Cloudinary/local file storage

---

## 2. High-Level System Architecture

```mermaid
graph TB
    subgraph "CLIENT TIER"
        Browser["Browser (Next.js 14 App Router)"]
        SSR["Next.js Server-Side Rendering"]
        CSR["React Client Components"]
        AuthCtx["AuthContext (SessionProvider)"]
        FetchInt["FetchInterceptor (Global Auth Injection)"]
    end

    subgraph "APPLICATION TIER"
        Express["Express.js REST API (Port 5000)"]
        CORS["CORS Middleware"]
        AuthMW["JWT Auth Middleware"]
        UploadMW["Multer Upload Middleware (10MB)"]
        ValidMW["File Validation Middleware"]
        ErrMW["Centralized Error Middleware"]

        subgraph "Controllers"
            AuthCtrl["Auth Controller"]
            DocCtrl["Document Controller"]
            FolderCtrl["Folder Controller"]
            ShareCtrl["Share Controller"]
        end

        subgraph "Models (Data Access Layer)"
            UserModel["User Model"]
            DocModel["Document Model"]
            FolderModel["Folder Model"]
            ShareModel["ShareLink Model"]
        end

        subgraph "Services"
            StorageSvc["Storage Service (Abstraction)"]
            CloudSvc["Cloudinary Service"]
            LocalSvc["Local Disk Service"]
        end
    end

    subgraph "DATA TIER"
        PG[("PostgreSQL 15 Database")]
        Prisma["Prisma ORM (pg adapter)"]
        Cloud["Cloudinary CDN"]
        LocalDisk["Local Filesystem (/uploads)"]
    end

    Browser -->|"HTTP/JSON"| Express
    Express --> CORS --> AuthMW --> UploadMW --> ValidMW
    ValidMW --> AuthCtrl & DocCtrl & FolderCtrl & ShareCtrl
    AuthCtrl & DocCtrl & FolderCtrl & ShareCtrl --> UserModel & DocModel & FolderModel & ShareModel
    UserModel & DocModel & FolderModel & ShareModel --> Prisma --> PG
    DocCtrl --> StorageSvc
    StorageSvc -->|"Primary"| CloudSvc --> Cloud
    StorageSvc -->|"Fallback"| LocalSvc --> LocalDisk
    ErrMW -.->|"Catches all errors"| Express
```

---

## 3. Component Architecture

### 3.1 Frontend Architecture (Next.js 14)

```mermaid
graph TD
    subgraph "App Router Pages"
        Landing["/ (Landing Page)"]
        Login["/login"]
        Register["/register"]
        Dashboard["/dashboard"]
        Profile["/profile"]
        Security["/security"]
        SharePage["/share/[token]"]
        Privacy["/privacy-policy"]
        Terms["/terms-of-service"]
        NotFound["not-found.jsx"]
    end

    subgraph "Shared Components"
        Navbar["Navbar (Search + Filters + Profile)"]
        Sidebar["Sidebar (Folders + Navigation)"]
        Header["Header (Breadcrumbs)"]
        DocList["DocumentList (Table View)"]
        DocCard["DocumentCard (Grid View)"]
        DocViewer["DocumentViewer (Preview Modal)"]
        UploadMod["UploadModal (Drag & Drop)"]
        ShareMod["ShareModal (Link Generation)"]
        MoveMod["MoveModal (Folder Relocation)"]
        ConfirmMod["ConfirmModal (Destructive Actions)"]
        InputMod["InputModal (Text Input Prompts)"]
        FolderCard["FolderCard"]
        Skeleton["SkeletonLoader"]
        ErrBound["ErrorBoundary"]
        Protected["ProtectedRoute"]
        FetchIntComp["FetchInterceptor"]
        GlobalPrompt["GlobalPromptHandler"]
        UploadProg["UploadProgress"]
    end

    subgraph "State Management"
        AuthContext["AuthContext (React Context)"]
        NextAuth["NextAuth.js SessionProvider"]
        LocalStorage["localStorage (Token Backup)"]
    end

    subgraph "Utilities"
        ApiClient["apiClient.js (Authenticated Fetch)"]
        DownloadHelper["downloadHelper.js (Force Download)"]
        PwValidator["passwordValidator.js (Client-side)"]
    end

    Dashboard --> Navbar & Sidebar & Header
    Dashboard --> DocList & DocCard & DocViewer
    Dashboard --> UploadMod & ShareMod & MoveMod & ConfirmMod
    AuthContext --> NextAuth
    FetchIntComp -->|"Injects Bearer token"| ApiClient
```

### 3.2 Backend Architecture (Express.js)

```mermaid
graph LR
    subgraph "Entry Point"
        Server["server.js"]
    end

    subgraph "Route Layer"
        AuthR["/api/* (Auth Routes)"]
        FolderR["/api/folders/* (Folder Routes)"]
        DocR["/api/documents/* (Document Routes)"]
        ShareR["/api/share/* (Share Routes)"]
    end

    subgraph "Middleware Pipeline"
        CORSm["CORS"]
        JSONm["Body Parser (JSON)"]
        URLm["Body Parser (URL-encoded)"]
        Staticm["Static Files (/uploads)"]
        AuthMiddleware["JWT Auth Middleware"]
        MulterMiddleware["Multer (Memory Storage)"]
        ValidationMiddleware["File Validation"]
        ErrorMiddleware["Error Handler"]
    end

    subgraph "Controller Layer"
        AC["authController"]
        DC["documentController"]
        FC["folderController"]
        SC["shareController"]
    end

    subgraph "Model Layer (DAL)"
        UM["User.js"]
        DM["Document.js"]
        FM["Folder.js"]
        SM["ShareLink.js"]
    end

    subgraph "Service Layer"
        SS["storageService.js"]
        CS["cloudinaryService.js"]
    end

    subgraph "Config"
        DB["config/db.js (Prisma + pg)"]
        StorageCfg["config/storage.js (GCS - legacy)"]
    end

    subgraph "Utilities"
        Token["utils/token.js"]
        PwVal["utils/passwordValidator.js"]
    end

    Server --> CORSm --> JSONm --> URLm --> Staticm
    Server --> AuthR & FolderR & DocR & ShareR
    AuthR --> AC
    FolderR --> AuthMiddleware --> FC
    DocR --> AuthMiddleware --> MulterMiddleware --> ValidationMiddleware --> DC
    ShareR --> SC
    AC & DC & FC & SC --> UM & DM & FM & SM
    UM & DM & FM & SM --> DB
    DC --> SS --> CS
```

---

## 4. Data Architecture

### 4.1 Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ FOLDERS : "owns (1:N)"
    USERS ||--o{ DOCUMENTS : "owns (1:N)"
    FOLDERS ||--o{ FOLDERS : "parent-child (self-referencing)"
    FOLDERS ||--o{ DOCUMENTS : "contains (1:N)"
    DOCUMENTS ||--o{ SHARE_LINKS : "has (1:N)"

    USERS {
        int id PK "Auto-increment"
        string name "VarChar(255)"
        string email UK "VarChar(255), Unique"
        string password "VarChar(255), bcrypt hash"
        string image "Text, nullable (Google profile pic)"
        string provider "Default: credentials"
        string googleId UK "VarChar(255), nullable, Unique"
        timestamp createdAt "Auto"
        timestamp updatedAt "Auto"
    }

    FOLDERS {
        int id PK "Auto-increment"
        int userId FK "References users.id, CASCADE"
        int parentId FK "Self-ref folders.id, CASCADE, nullable"
        string name "VarChar(255)"
        timestamp createdAt "Auto"
        timestamp updatedAt "Auto"
    }

    DOCUMENTS {
        int id PK "Auto-increment"
        int userId FK "References users.id, CASCADE"
        int folderId FK "References folders.id, CASCADE"
        string filename "VarChar(255)"
        string cloudUrl "Text (Cloudinary URL or /uploads/ path)"
        string fileType "VarChar(255), MIME type"
        int size "File size in bytes"
        boolean isFavorite "Default: false"
        timestamp uploadedAt "Auto"
        timestamp updatedAt "Auto"
    }

    SHARE_LINKS {
        int id PK "Auto-increment"
        int documentId FK "References documents.id, CASCADE"
        string token UK "VarChar(255), Unique, 16-char hex"
        timestamp expiresAt "Calculated from TTL"
        timestamp createdAt "Auto"
    }
```

### 4.2 Database Indexes

| Table | Index Name | Column(s) | Purpose |
|---|---|---|---|
| `folders` | `idx_user` | `userId` | Fast folder lookup by owner |
| `folders` | `idx_parent` | `parentId` | Fast child folder resolution |
| `documents` | `idx_user_doc` | `userId` | Fast document listing by owner |
| `documents` | `idx_folder_doc` | `folderId` | Fast folder contents lookup |
| `share_links` | `idx_token` | `token` | O(1) token lookup for public access |
| `share_links` | `idx_document` | `documentId` | Fast share link resolution |

---

## 5. API Design

### 5.1 API Gateway Overview

All API endpoints are served under the `/api` prefix from the Express.js server on port `5000`.

| Category | Base Path | Auth Required | Controller |
|---|---|---|---|
| Authentication | `/api/` | Mixed | `authController` |
| Folders | `/api/folders` | All routes | `folderController` |
| Documents | `/api/documents` | All routes | `documentController` |
| Share Links | `/api/share` | POST only | `shareController` |

### 5.2 Complete API Contract

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  AUTHENTICATION                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│  POST   /api/signup            → Register new user + auto-create folders    │
│  POST   /api/login             → Authenticate & return JWT                  │
│  POST   /api/auth/google       → Google OAuth login/register                │
│  GET    /api/profile           → Get user profile + storage usage    [AUTH] │
│  PUT    /api/user/email        → Update email address                [AUTH] │
│  PUT    /api/user/password     → Update password                     [AUTH] │
│  DELETE /api/user              → Delete account (cascade all data)   [AUTH] │
├──────────────────────────────────────────────────────────────────────────────┤
│  FOLDERS                                                             [AUTH] │
├──────────────────────────────────────────────────────────────────────────────┤
│  POST   /api/folders           → Create folder (name, parentId)             │
│  GET    /api/folders           → List all user folders                       │
│  PUT    /api/folders/:id       → Rename folder                              │
│  DELETE /api/folders/:id       → Delete folder (only if empty)              │
├──────────────────────────────────────────────────────────────────────────────┤
│  DOCUMENTS                                                           [AUTH] │
├──────────────────────────────────────────────────────────────────────────────┤
│  POST   /api/documents/upload  → Upload file (multipart, 10MB max)          │
│  GET    /api/documents         → List documents (paginated, filtered)       │
│  DELETE /api/documents/:id     → Delete document (storage + DB)             │
│  PUT    /api/documents/:id/move     → Move document to folder               │
│  PUT    /api/documents/:id/favorite → Toggle favorite status                │
├──────────────────────────────────────────────────────────────────────────────┤
│  SHARE LINKS                                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│  POST   /api/share/:documentId → Generate expiring link (10m/1h/24h)[AUTH] │
│  GET    /api/share/:token      → Access shared document              [PUB] │
├──────────────────────────────────────────────────────────────────────────────┤
│  SYSTEM                                                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│  GET    /                      → Root status check                          │
│  GET    /health                → Health check with DB connectivity test     │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Core User Flows

### 6.1 Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Next.js Client
    participant NextAuth as NextAuth.js API Route
    participant Backend as Express.js API
    participant DB as PostgreSQL

    rect rgb(240, 248, 255)
        Note over User, DB: SIGNUP FLOW
        User->>Browser: Fill signup form (name, email, password)
        Browser->>Backend: POST /api/signup
        Backend->>Backend: Validate password (NIST rules)
        Backend->>Backend: Check duplicate email
        Backend->>Backend: bcrypt.hash(password, 10)
        Backend->>DB: User.create()
        Backend->>DB: Create default folders (My Documents + 6 subfolders)
        Backend->>Backend: generateJwt({id, name, email})
        Backend-->>Browser: 201 {token, user}
        Browser->>NextAuth: signIn('credentials', {email, password})
        NextAuth->>Backend: POST /api/login (verify)
        NextAuth-->>Browser: Session established
    end

    rect rgb(255, 248, 240)
        Note over User, DB: LOGIN FLOW
        User->>Browser: Enter email + password
        Browser->>NextAuth: signIn('credentials', {email, password})
        NextAuth->>Backend: POST /api/login
        Backend->>DB: User.findByEmail()
        Backend->>Backend: bcrypt.compare(password, hash)
        Backend-->>NextAuth: 200 {token, user}
        NextAuth-->>Browser: Session + accessToken stored
        Browser->>Browser: Save token to localStorage (backup)
    end
```

### 6.2 Document Upload Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Modal as UploadModal
    participant XHR as XMLHttpRequest
    participant Multer as Multer Middleware
    participant Validator as Validation Middleware
    participant Controller as Document Controller
    participant Storage as Storage Service
    participant Cloud as Cloudinary
    participant Local as Local Disk
    participant DB as PostgreSQL

    User->>Modal: Drag & drop / browse file
    Modal->>Modal: Client-side validation (extension, size ≤ 10MB)
    
    alt Client validation fails
        Modal-->>User: Show error message
    else Client validation passes
        User->>Modal: Select destination folder, click Upload
        Modal->>XHR: POST /api/documents/upload (FormData + Bearer token)
        XHR->>XHR: Track upload.progress events → update progress bar
        XHR->>Multer: Process multipart (memory storage, 10MB limit)
        
        alt Multer rejects (size > 10MB)
            Multer-->>XHR: 400 LIMIT_FILE_SIZE
        else Multer accepts
            Multer->>Validator: Validate extension + MIME type
            alt Validation fails
                Validator-->>XHR: 400 (detailed error message)
            else Validation passes
                Validator->>Controller: uploadDocument()
                Controller->>Controller: Verify folder exists + ownership
                Controller->>Storage: uploadFile(file)
                
                alt Cloudinary enabled
                    Storage->>Cloud: upload_stream (auto resource_type)
                    Cloud-->>Storage: secure_url (HTTPS)
                else Cloudinary disabled or fails
                    Storage->>Local: Write buffer to /uploads/{uuid}.ext
                    Local-->>Storage: /uploads/{filename}
                end
                
                Controller->>DB: Document.create({userId, folderId, filename, cloudUrl, size, fileType})
                DB-->>Controller: Document record
                Controller-->>XHR: 201 {message, document}
                XHR-->>Modal: Success response
                Modal-->>User: Show success toast, auto-close after 1.5s
            end
        end
    end
```

### 6.3 Share Link Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Owner
    actor Visitor
    participant ShareMod as ShareModal
    participant API as Express API
    participant DB as PostgreSQL
    participant SharePage as /share/[token] Page

    rect rgb(240, 255, 240)
        Note over Owner, DB: LINK GENERATION
        Owner->>ShareMod: Click "Share" on document
        ShareMod->>ShareMod: Select expiry (10m / 1h / 24h)
        ShareMod->>API: POST /api/share/:documentId {expiry}
        API->>API: Verify document ownership
        API->>API: Calculate expiresAt = now + TTL
        API->>API: generateShareToken() → 16-char hex
        API->>DB: ShareLink.create({documentId, token, expiresAt})
        API-->>ShareMod: 201 {token, expiresAt, sharePath}
        ShareMod->>ShareMod: Build full URL: origin + sharePath
        ShareMod-->>Owner: Display copyable link
        Owner->>Owner: Click copy → clipboard + visual feedback
    end

    rect rgb(255, 240, 240)
        Note over Visitor, SharePage: LINK ACCESS
        Visitor->>SharePage: Navigate to /share/:token
        SharePage->>API: GET /api/share/:token
        API->>DB: ShareLink.deleteExpired() (lazy GC)
        API->>DB: ShareLink.findByToken(token) + JOIN document
        
        alt Token not found
            API-->>SharePage: 404 Not Found
            SharePage-->>Visitor: "Link does not exist" error page
        else Token found but expired
            API-->>SharePage: 410 Gone
            SharePage-->>Visitor: "Link has expired" error page
        else Token valid
            API-->>SharePage: 200 {document: {filename, cloudUrl, fileType, size}}
            SharePage-->>Visitor: Render preview + download button
        end
    end
```

---

## 7. Middleware Pipeline Architecture

Every request passes through a layered middleware pipeline before reaching the controller:

```mermaid
graph LR
    Request["Incoming HTTP Request"]
    CORS["1. CORS\n(Origin whitelist)"]
    JSON["2. Body Parser\n(JSON + URL)"]
    Static["3. Static Files\n(/uploads serve)"]
    Auth["4. JWT Auth\n(Bearer token verify)"]
    Upload["5. Multer\n(Memory storage, 10MB)"]
    Validate["6. File Validation\n(Extension + MIME)"]
    Controller["7. Controller\n(Business Logic)"]
    Error["Error Middleware\n(Catch-all handler)"]

    Request --> CORS --> JSON --> Static
    Static --> Auth -->|"Protected Routes"| Upload
    Upload -->|"Upload Routes Only"| Validate
    Validate --> Controller
    Static -->|"Public Routes"| Controller
    Controller -.->|"On Error"| Error

    style CORS fill:#e3f2fd
    style Auth fill:#fff3e0
    style Upload fill:#fce4ec
    style Validate fill:#fce4ec
    style Error fill:#ffebee
```

> [!NOTE]
> **Route-specific middleware application:**
> - Auth routes (`/api/signup`, `/api/login`, `/api/auth/google`) skip JWT middleware
> - Share GET route (`/api/share/:token`) is public — no auth required
> - Only the upload route chains Multer + Validation middleware

---

## 8. Storage Architecture

### 8.1 Dual Storage Strategy

```mermaid
graph TD
    Upload["File Upload Request"]
    Check{"Cloudinary\nConfigured?"}
    CloudUp["Cloudinary Upload\n(Stream API)"]
    CloudOK{"Upload\nSucceeded?"}
    LocalUp["Local Disk Fallback\n(/backend/uploads/)"]
    URL["Return File URL"]

    Upload --> Check
    Check -->|"Yes (env vars set)"| CloudUp
    Check -->|"No (env vars missing)"| LocalUp
    CloudUp --> CloudOK
    CloudOK -->|"Yes"| URL
    CloudOK -->|"No (network error)"| LocalUp
    LocalUp --> URL

    style CloudUp fill:#e8f5e9
    style LocalUp fill:#fff3e0
```

### 8.2 URL Resolution

| Storage Provider | URL Format | Served By |
|---|---|---|
| **Cloudinary** | `https://res.cloudinary.com/{cloud}/.../{public_id}.ext` | Cloudinary CDN |
| **Local Disk** | `/uploads/{uuid}.ext` | Express static middleware |

> Frontend's `getAbsoluteFileUrl()` resolves relative `/uploads/` paths by prepending `NEXT_PUBLIC_BACKEND_URL`.

---

## 9. Security Architecture

```mermaid
graph TD
    subgraph "Authentication Layer"
        JWT["JWT Token (7-day TTL)"]
        BCrypt["bcryptjs (cost=10)"]
        GoogleOAuth["Google OAuth (tokeninfo verification)"]
        NIST["NIST Password Policy"]
    end

    subgraph "Authorization Layer"
        OwnerCheck["Ownership Verification\n(userId match on every operation)"]
        FolderAuth["Folder ownership check"]
        DocAuth["Document ownership check"]
    end

    subgraph "Input Validation Layer"
        ExtBlacklist["Extension Blacklist\n(.exe, .zip, .apk, .bat, .js)"]
        ExtWhitelist["Extension Whitelist\n(.pdf, .jpg, .jpeg, .png, .docx)"]
        MIMECheck["MIME Type Verification"]
        SizeLimit["File Size Limit (10MB)"]
        InputSanit["Input Sanitization (trim, parseInt)"]
    end

    subgraph "Transport Security"
        CORSPolicy["CORS Whitelist + Regex"]
        HTTPS["Cloudinary Secure URLs (HTTPS)"]
        TokenCrypto["Cryptographic Share Tokens\n(crypto.randomBytes)"]
    end

    subgraph "Data Protection"
        CascadeDelete["Cascade Deletion\n(User → Folders → Documents → ShareLinks)"]
        EnvSecrets["Environment-based Secrets\n(.env excluded from VCS)"]
        PrismaParam["Parameterized Queries (Prisma ORM)"]
    end
```

---

## 10. Deployment Architecture

### 10.1 Docker Compose Topology

```mermaid
graph TB
    subgraph "Docker Compose Network"
        subgraph "db (postgres:15-alpine)"
            PG["PostgreSQL 15\nPort: 5432 (internal)\nPort: 5433 (host mapped)\nVolume: postgres_data"]
        end

        subgraph "backend (Node.js)"
            Express["Express.js API\nPort: 5000\nDepends on: db\nVolume: ./backend → /usr/src/app"]
        end

        subgraph "frontend (Next.js)"
            NextJS["Next.js 14\nPort: 3000\nDepends on: backend\nVolume: ./frontend → /usr/src/app"]
        end
    end

    User["User Browser"] -->|"HTTP :3000"| NextJS
    NextJS -->|"HTTP :5000"| Express
    Express -->|"TCP :5432"| PG
    Express -->|"HTTPS"| Cloud["Cloudinary CDN"]

    style PG fill:#336791,color:#fff
    style Express fill:#68A063,color:#fff
    style NextJS fill:#000,color:#fff
```

### 10.2 Production Deployment

| Component | Host | URL |
|---|---|---|
| Frontend | Vercel | `https://doc-vault-amber.vercel.app` |
| Backend | Render / Railway | Custom domain on port 5000 |
| Database | Neon / Supabase / Railway PostgreSQL | Connection via `DATABASE_URL` |
| File Storage | Cloudinary | `https://res.cloudinary.com/{cloud}/...` |

---

## 11. Environment Configuration Matrix

| Variable | Service | Required | Default |
|---|---|---|---|
| `PORT` | Backend | No | `5000` |
| `NODE_ENV` | Both | No | `development` |
| `DATABASE_URL` | Backend | **Yes** | — |
| `JWT_SECRET` | Backend | **Yes** | Hardcoded fallback (dev only) |
| `JWT_EXPIRES_IN` | Backend | No | `7d` |
| `FRONTEND_URL` | Backend | No | `http://localhost:3000` |
| `CLOUDINARY_CLOUD_NAME` | Backend | No | — (falls back to local) |
| `CLOUDINARY_API_KEY` | Backend | No | — |
| `CLOUDINARY_API_SECRET` | Backend | No | — |
| `GOOGLE_CLIENT_ID` | Backend | For Google OAuth | — |
| `NEXT_PUBLIC_BACKEND_URL` | Frontend | No | `http://localhost:5000` |
| `NEXTAUTH_SECRET` | Frontend | **Yes** | — |
| `NEXTAUTH_URL` | Frontend | **Yes** | `http://localhost:3000` |
