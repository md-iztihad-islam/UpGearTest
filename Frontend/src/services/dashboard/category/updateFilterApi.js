import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function updateFilterApi(filterId, filterData){
    try {
        const response = await axiosInstance.put(`/filter/update-filter-by-id/${filterId}`, filterData);
        return response.data;
    } catch (error) {
        console.log("Error in updateFilterApi:", error);
        return null;
    }
}

export default updateFilterApi;
