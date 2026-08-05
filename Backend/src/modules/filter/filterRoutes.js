import express from "express";
import {
    addFilterController,
    deleteFilterByIdController,
    getAllFiltersController,
    getFilterByIdController,
    getFiltersBySubCategoryIdController,
    updateFilterByIdController,
} from "./filterControllers.js";

const router = express.Router();

router.post("/add-filter", addFilterController);
router.get("/get-all-filters", getAllFiltersController);
router.get("/get-filter-by-id/:filterId", getFilterByIdController);
router.put("/update-filter-by-id/:filterId", updateFilterByIdController);
router.delete("/delete-filter-by-id/:filterId", deleteFilterByIdController);
router.get("/get-filters-by-sub-category-id/:subCategoryId", getFiltersBySubCategoryIdController);

export default router;
