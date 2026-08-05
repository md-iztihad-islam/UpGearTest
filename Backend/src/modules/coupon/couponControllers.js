import {
    addCouponService,
    deleteCouponByIdService,
    updateCouponByIdService,
    getAllCouponsService,
    getCouponByIdService,
    activateCouponByIdService,
    deactivateCouponByIdService,
    getActiveCouponsService,
    getInactiveCouponsService,
    getCouponByCodeService,
} from "./couponServices.js";

const normalizeDecimal = (value) => {
    if (value === undefined || value === null) return undefined;
    return typeof value === "string" ? parseFloat(value) : value;
};

export const addCouponController = async (req, res) => {
    try {
        const couponData = { ...req.body };

        if (!couponData.title) {
            return res.status(400).json({
                success: false,
                message: "Coupon title is required",
            });
        }

        if (!couponData.code) {
            return res.status(400).json({
                success: false,
                message: "Coupon code is required",
            });
        }

        couponData.discountPCT = normalizeDecimal(couponData.discountPCT);
        couponData.discountAMT = normalizeDecimal(couponData.discountAMT);
        couponData.minOrderAmount = normalizeDecimal(couponData.minOrderAmount);

        const response = await addCouponService(couponData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error adding coupon",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Coupon added successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in addCouponController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error adding coupon in controller",
        });
    }
};

export const getAllCouponsController = async (req, res) => {
    try {
        const response = await getAllCouponsService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching coupons",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getAllCouponsController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error fetching coupons in controller",
        });
    }
};

export const getCouponByIdController = async (req, res) => {
    try {
        const couponId = req.params.couponId;

        if (!couponId) {
            return res.status(400).json({
                success: false,
                message: "Coupon id is required",
            });
        }

        const response = await getCouponByIdService(couponId);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "Coupon not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getCouponByIdController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error fetching coupon in controller",
        });
    }
};

export const updateCouponByIdController = async (req, res) => {
    try {
        const couponId = req.params.couponId;
        const updateData = { ...req.body };

        if (!couponId) {
            return res.status(400).json({
                success: false,
                message: "Coupon id is required",
            });
        }

        if (updateData.orderIndex !== undefined) {
            const parsedOrderIndex = Number.parseInt(updateData.orderIndex, 10);
            if (Number.isNaN(parsedOrderIndex)) {
                return res.status(400).json({
                    success: false,
                    message: "Coupon orderIndex must be a valid number",
                });
            }
            updateData.orderIndex = parsedOrderIndex;
        }

        updateData.discountPCT = normalizeDecimal(updateData.discountPCT);
        updateData.discountAMT = normalizeDecimal(updateData.discountAMT);
        updateData.minOrderAmount = normalizeDecimal(updateData.minOrderAmount);

        const response = await updateCouponByIdService(couponId, updateData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error updating coupon",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon updated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in updateCouponByIdController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error updating coupon in controller",
        });
    }
};

export const deleteCouponByIdController = async (req, res) => {
    try {
        const couponId = req.params.couponId;

        if (!couponId) {
            return res.status(400).json({
                success: false,
                message: "Coupon id is required",
            });
        }

        const response = await deleteCouponByIdService(couponId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deleting coupon",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon deleted successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deleteCouponByIdController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error deleting coupon in controller",
        });
    }
};

export const activateCouponByIdController = async (req, res) => {
    try {
        const couponId = req.params.couponId;

        if(!couponId) {
            return res.status(400).json({
                success: false,
                message: "Coupon id is required",
            });
        }

        const response = await activateCouponByIdService(couponId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error activating coupon",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon activated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in activateCouponByIdController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error activating coupon in controller",
        });
    }
}

export const deactivateCouponByIdController = async (req, res) => {
    try {
        const couponId = req.params.couponId;

        if(!couponId) {
            return res.status(400).json({
                success: false,
                message: "Coupon id is required",
            });
        }

        const response = await deactivateCouponByIdService(couponId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deactivating coupon",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon deactivated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deactivateCouponByIdController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error deactivating coupon in controller",
        });
    }
}

export const getActiveCouponsController = async (req, res) => {
    try {
        const response = await getActiveCouponsService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching active coupons",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getActiveCouponsController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error fetching active coupons in controller",
        });
    }
}

export const getInactiveCouponsController = async (req, res) => {
    try {
        const response = await getInactiveCouponsService();
        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching inactive coupons",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getInactiveCouponsController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error fetching inactive coupons in controller",
        });
    }
}

export const getCouponByCodeController = async (req, res) => {
    try {
        const couponCode = req.params.couponCode;

        if (!couponCode) {
            return res.status(400).json({
                success: false,
                message: "Coupon code is required",
            });
        }

        const response = await getCouponByCodeService(couponCode);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "Coupon not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getCouponByCodeController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error fetching coupon by code in controller",
        });
    }
}