import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getProductsBySubCategoryAndBrandApi(subCategorySlug, brandSlug, { page = 1, limit = 10, sortBy, filter = [] } = {}) {
    try {
        const response = await axiosInstance.get(`/product/sub-category/${subCategorySlug}/brand/${brandSlug}`, {
            params: {
                page,
                limit,
                ...(sortBy && { sortBy }),
                ...(filter.length > 0 && { filter: JSON.stringify(filter) }),
            },
        });
        return response.data;
    } catch (error) {
        console.log("Error fetching products by sub-category and brand:", error);
        return null;
    }
}

export default getProductsBySubCategoryAndBrandApi;