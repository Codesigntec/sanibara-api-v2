/*
  Warnings:

  - Added the required column `description` to the `Matieres_premieres` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Matieres_premieres" ADD COLUMN     "description" TEXT NOT NULL;
