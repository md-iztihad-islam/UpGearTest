import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getWarrantyByIdApi(warrantyId) {
    try {
        const response = await axiosInstance.get(`/warranty/get-warranty-by-id/${warrantyId}`);
        return response.data;
    } catch (error) {
        console.log("Error in getWarrantyByIdApi:", error);
        return null;
    }
}

export default getWarrantyByIdApi;