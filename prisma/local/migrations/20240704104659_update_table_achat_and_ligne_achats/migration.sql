/*
  Warnings:

  - Added the required column `libelle` to the `achats` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Etat" AS ENUM ('LIVREE', 'EN_COURS');

-- CreateEnum
CREATE TYPE "StatutAchat" AS ENUM ('ACHETER', 'COMMANDE');

-- AlterTable
ALTER TABLE "achats" ADD COLUMN     "etat" "Etat" NOT NULL DEFAULT 'LIVREE',
ADD COLUMN     "libelle" TEXT NOT NULL,
ADD COLUMN     "statutAchat" "StatutAchat" NOT NULL DEFAULT 'ACHETER';

-- AlterTable
ALTER TABLE "couts" ADD COLUMN     "numero" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "ligne_achats" ADD COLUMN     "numero" SERIAL NOT NULL,
ADD COLUMN     "quantiteLivre" INTEGER,
ADD COLUMN     "references" TEXT;
