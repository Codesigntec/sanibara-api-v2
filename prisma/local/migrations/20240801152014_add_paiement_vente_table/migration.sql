-- CreateTable
CREATE TABLE "paiements_vente" (
    "id" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "achat_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paiements_vente_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "paiements_vente" ADD CONSTRAINT "paiements_vente_achat_id_fkey" FOREIGN KEY ("achat_id") REFERENCES "ventes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
