import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getAllCustomersApi() {
    try {
        const response = await axiosInstance.get('/customer/get-all-customers');
        return response.data;
    } catch (error) {
        console.log("Error fetching customers:", error);
        throw error;
    }
}

export default getAllCustomersApi;