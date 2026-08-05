import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getAllSubCategoriesApi(){
    try {
        const response = await axiosInstance.get("/sub-category/get-all-subcategories");
        return response.data;
    } catch (error) {
        console.log("Error in getAllSubCategoriesApi:", error);
        return [];
    }
}

export default getAllSubCategoriesApi;