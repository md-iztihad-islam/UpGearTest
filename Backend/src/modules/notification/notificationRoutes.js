import express from "express";
import {
    addNotificationController,
    deleteNotificationByIdController,
    getAllNotificationsController,
    getNotificationByIdController,
    updateNotificationByIdController,
} from "./notificationControllers.js";

const router = express.Router();

router.post("/add-notification", addNotificationController);
router.get("/get-all-notifications", getAllNotificationsController);
router.get("/get-notification-by-id/:notificationId", getNotificationByIdController);
router.put("/update-notification-by-id/:notificationId", updateNotificationByIdController);
router.delete("/delete-notification-by-id/:notificationId", deleteNotificationByIdController);

export default router;
