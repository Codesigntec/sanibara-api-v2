-- DropForeignKey
ALTER TABLE "stock_vente" DROP CONSTRAINT "stock_vente_vente_id_fkey";

-- AddForeignKey
ALTER TABLE "stock_vente" ADD CONSTRAINT "stock_vente_vente_id_fkey" FOREIGN KEY ("vente_id") REFERENCES "ventes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
