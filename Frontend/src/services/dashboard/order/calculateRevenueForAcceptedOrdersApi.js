import getOrderSummaryApi from "./getOrderSummaryApi";

// Kept for the dashboard home card: { data: number }
async function calculateRevenueForAcceptedOrdersApi() {
    const summary = await getOrderSummaryApi();
    return { data: summary?.data?.revenue ?? 0 };
}

export default calculateRevenueForAcceptedOrdersApi;
