import {
	addProductRepository,
	deleteProductByIdRepository,
	getAllProductsRepository,
	getProductByIdRepository,
	getProductBySlugRepository,
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