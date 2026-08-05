import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getCustomerByIdApi(customerid) {
    try {
        const response = await axiosInstance.get(`/customer/get-customer-by-id/${customerid}`);
        return response.data;
    } catch (error) {
        console.log("Error fetching customer:", error);
        throw error;
    }
}

export default getCustomerByIdApi;