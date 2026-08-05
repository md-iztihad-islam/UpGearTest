import express from "express";
import {
    activateCouponByIdController,
    addCouponController,
    deactivateCouponByIdController,
    deleteCouponByIdController,
    getActiveCouponsController,
    getAllCouponsController,
    getCouponByCodeController,
    getCouponByIdController,
    getInactiveCouponsController,
    updateCouponByIdController,
} from "./couponControllers.js";
import { getActiveCouponsService } from "./couponServices.js";

const router = express.Router();

router.post("/add-coupon", addCouponController);
router.get("/get-all-coupons", getAllCouponsController);
router.get("/get-coupon-by-id/:couponId", getCouponByIdController);
router.put("/update-coupon-by-id/:couponId", updateCouponByIdController);
router.delete("/delete-coupon-by-id/:couponId", deleteCouponByIdController);
router.put("/activate-coupon-by-id/:couponId", activateCouponByIdController);
router.put("/deactivate-coupon-by-id/:couponId", deactivateCouponByIdController);
router.get("/get-active-coupons", getActiveCouponsController);
router.get("/get-inactive-coupons", getInactiveCouponsController);
router.get("/get-coupon-by-code/:couponCode", getCouponByCodeController);

export default router;
