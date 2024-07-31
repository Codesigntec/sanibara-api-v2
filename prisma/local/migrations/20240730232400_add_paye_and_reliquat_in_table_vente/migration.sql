/*
  Warnings:

  - Added the required column `paye` to the `ventes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reliquat` to the `ventes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ventes" ADD COLUMN     "paye" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "reliquat" DOUBLE PRECISION NOT NULL;
