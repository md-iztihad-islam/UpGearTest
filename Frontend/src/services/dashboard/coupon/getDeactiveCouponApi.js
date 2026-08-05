import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getDeactivateCouponApi() {
    try {
        const response = await axiosInstance.get('/coupon/get-inactive-coupons');
        return response.data;
    } catch (error) {
        console.log('Error fetching deactive coupons:', error);
        return null;
    }
}

export default getDeactivateCouponApi;