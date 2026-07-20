-- Add Google OAuth account metadata while retaining existing credentials users.
ALTER TABLE "users" ADD COLUMN "image" TEXT;
ALTER TABLE "users" ADD COLUMN "provider" VARCHAR(255) NOT NULL DEFAULT 'credentials';
ALTER TABLE "users" ADD COLUMN "googleId" VARCHAR(255);

CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
