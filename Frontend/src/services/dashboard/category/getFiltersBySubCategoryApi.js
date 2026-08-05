import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getFiltersBySubCategoryApi(subCategoryId){
    try {
        const response = await axiosInstance.get(`/filter/get-filters-by-sub-category-id/${subCategoryId}`);
        return response.data;
    } catch (error) {
        console.log("Error in getFiltersBySubCategoryApi:", error);
        return [];
    }
}

export default getFiltersBySubCategoryApi;