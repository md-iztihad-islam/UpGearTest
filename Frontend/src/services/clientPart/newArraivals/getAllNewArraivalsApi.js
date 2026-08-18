import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getAllNewArraivalsApi() {
    try {
        const response = await axiosInstance.get("/product/get-new-arrivals");
        return response.data;
    } catch (error) {
        console.log("Error in getAllNewArraivalsApi:", error);
        return null;
    }
}

export default getAllNewArraivalsApi;