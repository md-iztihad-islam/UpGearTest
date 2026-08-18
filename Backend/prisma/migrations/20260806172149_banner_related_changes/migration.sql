/*
  Warnings:

  - A unique constraint covering the columns `[OrderIndex]` on the table `Banner` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Banner_OrderIndex_key" ON "Banner"("OrderIndex");
