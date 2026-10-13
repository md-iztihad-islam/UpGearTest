import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function deleteFilterApi(filterId){
    try {
        const response = await axiosInstance.delete(`/filter/delete-filter-by-id/${filterId}`);
        return response.data;
    } catch (error) {
        console.log("Error in deleteFilterApi:", error);
        return null;
    }
}

export default deleteFilterApi;
