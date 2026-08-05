import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function updateWarrantyApi(warrantyId, warrantyData) {
    try {
        const response = await axiosInstance.put(`/warranty/update-warranty-by-id/${warrantyId}`, warrantyData);
        return response.data;
    } catch (error) {
        console.log("Error in updateWarrantyApi:", error);
        return null;
    }
}

export default updateWarrantyApi;