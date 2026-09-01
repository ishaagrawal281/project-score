-- ============================================================================
--  DigiLocker Document Vault — PostgreSQL Relational Schema
-- ============================================================================
--
--  CONCEPT: Relational Schema Design with PK/FK (SQL - PostgreSQL)
--
--  This schema defines the complete relational database structure for the
--  Document Vault application using PostgreSQL-native DDL syntax.
--
--  SCHEMA DESIGN DECISIONS:
--  ─────────────────────────────────────────────────────────────────────────
--  1. PRIMARY KEYS: All tables use SERIAL (auto-incrementing integer) as
--     surrogate primary keys. This provides compact, efficient join keys
--     and avoids tying the PK to business data (like email, which can change).
--
--  2. FOREIGN KEYS: Every relationship is enforced with explicit FK constraints.
--     ON DELETE CASCADE ensures referential integrity — when a parent record
--     is deleted, all child records are automatically removed.
--
--  3. NORMALIZATION: The schema is in Third Normal Form (3NF):
--     - 1NF: All columns contain atomic values (no arrays, no nested objects)
--     - 2NF: All non-key columns depend on the entire primary key
--     - 3NF: No transitive dependencies (non-key columns don't depend on other non-key columns)
--
--  4. INDEXES: Strategic indexes on FK columns and frequently queried fields
--     optimize JOIN performance and WHERE clause filtering.
--
--  5. SELF-REFERENTIAL FK: folders.parent_id → folders.id enables hierarchical
--     folder nesting (adjacency list pattern for tree structures).
-- ============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
--  DATABASE SETUP
-- ─────────────────────────────────────────────────────────────────────────────

-- Create the database (run this separately as a superuser)
-- CREATE DATABASE document_vault;
-- \c document_vault;


-- ─────────────────────────────────────────────────────────────────────────────
--  TABLE: users
-- ─────────────────────────────────────────────────────────────────────────────
--
--  Root entity — every other table references users via FK.
--
--  PK: id (SERIAL) — Auto-incrementing surrogate key.
--      Using a surrogate integer PK instead of email because:
--      (a) Email can change → changing a natural PK cascades to all FK references
--      (b) Integer comparisons are faster than string comparisons for JOINs
--      (c) Integer PKs consume less storage in FK columns and indexes
--
--  UNIQUE: email — Enforces business rule that each account has a unique email.
--  UNIQUE: google_id — Ensures one Google account maps to one user.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id         SERIAL       PRIMARY KEY,           -- PK: Auto-incrementing surrogate key
    name       VARCHAR(255) NOT NULL,               -- User display name
    email      VARCHAR(255) NOT NULL UNIQUE,         -- UNIQUE constraint prevents duplicate accounts
    password   VARCHAR(255) NOT NULL,               -- bcrypt-hashed password (60 chars)
    image      TEXT,                                 -- Nullable: profile picture URL (Google OAuth)
    provider   VARCHAR(255) NOT NULL DEFAULT 'credentials',  -- Auth provider: 'credentials', 'google', 'credentials,google'
    google_id  VARCHAR(255) UNIQUE,                  -- UNIQUE: Google OAuth subject ID (nullable for non-Google users)
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Record creation timestamp
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP   -- Last update timestamp
);

-- Index on email for login lookups (covered by UNIQUE constraint automatically)
-- Index on google_id for OAuth lookups (covered by UNIQUE constraint automatically)

COMMENT ON TABLE users IS 'Root entity: stores user accounts with authentication credentials.';
COMMENT ON COLUMN users.id IS 'PK: Auto-incrementing surrogate integer key.';
COMMENT ON COLUMN users.email IS 'UNIQUE: Business key — each email maps to exactly one account.';
COMMENT ON COLUMN users.password IS 'bcrypt hash (10 rounds) — never store plaintext passwords.';
COMMENT ON COLUMN users.google_id IS 'UNIQUE: Google OAuth 2.0 subject ID for SSO linking.';


