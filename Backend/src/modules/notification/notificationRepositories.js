import { prisma } from "../../utils/prisma.js";

export const addNotificationRepository = async (notificationData) => {
    try {
        const response = await prisma.notification.create({
            data: notificationData,
        });
        return response;
    } catch (error) {
        console.log("Error in addNotificationRepository:", error);
        return {
            message: "Error adding notification in repository",
        };
    }
};

export const deleteNotificationByIdRepository = async (notificationId) => {
    try {
        const response = await prisma.notification.delete({
            where: {
                notificationId: notificationId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deleteNotificationByIdRepository:", error);
        return {
            message: "Error deleting notification in repository",
        };
    }
};

export const updateNotificationByIdRepository = async (notificationId, updateData) => {
    try {
        const response = await prisma.notification.update({
            where: {
                notificationId: notificationId,
            },
            data: updateData,
        });
        return response;
    } catch (error) {
        console.log("Error in updateNotificationByIdRepository:", error);
        return {
            message: "Error updating notification in repository",
        };
    }
};

export const getAllNotificationsRepository = async () => {
    try {
        const response = await prisma.notification.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllNotificationsRepository:", error);
        return {
            message: "Error fetching notifications in repository",
        };
    }
};

export const getNotificationByIdRepository = async (notificationId) => {
    try {
        const response = await prisma.notification.findUnique({
            where: {
                notificationId: notificationId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getNotificationByIdRepository:", error);
        return {
            message: "Error fetching notification by ID in repository",
        };
    }
};
