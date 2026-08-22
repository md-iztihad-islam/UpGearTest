/*
  Warnings:

  - You are about to drop the column `OrderIndex` on the `DescriptionImage` table. All the data in the column will be lost.
  - You are about to drop the column `OrderIndex` on the `ProductImage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DescriptionImage" DROP COLUMN "OrderIndex";

-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "OrderIndex";
