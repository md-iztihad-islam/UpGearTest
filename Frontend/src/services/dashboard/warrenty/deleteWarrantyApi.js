import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function deleteWarrantyApi(warrantyId) {
    try {
        const response = await axiosInstance.delete(`/warranty/delete-warranty-by-id/${warrantyId}`);
        return response.data;
    } catch (error) {
        console.log("Error in deleteWarrantyApi:", error);
        return null;
    }
}

export default deleteWarrantyApi;