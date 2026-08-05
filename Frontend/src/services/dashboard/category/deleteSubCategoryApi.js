import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function deleteSubCategoryApi(subCategoryId) {
    try {
        const response = await axiosInstance.delete(`/sub-category/delete-subcategory-by-id/${subCategoryId}`);
        return response.data;
    } catch (error) {
        console.log("Error in deleteSubCategoryApi:", error);
        return null;
    }
}

export default deleteSubCategoryApi;