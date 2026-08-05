import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getGroupBySubCategoryApi(subCategoryId){
    try {
        const response = await axiosInstance.get(`/group/group-by-sub-category/${subCategoryId}`);
        return response.data;
    } catch (error) {
        console.log("Error in getGroupBySubCategoryApi:", error);
        return [];
    }
}

export default getGroupBySubCategoryApi;