-- ─────────────────────────────────────────────────────────────────────────────
--  TABLE: folders
-- ─────────────────────────────────────────────────────────────────────────────
--
--  Hierarchical folder structure using the ADJACENCY LIST pattern.
--
--  PK: id (SERIAL) — Surrogate key for folder identification.
--
--  FK: user_id → users.id (ON DELETE CASCADE)
--      When a user is deleted, ALL their folders are automatically removed.
--      This maintains referential integrity without orphaned records.
--
--  FK: parent_id → folders.id (ON DELETE CASCADE, SELF-REFERENTIAL)
--      This is the key relationship that enables nested folders.
--      - parent_id = NULL means the folder is a ROOT folder
--      - parent_id = <folder_id> means it's a subfolder of that folder
--      - ON DELETE CASCADE means deleting a parent folder removes all subfolders
--
--  WHY ADJACENCY LIST (not Nested Sets or Materialized Path)?
--  - Simple INSERT/DELETE operations (no rebalancing needed)
--  - Efficient single-level queries (WHERE parent_id = ?)
--  - PostgreSQL supports recursive CTEs for full tree traversal when needed
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS folders (
    id         SERIAL       PRIMARY KEY,           -- PK: Auto-incrementing surrogate key
    user_id    INT          NOT NULL,               -- FK: Owner of this folder
    parent_id  INT          DEFAULT NULL,            -- FK: Parent folder (NULL = root folder)
    name       VARCHAR(255) NOT NULL,               -- Folder display name
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- FOREIGN KEY CONSTRAINTS with CASCADE behavior
    CONSTRAINT fk_folders_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,                          -- Delete user → delete all their folders

    CONSTRAINT fk_folders_parent
        FOREIGN KEY (parent_id)
        REFERENCES folders (id)
        ON DELETE CASCADE                           -- Delete parent folder → delete all subfolders
);

-- INDEX: Optimize queries that filter folders by owner (e.g., GET /api/folders)
CREATE INDEX idx_folders_user_id ON folders (user_id);

-- INDEX: Optimize queries that find subfolders of a parent
CREATE INDEX idx_folders_parent_id ON folders (parent_id);

COMMENT ON TABLE folders IS 'Hierarchical folder tree using adjacency list pattern. Self-referential FK enables nesting.';
COMMENT ON COLUMN folders.user_id IS 'FK → users.id: Folder owner. CASCADE on delete.';
COMMENT ON COLUMN folders.parent_id IS 'FK → folders.id (self-ref): Parent folder. NULL = root. CASCADE on delete.';


-- ─────────────────────────────────────────────────────────────────────────────
--  TABLE: documents
-- ─────────────────────────────────────────────────────────────────────────────
--
--  Stores metadata for uploaded documents. The actual file binary is stored
--  externally (Cloudinary CDN or local disk) — only the URL is stored here.
--
--  PK: id (SERIAL) — Surrogate key for document identification.
--
--  FK: user_id → users.id (ON DELETE CASCADE)
--      Deleting a user removes all their documents from the database.
--      Note: The storage service must also clean up the actual files.
--
--  FK: folder_id → folders.id (ON DELETE CASCADE)
--      Deleting a folder removes all documents within it.
--      This enforces the constraint that every document belongs to a folder.
--
--  DESIGN NOTE: folder_id is NOT NULL — every document MUST belong to a folder.
--  New users get a default "My Documents" root folder on signup to ensure this.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS documents (
    id          SERIAL       PRIMARY KEY,           -- PK: Auto-incrementing surrogate key
    user_id     INT          NOT NULL,               -- FK: Document owner
    folder_id   INT          NOT NULL,               -- FK: Parent folder (every doc must be in a folder)
    filename    VARCHAR(255) NOT NULL,               -- Original uploaded filename (e.g., "passport.pdf")
    cloud_url   TEXT         NOT NULL,               -- Storage URL (Cloudinary CDN URL or /uploads/uuid.ext)
    file_type   VARCHAR(255) NOT NULL,               -- MIME type (e.g., "application/pdf", "image/jpeg")
    size        INT          NOT NULL,               -- File size in bytes (max 10,485,760 = 10 MB)
    is_favorite BOOLEAN      NOT NULL DEFAULT FALSE,  -- User-toggled favorite flag
    -- NOTE: This column is defined in schema.prisma (as isFavorite) but was NOT
    -- included in the initial migration (20260710165052_init). If the database was
    -- provisioned using migrations only (not prisma db push), this column may not
    -- exist. Run `npx prisma db push` or create a manual migration to reconcile.
    uploaded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Upload timestamp
    updated_at  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Last modification timestamp

    -- FOREIGN KEY CONSTRAINTS
    CONSTRAINT fk_documents_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,                          -- Delete user → delete all their documents

    CONSTRAINT fk_documents_folder
        FOREIGN KEY (folder_id)
        REFERENCES folders (id)
        ON DELETE CASCADE                           -- Delete folder → delete all documents in it
);

