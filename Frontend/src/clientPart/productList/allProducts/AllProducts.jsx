import ProductListingPage from "@/components/clientPart/productList/ProductListingPage";
import { getShopProductsApi } from "@/services/clientPart/products/productListingApi";

function AllProducts() {
    return (
        <ProductListingPage
            title="All Products"
            queryKey={["shopProducts"]}
            fetchListing={getShopProductsApi}
        />
    );
}

export default AllProducts;
