-- DropForeignKey
ALTER TABLE "production_ligne_achat" DROP CONSTRAINT "production_ligne_achat_ligne_achat_id_fkey";

-- AddForeignKey
ALTER TABLE "production_ligne_achat" ADD CONSTRAINT "production_ligne_achat_ligne_achat_id_fkey" FOREIGN KEY ("ligne_achat_id") REFERENCES "ligne_achats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
