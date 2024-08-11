-- CreateTable
CREATE TABLE "couts_productions" (
    "id" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "motif" TEXT,
    "prod_id" TEXT NOT NULL,

    CONSTRAINT "couts_productions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "couts_productions" ADD CONSTRAINT "couts_productions_prod_id_fkey" FOREIGN KEY ("prod_id") REFERENCES "productions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
