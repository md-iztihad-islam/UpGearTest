/*
  Warnings:

  - You are about to drop the column `ProductType` on the `Brand` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "ProductType",
ADD COLUMN     "SubCategoryId" TEXT;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_SubCategoryId_fkey" FOREIGN KEY ("SubCategoryId") REFERENCES "SubCategory"("SubCategoryId") ON DELETE SET NULL ON UPDATE CASCADE;
