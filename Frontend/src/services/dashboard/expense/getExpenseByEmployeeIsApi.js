import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getExpenseByEmployeeApi(employeeId) {
    try {
        const response = await axiosInstance.get(`/expense/get-expenses-by-employee/${employeeId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching expense by employee:", error);
        throw error;
    }
};

export default getExpenseByEmployeeApi;