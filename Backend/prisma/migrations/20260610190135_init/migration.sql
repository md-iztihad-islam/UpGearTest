-- CreateTable
CREATE TABLE "Banner" (
    "BannerId" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "SubTitle" TEXT,
    "Link" TEXT,
    "ButtonText" TEXT,
    "ImageURL" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "OrderIndex" INTEGER NOT NULL,
    "StartAt" TIMESTAMP(3),
    "EndAt" TIMESTAMP(3),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("BannerId")
);

-- CreateTable
CREATE TABLE "Brand" (
    "BrandId" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "ProductType" TEXT NOT NULL,
    "Slug" TEXT NOT NULL,
    "MetaTitle" TEXT,
    "MetaDescription" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("BrandId")
);

-- CreateTable
CREATE TABLE "Warranty" (
    "WarrantyId" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "SubTitle" TEXT,
    "Description" TEXT,
    "Status" TEXT NOT NULL,
    "OrderIndex" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warranty_pkey" PRIMARY KEY ("WarrantyId")
);

-- CreateTable
CREATE TABLE "Group" (
    "GroupId" TEXT NOT NULL,
    "BrandId" TEXT NOT NULL,
    "CategoryId" TEXT NOT NULL,
    "SubCategoryId" TEXT NOT NULL,
    "Description" TEXT,
    "WarrantyId" TEXT,
    "ProductType" TEXT NOT NULL,
    "InsideDhakaCharge" DECIMAL NOT NULL,
    "OutsideDhakaCharge" DECIMAL NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("GroupId")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "CampaignId" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "SubTitle" TEXT,
    "OrderIndex" INTEGER NOT NULL,
    "Status" TEXT NOT NULL,
    "StartAt" TIMESTAMP(3),
    "EndAt" TIMESTAMP(3),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("CampaignId")
);

-- CreateTable
CREATE TABLE "CampaignProduct" (
    "CampaignId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,

    CONSTRAINT "CampaignProduct_pkey" PRIMARY KEY ("CampaignId","ProductId")
);

-- CreateTable
CREATE TABLE "Wishlist" (
    "WishlistId" TEXT NOT NULL,
    "CustomerId" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("WishlistId")
);

-- CreateTable
CREATE TABLE "WishlistItem" (
    "WishlistItemId" TEXT NOT NULL,
    "WishlistId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("WishlistItemId")
);

-- CreateTable
CREATE TABLE "Cart" (
    "CartId" TEXT NOT NULL,
    "CustomerId" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("CartId")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "CartItemId" TEXT NOT NULL,
    "CartId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("CartItemId")
);

-- CreateTable
CREATE TABLE "Category" (
    "CategoryId" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "OrderIndex" INTEGER NOT NULL,
    "Slug" TEXT NOT NULL,
    "MetaTitle" TEXT,
    "MetaDescription" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("CategoryId")
);

-- CreateTable
CREATE TABLE "SubCategory" (
    "SubCategoryId" TEXT NOT NULL,
    "CategoryId" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "OrderIndex" INTEGER NOT NULL,
    "Slug" TEXT NOT NULL,
    "MetaTitle" TEXT,
    "MetaDescription" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("SubCategoryId")
);

-- CreateTable
CREATE TABLE "Filter" (
    "FilterId" TEXT NOT NULL,
    "SubCategoryId" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "OrderIndex" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Filter_pkey" PRIMARY KEY ("FilterId")
);

-- CreateTable
CREATE TABLE "FilterItem" (
    "FilterItemId" TEXT NOT NULL,
    "FilterId" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "OrderIndex" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FilterItem_pkey" PRIMARY KEY ("FilterItemId")
);

-- CreateTable
CREATE TABLE "Specification" (
    "SpecificationId" TEXT NOT NULL,
    "SubCategoryId" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "OrderIndex" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specification_pkey" PRIMARY KEY ("SpecificationId")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "CouponId" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "Code" TEXT NOT NULL,
    "OrderIndex" INTEGER NOT NULL,
    "DiscountPCT" DECIMAL,
    "DiscountAMT" DECIMAL,
    "MaxUsageLimit" INTEGER,
    "ExpiryDate" TIMESTAMP(3),
    "MinOrderAmount" DECIMAL(65,30),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "UsedCount" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("CouponId")
);

-- CreateTable
CREATE TABLE "CouponUsage" (
    "CouponUsageId" TEXT NOT NULL,
    "CouponId" TEXT NOT NULL,
    "CustomerId" TEXT NOT NULL,
    "OrderId" TEXT NOT NULL,
    "UsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("CouponUsageId")
);

