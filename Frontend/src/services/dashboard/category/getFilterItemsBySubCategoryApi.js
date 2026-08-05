import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getFilterItemsBySubCategoryApi(subCategoryId){
    try {
        const response = await axiosInstance.get(`/filter-item/get-filter-items-by-sub-category-id/${subCategoryId}`);
        return response.data;
    } catch (error) {
        console.log("Error in getFiltersBySubCategoryApi:", error);
        return [];
    }
}

export default getFilterItemsBySubCategoryApi;