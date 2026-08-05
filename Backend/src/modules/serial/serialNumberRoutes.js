import express from "express";
import {
    addSerialNumberController,
    deleteSerialNumberByIdController,
    getAllSerialNumbersController,
    getSerialNumberByIdController,
    updateSerialNumberByIdController,
} from "./serialNumberControllers.js";

const router = express.Router();

router.post("/add-serial-number", addSerialNumberController);
router.get("/get-all-serial-numbers", getAllSerialNumbersController);
router.get("/get-serial-number-by-id/:serialNumber", getSerialNumberByIdController);
router.put("/update-serial-number-by-id/:serialNumber", updateSerialNumberByIdController);
router.delete("/delete-serial-number-by-id/:serialNumber", deleteSerialNumberByIdController);

export default router;