-- CreateTable
CREATE TABLE "Customer" (
    "CustomerId" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Phone" TEXT NOT NULL,
    "Email" TEXT,
    "ImageURL" TEXT,
    "Password" TEXT NOT NULL,
    "OTP" TEXT,
    "OTPExpires" TIMESTAMP(3),
    "IsVerified" BOOLEAN NOT NULL DEFAULT false,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("CustomerId")
);

-- CreateTable
CREATE TABLE "CustomerAddress" (
    "AddressId" TEXT NOT NULL,
    "CustomerId" TEXT NOT NULL,
    "RecipientName" TEXT NOT NULL,
    "Phone" TEXT NOT NULL,
    "AddressLine" TEXT NOT NULL,
    "Area" TEXT,
    "City" TEXT NOT NULL,
    "IsDefault" BOOLEAN NOT NULL DEFAULT false,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerAddress_pkey" PRIMARY KEY ("AddressId")
);

-- CreateTable
CREATE TABLE "Expense" (
    "ExpenseId" TEXT NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL,
    "Description" TEXT NOT NULL,
    "Amount" DECIMAL NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("ExpenseId")
);

-- CreateTable
CREATE TABLE "Stock" (
    "StockId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "Reserved" INTEGER NOT NULL DEFAULT 0,
    "Remaining" INTEGER NOT NULL,
    "PurchasingPrice" DECIMAL NOT NULL,
    "Status" TEXT NOT NULL,
    "BarcodePDF" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("StockId")
);

-- CreateTable
CREATE TABLE "SerialNumber" (
    "SerialNumber" TEXT NOT NULL,
    "StockId" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "StoreId" TEXT,
    "IsInWarehouse" BOOLEAN NOT NULL DEFAULT true,
    "SoldAt" TIMESTAMP(3),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SerialNumber_pkey" PRIMARY KEY ("SerialNumber")
);

-- CreateTable
CREATE TABLE "Notification" (
    "NotificationId" TEXT NOT NULL,
    "RecipientId" TEXT NOT NULL,
    "RecipientType" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "Message" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "IsRead" BOOLEAN NOT NULL DEFAULT false,
    "ReferenceId" TEXT,
    "ReferenceType" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("NotificationId")
);

-- CreateTable
CREATE TABLE "Order" (
    "OrderId" TEXT NOT NULL,
    "CustomerId" TEXT NOT NULL,
    "InsideDhaka" BOOLEAN NOT NULL,
    "DeliveryAddress" TEXT NOT NULL,
    "PaymentMethod" TEXT NOT NULL,
    "SubTotal" DECIMAL NOT NULL,
    "DeliveryCharge" DECIMAL NOT NULL,
    "Discount" DECIMAL,
    "TotalBill" DECIMAL NOT NULL,
    "OrderStatus" TEXT NOT NULL,
    "CouponId" TEXT,
    "StoreId" TEXT,
    "EmployeeId" TEXT,
    "PaymentStatus" TEXT NOT NULL,
    "TransactionId" TEXT,
    "InvoiceURL" TEXT,
    "OrderType" TEXT NOT NULL,
    "DeliveryNote" TEXT,
    "SellerNote" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("OrderId")
);

-- CreateTable
CREATE TABLE "OrderProduct" (
    "OrderId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "SerialNumber" TEXT,
    "PurchasePrice" DECIMAL NOT NULL,
    "PurchaseDiscount" DECIMAL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderProduct_pkey" PRIMARY KEY ("OrderId","ProductId")
);

-- CreateTable
CREATE TABLE "Product" (
    "ProductId" TEXT NOT NULL,
    "GroupId" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "SubTitle" TEXT,
    "BannerImageURL" TEXT,
    "MainPrice" DECIMAL NOT NULL,
    "Discount" DECIMAL,
    "Price" DECIMAL NOT NULL,
    "IsNewArrival" BOOLEAN NOT NULL DEFAULT false,
    "IsHotDeal" BOOLEAN NOT NULL DEFAULT false,
    "IsDiscounted" BOOLEAN NOT NULL DEFAULT false,
    "Status" TEXT NOT NULL,
    "Slug" TEXT NOT NULL,
    "MetaTitle" TEXT,
    "MetaDescription" TEXT,
    "CouponId" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("ProductId")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "ProductImageId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "Title" TEXT,
    "ImageURL" TEXT NOT NULL,
    "OrderIndex" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("ProductImageId")
);

-- CreateTable
CREATE TABLE "DescriptionImage" (
    "DescriptionImageId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "ImageURL" TEXT NOT NULL,
    "OrderIndex" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DescriptionImage_pkey" PRIMARY KEY ("DescriptionImageId")
);

-- CreateTable
CREATE TABLE "KeyFeature" (
    "KeyFeatureId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "Feature" TEXT NOT NULL,
    "OrderIndex" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeyFeature_pkey" PRIMARY KEY ("KeyFeatureId")
);

