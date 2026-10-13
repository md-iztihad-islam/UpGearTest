import { useParams } from "react-router-dom";
import ProductListingPage from "@/components/clientPart/productList/ProductListingPage";
import { getProductsBySubCategoryApi } from "@/services/clientPart/products/productListingApi";

function ProductsBySubcategory() {
    const { subCategorySlug } = useParams();

    return (
        <ProductListingPage
            title="Products"
            getTitle={(data) => data?.subCategory?.title}
            queryKey={["subCategoryListing", subCategorySlug]}
            fetchListing={(options) => getProductsBySubCategoryApi(subCategorySlug, null, options)}
        />
    );
}

export default ProductsBySubcategory;
