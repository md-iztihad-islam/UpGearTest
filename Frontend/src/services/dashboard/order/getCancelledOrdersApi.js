import axiosInstance from "@/helpers/dashboard/axiosInstance";

export default async function getCancelledOrdersApi(startDate, endDate) {
    try {
        let url = `/order/get-all-canceled-orders?`;
        const now = new Date();
        
        if (startDate) {
            url += `&startDate=${startDate}`;
        } else {
            url += `&startDate=2023-01-01`;
        }


        if (endDate) {
            url += `&endDate=${endDate}`;
        } else {
            url += `&endDate=${now.toISOString().split('T')[0]}`;
        }

        const response = await axiosInstance.get(url);
        const data = response.data;
    
        
        return data;
    } catch (error) {
        console.error('Error fetching cancelled orders:', error);
        throw error;
    }
}