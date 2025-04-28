/*
  Warnings:

  - You are about to drop the `_GameToPromotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `promotions` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "_CategoryToGame" ADD CONSTRAINT "_CategoryToGame_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CategoryToGame_AB_unique";

-- AlterTable
ALTER TABLE "_GameToPlatform" ADD CONSTRAINT "_GameToPlatform_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_GameToPlatform_AB_unique";

-- DropTable
DROP TABLE "_GameToPromotion";

-- DropTable
DROP TABLE "promotions";

-- DropEnum
DROP TYPE "DiscountType";
