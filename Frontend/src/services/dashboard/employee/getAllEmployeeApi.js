import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getAllEmployeeApi() {
    try {
        const response = await axiosInstance.get("/employee/get-all-employees");
        return response.data;
    } catch (error) {
        console.error("Error fetching employees:", error);
        throw error;
    }
};

export default getAllEmployeeApi;