import ProductListingPage from "@/components/clientPart/productList/ProductListingPage";
import { searchProductsApi } from "@/services/clientPart/products/productListingApi";

function SearchResultsPage() {
    return (
        <ProductListingPage
            isSearch
            queryKey={["searchListing"]}
            fetchListing={searchProductsApi}
        />
    );
}

export default SearchResultsPage;
