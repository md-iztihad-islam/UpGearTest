import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getAllFilterItemsApi(){
    try {
        const response = await axiosInstance.get(`/filter-item/get-all-filter-items`);
        return response.data;
    } catch (error) {
        console.log("Error in getAllFilterItemsApi:", error);
        return [];
    }
}

export default getAllFilterItemsApi;