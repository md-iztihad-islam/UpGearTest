import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getHotDealsApi() {
    try {
        const response = await axiosInstance.get("/hot-deals/get-hot-deals");
        return response.data;
    } catch (error) {
        console.log("Error in getHotDealsApi:", error);
        return null;
    }
}

export default getHotDealsApi;