-- INDEX: Optimize queries that list documents for a specific user
CREATE INDEX idx_documents_user_id ON documents (user_id);

-- INDEX: Optimize queries that list documents within a specific folder
CREATE INDEX idx_documents_folder_id ON documents (folder_id);

COMMENT ON TABLE documents IS 'Document metadata — file binaries stored externally (Cloudinary/local disk).';
COMMENT ON COLUMN documents.user_id IS 'FK → users.id: Document owner. CASCADE on delete.';
COMMENT ON COLUMN documents.folder_id IS 'FK → folders.id: Parent folder. NOT NULL — every doc must have a folder. CASCADE on delete.';
COMMENT ON COLUMN documents.cloud_url IS 'Storage URL — either Cloudinary CDN URL or relative path to /uploads/ directory.';
COMMENT ON COLUMN documents.size IS 'File size in bytes. Application enforces max 10,485,760 (10 MB).';


-- ─────────────────────────────────────────────────────────────────────────────
--  TABLE: share_links
-- ─────────────────────────────────────────────────────────────────────────────
--
--  Temporary, expiring public access links for document sharing.
--
--  PK: id (SERIAL) — Surrogate key.
--
--  FK: document_id → documents.id (ON DELETE CASCADE)
--      If the shared document is deleted, its share links are also removed.
--      This prevents dangling share links pointing to non-existent documents.
--
--  UNIQUE: token — Each share link has a cryptographically unique token.
--      This is the public-facing identifier in URLs (e.g., /share/A1B2C3D4E5F6G7H8).
--      Generated using crypto.randomBytes(8).toString('hex').toUpperCase().
--
--  EXPIRATION: expires_at stores the absolute expiration timestamp.
--      The application checks `NOW() > expires_at` to determine if a link is valid.
--      Lazy garbage collection deletes expired links on each access.
--
--  ALLOWED EXPIRY DURATIONS: 10m (10 minutes), 1h (1 hour), 24h (24 hours)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS share_links (
    id          SERIAL       PRIMARY KEY,           -- PK: Auto-incrementing surrogate key
    document_id INT          NOT NULL,               -- FK: The shared document
    token       VARCHAR(255) NOT NULL UNIQUE,         -- UNIQUE: Cryptographic share token (16 hex chars)
    expires_at  TIMESTAMP(6) NOT NULL,               -- Absolute expiration timestamp
    created_at  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Link creation timestamp

    -- FOREIGN KEY CONSTRAINT
    CONSTRAINT fk_share_links_document
        FOREIGN KEY (document_id)
        REFERENCES documents (id)
        ON DELETE CASCADE                           -- Delete document → delete all its share links
);

-- INDEX: Optimize token lookups for public share link access (GET /api/share/:token)
-- Note: The UNIQUE constraint on token already creates an implicit index,
-- but we add an explicit one for clarity and documentation purposes.
CREATE INDEX idx_share_links_token ON share_links (token);

-- INDEX: Optimize queries that find all share links for a specific document
CREATE INDEX idx_share_links_document_id ON share_links (document_id);

COMMENT ON TABLE share_links IS 'Time-limited public access tokens for document sharing. Expired links return HTTP 410 Gone.';
COMMENT ON COLUMN share_links.document_id IS 'FK → documents.id: The shared document. CASCADE on delete.';
COMMENT ON COLUMN share_links.token IS 'UNIQUE: 16-character uppercase hex token — public URL identifier.';
COMMENT ON COLUMN share_links.expires_at IS 'Absolute expiration time. Valid durations: 10m, 1h, 24h.';


-- ─────────────────────────────────────────────────────────────────────────────
--  RELATIONSHIP SUMMARY (ER Model)
-- ─────────────────────────────────────────────────────────────────────────────
--
--  users     1 ──────< N   folders      (One user owns many folders)
--  users     1 ──────< N   documents    (One user owns many documents)
--  folders   1 ──────< N   folders      (Self-referential: parent ← children)
--  folders   1 ──────< N   documents    (One folder contains many documents)
--  documents 1 ──────< N   share_links  (One document has many share links)
--
--  CASCADE CHAIN:
--  DELETE user → CASCADE to folders → CASCADE to documents → CASCADE to share_links
--                                   → CASCADE to documents (direct FK too)
--
--  This ensures complete cleanup: deleting a single user removes ALL their
--  data (folders, documents, share links) without leaving orphaned records.
-- ─────────────────────────────────────────────────────────────────────────────
