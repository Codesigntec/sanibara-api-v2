-- CreateTable
CREATE TABLE "produits_finis" (
    "id" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "description" TEXT,
    "numero" SERIAL NOT NULL,
    "unite_id" TEXT NOT NULL,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produits_finis_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "produits_finis" ADD CONSTRAINT "produits_finis_unite_id_fkey" FOREIGN KEY ("unite_id") REFERENCES "unites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
