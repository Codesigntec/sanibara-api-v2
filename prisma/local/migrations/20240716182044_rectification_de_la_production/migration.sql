-- DropForeignKey
ALTER TABLE "production_ligne_achat" DROP CONSTRAINT "production_ligne_achat_production_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_produi_fini" DROP CONSTRAINT "stock_produi_fini_produition__id_fkey";

-- AlterTable
ALTER TABLE "productions" ADD COLUMN     "description" TEXT;

-- AddForeignKey
ALTER TABLE "production_ligne_achat" ADD CONSTRAINT "production_ligne_achat_production_id_fkey" FOREIGN KEY ("production_id") REFERENCES "productions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_produi_fini" ADD CONSTRAINT "stock_produi_fini_produition__id_fkey" FOREIGN KEY ("produition__id") REFERENCES "productions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
