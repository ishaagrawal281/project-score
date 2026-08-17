# 📋 Product Requirements Document (PRD)
## DigiLocker Document Vault — v1.0

---

> **Revision**: 1.0 | **Date**: August 17, 2026 | **Status**: Implementation Complete  
> **Team**: Aryan Patil (Project Admin), Isha Agrawal (DevOps & Frontend), Gauri Mhetre (API & Document Management)

---

## 1. Executive Summary

**DigiLocker Document Vault** (DocVault) is an enterprise-grade, secure digital document management platform inspired by India's DigiLocker and Google Drive. It enables users to upload, organize, preview, and share personal documents through a modern web interface backed by a resilient cloud-native architecture.

The platform combines the organizational structure of a personal document vault with the convenience of cloud storage and the security of time-limited sharing — without exposing permanent download links to third parties.

---

## 2. Problem Statement

### 2.1 The Core Problem
Indian citizens and professionals need a centralized, secure digital vault to store and manage critical documents (Aadhaar cards, PAN cards, mark sheets, medical records, financial statements) with:

- **Cloud-first storage** that doesn't rely on a single device
- **Strict file type and size enforcement** to prevent malicious uploads
- **Time-limited sharing** for scenarios like job applications, loan approvals, and medical referrals — where permanent access is neither needed nor desirable
- **Organized folder hierarchies** mirroring real-life document categories

### 2.2 Who Is This For?

| Persona | Need |
|---|---|
| **Students** | Store and share education certificates, identity proofs, transcripts |
| **Job Seekers** | Generate time-limited links for recruiters to view resumes and certificates |
| **Professionals** | Maintain organized digital copies of financial, medical, and employment documents |
| **Government Applicants** | Upload document copies required for KYC, passport, or scheme applications |

---

## 3. Goals & Success Metrics

### 3.1 Product Goals

| # | Goal | Priority |
|---|---|---|
| G1 | Secure user authentication with JWT and optional Google OAuth | **P0 — Critical** |
| G2 | Upload documents (≤10 MB) with strict type validation to cloud storage | **P0 — Critical** |
| G3 | Hierarchical folder management (create, rename, delete, nest) | **P0 — Critical** |
| G4 | In-app document preview (PDF, images) and single-click download | **P0 — Critical** |
| G5 | Expiring shareable links with configurable TTL (10m / 1h / 24h) | **P0 — Critical** |
| G6 | Infinite scroll pagination for seamless document browsing | **P1 — High** |
| G7 | Advanced search and multi-filter document discovery | **P1 — High** |
| G8 | Favorite document tagging and filtering | **P1 — High** |
| G9 | Storage usage tracking and user profile management | **P2 — Medium** |
| G10 | Full Docker containerization for one-command deployment | **P2 — Medium** |

### 3.2 Success Metrics

| Metric | Target |
|---|---|
| Upload success rate (valid files) | > 99.5% |
| Average file upload latency (< 5 MB) | < 3 seconds |
| Share link generation latency | < 500ms |
| Expired link cleanup coverage | 100% (lazy GC on access) |
| Page load time (dashboard, cached) | < 2 seconds |

---

## 4. Features & Functional Requirements

### 4.1 Authentication & User Management

| ID | Requirement | Status |
|---|---|---|
| **FR-AUTH-01** | Users can register with name, email, and password (minimum 8 chars, NIST SP 800-63B compliant) | ✅ Implemented |
| **FR-AUTH-02** | Users can log in with email + password credentials | ✅ Implemented |
| **FR-AUTH-03** | Users can log in with Google OAuth (ID token verification via Google tokeninfo endpoint) | ✅ Implemented |
| **FR-AUTH-04** | Google login links to existing email-matched accounts automatically | ✅ Implemented |
| **FR-AUTH-05** | Stateless JWT session tokens (7-day TTL by default) | ✅ Implemented |
| **FR-AUTH-06** | Authenticated users can view and update their profile (email, password, profile picture) | ✅ Implemented |
| **FR-AUTH-07** | Users can delete their account (cascading deletion of all folders, documents, and share links) | ✅ Implemented |
| **FR-AUTH-08** | Password validation rejects common/breached passwords and contextual data (name, email username, app terms) | ✅ Implemented |
| **FR-AUTH-09** | On signup, default folder hierarchy auto-created: "My Documents" → {Identity, Education, Finance, Employment, Medical, Others} | ✅ Implemented |

### 4.2 Folder Management

| ID | Requirement | Status |
|---|---|---|
| **FR-FLDR-01** | Create new folders with optional parent folder (hierarchical nesting) | ✅ Implemented |
| **FR-FLDR-02** | Rename existing folders (uniqueness enforced within same parent level) | ✅ Implemented |
| **FR-FLDR-03** | Delete empty folders only (guard against data loss) | ✅ Implemented |
| **FR-FLDR-04** | Retrieve full folder tree for the authenticated user | ✅ Implemented |
| **FR-FLDR-05** | Ownership validation on all folder operations (userId check) | ✅ Implemented |