-- CreateTable
CREATE TABLE "Tag" (
    "TagId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "Tag" TEXT NOT NULL,
    "OrderIndex" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("TagId")
);

-- CreateTable
CREATE TABLE "ProductFilter" (
    "ProductFilterId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "FilterId" TEXT NOT NULL,
    "FilterItemId" TEXT NOT NULL,
    "OrderIndex" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductFilter_pkey" PRIMARY KEY ("ProductFilterId")
);

-- CreateTable
CREATE TABLE "ProductSpecification" (
    "ProductSpecificationId" TEXT NOT NULL,
    "SpecificationId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "Value" TEXT NOT NULL,
    "OrderIndex" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductSpecification_pkey" PRIMARY KEY ("ProductSpecificationId")
);

-- CreateTable
CREATE TABLE "Review" (
    "ReviewId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Comment" TEXT,
    "Rating" INTEGER NOT NULL,
    "OrderIndex" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("ReviewId")
);

-- CreateTable
CREATE TABLE "AffiliateProduct" (
    "AffiliateProductId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "AffiliateSource" TEXT NOT NULL,
    "AffiliateURL" TEXT NOT NULL,
    "AffiliatePrice" DECIMAL(65,30) NOT NULL,
    "CommissionPCT" DECIMAL(65,30),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateProduct_pkey" PRIMARY KEY ("AffiliateProductId")
);

-- CreateTable
CREATE TABLE "ReturnRequest" (
    "ReturnRequestId" TEXT NOT NULL,
    "OrderId" TEXT NOT NULL,
    "CustomerId" TEXT NOT NULL,
    "ProductId" TEXT NOT NULL,
    "SerialNumber" TEXT,
    "Reason" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "RefundAmount" DECIMAL,
    "RefundMethod" TEXT,
    "RefundStatus" TEXT,
    "HandledByEmployeeId" TEXT,
    "StoreId" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("ReturnRequestId")
);

-- CreateTable
CREATE TABLE "Store" (
    "StoreId" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "SubTitle" TEXT,
    "Address" TEXT NOT NULL,
    "Phone" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "OTP" TEXT,
    "OTPExpires" TIMESTAMP(3),
    "OrderIndex" INTEGER NOT NULL,
    "StoreNumber" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("StoreId")
);

