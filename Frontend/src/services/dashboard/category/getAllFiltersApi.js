import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getAllFiltersApi(){
    try {
        const response = await axiosInstance.get("/filter/get-all-filters");
        return response.data;
    } catch (error) {
        console.log("Error in getAllFiltersApi:", error);
        return [];
    }
}

export default getAllFiltersApi;