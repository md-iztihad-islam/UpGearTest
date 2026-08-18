import {
	addProductService,
	deleteProductByIdService,
	getAllProductsService,
	getDiscountedService,
	getHotDealsService,
	getNewArraivalsService,
	getProductByIdService,
	getProductbySlugService,
	searchProductsService,
	updateProductByIdService,
} from "./productServices.js";

const parseDecimal = (value) => {
	if (value === undefined || value === null || value === "") {
		return undefined;
	}

	const parsed = Number.parseFloat(value);
	return Number.isNaN(parsed) ? Number.NaN : parsed;
};

const parseBoolean = (value) => {
	if (value === undefined || value === null || value === "") {
		return undefined;
	}

	if (typeof value === "boolean") {
		return value;
	}

	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		if (normalized === "true") return true;
		if (normalized === "false") return false;
	}

	return undefined;
};

const getS3URL = (file) => file?.location || file?.Location || file?.path;

export const addProductController = async (req, res) => {
	try {
		const productData = { ...req.body };

		if (!productData.groupId) {
			return res.status(400).json({
				success: false,
				message: "Product groupId is required",
			});
		}

		if (!productData.title) {
			return res.status(400).json({
				success: false,
				message: "Product title is required",
			});
		}

		if (!productData.mainPrice) {
			return res.status(400).json({
				success: false,
				message: "Product mainPrice is required",
			});
		}

		if (!productData.price) {
			return res.status(400).json({
				success: false,
				message: "Product price is required",
			});
		}

		if (!productData.status) {
			return res.status(400).json({
				success: false,
				message: "Product status is required",
			});
		}

		if (!productData.slug) {
			return res.status(400).json({
				success: false,
				message: "Product slug is required",
			});
		}

		const parsedMainPrice = parseDecimal(productData.mainPrice);
		const parsedPrice = parseDecimal(productData.price);
		const parsedDiscount = parseDecimal(productData.discount);

		if (Number.isNaN(parsedMainPrice)) {
			return res.status(400).json({
				success: false,
				message: "Product mainPrice must be a valid number",
			});
		}

		if (Number.isNaN(parsedPrice)) {
			return res.status(400).json({
				success: false,
				message: "Product price must be a valid number",
			});
		}

		if (Number.isNaN(parsedDiscount)) {
			return res.status(400).json({
				success: false,
				message: "Product discount must be a valid number",
			});
		}

		const parsedIsNewArrival = parseBoolean(productData.isNewArrival);
		const parsedIsHotDeal = parseBoolean(productData.isHotDeal);
		const parsedIsDiscounted = parseBoolean(productData.isDiscounted);

		let productFilters = [];
		if (productData.productFilters !== undefined) {
			try {
				productFilters = JSON.parse(productData.productFilters);
			} catch (parseError) {
				return res.status(400).json({
					success: false,
					message: "productFilters contained invalid JSON",
				});
			}
			delete productData.productFilters;
		}

		const bannerImageFile = req.files?.bannerImage?.[0];
		const productImageFiles = req.files?.productImages ?? [];

		const bannerImageURL = getS3URL(bannerImageFile);
		const productImageURLs = productImageFiles
			.map(getS3URL)
			.filter(Boolean);

		productData.mainPrice = parsedMainPrice;
		productData.price = parsedPrice;

		if (parsedDiscount !== undefined) {
			productData.discount = parsedDiscount;
		}

		if (parsedIsNewArrival !== undefined) {
			productData.isNewArrival = parsedIsNewArrival;
		}

		if (parsedIsHotDeal !== undefined) {
			productData.isHotDeal = parsedIsHotDeal;
		}

		if (parsedIsDiscounted !== undefined) {
			productData.isDiscounted = parsedIsDiscounted;
		}

		if (bannerImageURL) {
			productData.bannerImageURL = bannerImageURL;
		}

		if (productData.couponId === "") {
			delete productData.couponId;
		}

		const response = await addProductService(productData, productImageURLs, productFilters);

		if (!response || response.message) {
			return res.status(500).json({
				success: false,
				message: response?.message || "Error adding product",
			});
		}

		return res.status(201).json({
			success: true,
			message: "Product added successfully",
			data: response,
		});
	} catch (error) {
		console.log("Error in addProductController:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Error adding product in controller",
		});
	}
};

