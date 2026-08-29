# 🏗️ System Design Document — DigiLocker Document Vault

## CONCEPT: System Design Basics — Frontend, Backend, DB and Other Systems Integration

This document describes the full system architecture of the DigiLocker Document Vault, covering how the **frontend**, **backend**, **database**, and **external services** integrate to deliver a secure, scalable document management platform.

---

## 1. High-Level Architecture Overview

The system follows a **three-tier client-server architecture** with a clear separation between presentation, business logic, and data persistence layers.

```mermaid
graph TD
    subgraph "Client Tier (Browser)"
        CLIENT["Next.js 14 Frontend<br/>(App Router / React 18)"]
    end

    subgraph "Application Tier (Server)"
        API["Express.js REST API<br/>(Port 5000)"]
        AUTH["JWT Auth Middleware"]
        VALIDATION["Zod Structured Validation"]
        FILE_VALID["File Validation Middleware<br/>(10MB / MIME Whitelist)"]
        CONTROLLERS["Controllers Layer"]
        MODELS["Models / Data Access Layer"]
        STORAGE["Storage Service<br/>(Cloudinary + Local Fallback)"]
    end

    subgraph "Data Tier"
        PRISMA["Prisma ORM<br/>(pg Adapter)"]
        DB[(PostgreSQL 15<br/>Database)]
    end

    subgraph "External Services"
        CLOUDINARY["Cloudinary CDN<br/>(Cloud File Storage)"]
        GOOGLE["Google OAuth 2.0<br/>(ID Token Verification)"]
    end

    CLIENT -->|"HTTP REST API<br/>JSON + JWT Bearer"| API
    API --> AUTH
    AUTH --> VALIDATION
    VALIDATION --> CONTROLLERS
    API --> FILE_VALID
    FILE_VALID --> CONTROLLERS
    CONTROLLERS --> MODELS
    CONTROLLERS --> STORAGE
    MODELS --> PRISMA
    PRISMA --> DB
    STORAGE -->|"Primary"| CLOUDINARY
    STORAGE -->|"Fallback"| API
    API -->|"Token Verification"| GOOGLE
```

---

## 2. Frontend Architecture

### Technology: Next.js 14 (App Router)

The frontend uses **Next.js App Router** for file-system-based routing with React Server Components.

```mermaid
graph TD
    subgraph "Next.js App Router"
        LAYOUT["layout.jsx<br/>(Root Layout + AuthProvider)"]
        HOME["page.jsx<br/>(Landing Page)"]
        LOGIN["login/page.jsx<br/>(Auth Form)"]
        REGISTER["register/page.jsx<br/>(Registration)"]
        DASHBOARD["dashboard/page.jsx<br/>(Protected Dashboard)"]
        SHARE["share/[token]/page.jsx<br/>(SSR Share View)"]
        PROFILE["profile/page.jsx<br/>(User Settings)"]
        NEXTAUTH["api/auth/[...nextauth]/route.js<br/>(NextAuth.js API)"]
    end

    subgraph "Component Layer"
        NAVBAR["Navbar<br/>(Search + Filters)"]
        SIDEBAR["Sidebar<br/>(Folder Tree)"]
        DOCLIST["DocumentList<br/>(Table View)"]
        DOCCARD["DocumentCard<br/>(Grid View)"]
        VIEWER["DocumentViewer<br/>(Preview Modal)"]
        UPLOAD["UploadModal<br/>(Drag & Drop)"]
        SHAREMODAL["ShareModal<br/>(Link Generator)"]
        MOVEMODAL["MoveModal<br/>(Folder Picker)"]
    end

    subgraph "State Management"
        AUTHCTX["AuthContext<br/>(Session + Token)"]
        SESSPR["SessionProvider<br/>(NextAuth)"]
        FETCHINT["FetchInterceptor<br/>(Token Injection)"]
    end

    LAYOUT --> HOME
    LAYOUT --> LOGIN
    LAYOUT --> DASHBOARD
    LAYOUT --> SHARE
    DASHBOARD --> NAVBAR
    DASHBOARD --> SIDEBAR
    DASHBOARD --> DOCLIST
    DASHBOARD --> VIEWER
    DASHBOARD --> UPLOAD
    LAYOUT --> AUTHCTX
    AUTHCTX --> SESSPR
    SESSPR --> FETCHINT
```