### 4.3 Document Upload & Storage

| ID | Requirement | Status |
|---|---|---|
| **FR-DOC-01** | Upload single files via multipart/form-data with real-time progress tracking (XHR) | ✅ Implemented |
| **FR-DOC-02** | **File size hard limit**: ≤ 10 MB (10,485,760 bytes) — enforced at both Multer and validation middleware | ✅ Implemented |
| **FR-DOC-03** | **Allowed file types** (whitelist): `.pdf`, `.jpg`, `.jpeg`, `.png`, `.docx` | ✅ Implemented |
| **FR-DOC-04** | **Blocked file types** (blacklist): `.exe`, `.zip`, `.apk`, `.bat`, `.js` | ✅ Implemented |
| **FR-DOC-05** | **Dual MIME + extension validation**: Both file extension and MIME type are verified server-side | ✅ Implemented |
| **FR-DOC-06** | **Primary storage**: Cloudinary (cloud) with automatic local disk fallback (`backend/uploads/`) | ✅ Implemented |
| **FR-DOC-07** | Client-side validation mirrors server-side rules for instant user feedback | ✅ Implemented |
| **FR-DOC-08** | Drag-and-drop file selection in upload modal | ✅ Implemented |

### 4.4 Document Operations

| ID | Requirement | Status |
|---|---|---|
| **FR-OPS-01** | List paginated documents (offset-based, default 20/page) with folder and search filters | ✅ Implemented |
| **FR-OPS-02** | Move documents between folders (ownership verified on both source doc and destination folder) | ✅ Implemented |
| **FR-OPS-03** | Delete documents (removes from both storage provider and database) | ✅ Implemented |
| **FR-OPS-04** | Toggle document favorite status (optimistic UI update) | ✅ Implemented |
| **FR-OPS-05** | In-app preview: PDF (iframe embed), images (direct render), DOCX (download prompt) | ✅ Implemented |
| **FR-OPS-06** | Document navigation (previous/next) in viewer modal | ✅ Implemented |
| **FR-OPS-07** | Force-download documents (bypasses browser default open behavior) | ✅ Implemented |

### 4.5 Expiring Share Links

| ID | Requirement | Status |
|---|---|---|
| **FR-SHARE-01** | Generate shareable link with configurable TTL: `10m` (10 min), `1h` (1 hour), `24h` (24 hours) | ✅ Implemented |
| **FR-SHARE-02** | Share token: 16-character uppercase hex string (cryptographically random) | ✅ Implemented |
| **FR-SHARE-03** | Public access endpoint (`GET /api/share/:token`) — no authentication required | ✅ Implemented |
| **FR-SHARE-04** | Expired links return **HTTP 410 Gone** with user-friendly error page | ✅ Implemented |
| **FR-SHARE-05** | Non-existent/revoked links return **HTTP 404 Not Found** | ✅ Implemented |
| **FR-SHARE-06** | **Lazy garbage collection**: Expired share links are batch-deleted on each access request | ✅ Implemented |
| **FR-SHARE-07** | Copy-to-clipboard functionality with visual feedback | ✅ Implemented |

### 4.6 Dashboard & UI

| ID | Requirement | Status |
|---|---|---|
| **FR-UI-01** | Sidebar navigation with All Documents, Favorites, and folder tree | ✅ Implemented |
| **FR-UI-02** | Dual view modes: list (table) and grid (cards) | ✅ Implemented |
| **FR-UI-03** | Dashboard statistics panel: total documents, storage used, folder count, favorites count | ✅ Implemented |
| **FR-UI-04** | Breadcrumb navigation reflecting current folder path | ✅ Implemented |
| **FR-UI-05** | Infinite scroll via `IntersectionObserver` (no manual "load more" button) | ✅ Implemented |
| **FR-UI-06** | Advanced filter panel: folder, date range, file type, file size, favorites, sort order | ✅ Implemented |
| **FR-UI-07** | Active filter chips with individual removal and "Clear All" | ✅ Implemented |
| **FR-UI-08** | Confirmation modals for destructive actions (delete document, delete folder) | ✅ Implemented |
| **FR-UI-09** | Toast-style success/error alerts | ✅ Implemented |
| **FR-UI-10** | Skeleton loaders for loading states | ✅ Implemented |
| **FR-UI-11** | Error boundary component for graceful React error handling | ✅ Implemented |

---

## 5. Non-Functional Requirements

### 5.1 Security

| ID | Requirement |
|---|---|
| **NFR-SEC-01** | All passwords hashed with bcryptjs (cost factor 10) before storage |
| **NFR-SEC-02** | JWT tokens verified on every protected API route |
| **NFR-SEC-03** | CORS restricted to known origins (localhost, Vercel production domain) with regex fallback for localhost ports |
| **NFR-SEC-04** | No executable file types can be uploaded under any circumstance |
| **NFR-SEC-05** | User can only access/modify their own folders and documents (ownership checks on every operation) |
| **NFR-SEC-06** | Google OAuth tokens verified against Google's official tokeninfo endpoint (not blindly trusted) |
| **NFR-SEC-07** | Share link tokens are cryptographically generated (not sequential/guessable) |
| **NFR-SEC-08** | `.env` files excluded from version control via `.gitignore` |