export const getAllProductsController = async (req, res) => {
	try {
		const response = await getAllProductsService();

		if (!response || response.message) {
			return res.status(500).json({
				success: false,
				message: response?.message || "Error fetching products",
			});
		}

		return res.status(200).json({
			success: true,
			data: response,
		});
	} catch (error) {
		console.log("Error in getAllProductsController:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Error fetching products in controller",
		});
	}
};

export const getProductByIdController = async (req, res) => {
	try {
		const productId = req.params.productId;

		if (!productId) {
			return res.status(400).json({
				success: false,
				message: "Product id is required",
			});
		}

		const response = await getProductByIdService(productId);

		if (!response || response.message) {
			return res.status(404).json({
				success: false,
				message: response?.message || "Product not found",
			});
		}

		return res.status(200).json({
			success: true,
			data: response,
		});
	} catch (error) {
		console.log("Error in getProductByIdController:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Error fetching product in controller",
		});
	}
};

export const updateProductByIdController = async (req, res) => {
	try {
		const productId = req.params.productId;
		const updateData = { ...req.body };

		if (!productId) {
			return res.status(400).json({
				success: false,
				message: "Product id is required",
			});
		}

		if (updateData.mainPrice !== undefined) {
			const parsedMainPrice = parseDecimal(updateData.mainPrice);
			if (Number.isNaN(parsedMainPrice)) {
				return res.status(400).json({
					success: false,
					message: "Product mainPrice must be a valid number",
				});
			}
			updateData.mainPrice = parsedMainPrice;
		}

		if (updateData.price !== undefined) {
			const parsedPrice = parseDecimal(updateData.price);
			if (Number.isNaN(parsedPrice)) {
				return res.status(400).json({
					success: false,
					message: "Product price must be a valid number",
				});
			}
			updateData.price = parsedPrice;
		}

		if (updateData.discount !== undefined) {
			const parsedDiscount = parseDecimal(updateData.discount);
			if (Number.isNaN(parsedDiscount)) {
				return res.status(400).json({
					success: false,
					message: "Product discount must be a valid number",
				});
			}
			updateData.discount = parsedDiscount;
		}

		if (updateData.isNewArrival !== undefined) {
			updateData.isNewArrival = parseBoolean(updateData.isNewArrival);
		}
		if (updateData.isHotDeal !== undefined) {
			updateData.isHotDeal = parseBoolean(updateData.isHotDeal);
		}
		if (updateData.isDiscounted !== undefined) {
			updateData.isDiscounted = parseBoolean(updateData.isDiscounted);
		}

		if (updateData.couponId === "") {
			updateData.couponId = null;
		}

		try {
			if (updateData.existingProductImages !== undefined) {
				updateData.existingProductImages = JSON.parse(updateData.existingProductImages);
			}
			if (updateData.newImageOrderIndexes !== undefined) {
				updateData.newImageOrderIndexes = JSON.parse(updateData.newImageOrderIndexes);
			}
		} catch (parseError) {
			return res.status(400).json({
				success: false,
				message: "Image ordering data contained invalid JSON",
			});
		}

		try {
			if (updateData.productFilters !== undefined) {
				updateData.productFilters = JSON.parse(updateData.productFilters);
			}
		} catch {
			return res.status(400).json({
				success: false,
				message: "productFilters contained invalid JSON",
			});
		}

		const bannerImageFile = req.files?.bannerImage?.[0];
		const productImageFiles = req.files?.productImages ?? [];

		const bannerImageURL = getS3URL(bannerImageFile);
		const newProductImageURLs = productImageFiles.map(getS3URL).filter(Boolean);

		if (bannerImageURL) {
			updateData.bannerImageURL = bannerImageURL;
		}

		updateData.newProductImages = newProductImageURLs.map((imageURL, index) => ({
			imageURL,
			orderIndex: updateData.newImageOrderIndexes?.[index] ?? index,
		}));
		delete updateData.newImageOrderIndexes;

		const response = await updateProductByIdService(productId, updateData);

		if (!response || response.message) {
			return res.status(500).json({
				success: false,
				message: response?.message || "Error updating product",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Product updated successfully",
			data: response,
		});
	} catch (error) {
		console.log("Error in updateProductByIdController:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Error updating product in controller",
		});
	}
};

