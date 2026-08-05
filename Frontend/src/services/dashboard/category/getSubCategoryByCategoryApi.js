import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getSubCategoryByCategoryApi(categoryId){
    try {
        const response = await axiosInstance.get(`/sub-category/get-subcategories-by-category-id/${categoryId}`);
        return response.data;
    } catch (error) {
        console.log("Error in getSubCategoryByCategoryApi:", error);
        return [];
    }
}

export default getSubCategoryByCategoryApi;