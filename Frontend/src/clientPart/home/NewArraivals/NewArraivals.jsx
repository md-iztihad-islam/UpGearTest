import ProductRow from "../components/ProductRow";
import { getNewArrivalsApi } from "@/services/clientPart/products/productListingApi";

function NewArraivals() {
    return (
        <ProductRow
            title="New On The Shop!"
            subtitle="We've got some shiny stuff for your desk"
            queryKey={["home", "newArrivals"]}
            fetchProducts={getNewArrivalsApi}
            viewAllTo="/new-arraivals"
            glowClass="-right-32 bg-blue-600/20"
        />
    );
}

export default NewArraivals;
