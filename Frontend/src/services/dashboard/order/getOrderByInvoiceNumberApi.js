import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getOrderByInvoiceNumberApi(invoiceNumber) {
    try {
        const response = await axiosInstance.get(`/order/invoice/${invoiceNumber}`);
        return response.data;
    } catch (error) {
        console.log("Error fetching order by invoice number:", error);
        throw error;
    }
}

export default getOrderByInvoiceNumberApi;