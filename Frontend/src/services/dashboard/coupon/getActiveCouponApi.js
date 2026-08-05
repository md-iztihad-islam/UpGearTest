import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getActiveCouponApi() {
    try {
        const response = await axiosInstance.get('/coupon/get-active-coupons');
        return response.data;
    } catch (error) {
        console.log('Error fetching active coupons:', error);
        return null;
    }
}

export default getActiveCouponApi;