import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function updateStoreApi(storeId, storeData) {
    try {
        const response = await axiosInstance.put(`/store/update-store-by-id/${storeId}`, storeData);
        return response.data;
    } catch (error) {
        console.error("Error updating store:", error);
        throw error;
    }
}

export default updateStoreApi;