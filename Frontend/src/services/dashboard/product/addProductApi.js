import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function addProductApi(formData) {
    try {
        const response = await axiosInstance.post("/product/add-product", formData);
        return response.data;
    } catch (error) {
        console.error("Error in addProductApi:", error);
        throw error;
    }
}

export default addProductApi;