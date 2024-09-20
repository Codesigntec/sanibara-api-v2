-- DropForeignKey
ALTER TABLE "ventes" DROP CONSTRAINT "ventes_client_id_fkey";

-- AlterTable
ALTER TABLE "ventes" ALTER COLUMN "client_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
