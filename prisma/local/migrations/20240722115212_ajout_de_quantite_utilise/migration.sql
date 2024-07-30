-- AlterTable
ALTER TABLE "ligne_achats" ADD COLUMN     "qt_Utilise" INTEGER;

-- AlterTable
ALTER TABLE "production_ligne_achat" ADD COLUMN     "qt_Utilise" INTEGER;


ALTER TABLE "productions" ADD COLUMN "beneficeDetails" VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE "productions" ADD COLUMN "beneficeGros" DECIMAL(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE "productions" ADD COLUMN "coutTotalProduction" DECIMAL(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE "stock_produi_fini" ADD COLUMN "vente_id" INTEGER NOT NULL DEFAULT 0;
