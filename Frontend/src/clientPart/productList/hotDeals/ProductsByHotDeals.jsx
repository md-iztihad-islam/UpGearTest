import ProductListingPage from "@/components/clientPart/productList/ProductListingPage";
import { getHotDealsApi } from "@/services/clientPart/products/productListingApi";

function ProductsByHotDeals() {
    return (
        <ProductListingPage
            title="Hot Deals"
            subtitle="Selling fast"
            queryKey={["hotDealsListing"]}
            fetchListing={getHotDealsApi}
        />
    );
}

export default ProductsByHotDeals;
