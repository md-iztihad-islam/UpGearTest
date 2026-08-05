import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getFilterItemByFilterApi({filterId}){
    try {
        console.log("Fetching filter items for filter ID:", filterId);
        const response = await axiosInstance.get(`/filter-item/get-filter-items-by-filter/${filterId}`);
        return response.data;
    } catch (error) {
        console.log("Error in getFilterItemByFilterApi:", error);
        return [];
    }
}

export default getFilterItemByFilterApi;