/*
  Warnings:

  - The primary key for the `OrderProduct` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `OrderProductId` was added to the `OrderProduct` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "OrderProduct" DROP CONSTRAINT "OrderProduct_pkey",
ADD COLUMN     "OrderProductId" TEXT NOT NULL,
ADD CONSTRAINT "OrderProduct_pkey" PRIMARY KEY ("OrderProductId");