-- CreateTable
CREATE TABLE "Employee" (
    "EmployeeId" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Phone" TEXT NOT NULL,
    "Address" TEXT,
    "Password" TEXT NOT NULL,
    "HireDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3),
    "ImageURL" TEXT,
    "StoreId" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "Role" TEXT NOT NULL,
    "OTP" TEXT,
    "OTPExpires" TIMESTAMP(3),
    "EmployeeNumber" TEXT NOT NULL,
    "OrderIndex" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("EmployeeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_Slug_key" ON "Brand"("Slug");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_CustomerId_key" ON "Wishlist"("CustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItem_WishlistId_ProductId_key" ON "WishlistItem"("WishlistId", "ProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_CustomerId_key" ON "Cart"("CustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_CartId_ProductId_key" ON "CartItem"("CartId", "ProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_Slug_key" ON "Category"("Slug");

-- CreateIndex
CREATE UNIQUE INDEX "SubCategory_Slug_key" ON "SubCategory"("Slug");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_Code_key" ON "Coupon"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "CouponUsage_OrderId_key" ON "CouponUsage"("OrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_Phone_key" ON "Customer"("Phone");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_Email_key" ON "Customer"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_Slug_key" ON "Product"("Slug");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateProduct_ProductId_key" ON "AffiliateProduct"("ProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_Email_key" ON "Store"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Store_StoreNumber_key" ON "Store"("StoreNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_EmployeeNumber_key" ON "Employee"("EmployeeNumber");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_BrandId_fkey" FOREIGN KEY ("BrandId") REFERENCES "Brand"("BrandId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_CategoryId_fkey" FOREIGN KEY ("CategoryId") REFERENCES "Category"("CategoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_SubCategoryId_fkey" FOREIGN KEY ("SubCategoryId") REFERENCES "SubCategory"("SubCategoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_WarrantyId_fkey" FOREIGN KEY ("WarrantyId") REFERENCES "Warranty"("WarrantyId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignProduct" ADD CONSTRAINT "CampaignProduct_CampaignId_fkey" FOREIGN KEY ("CampaignId") REFERENCES "Campaign"("CampaignId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignProduct" ADD CONSTRAINT "CampaignProduct_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("ProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_CustomerId_fkey" FOREIGN KEY ("CustomerId") REFERENCES "Customer"("CustomerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_WishlistId_fkey" FOREIGN KEY ("WishlistId") REFERENCES "Wishlist"("WishlistId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("ProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_CustomerId_fkey" FOREIGN KEY ("CustomerId") REFERENCES "Customer"("CustomerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_CartId_fkey" FOREIGN KEY ("CartId") REFERENCES "Cart"("CartId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("ProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_CategoryId_fkey" FOREIGN KEY ("CategoryId") REFERENCES "Category"("CategoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filter" ADD CONSTRAINT "Filter_SubCategoryId_fkey" FOREIGN KEY ("SubCategoryId") REFERENCES "SubCategory"("SubCategoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilterItem" ADD CONSTRAINT "FilterItem_FilterId_fkey" FOREIGN KEY ("FilterId") REFERENCES "Filter"("FilterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specification" ADD CONSTRAINT "Specification_SubCategoryId_fkey" FOREIGN KEY ("SubCategoryId") REFERENCES "SubCategory"("SubCategoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_CouponId_fkey" FOREIGN KEY ("CouponId") REFERENCES "Coupon"("CouponId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_CustomerId_fkey" FOREIGN KEY ("CustomerId") REFERENCES "Customer"("CustomerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_OrderId_fkey" FOREIGN KEY ("OrderId") REFERENCES "Order"("OrderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_CustomerId_fkey" FOREIGN KEY ("CustomerId") REFERENCES "Customer"("CustomerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("ProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SerialNumber" ADD CONSTRAINT "SerialNumber_StockId_fkey" FOREIGN KEY ("StockId") REFERENCES "Stock"("StockId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SerialNumber" ADD CONSTRAINT "SerialNumber_StoreId_fkey" FOREIGN KEY ("StoreId") REFERENCES "Store"("StoreId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_RecipientId_fkey" FOREIGN KEY ("RecipientId") REFERENCES "Customer"("CustomerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_CustomerId_fkey" FOREIGN KEY ("CustomerId") REFERENCES "Customer"("CustomerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_CouponId_fkey" FOREIGN KEY ("CouponId") REFERENCES "Coupon"("CouponId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_StoreId_fkey" FOREIGN KEY ("StoreId") REFERENCES "Store"("StoreId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_EmployeeId_fkey" FOREIGN KEY ("EmployeeId") REFERENCES "Employee"("EmployeeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProduct" ADD CONSTRAINT "OrderProduct_OrderId_fkey" FOREIGN KEY ("OrderId") REFERENCES "Order"("OrderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProduct" ADD CONSTRAINT "OrderProduct_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("ProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProduct" ADD CONSTRAINT "OrderProduct_SerialNumber_fkey" FOREIGN KEY ("SerialNumber") REFERENCES "SerialNumber"("SerialNumber") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_GroupId_fkey" FOREIGN KEY ("GroupId") REFERENCES "Group"("GroupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_CouponId_fkey" FOREIGN KEY ("CouponId") REFERENCES "Coupon"("CouponId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("ProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DescriptionImage" ADD CONSTRAINT "DescriptionImage_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("ProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyFeature" ADD CONSTRAINT "KeyFeature_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("ProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("ProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFilter" ADD CONSTRAINT "ProductFilter_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("ProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFilter" ADD CONSTRAINT "ProductFilter_FilterId_fkey" FOREIGN KEY ("FilterId") REFERENCES "Filter"("FilterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFilter" ADD CONSTRAINT "ProductFilter_FilterItemId_fkey" FOREIGN KEY ("FilterItemId") REFERENCES "FilterItem"("FilterItemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSpecification" ADD CONSTRAINT "ProductSpecification_SpecificationId_fkey" FOREIGN KEY ("SpecificationId") REFERENCES "Specification"("SpecificationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSpecification" ADD CONSTRAINT "ProductSpecification_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("ProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("ProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateProduct" ADD CONSTRAINT "AffiliateProduct_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("ProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_OrderId_fkey" FOREIGN KEY ("OrderId") REFERENCES "Order"("OrderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_CustomerId_fkey" FOREIGN KEY ("CustomerId") REFERENCES "Customer"("CustomerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES "Product"("ProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_SerialNumber_fkey" FOREIGN KEY ("SerialNumber") REFERENCES "SerialNumber"("SerialNumber") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_HandledByEmployeeId_fkey" FOREIGN KEY ("HandledByEmployeeId") REFERENCES "Employee"("EmployeeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_StoreId_fkey" FOREIGN KEY ("StoreId") REFERENCES "Store"("StoreId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_StoreId_fkey" FOREIGN KEY ("StoreId") REFERENCES "Store"("StoreId") ON DELETE RESTRICT ON UPDATE CASCADE;
