/*
  Warnings:

  - You are about to drop the column `Used` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `PurchaseDiscount` on the `OrderProduct` table. All the data in the column will be lost.
  - Added the required column `OriginalPrice` to the `OrderProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "DisplayType" TEXT NOT NULL DEFAULT 'DESKTOP';

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "Used",
ALTER COLUMN "MaxUsageLimit" SET DEFAULT 1000000000;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "DueAmount" DECIMAL,
ADD COLUMN     "PaidAmount" DECIMAL;

-- AlterTable
ALTER TABLE "OrderProduct" DROP COLUMN "PurchaseDiscount",
ADD COLUMN     "DiscountAmount" DECIMAL,
ADD COLUMN     "OriginalPrice" DECIMAL NOT NULL;
