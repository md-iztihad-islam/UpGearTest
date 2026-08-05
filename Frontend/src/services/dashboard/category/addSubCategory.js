import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function addSubCategoryApi(subCategoryData){
    try {
        const response = await axiosInstance.post("/sub-category/add-subcategory", subCategoryData);
        return response.data;
    } catch (error) {
        console.log("Error in addSubCategoryApi:", error);
        return null;
    }
}

export default addSubCategoryApi;