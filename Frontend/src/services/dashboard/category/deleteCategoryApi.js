import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function deleteCategoryApi(categoryId) {
    try {
        const response = await axiosInstance.delete(`/category/delete-category-by-id/${categoryId}`);
        return response.data;
    } catch (error) {
        console.log("Error in deleteCategoryApi:", error);
        return null;
    }
}

export default deleteCategoryApi;