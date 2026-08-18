import {
	addProductRepository,
	deleteProductByIdRepository,
	getAllProductsRepository,
	getDiscountedRepository,
	getHotDealsRepository,
	getNewArraivalsRepository,
	getProductByIdRepository,
	getProductBySlugRepository,
	searchProductsRepository,
	updateProductByIdRepository,
} from "./productRepositories.js";

export const addProductService = async (productData, productImageURLs = [], productFilters = []) => {
	try {
		const response = await addProductRepository(productData, productImageURLs, productFilters);
		return response;
	} catch (error) {
		console.log("Error in addProductService:", error);
		return {
			message: "Error adding product in service",
		};
	}
};

export const deleteProductByIdService = async (productId) => {
	try {
		const response = await deleteProductByIdRepository(productId);
		return response;
	} catch (error) {
		console.log("Error in deleteProductByIdService:", error);
		return {
			message: "Error deleting product in service",
		};
	}
};

export const updateProductByIdService = async (productId, updateData) => {
	try {
		const response = await updateProductByIdRepository(productId, updateData);
		return response;
	} catch (error) {
		console.log("Error in updateProductByIdService:", error);
		return {
			message: "Error updating product in service",
		};
	}
};

export const getAllProductsService = async () => {
	try {
		const response = await getAllProductsRepository();
		return response;
	} catch (error) {
		console.log("Error in getAllProductsService:", error);
		return {
			message: "Error fetching products in service",
		};
	}
};

export const getProductByIdService = async (productId) => {
	try {
		const response = await getProductByIdRepository(productId);
		return response;
	} catch (error) {
		console.log("Error in getProductByIdService:", error);
		return {
			message: "Error fetching product by ID in service",
		};
	}
};


export const getProductbySlugService = async (slug) => {
	try {
		const response = await getProductBySlugRepository(slug);
		return response;
	} catch (error) {
		console.log("Error in getProductbySlugService:", error);
		return {
			message: "Error fetching product by slug in service",
		};
	}
}

export const searchProductsService = async (searchTerm, page, limit, sortBy) => {
	try {
		const products = await searchProductsRepository(searchTerm, page, limit, sortBy);;
		return products;
	} catch (error) {
		console.log("Error in searchProductsService:", error);
		return {
			message: "Error searching products in service",
		};
	}
}

export const getNewArraivalsService = async (page=1, limit=10, sortBy) => {
	try {
		const products = await getNewArraivalsRepository(page, limit, sortBy);
		return products;
	} catch (error) {
		console.log("Error in getNewArraivalsService:", error);
		return {
			message: "Error fetching new arrivals in service",
		};
	}
}

export const getHotDealsService = async (page=1, limit=10, sortBy) => {
	try {
		const products = await getHotDealsRepository(page, limit, sortBy);
		return products;
	} catch (error) {
		console.log("Error in getHotDealsService:", error);
		return {
			message: "Error fetching hot deals in service",
		};
	}
}

export const getDiscountedService = async (page=1, limit=10, sortBy) => {
	try {
		const products = await getDiscountedRepository(page, limit, sortBy);
		return products;
	} catch (error) {
		console.log("Error in getDiscountedService:", error);
		return {
			message: "Error fetching discounted products in service",
		};
	}
}