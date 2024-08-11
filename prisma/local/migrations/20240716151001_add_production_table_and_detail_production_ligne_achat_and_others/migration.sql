-- CreateTable
CREATE TABLE "production_ligne_achat" (
    "id" TEXT NOT NULL,
    "ligne_achat_id" TEXT NOT NULL,
    "production_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_ligne_achat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productions" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_produi_fini" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "pu_gros" DOUBLE PRECISION NOT NULL,
    "pu_detail" DOUBLE PRECISION NOT NULL,
    "qt_produit" INTEGER NOT NULL,
    "produit_fini_id" TEXT NOT NULL,
    "produition__id" TEXT NOT NULL,
    "magasin_id" TEXT NOT NULL,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "removed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "stock_produi_fini_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "production_ligne_achat" ADD CONSTRAINT "production_ligne_achat_ligne_achat_id_fkey" FOREIGN KEY ("ligne_achat_id") REFERENCES "ligne_achats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_ligne_achat" ADD CONSTRAINT "production_ligne_achat_production_id_fkey" FOREIGN KEY ("production_id") REFERENCES "productions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_produi_fini" ADD CONSTRAINT "stock_produi_fini_produit_fini_id_fkey" FOREIGN KEY ("produit_fini_id") REFERENCES "produits_finis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_produi_fini" ADD CONSTRAINT "stock_produi_fini_produition__id_fkey" FOREIGN KEY ("produition__id") REFERENCES "productions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_produi_fini" ADD CONSTRAINT "stock_produi_fini_magasin_id_fkey" FOREIGN KEY ("magasin_id") REFERENCES "magasins_produits_finis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
