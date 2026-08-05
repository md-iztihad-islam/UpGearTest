import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getSpecificationBySubCategoryApi(subcategoryId){ 
    try {
        const response = await axiosInstance.get(`/specification/sub-category/${subcategoryId}`);
        return response.data;
    } catch (error) {
        console.log("Error in getSpecificationBySubCategoryApi:", error);
        return null;
    }
}

export default getSpecificationBySubCategoryApi;