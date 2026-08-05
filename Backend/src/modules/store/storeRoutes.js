import express from "express";
import {
    addStoreController,
    deleteStoreByIdController,
    getAllStoresController,
    getStoreByIdController,
    updateStoreByIdController,
} from "./storeControllers.js";

const router = express.Router();

router.post("/add-store", addStoreController);
router.get("/get-all-stores", getAllStoresController);
router.get("/get-store-by-id/:storeId", getStoreByIdController);
router.put("/update-store-by-id/:storeId", updateStoreByIdController);
router.delete("/delete-store-by-id/:storeId", deleteStoreByIdController);

export default router;
