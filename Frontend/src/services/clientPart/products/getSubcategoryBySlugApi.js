import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getSubcategoryBySlugApi(slug) {
    try {
        // console.log("Fetching subcategory with slug:", slug);
        const response = await axiosInstance.get(`/sub-category/get-sub-category-by-slug/${slug}`);
        return response.data;
    } catch (error) {
        console.log("Error in getSubcategoryBySlugApi:", error);
        return {
            success: false,
            data: null
        };
    }
}

export default getSubcategoryBySlugApi;