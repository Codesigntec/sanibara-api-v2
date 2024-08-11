-- AlterTable
ALTER TABLE "achats" ADD COLUMN     "reference" TEXT;

-- AlterTable
ALTER TABLE "stock_produi_fini" ALTER COLUMN "datePeremption" DROP NOT NULL;
