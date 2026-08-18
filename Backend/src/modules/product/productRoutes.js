import express from "express";
import {
	addProductController,
	deleteProductByIdController,
	getAllProductsController,
	getDiscountedController,
	getHotDealsController,
	getNewArrivalsController,
	getProductByIdController,
	getProductBySlugController,
	searchProductsController,
	updateProductByIdController,
} from "./productControllers.js";
import { s3Uploader } from "../../config/multerConfig.js";

const router = express.Router();

router.post(
	"/add-product",
	s3Uploader.fields([
		{ name: "bannerImage", maxCount: 1 },
		{ name: "productImages", maxCount: 10 },
	]),
	addProductController
);
router.get("/get-all-products", getAllProductsController);
router.get("/get-product-by-id/:productId", getProductByIdController);
router.put(
	"/update-product-by-id/:productId",
	s3Uploader.fields([
		{ name: "bannerImage", maxCount: 1 },
		{ name: "productImages", maxCount: 10 },
	]),
	updateProductByIdController
);
router.delete("/delete-product-by-id/:productId", deleteProductByIdController);
router.get("/get-product-by-slug/:slug", getProductBySlugController);
router.get("/search-products", searchProductsController);
router.get("/get-new-arrivals", getNewArrivalsController);
router.get("/get-discounted-products", getDiscountedController);
router.get("/get-hot-deals", getHotDealsController);

export default router;
