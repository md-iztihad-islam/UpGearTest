import {
    addFilterRepository,
    deleteFilterByIdRepository,
    updateFilterByIdRepository,
    getAllFiltersRepository,
    getFilterByIdRepository,
    getFilterBySubCategoryIdRepository,
} from "./filterRepositories.js";

export const addFilterService = async (filterData) => {
    try {
        const response = await addFilterRepository(filterData);
        return response;
    } catch (error) {
        console.log("Error in addFilterService:", error);
        return {
            message: "Error adding filter in service",
        };
    }
};

export const deleteFilterByIdService = async (filterId) => {
    try {
        const response = await deleteFilterByIdRepository(filterId);
        return response;
    } catch (error) {
        console.log("Error in deleteFilterByIdService:", error);
        return {
            message: "Error deleting filter in service",
        };
    }
};

export const updateFilterByIdService = async (filterId, updateData) => {
    try {
        const response = await updateFilterByIdRepository(filterId, updateData);
        return response;
    } catch (error) {
        console.log("Error in updateFilterByIdService:", error);
        return {
            message: "Error updating filter in service",
        };
    }
};

export const getAllFiltersService = async () => {
    try {
        const response = await getAllFiltersRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllFiltersService:", error);
        return {
            message: "Error fetching filters in service",
        };
    }
};

export const getFilterByIdService = async (filterId) => {
    try {
        const response = await getFilterByIdRepository(filterId);
        return response;
    } catch (error) {
        console.log("Error in getFilterByIdService:", error);
        return {
            message: "Error fetching filter by ID in service",
        };
    }
};

export const getFiltersBySubCategoryIdService = async (subCategoryId) => {
    try {
        const response = await getFilterBySubCategoryIdRepository(subCategoryId);
        return response;
    } catch (error) {
        console.log("Error in getFiltersBySubCategoryIdService:", error);
        return {
            message: error.message || "Error fetching filters by sub-category ID in service",
        };
    }
}