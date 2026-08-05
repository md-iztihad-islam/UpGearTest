import {
    addGroupRepository,
    deleteGroupByIdRepository,
    updateGroupByIdRepository,
    getAllGroupsRepository,
    getGroupByIdRepository,
    searchGroupsByKeywordRepository,
} from "./groupRepositories.js";

export const addGroupService = async (groupData) => {
    try {
        const response = await addGroupRepository(groupData);
        return response;
    } catch (error) {
        console.log("Error in addGroupService:", error);
        return {
            message: "Error adding group in service",
        };
    }
};

export const deleteGroupByIdService = async (groupId) => {
    try {
        const response = await deleteGroupByIdRepository(groupId);
        return response;
    } catch (error) {
        console.log("Error in deleteGroupByIdService:", error);
        return {
            message: "Error deleting group in service",
        };
    }
};

export const updateGroupByIdService = async (groupId, updateData) => {
    try {
        const response = await updateGroupByIdRepository(groupId, updateData);
        return response;
    } catch (error) {
        console.log("Error in updateGroupByIdService:", error);
        return {
            message: "Error updating group in service",
        };
    }
};

export const getAllGroupsService = async () => {
    try {
        const response = await getAllGroupsRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllGroupsService:", error);
        return {
            message: "Error fetching groups in service",
        };
    }
};

export const getGroupByIdService = async (groupId) => {
    try {
        const response = await getGroupByIdRepository(groupId);
        return response;
    } catch (error) {
        console.log("Error in getGroupByIdService:", error);
        return {
            message: "Error fetching group by ID in service",
        };
    }
};

export const searchGroupsByKeywordService = async (keyword, limit, page, skip) => {
    try {
        const response = await searchGroupsByKeywordRepository(keyword, limit, page, skip);
        return response;
    } catch (error) {
        console.log("Error in searchGroupsByKeywordService:", error);
        return {
            message: error.message || "Error searching groups by keyword in service",
        }
    };
};