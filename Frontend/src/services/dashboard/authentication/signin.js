import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function signinApi(credentials) {
    try {
        const response = await axiosInstance.post('/employee/employee-sign-in', credentials);
        return response.data;
    } catch (error) {
        console.log("Error in signinApi:", error);
        return null;
    }
}

export default signinApi;