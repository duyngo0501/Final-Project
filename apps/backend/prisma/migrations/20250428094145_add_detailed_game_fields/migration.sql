/*
  Warnings:

  - The primary key for the `_CategoryToGame` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_GameToPlatform` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_CategoryToGame` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_GameToPlatform` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rawg_id]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rawg_id]` on the table `platforms` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_CategoryToGame" DROP CONSTRAINT "_CategoryToGame_AB_pkey";

-- AlterTable
ALTER TABLE "_GameToPlatform" DROP CONSTRAINT "_GameToPlatform_AB_pkey";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "games_count" INTEGER,
ADD COLUMN     "image_background" TEXT,
ADD COLUMN     "rawg_id" INTEGER,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "added" INTEGER,
ADD COLUMN     "added_by_status" JSONB,
ADD COLUMN     "dominant_color" TEXT,
ADD COLUMN     "esrbRatingId" INTEGER,
ADD COLUMN     "reviews_count" INTEGER,
ADD COLUMN     "reviews_text_count" INTEGER,
ADD COLUMN     "saturated_color" TEXT,
ADD COLUMN     "tba" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "platforms" ADD COLUMN     "games_count" INTEGER,
ADD COLUMN     "image_background" TEXT,
ADD COLUMN     "rawg_id" INTEGER,
ADD COLUMN     "slug" TEXT;

-- CreateTable
CREATE TABLE "rating_details" (
    "rawg_rating_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "percent" DOUBLE PRECISION NOT NULL,
    "gameId" UUID NOT NULL,

    CONSTRAINT "rating_details_pkey" PRIMARY KEY ("rawg_rating_id")
);

-- CreateTable
CREATE TABLE "esrb_ratings" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "esrb_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "language" TEXT,
    "games_count" INTEGER,
    "image_background" TEXT,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "games_count" INTEGER,
    "image_background" TEXT,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screenshots" (
    "rawg_id" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "gameId" UUID NOT NULL,

    CONSTRAINT "screenshots_pkey" PRIMARY KEY ("rawg_id")
);

-- CreateTable
CREATE TABLE "_GameToTag" (
    "A" UUID NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_GameToStore" (
    "A" UUID NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "rating_details_gameId_idx" ON "rating_details"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "esrb_ratings_name_key" ON "esrb_ratings"("name");

-- CreateIndex
CREATE UNIQUE INDEX "esrb_ratings_slug_key" ON "esrb_ratings"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "stores_name_key" ON "stores"("name");

-- CreateIndex
CREATE UNIQUE INDEX "stores_slug_key" ON "stores"("slug");

-- CreateIndex
CREATE INDEX "screenshots_gameId_idx" ON "screenshots"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "_GameToTag_AB_unique" ON "_GameToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_GameToTag_B_index" ON "_GameToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GameToStore_AB_unique" ON "_GameToStore"("A", "B");

-- CreateIndex
CREATE INDEX "_GameToStore_B_index" ON "_GameToStore"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToGame_AB_unique" ON "_CategoryToGame"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_GameToPlatform_AB_unique" ON "_GameToPlatform"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "categories_rawg_id_key" ON "categories"("rawg_id");

-- CreateIndex
CREATE UNIQUE INDEX "platforms_rawg_id_key" ON "platforms"("rawg_id");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_esrbRatingId_fkey" FOREIGN KEY ("esrbRatingId") REFERENCES "esrb_ratings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_entries" ADD CONSTRAINT "cart_entries_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "shopping_carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_entries" ADD CONSTRAINT "cart_entries_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_details" ADD CONSTRAINT "rating_details_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screenshots" ADD CONSTRAINT "screenshots_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToPlatform" ADD CONSTRAINT "_GameToPlatform_A_fkey" FOREIGN KEY ("A") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToPlatform" ADD CONSTRAINT "_GameToPlatform_B_fkey" FOREIGN KEY ("B") REFERENCES "platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToTag" ADD CONSTRAINT "_GameToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToTag" ADD CONSTRAINT "_GameToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToStore" ADD CONSTRAINT "_GameToStore_A_fkey" FOREIGN KEY ("A") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToStore" ADD CONSTRAINT "_GameToStore_B_fkey" FOREIGN KEY ("B") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToGame" ADD CONSTRAINT "_CategoryToGame_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToGame" ADD CONSTRAINT "_CategoryToGame_B_fkey" FOREIGN KEY ("B") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
