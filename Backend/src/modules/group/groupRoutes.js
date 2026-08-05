import express from "express";
import {
    addGroupController,
    deleteGroupByIdController,
    getAllGroupsController,
    getGroupByIdController,
    searchGroupsByKeywordController,
    updateGroupByIdController,
} from "./groupControllers.js";
import { s3Uploader } from "../../config/multerConfig.js";

const router = express.Router();

router.post(
    "/add-group",
    s3Uploader.fields([
        { name: "descImages", maxCount: 3 },
    ]),
    addGroupController
);
router.get("/get-all-groups", getAllGroupsController);
router.get("/get-group-by-id/:id", getGroupByIdController);
router.put(
    "/update-group-by-id/:id",
    s3Uploader.fields([
        { name: "descImages", maxCount: 3 },
    ]),
    updateGroupByIdController
);
router.delete("/delete-group-by-id/:id", deleteGroupByIdController);
router.get("/search-groups", searchGroupsByKeywordController);

export default router;