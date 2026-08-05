import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function deleteStoreApi(storeId) {
    try {
        const response = await axiosInstance.delete(`/store/delete-store-by-id/${storeId}`);
        return response.data;
    } catch (error) {
        console.log("Delete store error:", error);
        throw error;
    }
}

export default deleteStoreApi;