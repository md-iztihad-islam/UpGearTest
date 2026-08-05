import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getEmployeeByIdApi(employeeId) {
    try {
        const response = await axiosInstance.get(`/employee/get-employee-by-id/${employeeId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching employee by ID:", error);
        throw error;
    }
};

export default getEmployeeByIdApi;