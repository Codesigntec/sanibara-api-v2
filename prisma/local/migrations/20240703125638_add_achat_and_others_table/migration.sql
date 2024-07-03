-- CreateTable
CREATE TABLE "ligne_achats" (
    "id" TEXT NOT NULL,
    "prix_unitaire" DOUBLE PRECISION NOT NULL,
    "quantite" INTEGER NOT NULL,
    "date_peremption" TIMESTAMP(3),
    "matiere_id" TEXT NOT NULL,
    "achat_id" TEXT NOT NULL,
    "magasin_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ligne_achats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achats" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fournisseur_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "removed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "achats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couts" (
    "id" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "motif" TEXT,
    "achat_id" TEXT NOT NULL,

    CONSTRAINT "couts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "achat_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ligne_achats" ADD CONSTRAINT "ligne_achats_matiere_id_fkey" FOREIGN KEY ("matiere_id") REFERENCES "matieres_premieres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ligne_achats" ADD CONSTRAINT "ligne_achats_achat_id_fkey" FOREIGN KEY ("achat_id") REFERENCES "achats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ligne_achats" ADD CONSTRAINT "ligne_achats_magasin_id_fkey" FOREIGN KEY ("magasin_id") REFERENCES "magasins_matieres_premieres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achats" ADD CONSTRAINT "achats_fournisseur_id_fkey" FOREIGN KEY ("fournisseur_id") REFERENCES "fournisseurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couts" ADD CONSTRAINT "couts_achat_id_fkey" FOREIGN KEY ("achat_id") REFERENCES "achats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_achat_id_fkey" FOREIGN KEY ("achat_id") REFERENCES "achats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
