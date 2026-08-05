import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function signoutApi() {
    // Get token from localStorage
    const token = localStorage.getItem("token");
    
    if (!token) {
        throw new Error("No token found");
    }

    const response = await axiosInstance.post(
        '/employee/employee-sign-out',
        {},
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );
    
    return response.data;
}

export default signoutApi;