import axiosInstance from"@/helpers/dashboard/axiosInstance";

async function addWarrantyApi(warrentyData) {
    try {
        const response = await axiosInstance.post("/warranty/add-warranty", warrentyData);
        return response.data;
    } catch (error) {
        console.log("Error in addWarrantyApi:", error);
        return null;
    }
}

export default addWarrantyApi;