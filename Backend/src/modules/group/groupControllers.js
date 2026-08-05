import {
    addGroupService,
    deleteGroupByIdService,
    updateGroupByIdService,
    getAllGroupsService,
    getGroupByIdService,
    searchGroupsByKeywordService,
} from "./groupServices.js";

const normalizeDecimal = (value) => {
    if (value === undefined || value === null || value === "") {
        return value;
    }

    const parsedValue = Number.parseFloat(value);
    return Number.isNaN(parsedValue) ? value : parsedValue;
};

export const addGroupController = async (req, res) => {
    try {
        const {
            groupId,
            brandId,
            categoryId,
            subCategoryId,
            insideDhakaCharge,
            outsideDhakaCharge,
            description,
            productType,
            warrentyId,
            keyFeatures,   // string[] from formData keyFeatures[]
            tags,          // string[] from formData tags[]
            filterItems,   // JSON string[] from formData filterItems[]
            specifications // JSON string[] from formData specifications[]
        } = req.body;

        // S3 URLs come from req.files, not req.body
        const descImageFiles = req.files?.descImages ?? []; // multer-s3 array
        const descImageURLs = descImageFiles.map((file) => file.location); 
        // file.location is the full S3 URL provided by multer-s3

        // Parse JSON arrays sent as strings
        const parsedFilterItems   = (Array.isArray(filterItems)   ? filterItems   : [filterItems  ].filter(Boolean)).map(JSON.parse);
        const parsedSpecifications = (Array.isArray(specifications) ? specifications : [specifications].filter(Boolean)).map(JSON.parse);
        const parsedKeyFeatures    = Array.isArray(keyFeatures) ? keyFeatures : [keyFeatures].filter(Boolean);
        const parsedTags           = Array.isArray(tags)        ? tags        : [tags       ].filter(Boolean);

        // Now pass everything to your service / prisma calls
        // e.g. await addGroupService({ groupId, brandId, ..., descImageURLs, ... });
        const groupData = {
            groupId,
            brandId,
            categoryId,
            subCategoryId,
            insideDhakaCharge: normalizeDecimal(insideDhakaCharge),
            outsideDhakaCharge: normalizeDecimal(outsideDhakaCharge),
            description,
            productType,
            warrentyId,
            keyFeatures: parsedKeyFeatures,
            tags: parsedTags,
            filterItems: parsedFilterItems,
            specifications: parsedSpecifications,
            descImageURLs, // Pass the S3 URLs to the service
        }

        const response = await addGroupService(groupData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error adding group",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Group added successfully",
            data: response,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllGroupsController = async (req, res) => {
    try {
        const response = await getAllGroupsService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching groups",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getAllGroupsController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching groups in controller",
        });
    }
};

export const getGroupByIdController = async (req, res) => {
    try {
        const groupId = req.params.id;

        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: "Group id is required",
            });
        }

        const response = await getGroupByIdService(groupId);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "Group not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getGroupByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching group in controller",
        });
    }
};

export const updateGroupByIdController = async (req, res) => {
    try {
        const groupId = req.params.id;
        const updateData = { ...req.body };

        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: "Group id is required",
            });
        }

        if (updateData.insideDhakaCharge !== undefined) {
            updateData.insideDhakaCharge = normalizeDecimal(updateData.insideDhakaCharge);
            if (Number.isNaN(updateData.insideDhakaCharge)) {
                return res.status(400).json({
                    success: false,
                    message: "Group insideDhakaCharge must be a valid number",
                });
            }
        }

        if (updateData.outsideDhakaCharge !== undefined) {
            updateData.outsideDhakaCharge = normalizeDecimal(updateData.outsideDhakaCharge);
            if (Number.isNaN(updateData.outsideDhakaCharge)) {
                return res.status(400).json({
                    success: false,
                    message: "Group outsideDhakaCharge must be a valid number",
                });
            }
        }

        try {
            if (updateData.keyFeatures !== undefined) {
                updateData.keyFeatures = JSON.parse(updateData.keyFeatures);
            }
            if (updateData.tags !== undefined) {
                updateData.tags = JSON.parse(updateData.tags);
            }
            if (updateData.productSpecifications !== undefined) {
                updateData.productSpecifications = JSON.parse(updateData.productSpecifications);
            }
            if (updateData.existingDescriptionImages !== undefined) {
                updateData.existingDescriptionImages = JSON.parse(updateData.existingDescriptionImages);
            }
            if (updateData.newImageOrderIndexes !== undefined) {
                updateData.newImageOrderIndexes = JSON.parse(updateData.newImageOrderIndexes);
            }
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                message: "One or more fields contained invalid JSON",
            });
        }

        if (updateData.warrantyId === "") {
            updateData.warrantyId = null;
        }

        // Adjust `.location` below if your multerConfig.js exposes a different field for the S3 URL
        const newImageFiles = req.files?.descImages || [];
        updateData.newDescriptionImages = newImageFiles.map((file, index) => ({
            imageURL: file.location,
            orderIndex: updateData.newImageOrderIndexes?.[index] ?? index,
        }));
        delete updateData.newImageOrderIndexes;

        const response = await updateGroupByIdService(groupId, updateData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error updating group",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Group updated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in updateGroupByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating group in controller",
        });
    }
};

export const deleteGroupByIdController = async (req, res) => {
    try {
        const groupId = req.params.id;

        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: "Group id is required",
            });
        }

        const response = await deleteGroupByIdService(groupId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deleting group",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Group deleted successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deleteGroupByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting group in controller",
        });
    }
};

export const searchGroupsByKeywordController = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const response = await searchGroupsByKeywordService(keyword, limit, page, skip);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error searching groups",
            });
        }

        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        console.log("Error in searchGroupsByKeywordController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error searching groups in controller",
        });
    }
};