export const deleteProductByIdController = async (req, res) => {
	try {
		const productId = req.params.productId;

		if (!productId) {
			return res.status(400).json({
				success: false,
				message: "Product id is required",
			});
		}

		const response = await deleteProductByIdService(productId);

		if (!response || response.message) {
			return res.status(500).json({
				success: false,
				message: response?.message || "Error deleting product",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Product deleted successfully",
			data: response,
		});
	} catch (error) {
		console.log("Error in deleteProductByIdController:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Error deleting product in controller",
		});
	}
};

export const getProductBySlugController = async (req, res) => {
	try {
		const slug = req.params.slug;

		if (!slug) {
			return res.status(400).json({
				success: false,
				message: "Product slug is required",
			});
		}

		const response = await getProductbySlugService(slug);

		if (!response || response.message) {
			return res.status(404).json({
				success: false,
				message: response?.message || "Product not found",
			});
		}

		return res.status(200).json({
			success: true,
			data: response,
		});
	} catch (error) {
		console.log("Error in getProductBySlugController:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Error fetching product by slug in controller",
		});
	}
};

// searchProductsController.js
export const searchProductsController = async (req, res) => {
	try {
		const { query } = req.query;

		if (!query) {
			return res.status(400).json({
				success: false,
				message: "Search query is required",
			});
		}

		const searchTerm = query.trim();
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 10;
		const sortBy = req.query.sortBy || "createdAt";

		const response = await searchProductsService(searchTerm, page, limit, sortBy); // now forwarded

		return res.status(200).json({
			success: true,
			data: response, // { products, page, limit }
		});
	} catch (error) {
		console.log("Error in searchProductsController:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Error searching products in controller",
		});
	}
};

export const getNewArrivalsController = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 10;
		const sortBy = req.query.sortBy || "createdAt";

		const response = await getNewArraivalsService(page, limit, sortBy);

		if (!response || response.message) {
			return res.status(500).json({
				success: false,
				message: response?.message || "Error fetching new arrivals",
			});
		}

		return res.status(200).json({
			success: true,
			data: response,
		});
	} catch (error) {
		console.log("Error in getNewArrivalsController:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Error fetching new arrivals in controller",
		});
	}
}

export const getHotDealsController = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 10;
		const sortBy = req.query.sortBy || "createdAt";

		const response = await getHotDealsService(page, limit, sortBy);

		if (!response || response.message) {
			return res.status(500).json({
				success: false,
				message: response?.message || "Error fetching hot deals",
			});
		}

		return res.status(200).json({
			success: true,
			data: response,
		});
	} catch (error) {
		console.log("Error in getHotDealsController:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Error fetching hot deals in controller",
		});
	}
};

export const getDiscountedController = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 10;
		const sortBy = req.query.sortBy || "createdAt";

		const response = await getDiscountedService(page, limit, sortBy);

		if (!response || response.message) {
			return res.status(500).json({
				success: false,
				message: response?.message || "Error fetching discounted products",
			});
		}

		return res.status(200).json({
			success: true,
			data: response,
		});
	} catch (error) {
		console.log("Error in getDiscountedController:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Error fetching discounted products in controller",
		});
	}
}