import { useState } from "react";
import ProductCard from "@/components/clientPart/productList/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Package, AlertCircle, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import getAllProductsApi from "@/services/clientPart/allProducts/getAllProductsApi";
import ProductLoadingState from "@/components/loader/ProductLoader";

function AllProducts() {
    const [sortBy, setSortBy] = useState("featured");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    const { data: productsData, isLoading, isError, refetch } = useQuery({
        queryKey: ['all-products', currentPage, itemsPerPage, sortBy],
        queryFn: () => getAllProductsApi({
            page: currentPage,
            limit: itemsPerPage,
            sortBy: sortBy
        }),
        keepPreviousData: true,
        cacheTime: 5 * 60 * 1000,
        staleTime: 2 * 60 * 1000,
    });

    const calculateRatingFromReviews = (product) => {
        const reviews = product.review || [];
        if (!reviews.length) return 0;
        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        return Math.round((totalRating / reviews.length) * 10) / 10;
    };

    const countReviews = (product) => product.review?.length || 0;

    const processedProducts = (productsData?.data?.products || []).map(product => {
        const calculatedRating = calculateRatingFromReviews(product);
        const reviewCount = countReviews(product);
        const mainPrice = product.mainPrice || 0;
        const discountAmount = product.discountAmount || 0;
        const finalPrice = product.finalPrice || mainPrice;

        let discountPercentage = 0;
        if (mainPrice > 0 && discountAmount > 0) {
            discountPercentage = Math.round((discountAmount / mainPrice) * 100);
        } else if (mainPrice > 0 && finalPrice < mainPrice) {
            discountPercentage = Math.round(((mainPrice - finalPrice) / mainPrice) * 100);
        }

        return {
            ...product,
            calculatedRating,
            reviewCount,
            discountPercentage,
            savings: mainPrice - finalPrice,
            mainPrice,
            finalPrice,
            discountAmount
        };
    });

    const products = productsData?.data?.products || [];
    const totalProducts = productsData?.data?.totalCount || 0;
    const totalPages = productsData?.data?.totalPages || 1;

    // Correct showing count based on actual products returned
    const firstItem = products.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0;
    const lastItem = ((currentPage - 1) * itemsPerPage) + products.length;

    const getPaginationRange = () => {
        const delta = 1;
        const range = [];
        const rangeWithDots = [];

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        let prev = 0;
        for (const i of range) {
            if (prev && i - prev !== 1) rangeWithDots.push('...');
            rangeWithDots.push(i);
            prev = i;
        }

        return rangeWithDots;
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading && currentPage === 1) return <ProductLoadingState />;

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6 backdrop-blur-sm">
                        <AlertCircle className="h-8 w-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Unable to Load Products</h3>
                    <p className="text-sm text-gray-400 mb-6">We encountered an error while fetching products. Please try again.</p>
                    <Button
                        onClick={() => refetch()}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <main className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

                {/* Header */}
                <div className="mb-5 sm:mb-6 lg:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                        <div className="h-1 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            All Products
                        </h1>
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm">
                        Discover our complete collection of{" "}
                        <span className="text-blue-400 font-semibold">{totalProducts}</span> premium products
                    </p>
                </div>

                {/* Toolbar */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-3 sm:p-4 mb-5 sm:mb-6">
                    <div className="flex items-center justify-between gap-3">
                        {/* Count */}
                        <p className="text-xs sm:text-sm text-gray-300">
                            <span className="hidden sm:inline">Showing </span>
                            <span className="font-semibold text-white">
                                {products.length > 0 ? `${firstItem}–${lastItem}` : "0"}
                            </span>
                            {" "}of{" "}
                            <span className="font-semibold text-white">{totalProducts}</span>
                            <span className="hidden sm:inline text-gray-400"> products</span>
                        </p>

                        {/* Sort */}
                        <Select value={sortBy} onValueChange={(value) => {
                            setSortBy(value);
                            setCurrentPage(1);
                        }}>
                            <SelectTrigger className="w-40 sm:w-48 bg-gray-900/50 border-gray-700/50 text-gray-200 hover:bg-gray-900 transition-colors h-9 text-xs sm:text-sm">
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                    <SelectValue placeholder="Sort by" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700">
                                <SelectItem value="featured" className="text-gray-200 focus:bg-gray-800 focus:text-white text-xs sm:text-sm">⭐ Featured</SelectItem>
                                <SelectItem value="newest" className="text-gray-200 focus:bg-gray-800 focus:text-white text-xs sm:text-sm">🆕 Newest First</SelectItem>
                                <SelectItem value="price-low" className="text-gray-200 focus:bg-gray-800 focus:text-white text-xs sm:text-sm">💰 Price: Low to High</SelectItem>
                                <SelectItem value="price-high" className="text-gray-200 focus:bg-gray-800 focus:text-white text-xs sm:text-sm">💎 Price: High to Low</SelectItem>
                                <SelectItem value="rating-high" className="text-gray-200 focus:bg-gray-800 focus:text-white text-xs sm:text-sm">🌟 Highest Rated</SelectItem>
                                <SelectItem value="discount-high" className="text-gray-200 focus:bg-gray-800 focus:text-white text-xs sm:text-sm">🎉 Biggest Discount</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Product Grid */}
                {isLoading && currentPage > 1 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-700"></div>
                            <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-blue-500 absolute top-0 left-0"></div>
                        </div>
                        <p className="mt-5 text-sm text-gray-400 font-medium">Loading page {currentPage}...</p>
                    </div>
                ) : processedProducts.length > 0 ? (
                    <>
                        {/* Fixed 5-column grid: 2 on mobile → 3 on md → 4 on lg → 5 on xl */}
                        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-6 place-items-center">
                            {processedProducts.map((product, index) => (
                                <div
                                    key={`${product._id}-${index}`}
                                    className="transform transition-all duration-300 hover:scale-[1.02]"
                                >
                                    <ProductCard
                                        productDetails={{
                                            ...product,
                                            rating: product.calculatedRating || 0,
                                            reviewCount: product.reviewCount || 0
                                        }}
                                        showDiscountBadge={false}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="text-xs sm:text-sm text-gray-400 order-2 sm:order-1">
                                        Page <span className="text-white font-semibold">{currentPage}</span> of{" "}
                                        <span className="text-white font-semibold">{totalPages}</span>
                                        <span className="hidden sm:inline text-gray-500"> · {itemsPerPage} per page</span>
                                    </div>

                                    <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2 flex-wrap justify-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="h-9 w-9 p-0 bg-gray-900/50 border-gray-700/50 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-30"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>

                                        {getPaginationRange().map((pageNum, index) => (
                                            pageNum === '...' ? (
                                                <span key={`dots-${index}`} className="px-2 text-gray-500 text-sm">...</span>
                                            ) : (
                                                <Button
                                                    key={pageNum}
                                                    variant={currentPage === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`h-9 w-9 p-0 font-medium transition-all text-sm ${
                                                        currentPage === pageNum
                                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-lg shadow-blue-500/30'
                                                            : 'bg-gray-900/50 border-gray-700/50 text-gray-300 hover:bg-gray-800 hover:text-white'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </Button>
                                            )
                                        ))}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage >= totalPages}
                                            className="h-9 w-9 p-0 bg-gray-900/50 border-gray-700/50 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-30"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 lg:py-32">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800/50 border border-gray-700/50 rounded-3xl mb-6 backdrop-blur-sm">
                            <Package className="h-10 w-10 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 text-center">No Products Available</h3>
                        <p className="text-sm text-gray-400 text-center max-w-md px-4">
                            We're currently updating our inventory. Check back soon for exciting new products!
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default AllProducts;