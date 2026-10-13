import axiosInstance from "@/helpers/dashboard/axiosInstance";

// Only send the dates the user picked. The backend reads them as Bangladesh
// days and treats a missing one as "no limit", so don't default endDate to
// today here — new Date().toISOString() is the UTC date, which lags BD time
// by a day between 00:00 and 06:00 and hides that day's orders.
export default async function getCancelledOrdersApi(startDate, endDate) {
    try {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await axiosInstance.get("/order/get-all-canceled-orders", { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching cancelled orders:", error);
        throw error;
    }
}
