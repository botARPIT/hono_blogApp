-- CreateEnum
CREATE TYPE "BlogTag" AS ENUM ('SOCIAL', 'TECH', 'ENTERTAINMENT', 'INFOTAINMENT', 'SPORTS', 'MOVIES', 'GAMING', 'PHILOSOPHY', 'SCIENCE', 'ART', 'NATURE', 'WILDLIFE', 'GENERAL');

-- DropIndex
DROP INDEX "Blog_authorId_idx";

-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "tag" "BlogTag" NOT NULL DEFAULT 'GENERAL';

-- CreateIndex
CREATE INDEX "Blog_id_idx" ON "Blog"("id");
