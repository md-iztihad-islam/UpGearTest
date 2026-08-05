import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function signinCustomerApi(customerData) {
    try {
        const response = await axiosInstance.post('/customer/signin', customerData);
        return response.data;
    } catch (error) {
        console.log("Error in signinCustomer:", error);
        return null;
    }
}

export default signinCustomerApi;