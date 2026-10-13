import ProductListingPage from "@/components/clientPart/productList/ProductListingPage";
import { getDiscountedProductsApi } from "@/services/clientPart/products/productListingApi";

function ProductsByDiscounted() {
    return (
        <ProductListingPage
            title="Discounted"
            subtitle="Biggest savings first"
            queryKey={["discountedListing"]}
            fetchListing={getDiscountedProductsApi}
            defaultSort="discount-desc"
        />
    );
}

export default ProductsByDiscounted;
