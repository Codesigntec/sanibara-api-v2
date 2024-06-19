/*
  Warnings:

  - You are about to drop the column `numero` on the `magasin_matiere_premiere_utilisateurs` table. All the data in the column will be lost.
  - You are about to drop the column `numero` on the `magasin_produit_fini_utilisateurs` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `magasins_matieres_premieres` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `magasins_produits_finis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "magasin_matiere_premiere_utilisateurs" DROP COLUMN "numero";

-- AlterTable
ALTER TABLE "magasin_produit_fini_utilisateurs" DROP COLUMN "numero";

-- AlterTable
ALTER TABLE "magasins_matieres_premieres" DROP COLUMN "type",
ADD COLUMN     "numero" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "magasins_produits_finis" DROP COLUMN "type",
ADD COLUMN     "numero" SERIAL NOT NULL;
