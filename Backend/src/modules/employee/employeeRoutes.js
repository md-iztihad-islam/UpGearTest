import express from "express";
import {
    addEmployeeController,
    deleteEmployeeByIdController,
    employeeSignInController,
    employeeSignOutController,
    getAllEmployeesController,
    getEmployeeByEmailController,
    getEmployeeByIdController,
    getEmployeeByRoleController,
    getEmployeeByStoreIdController,
    updateEmployeeByIdController,
} from "./employeeControllers.js";
import { s3Uploader } from "../../config/multerConfig.js";

const router = express.Router();

router.post("/add-employee", s3Uploader.single("imageURL"), addEmployeeController);
router.get("/get-all-employees", getAllEmployeesController);
router.get("/get-employee-by-id/:employeeId", getEmployeeByIdController);
router.put("/update-employee-by-id/:employeeId", s3Uploader.single("imageURL"), updateEmployeeByIdController);
router.delete("/delete-employee-by-id/:employeeId", deleteEmployeeByIdController);
router.get("/get-employee-by-role/:role", getEmployeeByRoleController);
router.get("/get-employee-by-store-id/:storeId", getEmployeeByStoreIdController);
router.get("/get-employee-by-email/:email", getEmployeeByEmailController);
router.post("/employee-sign-in", employeeSignInController);
router.post("/employee-sign-out", employeeSignOutController);

export default router;
