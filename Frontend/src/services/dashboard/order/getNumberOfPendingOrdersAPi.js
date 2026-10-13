import getOrderSummaryApi from "./getOrderSummaryApi";

// Kept for the dashboard home card: { data: number }
async function getNumberOfPendingOrdersApi() {
    const summary = await getOrderSummaryApi();
    return { data: summary?.data?.pendingCount ?? 0 };
}

export default getNumberOfPendingOrdersApi;
