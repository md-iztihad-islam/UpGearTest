import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getEmployeeByRoleApi(role) {
    try {
        const response = await axiosInstance.get(`/employee/get-employee-by-email/${role}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching employees by role:", error);
        throw error;
    }
};

export default getEmployeeByRoleApi;