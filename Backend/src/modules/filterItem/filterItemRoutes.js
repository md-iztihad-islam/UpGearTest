import express from "express";
import {
    addFilterItemController,
    deleteFilterItemByIdController,
    getAllFilterItemsController,
    getFilterItemByIdController,
    getFilterItemBySubCategoryIdController,
    updateFilterItemByIdController,
} from "./filterItemControllers.js";

const router = express.Router();

router.post("/add-filter-item", addFilterItemController);
router.get("/get-all-filter-items", getAllFilterItemsController);
router.get("/get-filter-item-by-id/:filterItemId", getFilterItemByIdController);
router.put("/update-filter-item-by-id/:filterItemId", updateFilterItemByIdController);
router.delete("/delete-filter-item-by-id/:filterItemId", deleteFilterItemByIdController);
router.get("/get-filter-items-by-sub-category-id/:subCategoryId", getFilterItemBySubCategoryIdController);

export default router;
