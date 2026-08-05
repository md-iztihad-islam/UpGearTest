import express from "express";
import {
    addCouponUsageController,
    deleteCouponUsageByIdController,
    getAllCouponUsagesController,
    getCouponUsageByIdController,
    updateCouponUsageByIdController,
} from "./couponUsageControllers.js";

const router = express.Router();

router.post("/add-coupon-usage", addCouponUsageController);
router.get("/get-all-coupon-usages", getAllCouponUsagesController);
router.get("/get-coupon-usage-by-id/:couponUsageId", getCouponUsageByIdController);
router.put("/update-coupon-usage-by-id/:couponUsageId", updateCouponUsageByIdController);
router.delete("/delete-coupon-usage-by-id/:couponUsageId", deleteCouponUsageByIdController);

export default router;
