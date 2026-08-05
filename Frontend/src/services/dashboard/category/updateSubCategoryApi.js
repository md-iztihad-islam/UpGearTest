import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function updateSubCategoryApi(subcategoryId, subcategoryData) {
    try {
        const response = await axiosInstance.put(`/sub-category/update-subcategory-by-id/${subcategoryId}`, subcategoryData);
        return response.data;
    } catch (error) {
        console.log("Error in updateSubCategoryApi:", error);
        return null;
    }
}

export default updateSubCategoryApi;