### Client-Side Routing

Next.js App Router provides **file-system-based client-side routing**:
- `/dashboard` → `app/dashboard/page.jsx`
- `/share/[token]` → `app/share/[token]/page.jsx`
- Navigation uses `useRouter().push()` for SPA-like transitions
- URL search params (`useSearchParams`) drive dashboard filters without page reloads

### State Management

- **AuthContext** wraps the app, managing JWT tokens and user sessions
- **NextAuth.js** handles OAuth flows and credential-based authentication
- **localStorage** used as a secondary token cache for API calls

---

## 3. Backend Architecture

### Technology: Express.js (Node.js)

The backend follows a **layered architecture** pattern:

```
Request → Routes → Middleware → Controllers → Models → Prisma → PostgreSQL
```

```mermaid
graph LR
    subgraph "Middleware Pipeline"
        CORS["CORS<br/>(Origin Whitelist)"]
        BODY["Body Parser<br/>(JSON + URL-encoded)"]
        JWTMW["JWT Auth<br/>Middleware"]
        ZODMW["Zod Validation<br/>(Structured Outputs)"]
        MULTER["Multer<br/>(File Upload)"]
        FILEMW["File Validation<br/>(Size + MIME)"]
        ERRMW["Error Handler<br/>(Centralized)"]
    end

    REQ["Incoming<br/>Request"] --> CORS
    CORS --> BODY
    BODY --> JWTMW
    JWTMW --> ZODMW
    ZODMW --> MULTER
    MULTER --> FILEMW
    FILEMW --> CTRL["Controller"]
    CTRL --> ERRMW
```

### Layered Responsibilities

| Layer | Files | Responsibility |
|-------|-------|---------------|
| **Routes** | `routes/*.js` | Define HTTP endpoints, compose middleware chains |
| **Middleware** | `middleware/*.js` | Cross-cutting concerns: auth, validation, error handling |
| **Controllers** | `controllers/*.js` | Business logic, request/response handling |
| **Models** | `models/*.js` | Data access abstraction over Prisma ORM |
| **Services** | `services/*.js` | External service integrations (Cloudinary, local storage) |
| **Config** | `config/*.js` | Database connection, environment configuration |
| **Utils** | `utils/*.js` | JWT generation, password validation, token helpers |

### Structured Output Validation (Zod)

All API request bodies pass through **Zod schema validation middleware** before reaching controllers:

```
POST /api/signup → validateBody(SignupSchema) → authController.signup
POST /api/login  → validateBody(LoginSchema)  → authController.login
```

Invalid payloads receive structured 400 responses:
```json
{
  "error": "Validation failed. Please check the highlighted fields.",
  "details": [
    { "field": "email", "message": "Please provide a valid email address." },
    { "field": "password", "message": "Password must be at least 8 characters long." }
  ]
}
```

---

## 4. Database Design

### Technology: PostgreSQL 15 + Prisma ORM

