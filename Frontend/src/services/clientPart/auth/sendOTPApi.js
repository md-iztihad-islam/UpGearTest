import axiosInstance from "../../../helpers/dashboard/axiosInstance";

async function sendOTPApi(customerPhone) {
    try {
        const response = await axiosInstance.post('/customer/send-otp', { customerPhone });
        return response.data;
    } catch (error) {
        console.log("Error in sendOTP:", error);
        return null;
    }
}

export default sendOTPApi;