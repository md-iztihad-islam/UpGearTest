import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function addFilterApi(filterData){
    try {
        const response = await axiosInstance.post("/filter/add-filter", filterData);
        return response.data;
    } catch (error) {
        console.log("Error in addFilterApi:", error);
        return null;
    }
}

export default addFilterApi;