```mermaid
erDiagram
    users ||--o{ folders : "owns (userId FK)"
    users ||--o{ documents : "owns (userId FK)"
    folders ||--o{ folders : "contains (parentId FK, self-referential)"
    folders ||--o{ documents : "contains (folderId FK)"
    documents ||--o{ share_links : "has (documentId FK)"

    users {
        int id PK "Auto-incrementing surrogate key"
        varchar name "NOT NULL, max 255"
        varchar email "NOT NULL, UNIQUE"
        varchar password "NOT NULL, bcrypt hash"
        text image "Nullable, profile picture URL"
        varchar provider "DEFAULT 'credentials'"
        varchar googleId "UNIQUE, nullable"
        timestamp createdAt "DEFAULT CURRENT_TIMESTAMP"
        timestamp updatedAt "Auto-updated"
    }

    folders {
        int id PK "Auto-incrementing surrogate key"
        int userId FK "→ users.id ON DELETE CASCADE"
        int parentId FK "→ folders.id ON DELETE CASCADE (self-ref)"
        varchar name "NOT NULL, max 255"
        timestamp createdAt "DEFAULT CURRENT_TIMESTAMP"
        timestamp updatedAt "Auto-updated"
    }

    documents {
        int id PK "Auto-incrementing surrogate key"
        int userId FK "→ users.id ON DELETE CASCADE"
        int folderId FK "→ folders.id ON DELETE CASCADE"
        varchar filename "NOT NULL, original file name"
        text cloudUrl "NOT NULL, storage URL"
        varchar fileType "NOT NULL, MIME type"
        int size "NOT NULL, bytes"
        boolean isFavorite "DEFAULT false"
        timestamp uploadedAt "DEFAULT CURRENT_TIMESTAMP"
        timestamp updatedAt "Auto-updated"
    }

    share_links {
        int id PK "Auto-incrementing surrogate key"
        int documentId FK "→ documents.id ON DELETE CASCADE"
        varchar token "NOT NULL, UNIQUE, 16-char hex"
        timestamp expiresAt "NOT NULL, expiration time"
        timestamp createdAt "DEFAULT CURRENT_TIMESTAMP"
    }
```

### Schema Design Decisions

1. **Surrogate Integer PKs**: Auto-incrementing `SERIAL` IDs — simple, performant for JOINs
2. **Cascading Deletes**: All FK relationships use `ON DELETE CASCADE` — deleting a user removes all their folders, documents, and share links
3. **Self-Referential FK**: `folders.parentId` → `folders.id` enables hierarchical folder nesting
4. **Indexes**: Strategic indexes on `userId`, `folderId`, `parentId`, `token`, `documentId` for query optimization
5. **Normalization**: Schema is in **3NF** — no transitive dependencies, no data duplication

---

## 5. Systems Integration

### 5.1 Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend as Next.js Frontend
    participant NextAuth as NextAuth.js API Route
    participant Backend as Express.js Backend
    participant DB as PostgreSQL

    User->>Frontend: Enter email + password
    Frontend->>NextAuth: signIn('credentials', { email, password })
    NextAuth->>Backend: POST /api/login { email, password }
    Backend->>DB: User.findByEmail(email)
    DB-->>Backend: User record (with bcrypt hash)
    Backend->>Backend: bcrypt.compare(password, hash)
    Backend-->>NextAuth: 200 { token: JWT, user: {...} }
    NextAuth->>NextAuth: Store JWT in session (jwt callback)
    NextAuth-->>Frontend: Session with accessToken
    Frontend->>Frontend: Save token to localStorage
    Frontend->>Backend: Subsequent API calls with Authorization: Bearer <JWT>
    Backend->>Backend: JWT verification middleware
```

### 5.2 File Storage Integration

```mermaid
graph TD
    UPLOAD["File Upload Request"] --> MULTER["Multer Memory Storage<br/>(Buffer in RAM)"]
    MULTER --> VALIDATE["Validation Middleware<br/>Size ≤ 10MB, MIME whitelist"]
    VALIDATE --> STORAGE["Storage Service<br/>(Abstraction Layer)"]
    
    STORAGE -->|"Check Config"| DECISION{Cloudinary<br/>Configured?}
    
    DECISION -->|Yes| CLOUD["Cloudinary Upload<br/>Returns CDN URL"]
    DECISION -->|No| LOCAL["Local Disk Write<br/>/backend/uploads/UUID.ext"]
    
    CLOUD -->|"On Failure"| LOCAL
    
    CLOUD --> SAVE["Save Metadata to DB<br/>(cloudUrl, fileType, size)"]
    LOCAL --> SAVE
