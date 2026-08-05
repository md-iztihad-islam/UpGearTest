import {
    addCouponUsageService,
    deleteCouponUsageByIdService,
    updateCouponUsageByIdService,
    getAllCouponUsagesService,
    getCouponUsageByIdService,
} from "./couponUsageServices.js";

export const addCouponUsageController = async (req, res) => {
    try {
        const couponUsageData = { ...req.body };

        if (!couponUsageData.couponId) {
            return res.status(400).json({
                success: false,
                message: "CouponUsage couponId is required",
            });
        }

        if (!couponUsageData.customerId) {
            return res.status(400).json({
                success: false,
                message: "CouponUsage customerId is required",
            });
        }

        if (!couponUsageData.orderId) {
            return res.status(400).json({
                success: false,
                message: "CouponUsage orderId is required",
            });
        }

        const response = await addCouponUsageService(couponUsageData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error adding coupon usage",
            });
        }

        return res.status(201).json({
            success: true,
            message: "CouponUsage added successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in addCouponUsageController:", error);
        return res.status(500).json({
            success: false,
            message: "Error adding coupon usage in controller",
        });
    }
};

export const getAllCouponUsagesController = async (req, res) => {
    try {
        const response = await getAllCouponUsagesService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching coupon usages",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getAllCouponUsagesController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching coupon usages in controller",
        });
    }
};

export const getCouponUsageByIdController = async (req, res) => {
    try {
        const couponUsageId = req.params.couponUsageId;

        if (!couponUsageId) {
            return res.status(400).json({
                success: false,
                message: "CouponUsage id is required",
            });
        }

        const response = await getCouponUsageByIdService(couponUsageId);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "CouponUsage not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getCouponUsageByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching coupon usage in controller",
        });
    }
};

export const updateCouponUsageByIdController = async (req, res) => {
    try {
        const couponUsageId = req.params.couponUsageId;
        const updateData = { ...req.body };

        if (!couponUsageId) {
            return res.status(400).json({
                success: false,
                message: "CouponUsage id is required",
            });
        }

        const response = await updateCouponUsageByIdService(couponUsageId, updateData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error updating coupon usage",
            });
        }

        return res.status(200).json({
            success: true,
            message: "CouponUsage updated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in updateCouponUsageByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating coupon usage in controller",
        });
    }
};

export const deleteCouponUsageByIdController = async (req, res) => {
    try {
        const couponUsageId = req.params.couponUsageId;

        if (!couponUsageId) {
            return res.status(400).json({
                success: false,
                message: "CouponUsage id is required",
            });
        }

        const response = await deleteCouponUsageByIdService(couponUsageId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deleting coupon usage",
            });
        }

        return res.status(200).json({
            success: true,
            message: "CouponUsage deleted successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deleteCouponUsageByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting coupon usage in controller",
        });
    }
};
