-- AddForeignKey
ALTER TABLE "FilterItem" ADD CONSTRAINT "FilterItem_SubCategoryId_fkey" FOREIGN KEY ("SubCategoryId") REFERENCES "SubCategory"("SubCategoryId") ON DELETE RESTRICT ON UPDATE CASCADE;
