-- AlterTable
ALTER TABLE "ligne_achats" ADD COLUMN     "archive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "removed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "stock_vente" ADD COLUMN     "archive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "removed" BOOLEAN NOT NULL DEFAULT false;
