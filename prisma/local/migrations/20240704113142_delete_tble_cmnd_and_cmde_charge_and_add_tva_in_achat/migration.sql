/*
  Warnings:

  - You are about to drop the `commande_charges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `commandes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "commande_charges" DROP CONSTRAINT "commande_charges_commande_id_fkey";

-- DropForeignKey
ALTER TABLE "commandes" DROP CONSTRAINT "commandes_fournisseur_id_fkey";

-- AlterTable
ALTER TABLE "achats" ADD COLUMN     "tva" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "commande_charges";

-- DropTable
DROP TABLE "commandes";
