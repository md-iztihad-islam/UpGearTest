import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function addcategoryApi(categoryData){
    try {
        const response = await axiosInstance.post("/category/add-category", categoryData);
        return response.data;
    } catch (error) {
        console.log("Error in addcategoryApi:", error);
        return null;
    }
}

export default addcategoryApi;