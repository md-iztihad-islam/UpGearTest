import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function addFilterItemApi(filterItemData){
    try {
        const response = await axiosInstance.post("/filter-item/add-filter-item", filterItemData);
        return response.data;
    } catch (error) {
        console.log("Error in addFilterItemApi:", error);
        return null;
    }
}

export default addFilterItemApi;