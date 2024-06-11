/*
  Warnings:

  - You are about to drop the column `numero` on the `magasins` table. All the data in the column will be lost.
  - You are about to drop the `articles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `magasins` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "articles" DROP CONSTRAINT "articles_categorie_id_fkey";

-- DropForeignKey
ALTER TABLE "articles" DROP CONSTRAINT "articles_unite_id_fkey";

-- AlterTable
ALTER TABLE "magasins" DROP COLUMN "numero",
ADD COLUMN     "type" TEXT NOT NULL;

-- DropTable
DROP TABLE "articles";

-- DropTable
DROP TABLE "categories";

-- CreateTable
CREATE TABLE "Matieres_premieres" (
    "id" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "unite_id" TEXT NOT NULL,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Matieres_premieres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commandes" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tva" INTEGER NOT NULL DEFAULT 0,
    "statut" TEXT NOT NULL DEFAULT 'EN COURS',
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "fournisseur_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commandes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commande_charges" (
    "id" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "motif" TEXT NOT NULL,
    "commande_id" TEXT NOT NULL,

    CONSTRAINT "commande_charges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commande_charges_commande_id_key" ON "commande_charges"("commande_id");

-- AddForeignKey
ALTER TABLE "Matieres_premieres" ADD CONSTRAINT "Matieres_premieres_unite_id_fkey" FOREIGN KEY ("unite_id") REFERENCES "unites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_fournisseur_id_fkey" FOREIGN KEY ("fournisseur_id") REFERENCES "fournisseurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commande_charges" ADD CONSTRAINT "commande_charges_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commandes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
