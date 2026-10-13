import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function updateFilterItemApi(filterItemId, filterItemData){
    try {
        const response = await axiosInstance.put(`/filter-item/update-filter-item-by-id/${filterItemId}`, filterItemData);
        return response.data;
    } catch (error) {
        console.log("Error in updateFilterItemApi:", error);
        return null;
    }
}

export default updateFilterItemApi;
