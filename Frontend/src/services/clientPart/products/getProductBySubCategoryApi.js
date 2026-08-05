// services/clientPart/products/getProductBySubCategoryApi.js
import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getProductBySubCategoryApi({ subcategoryslug, filters, page }) {
    try {
        // console.log("API call params:", { subcategoryslug, filters, page });
        
        const response = await axiosInstance.get(
            `/product/get-products-by-subcategory/${subcategoryslug}`,
            {
                params: {
                    filters: JSON.stringify(filters), // Stringify filters for GET request
                    page: page || 1
                }
            }
        );
        return response.data;
    } catch (error) {
        console.log("Error in getProductBySubCategoryApi:", error);
        return {
            success: false,
            data: [],
            totalCount: 0,
            totalPages: 0,
            currentPage: 1
        };
    }
}

export default getProductBySubCategoryApi;