import axiosInstance from "@/helpers/dashboard/axiosInstance";

// Server-side price breakdown — the same maths used when the order is placed.
// input: { channel?: "ONLINE" | "POS", items: [{ productId, quantity }],
//          insideDhaka, couponCode?, deliveryCharge? (POS), customDiscount? (POS) }
// Response: { success, data: { lines, subTotal, deliveryCharge, couponDiscount,
//             customDiscount, discount, totalBill, coupon } }
// Throws with err.response.data = { message, field } when something is invalid.
async function quoteOrderApi(input) {
    const response = await axiosInstance.post("/order/quote", input);
    return response.data;
}

export default quoteOrderApi;
