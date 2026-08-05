import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function signoutCustomerApi() {
    // Get token from localStorage
    const token = localStorage.getItem("token");
    
    if (!token) {
        throw new Error("No token found");
    }

    const response = await axiosInstance.post(
        '/customer/signout',
        {},
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );
    
    return response.data;
}

export default signoutCustomerApi;