/*
  Warnings:

  - You are about to drop the `magasin_utilisateurs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `magasins` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "magasin_utilisateurs" DROP CONSTRAINT "magasin_utilisateurs_magasin_id_fkey";

-- DropForeignKey
ALTER TABLE "magasin_utilisateurs" DROP CONSTRAINT "magasin_utilisateurs_utilisateur_id_fkey";

-- DropTable
DROP TABLE "magasin_utilisateurs";

-- DropTable
DROP TABLE "magasins";

-- CreateTable
CREATE TABLE "magasins_produits_finis" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "magasins_produits_finis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magasins_matieres_premieres" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "magasins_matieres_premieres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magasin_produit_fini_utilisateurs" (
    "id" TEXT NOT NULL,
    "magasin_id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "magasin_produit_fini_utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magasin_matiere_premiere_utilisateurs" (
    "id" TEXT NOT NULL,
    "magasin_id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "magasin_matiere_premiere_utilisateurs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "magasin_produit_fini_utilisateurs" ADD CONSTRAINT "magasin_produit_fini_utilisateurs_magasin_id_fkey" FOREIGN KEY ("magasin_id") REFERENCES "magasins_produits_finis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magasin_produit_fini_utilisateurs" ADD CONSTRAINT "magasin_produit_fini_utilisateurs_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magasin_matiere_premiere_utilisateurs" ADD CONSTRAINT "magasin_matiere_premiere_utilisateurs_magasin_id_fkey" FOREIGN KEY ("magasin_id") REFERENCES "magasins_matieres_premieres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magasin_matiere_premiere_utilisateurs" ADD CONSTRAINT "magasin_matiere_premiere_utilisateurs_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
