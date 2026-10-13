-- DropIndex
DROP INDEX "Banner_OrderIndex_key";

-- AlterTable
ALTER TABLE "Banner" DROP COLUMN "OrderIndex";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "OrderIndex";

-- AlterTable
ALTER TABLE "SubCategory" ADD COLUMN     "ImageURL" TEXT;
