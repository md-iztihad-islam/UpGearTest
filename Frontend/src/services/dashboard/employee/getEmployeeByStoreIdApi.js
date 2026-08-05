import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getEmployeeByStoreIdApi(storeId) {
    try {
        const response = await axiosInstance.get(`/employee/get-employee-by-store-id/${storeId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching employees by store ID:", error);
        throw error;
    }
};

export default getEmployeeByStoreIdApi;