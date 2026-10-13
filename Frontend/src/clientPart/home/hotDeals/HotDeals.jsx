import ProductRow from "../components/ProductRow";
import { getHotDealsApi } from "@/services/clientPart/products/productListingApi";

function HotDeals() {
    return (
        <ProductRow
            title="Selling too fast!"
            subtitle="Get these before they're out of stock"
            queryKey={["home", "hotDeals"]}
            fetchProducts={getHotDealsApi}
            viewAllTo="/hot-deals"
            glowClass="-left-32 bg-red-600/20"
        />
    );
}

export default HotDeals;
