import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getCategoryByIdApi(categoryId) {
    try {
        const response = await axiosInstance.get(`/category/get-category-by-id/${categoryId}`);
        return response.data;
    } catch (error) {
        console.log("Error in getCategoryByIdApi:", error);
        return null;
    }
}

export default getCategoryByIdApi;