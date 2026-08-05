/*
  Warnings:

  - A unique constraint covering the columns `[OrderIndex]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[OrderIndex]` on the table `Filter` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[OrderIndex]` on the table `FilterItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[OrderIndex]` on the table `Specification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[OrderIndex]` on the table `SubCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `SubCategoryId` to the `FilterItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FilterItem" ADD COLUMN     "SubCategoryId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Category_OrderIndex_key" ON "Category"("OrderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Filter_OrderIndex_key" ON "Filter"("OrderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "FilterItem_OrderIndex_key" ON "FilterItem"("OrderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Specification_OrderIndex_key" ON "Specification"("OrderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "SubCategory_OrderIndex_key" ON "SubCategory"("OrderIndex");