```

### 5.3 Docker Compose Orchestration

```mermaid
graph TD
    subgraph "Docker Compose Network"
        PGDB["PostgreSQL 15<br/>(db:5432)"]
        BACKEND["Express Backend<br/>(backend:5000)"]
        FRONTEND["Next.js Frontend<br/>(frontend:3000)"]
    end

    FRONTEND -->|"HTTP API"| BACKEND
    BACKEND -->|"Prisma + pg"| PGDB
    
    FRONTEND ---|"Port 3000"| HOST["Host Machine"]
    BACKEND ---|"Port 5000"| HOST
    PGDB ---|"Port 5433"| HOST
```

Services start in dependency order: `db` → `backend` → `frontend`

---

## 6. Data Flow: Document Upload Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as Next.js Client
    participant Multer as Multer (Memory)
    participant Validation as Validation Middleware
    participant Zod as Zod Schema Validation
    participant Storage as Storage Service
    participant Cloud as Cloudinary CDN
    participant Prisma as Prisma ORM
    participant DB as PostgreSQL

    User->>Frontend: Drag & Drop file
    Frontend->>Frontend: Client-side size/type check
    Frontend->>Multer: POST /api/documents/upload<br/>(multipart/form-data + JWT)
    Multer->>Multer: Buffer file in memory
    Multer->>Validation: Pass req.file to middleware
    Validation->>Validation: Check extension whitelist<br/>Check MIME type<br/>Check size ≤ 10MB
    
    alt Validation fails
        Validation-->>Frontend: 400 Structured Error
    else Validation passes
        Validation->>Storage: uploadFile(file)
        Storage->>Cloud: Stream upload
        Cloud-->>Storage: CDN URL
        Storage->>Prisma: Document.create({...})
        Prisma->>DB: INSERT INTO documents
        DB-->>Frontend: 201 { document: {...} }
    end
```

---

## 7. Security Architecture

| Layer | Mechanism | Purpose |
|-------|-----------|---------|
| **Transport** | HTTPS (production) | Encrypt data in transit |
| **Authentication** | JWT (jsonwebtoken) | Stateless session tokens |
| **Password Storage** | bcryptjs (10 rounds) | One-way hash with salt |
| **CORS** | Origin whitelist | Prevent cross-origin attacks |
| **Input Validation** | Zod schemas | Prevent injection, enforce types |
| **File Validation** | Extension + MIME whitelist | Block executable uploads |
| **File Size Limit** | 10 MB hard limit | Prevent resource exhaustion |
| **Share Links** | Cryptographic UUID + TTL | Time-bound public access |
| **Cascade Deletes** | ON DELETE CASCADE | Prevent orphaned records |

---

## 8. API Endpoint Summary

| Category | Method | Endpoint | Auth | Validation Schema |
|----------|--------|----------|------|-------------------|
| Auth | POST | `/api/signup` | No | `SignupSchema` |
| Auth | POST | `/api/login` | No | `LoginSchema` |
| Auth | POST | `/api/auth/google` | No | — |
| Auth | GET | `/api/profile` | Yes | — |
| Auth | PUT | `/api/user/email` | Yes | `UpdateEmailSchema` |
| Auth | PUT | `/api/user/password` | Yes | `UpdatePasswordSchema` |
| Auth | DELETE | `/api/user` | Yes | — |
| Folders | POST | `/api/folders` | Yes | `CreateFolderSchema` |
| Folders | GET | `/api/folders` | Yes | — |
| Folders | PUT | `/api/folders/:id` | Yes | `RenameFolderSchema` |
| Folders | DELETE | `/api/folders/:id` | Yes | — |
| Documents | POST | `/api/documents/upload` | Yes | File validation middleware |
| Documents | GET | `/api/documents` | Yes | — |
| Documents | PUT | `/api/documents/:id/move` | Yes | `MoveDocumentSchema` |
| Documents | PUT | `/api/documents/:id/favorite` | Yes | `ToggleFavoriteSchema` |
| Documents | DELETE | `/api/documents/:id` | Yes | — |
| Share | POST | `/api/share/:documentId` | Yes | `CreateShareLinkSchema` |
| Share | GET | `/api/share/:token` | No | — |
