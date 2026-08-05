import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getAllNewArraivalsApi() {
    try {
        const response = await axiosInstance.get("/new-arraivals/get-newarraivals");
        return response.data;
    } catch (error) {
        console.log("Error in getAllNewArraivalsApi:", error);
        return null;
    }
}

export default getAllNewArraivalsApi;