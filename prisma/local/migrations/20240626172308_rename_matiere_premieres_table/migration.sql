/*
  Warnings:

  - You are about to drop the `Matieres_premieres` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Matieres_premieres" DROP CONSTRAINT "Matieres_premieres_unite_id_fkey";

-- DropTable
DROP TABLE "Matieres_premieres";

-- CreateTable
CREATE TABLE "matieres_premieres" (
    "id" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "description" TEXT,
    "numero" SERIAL NOT NULL,
    "unite_id" TEXT NOT NULL,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matieres_premieres_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "matieres_premieres" ADD CONSTRAINT "matieres_premieres_unite_id_fkey" FOREIGN KEY ("unite_id") REFERENCES "unites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
