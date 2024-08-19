/*
  Warnings:

  - Added the required column `quantiteDevis` to the `stock_vente` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stock_vente" ADD COLUMN     "quantiteDevis" INTEGER NOT NULL;
