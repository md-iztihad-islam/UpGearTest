import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getProductsBySubCategoryApi(subCategorySlug, { page = 1, limit = 10, sortBy, filter = [] } = {}) {
    try {
        const response = await axiosInstance.get(`/product/get-products-by-subcategory/${subCategorySlug}`, {
            params: {
                page,
                limit,
                ...(sortBy && { sortBy }),
                ...(filter.length > 0 && { filter: JSON.stringify(filter) }),
            },
        });
        return response.data;
    } catch (error) {
        console.log("Error fetching products by sub-category:", error);
        return null;
    }
}

export default getProductsBySubCategoryApi;