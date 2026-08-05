import express from "express";
import {
    addSpecificationController,
    deleteSpecificationByIdController,
    getAllSpecificationsController,
    getSpecificationByIdController,
    getSpecificationBySubCategoryIdController,
    updateSpecificationByIdController,
} from "./specificationControllers.js";

const router = express.Router();

router.post("/add-specification", addSpecificationController);
router.get("/get-all-specifications", getAllSpecificationsController);
router.get("/get-specification-by-id/:specificationId", getSpecificationByIdController);
router.put("/update-specification-by-id/:specificationId", updateSpecificationByIdController);
router.delete("/delete-specification-by-id/:specificationId", deleteSpecificationByIdController);
router.get("/get-specifications-by-sub-category-id/:subCategoryId", getSpecificationBySubCategoryIdController);

export default router;
