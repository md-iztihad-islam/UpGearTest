import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function signupCustomerApi(customerData) {
    try {
        const response = await axiosInstance.post('/customer/signup', customerData);
        return response.data;
    } catch (error) {
        console.log("Error in signupCustomer:", error);
        return null;
    }
}

export default signupCustomerApi;