### 5.2 Performance

| ID | Requirement |
|---|---|
| **NFR-PERF-01** | Database queries use indexed columns (userId, folderId, token, parentId) |
| **NFR-PERF-02** | Pagination limits default to 20 documents per page |
| **NFR-PERF-03** | File buffers streamed to Cloudinary (no intermediate disk write for cloud uploads) |
| **NFR-PERF-04** | IntersectionObserver-based infinite scroll (no page reload on pagination) |
| **NFR-PERF-05** | Optimistic UI updates on favorite toggle (instant visual feedback, rollback on failure) |

### 5.3 Reliability

| ID | Requirement |
|---|---|
| **NFR-REL-01** | Automatic Cloudinary → local disk fallback on cloud upload failure |
| **NFR-REL-02** | Health check endpoint (`/health`) with database connectivity test |
| **NFR-REL-03** | Centralized error middleware catches and formats all unhandled errors |
| **NFR-REL-04** | Unhandled promise rejection handler at process level |
| **NFR-REL-05** | FetchInterceptor on frontend globally injects auth tokens and handles 401 responses |

### 5.4 Scalability & Deployment

| ID | Requirement |
|---|---|
| **NFR-SCALE-01** | Docker Compose orchestration for 3-service deployment (PostgreSQL, backend, frontend) |
| **NFR-SCALE-02** | Prisma ORM for database-agnostic schema management and migrations |
| **NFR-SCALE-03** | Environment-driven configuration (no hardcoded secrets or URLs) |
| **NFR-SCALE-04** | Production-ready Vercel deployment for frontend (separate backend host) |

---

## 6. File Validation Rules Summary

```
┌─────────────────────────────────────────────────────────┐
│  UPLOAD VALIDATION PIPELINE                              │
│                                                          │
│  1. CLIENT-SIDE (UploadModal.jsx)                        │
│     ├── Extension blacklist check (.exe, .zip, etc.)    │
│     ├── Extension whitelist check (.pdf, .jpg, etc.)    │
│     └── Size check (≤ 10 MB)                            │
│                                                          │
│  2. MULTER MIDDLEWARE (uploadMiddleware.js)               │
│     └── Memory storage with 10 MB fileSize limit        │
│                                                          │
│  3. VALIDATION MIDDLEWARE (validationMiddleware.js)       │
│     ├── Extension blacklist check                        │
│     ├── Extension whitelist check                        │
│     ├── MIME type verification                           │
│     └── Size check (10,485,760 bytes)                   │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Share Link Expiry Matrix

| Option | Display Label | Duration (ms) | TTL |
|---|---|---|---|
| `10m` | 10 Minutes | 600,000 | 10 min |
| `1h` | 1 Hour | 3,600,000 | 60 min |
| `24h` | 24 Hours | 86,400,000 | 1440 min |

> **Expiry enforcement**: Server-side timestamp comparison on every access. Lazy garbage collection deletes all expired rows before token lookup.

---

## 8. Out of Scope (v1.0)

| Feature | Reason |
|---|---|
| Multi-user document sharing (collaboration) | v1 focuses on single-owner vault model |
| File versioning | Not required for initial release |
| Bulk upload (multiple files at once) | Single file upload with progress covers v1 needs |
| Role-based access control (RBAC) | All users have equal privileges in v1 |
| Two-factor authentication (2FA) | Google OAuth provides an additional auth vector; 2FA deferred |
| Document OCR / text extraction | Out of scope for document storage platform |
| Mobile native apps (iOS/Android) | Responsive web covers mobile access in v1 |
| Audit logging | Deferred to v2 for compliance use cases |

---

## 9. Tech Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | Next.js (App Router) | 14.x |
| Frontend Styling | CSS Modules / Vanilla CSS, Lucide Icons | — |
| Typography | Inter, Plus Jakarta Sans (Google Fonts) | — |
| Backend Runtime | Node.js + Express.js | 4.x |
| Database | PostgreSQL | 15.x |
| ORM | Prisma | 7.x |
| Cloud Storage | Cloudinary + Local Disk Fallback | — |
| Authentication | JWT (jsonwebtoken) + bcryptjs + Google OAuth | — |
| File Upload | Multer (memory storage) | — |
| Containerization | Docker + Docker Compose | 3.8 |
| Production Frontend | Vercel | — |

---

## 10. Team & Responsibilities

| Member | Role | Ownership Area |
|---|---|---|
| **Aryan Patil** | Project Admin | Authentication, Cloud Storage, Architecture |
| **Isha Agrawal** | DevOps & Frontend | Docker, CI/CD, Frontend UI & UX |
| **Gauri Mhetre** | Backend & API | Document Management, Folder Hierarchy, API Integrations |
