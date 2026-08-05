import {
    addNotificationService,
    deleteNotificationByIdService,
    updateNotificationByIdService,
    getAllNotificationsService,
    getNotificationByIdService,
} from "./notificationServices.js";

export const addNotificationController = async (req, res) => {
    try {
        const notificationData = { ...req.body };

        if (!notificationData.recipientId) {
            return res.status(400).json({
                success: false,
                message: "Notification recipientId is required",
            });
        }

        if (!notificationData.recipientType) {
            return res.status(400).json({
                success: false,
                message: "Notification recipientType is required",
            });
        }

        if (!notificationData.title) {
            return res.status(400).json({
                success: false,
                message: "Notification title is required",
            });
        }

        if (!notificationData.message) {
            return res.status(400).json({
                success: false,
                message: "Notification message is required",
            });
        }

        if (!notificationData.type) {
            return res.status(400).json({
                success: false,
                message: "Notification type is required",
            });
        }

        const response = await addNotificationService(notificationData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error adding notification",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Notification added successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in addNotificationController:", error);
        return res.status(500).json({
            success: false,
            message: "Error adding notification in controller",
        });
    }
};

export const getAllNotificationsController = async (req, res) => {
    try {
        const response = await getAllNotificationsService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching notifications",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getAllNotificationsController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching notifications in controller",
        });
    }
};

export const getNotificationByIdController = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;

        if (!notificationId) {
            return res.status(400).json({
                success: false,
                message: "Notification id is required",
            });
        }

        const response = await getNotificationByIdService(notificationId);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "Notification not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getNotificationByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching notification in controller",
        });
    }
};

export const updateNotificationByIdController = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;
        const updateData = { ...req.body };

        if (!notificationId) {
            return res.status(400).json({
                success: false,
                message: "Notification id is required",
            });
        }

        const response = await updateNotificationByIdService(notificationId, updateData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error updating notification",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification updated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in updateNotificationByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating notification in controller",
        });
    }
};

export const deleteNotificationByIdController = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;

        if (!notificationId) {
            return res.status(400).json({
                success: false,
                message: "Notification id is required",
            });
        }

        const response = await deleteNotificationByIdService(notificationId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deleting notification",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deleteNotificationByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting notification in controller",
        });
    }
};
