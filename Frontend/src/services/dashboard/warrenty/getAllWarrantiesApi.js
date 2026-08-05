import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getAllWarrantiesApi() {
    try {
        const response = await axiosInstance.get("/warranty/get-all-warranties");
        return response.data;
    } catch (error) {
        console.log("Error in getAllWarrantiesApi:", error);
        return null;
    }
}

export default getAllWarrantiesApi;