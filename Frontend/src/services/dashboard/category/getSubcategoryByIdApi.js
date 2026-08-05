import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getSubcategioryByIdApi(subcategoryId) {
    try {
        const response = await axiosInstance.get(`/sub-category/get-subcategory-by-id/${subcategoryId}`);
        return response.data;
    } catch (error) {
        console.log("Error in getSubcategioryById:", error);
        return null;
    }
}

export default getSubcategioryByIdApi;