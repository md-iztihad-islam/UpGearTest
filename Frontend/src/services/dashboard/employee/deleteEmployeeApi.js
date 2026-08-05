import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function deleteEmployeeApi(employeeId) {
    try {
        const response = await axiosInstance.delete(`/employee/delete-employee-by-id/${employeeId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting employee:", error);
        throw error;
    }
};

export default deleteEmployeeApi;