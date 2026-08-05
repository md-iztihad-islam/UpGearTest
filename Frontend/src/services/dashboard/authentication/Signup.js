import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function signupApi(userData) {
    try {
        const response = await axiosInstance.post('/admin/create-admin', userData);
        return response.data;
    } catch (error) {
        console.log("Error in signupApi:", error);
        return null;
    }
}

export default signupApi;