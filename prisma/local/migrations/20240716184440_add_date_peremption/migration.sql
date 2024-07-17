/*
  Warnings:

  - Added the required column `datePeremption` to the `stock_produi_fini` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stock_produi_fini" ADD COLUMN     "datePeremption" TIMESTAMP(3) NOT NULL;
