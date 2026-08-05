import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getAllCategories(){
    try {
        const response = await axiosInstance.get("/category/get-all-categories");
        return response.data;
    } catch (error) {
        console.log("Error in getAllCategories:", error);
        return [];
    }   
}

export default getAllCategories;