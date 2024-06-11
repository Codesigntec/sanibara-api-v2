-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "archive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "removed" BOOLEAN NOT NULL DEFAULT false;
