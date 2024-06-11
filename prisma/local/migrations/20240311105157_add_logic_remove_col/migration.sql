/*
  Warnings:

  - You are about to drop the column `permissions` on the `roles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "removed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "removed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "removed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "depenses" ADD COLUMN     "removed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "devises" ADD COLUMN     "removed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "fournisseurs" ADD COLUMN     "removed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "magasins" ADD COLUMN     "removed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "permissions",
ADD COLUMN     "removed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "unites" ADD COLUMN     "removed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;
