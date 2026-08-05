import {
    addNotificationRepository,
    deleteNotificationByIdRepository,
    updateNotificationByIdRepository,
    getAllNotificationsRepository,
    getNotificationByIdRepository,
} from "./notificationRepositories.js";

export const addNotificationService = async (notificationData) => {
    try {
        const response = await addNotificationRepository(notificationData);
        return response;
    } catch (error) {
        console.log("Error in addNotificationService:", error);
        return {
            message: "Error adding notification in service",
        };
    }
};

export const deleteNotificationByIdService = async (notificationId) => {
    try {
        const response = await deleteNotificationByIdRepository(notificationId);
        return response;
    } catch (error) {
        console.log("Error in deleteNotificationByIdService:", error);
        return {
            message: "Error deleting notification in service",
        };
    }
};

export const updateNotificationByIdService = async (notificationId, updateData) => {
    try {
        const response = await updateNotificationByIdRepository(notificationId, updateData);
        return response;
    } catch (error) {
        console.log("Error in updateNotificationByIdService:", error);
        return {
            message: "Error updating notification in service",
        };
    }
};

export const getAllNotificationsService = async () => {
    try {
        const response = await getAllNotificationsRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllNotificationsService:", error);
        return {
            message: "Error fetching notifications in service",
        };
    }
};

export const getNotificationByIdService = async (notificationId) => {
    try {
        const response = await getNotificationByIdRepository(notificationId);
        return response;
    } catch (error) {
        console.log("Error in getNotificationByIdService:", error);
        return {
            message: "Error fetching notification by ID in service",
        };
    }
};
