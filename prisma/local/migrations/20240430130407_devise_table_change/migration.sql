/*
  Warnings:

  - You are about to drop the column `symole` on the `devises` table. All the data in the column will be lost.
  - Added the required column `symbole` to the `devises` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "telephone" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "adresse" DROP NOT NULL;

-- AlterTable
ALTER TABLE "devises" DROP COLUMN "symole",
ADD COLUMN     "symbole" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "fournisseurs" ALTER COLUMN "telephone" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "adresse" DROP NOT NULL;

-- CreateTable
CREATE TABLE "magasin_utilisateurs" (
    "id" TEXT NOT NULL,
    "magasin_id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "magasin_utilisateurs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "magasin_utilisateurs" ADD CONSTRAINT "magasin_utilisateurs_magasin_id_fkey" FOREIGN KEY ("magasin_id") REFERENCES "magasins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magasin_utilisateurs" ADD CONSTRAINT "magasin_utilisateurs_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
