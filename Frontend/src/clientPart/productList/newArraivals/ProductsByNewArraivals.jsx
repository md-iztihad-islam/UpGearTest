import ProductListingPage from "@/components/clientPart/productList/ProductListingPage";
import { getNewArrivalsApi } from "@/services/clientPart/products/productListingApi";

function ProductsByNewArraivals() {
    return (
        <ProductListingPage
            title="New Arrivals"
            subtitle="Fresh on the shop"
            queryKey={["newArrivalsListing"]}
            fetchListing={getNewArrivalsApi}
        />
    );
}

export default ProductsByNewArraivals;
