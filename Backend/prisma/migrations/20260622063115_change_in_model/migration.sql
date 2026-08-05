/*
  Warnings:

  - You are about to drop the column `ProductId` on the `DescriptionImage` table. All the data in the column will be lost.
  - You are about to drop the column `ProductId` on the `KeyFeature` table. All the data in the column will be lost.
  - You are about to drop the column `ProductId` on the `ProductSpecification` table. All the data in the column will be lost.
  - You are about to drop the column `ProductId` on the `Tag` table. All the data in the column will be lost.
  - Added the required column `GroupId` to the `DescriptionImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `GroupId` to the `KeyFeature` table without a default value. This is not possible if the table is not empty.
  - Added the required column `GroupId` to the `ProductSpecification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `GroupId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DescriptionImage" DROP CONSTRAINT "DescriptionImage_ProductId_fkey";

-- DropForeignKey
ALTER TABLE "KeyFeature" DROP CONSTRAINT "KeyFeature_ProductId_fkey";

-- DropForeignKey
ALTER TABLE "ProductSpecification" DROP CONSTRAINT "ProductSpecification_ProductId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_ProductId_fkey";

-- AlterTable
ALTER TABLE "DescriptionImage" DROP COLUMN "ProductId",
ADD COLUMN     "GroupId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "KeyFeature" DROP COLUMN "ProductId",
ADD COLUMN     "GroupId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductSpecification" DROP COLUMN "ProductId",
ADD COLUMN     "GroupId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "ProductId",
ADD COLUMN     "GroupId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "DescriptionImage" ADD CONSTRAINT "DescriptionImage_GroupId_fkey" FOREIGN KEY ("GroupId") REFERENCES "Group"("GroupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyFeature" ADD CONSTRAINT "KeyFeature_GroupId_fkey" FOREIGN KEY ("GroupId") REFERENCES "Group"("GroupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_GroupId_fkey" FOREIGN KEY ("GroupId") REFERENCES "Group"("GroupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSpecification" ADD CONSTRAINT "ProductSpecification_GroupId_fkey" FOREIGN KEY ("GroupId") REFERENCES "Group"("GroupId") ON DELETE RESTRICT ON UPDATE CASCADE;
