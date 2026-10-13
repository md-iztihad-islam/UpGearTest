import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function deleteFilterItemApi(filterItemId){
    try {
        const response = await axiosInstance.delete(`/filter-item/delete-filter-item-by-id/${filterItemId}`);
        return response.data;
    } catch (error) {
        console.log("Error in deleteFilterItemApi:", error);
        return null;
    }
}

export default deleteFilterItemApi;
