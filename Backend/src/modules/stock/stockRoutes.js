import express from "express";
import {
    addStockController,
    deleteStockByIdController,
    getAllStocksController,
    getStockByIdController,
    updateStockByIdController,
} from "./stockControllers.js";

const router = express.Router();

router.post("/add-stock", addStockController);
router.get("/get-all-stocks", getAllStocksController);
router.get("/get-stock-by-id/:stockId", getStockByIdController);
router.put("/update-stock-by-id/:stockId", updateStockByIdController);
router.delete("/delete-stock-by-id/:stockId", deleteStockByIdController);

export default router;
