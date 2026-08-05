/*
  Warnings:

  - You are about to drop the column `EndAt` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `StartAt` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `OrderIndex` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `OrderIndex` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `OrderIndex` on the `Filter` table. All the data in the column will be lost.
  - You are about to drop the column `OrderIndex` on the `FilterItem` table. All the data in the column will be lost.
  - You are about to drop the column `ProductType` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `OrderIndex` on the `KeyFeature` table. All the data in the column will be lost.
  - You are about to drop the column `OrderIndex` on the `ProductFilter` table. All the data in the column will be lost.
  - You are about to drop the column `OrderIndex` on the `ProductSpecification` table. All the data in the column will be lost.
  - You are about to drop the column `OrderIndex` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `OrderIndex` on the `Specification` table. All the data in the column will be lost.
  - You are about to drop the column `OrderIndex` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `OrderIndex` on the `SubCategory` table. All the data in the column will be lost.
  - You are about to drop the column `OrderIndex` on the `Tag` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Banner" DROP COLUMN "EndAt",
DROP COLUMN "StartAt";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "OrderIndex";

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "OrderIndex";

-- AlterTable
ALTER TABLE "Filter" DROP COLUMN "OrderIndex";

-- AlterTable
ALTER TABLE "FilterItem" DROP COLUMN "OrderIndex";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "ProductType";

-- AlterTable
ALTER TABLE "KeyFeature" DROP COLUMN "OrderIndex";

-- AlterTable
ALTER TABLE "ProductFilter" DROP COLUMN "OrderIndex";

-- AlterTable
ALTER TABLE "ProductSpecification" DROP COLUMN "OrderIndex";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "OrderIndex";

-- AlterTable
ALTER TABLE "Specification" DROP COLUMN "OrderIndex";

-- AlterTable
ALTER TABLE "Store" DROP COLUMN "OrderIndex";

-- AlterTable
ALTER TABLE "SubCategory" DROP COLUMN "OrderIndex";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "OrderIndex";
