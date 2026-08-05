import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function addEmployeeApi(employeeData) {
    try {
        const response = await axiosInstance.post("/employee/add-employee", employeeData);
        return response.data;
    } catch (error) {
        console.error("Error adding employee:", error);
        throw error;
    }
};

export default addEmployeeApi;