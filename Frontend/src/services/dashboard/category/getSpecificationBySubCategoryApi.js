import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getSpecificationBySubCategoryApi(subCategoryId){
    try {
        const response = await axiosInstance.get(`/specification/get-specifications-by-sub-category-id/${subCategoryId}`);
        return response.data;
    } catch (error) {
        console.log("Error in getSpecificationBySubCategoryApi:", error);
        return [];
    }
}

export default getSpecificationBySubCategoryApi;