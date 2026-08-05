import axiosInstance from "../../../helpers/dashboard/axiosInstance";

async function getCustomerByIdApi(customerId) {
    try {
        const response = await axiosInstance.get(`/customer/get-customer-by-id/${customerId}`);
        return response.data;
    } catch (error) {
        console.log("Error fetching customer by ID:", error);
        throw error;
    }
}

export default getCustomerByIdApi;