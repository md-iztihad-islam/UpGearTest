import ProductRow from "../components/ProductRow";
import { getDiscountedProductsApi } from "@/services/clientPart/products/productListingApi";

function Discounted() {
    return (
        <ProductRow
            title="We're giving you a discount"
            subtitle="You scrolled far down, here's a reward for you"
            queryKey={["home", "discounted"]}
            fetchProducts={(options) => getDiscountedProductsApi({ ...options, sortBy: "discount-desc" })}
            viewAllTo="/discounted"
            glowClass="-right-32 bg-green-600/20"
        />
    );
}

export default Discounted;
