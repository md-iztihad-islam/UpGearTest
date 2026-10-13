import { useParams } from "react-router-dom";
import ProductListingPage from "@/components/clientPart/productList/ProductListingPage";
import { getProductsBySubCategoryApi } from "@/services/clientPart/products/productListingApi";

function ProductsBySubCategoryAndBrand() {
    const { subcategorySlug, brandSlug } = useParams();

    return (
        <ProductListingPage
            title="Products"
            getTitle={(data) =>
                data?.subCategory && data?.brand ? `${data.brand.title} ${data.subCategory.title}` : undefined
            }
            queryKey={["brandListing", subcategorySlug, brandSlug]}
            fetchListing={(options) => getProductsBySubCategoryApi(subcategorySlug, brandSlug, options)}
        />
    );
}

export default ProductsBySubCategoryAndBrand;
