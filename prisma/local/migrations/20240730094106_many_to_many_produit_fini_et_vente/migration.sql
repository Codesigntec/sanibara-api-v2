/*
  Warnings:

  - You are about to drop the column `vente_id` on the `stock_produi_fini` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "stock_produi_fini" DROP CONSTRAINT "stock_produi_fini_vente_id_fkey";

-- AlterTable
ALTER TABLE "stock_produi_fini" DROP COLUMN "vente_id";

-- CreateTable
CREATE TABLE "stock_vente" (
    "id" TEXT NOT NULL,
    "quantiteVendue" INTEGER NOT NULL,
    "stock_produi_fini_id" TEXT NOT NULL,
    "vente_id" TEXT NOT NULL,

    CONSTRAINT "stock_vente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_vente_stock_produi_fini_id_vente_id_key" ON "stock_vente"("stock_produi_fini_id", "vente_id");

-- AddForeignKey
ALTER TABLE "stock_vente" ADD CONSTRAINT "stock_vente_stock_produi_fini_id_fkey" FOREIGN KEY ("stock_produi_fini_id") REFERENCES "stock_produi_fini"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_vente" ADD CONSTRAINT "stock_vente_vente_id_fkey" FOREIGN KEY ("vente_id") REFERENCES "ventes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
