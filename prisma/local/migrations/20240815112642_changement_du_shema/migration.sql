/*
  Warnings:

  - Added the required column `symbole` to the `unites` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "unites" ADD COLUMN     "symbole" TEXT NOT NULL;
