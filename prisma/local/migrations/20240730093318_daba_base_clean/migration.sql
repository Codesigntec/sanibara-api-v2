/*
  Warnings:

  - You are about to alter the column `beneficeGros` on the `productions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `coutTotalProduction` on the `productions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - Changed the type of `beneficeDetails` on the `productions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "productions" DROP COLUMN "beneficeDetails",
ADD COLUMN     "beneficeDetails" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "beneficeGros" DROP DEFAULT,
ALTER COLUMN "beneficeGros" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "coutTotalProduction" DROP DEFAULT,
ALTER COLUMN "coutTotalProduction" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "stock_produi_fini" ALTER COLUMN "vente_id" DROP DEFAULT,
ALTER COLUMN "vente_id" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "ventes" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "dateVente" TIMESTAMP(3) NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "tva" DOUBLE PRECISION NOT NULL,
    "client_id" TEXT NOT NULL,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ventes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stock_produi_fini" ADD CONSTRAINT "stock_produi_fini_vente_id_fkey" FOREIGN KEY ("vente_id") REFERENCES "ventes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
