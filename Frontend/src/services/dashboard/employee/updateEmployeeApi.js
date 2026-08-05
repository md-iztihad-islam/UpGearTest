import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function updateEmployeeApi(employeeId, employeeData) {
    try {
        const response = await axiosInstance.put(`/employee/update-employee-by-id/${employeeId}`, employeeData);
        return response.data;
    } catch (error) {
        console.error("Error updating employee:", error);
        throw error;
    }
};

export default updateEmployeeApi;