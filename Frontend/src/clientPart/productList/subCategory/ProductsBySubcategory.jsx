import { useEffect, useRef, useState } from "react";
import ProductCard from "@/components/clientPart/productList/ProductCard";
import ProductBySubctegoryFilters from "./ProductBySubcategoryFilter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal, Grid3X3, LayoutGrid, ChevronLeft, ChevronRight, Package, AlertCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import getProductBySubCategoryApi from "@/services/clientPart/products/getProductBySubCategoryApi";
import pageStore from "@/state/clientPart/pageStore";
import ProductLoadingState from "@/components/loader/ProductLoader";
import getSubcategoryBySlugApi from "@/services/clientPart/products/getSubcategoryBySlugApi";
import { Helmet } from "react-helmet-async";

function ProductsBySubcategory() {
    const { subcategorySlug } = useParams();
    const { currentPage, setCurrentPage, resetPage } = pageStore();

    const prevSlugRef = useRef(subcategorySlug);

    const slug = subcategorySlug || "";
    const subcategoryslug = subcategorySlug || "";

    const { data: subcategoryData } = useQuery({
        queryKey: ['subcategory-by-slug', slug],
        queryFn: () => getSubcategoryBySlugApi(slug),
        enabled: !!slug,
        cacheTime: 10 * 60 * 1000,
        staleTime: 5 * 60 * 1000,
    });

    const subcategoryId = subcategoryData?.data?._id;

    useEffect(() => {
        if (prevSlugRef.current !== subcategorySlug) {
            prevSlugRef.current = subcategorySlug;
            setFilters({ priceRange: [0, 30000] });
            resetPage();
        }
    }, [subcategorySlug]);

    const [filters, setFilters] = useState({ priceRange: [0, 30000] });
    const [sortBy, setSortBy] = useState("featured");
    const [gridCols, setGridCols] = useState(4); // Default 4 columns
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const { data: productData, isLoading, isError, refetch } = useQuery({
        queryKey: ['product-by-subcategory', subcategoryslug, filters, currentPage],
        queryFn: () => getProductBySubCategoryApi({
            subcategoryslug,
            filters,
            page: currentPage
        }),
        enabled: !!subcategoryslug,
        cacheTime: 5 * 60 * 1000,
        staleTime: 2 * 60 * 1000,
        keepPreviousData: true,
    });

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        resetPage();
    };

    const handleClearFilters = () => {
        setFilters({ priceRange: [0, 30000] });
        resetPage();
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getPaginationRange = () => {
        const totalPages = productData?.data?.totalPages || 1;
        const current = currentPage;
        const delta = 1;

        const range = [];
        const rangeWithDots = [];

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= current - delta && i <= current + delta)) {
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

    const products = productData?.data?.products || [];
    const totalProducts = productData?.data?.totalCount || 0;
    const totalPages = productData?.data?.totalPages || 1;
    const itemsPerPage = productData?.data?.itemsPerPage || 20;

    // Correct "showing X-Y of Z" calculation based on actual products on this page
    const firstItem = products.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0;
    const lastItem = ((currentPage - 1) * itemsPerPage) + products.length;

    const sortedProducts = [...products].sort((a, b) => {
        switch (sortBy) {
            case "price-low": return a.finalPrice - b.finalPrice;
            case "price-high": return b.finalPrice - a.finalPrice;
            case "rating": return (b.rating || 0) - (a.rating || 0);
            case "newest": return new Date(b.createdAt) - new Date(a.createdAt);
            default: return 0;
        }
    });

    if (isLoading && currentPage === 1) return <ProductLoadingState />;

    if (isError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <Helmet>
                    <title>{subcategorySlug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} | UpGear</title>
                    <meta name="description" content={`Browse ${subcategorySlug?.replace(/-/g, ' ')} products at UpGear. Best prices in Bangladesh.`} />
                </Helmet>
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6 backdrop-blur-sm">
                        <AlertCircle className="h-10 w-10 text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Unable to Load Products</h3>
                    <p className="text-gray-400 mb-6">We encountered an error while fetching products. Please try again.</p>
                    <Button
                        onClick={() => refetch()}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
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
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Desktop Filters Sidebar */}
                    <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
                        <div className="sticky top-4">
                            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5">
                                <ProductBySubctegoryFilters
                                    filters={filters}
                                    setFilters={handleFilterChange}
                                    subcategoryId={subcategoryId}
                                />
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Toolbar */}
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 mb-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                {/* Left: filter button + count */}
                                <div className="flex items-center gap-3 order-2 sm:order-1">
                                    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                        <SheetTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="lg:hidden bg-gray-900/50 border-gray-700/50 hover:bg-gray-800 h-9"
                                            >
                                                <SlidersHorizontal className="h-4 w-4 mr-2" />
                                                Filters
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent
                                            side="left"
                                            className="w-[90vw] sm:w-96 overflow-y-auto bg-gray-900 border-gray-700"
                                        >
                                            <SheetHeader className="mb-6">
                                                <SheetTitle className="text-white">Filter Products</SheetTitle>
                                            </SheetHeader>
                                            <ProductBySubctegoryFilters
                                                filters={filters}
                                                setFilters={(newFilters) => {
                                                    handleFilterChange(newFilters);
                                                    setIsFilterOpen(false);
                                                }}
                                                subcategoryId={subcategoryId}
                                            />
                                        </SheetContent>
                                    </Sheet>

                                    <p className="text-sm text-gray-300">
                                        <span className="hidden sm:inline">Showing </span>
                                        <span className="font-semibold text-white">
                                            {products.length > 0 ? `${firstItem}–${lastItem}` : "0"}
                                        </span>
                                        {" "}of{" "}
                                        <span className="font-semibold text-white">{totalProducts}</span>
                                        <span className="hidden sm:inline text-gray-400"> products</span>
                                    </p>
                                </div>

                                {/* Right: grid toggle + sort */}
                                <div className="flex items-center gap-3 order-1 sm:order-2">
                                    <div className="hidden md:flex items-center bg-gray-900/50 border border-gray-700/50 rounded-xl p-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                                gridCols === 3
                                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                                                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                                            }`}
                                            onClick={() => setGridCols(3)}
                                        >
                                            <LayoutGrid className="h-4 w-4 mr-1.5" />
                                            <span className="hidden lg:inline text-xs">3 Cols</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                                gridCols === 4
                                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                                                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                                            }`}
                                            onClick={() => setGridCols(4)}
                                        >
                                            <Grid3X3 className="h-4 w-4 mr-1.5" />
                                            <span className="hidden lg:inline text-xs">4 Cols</span>
                                        </Button>
                                    </div>

                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-full sm:w-44 bg-gray-900/50 border-gray-700/50 text-gray-200 hover:bg-gray-900 transition-colors h-9 text-sm">
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-900 border-gray-700">
                                            <SelectItem value="featured" className="text-gray-200 focus:bg-gray-800 focus:text-white">⭐ Featured</SelectItem>
                                            <SelectItem value="newest" className="text-gray-200 focus:bg-gray-800 focus:text-white">🆕 Newest First</SelectItem>
                                            <SelectItem value="price-low" className="text-gray-200 focus:bg-gray-800 focus:text-white">💰 Price: Low to High</SelectItem>
                                            <SelectItem value="price-high" className="text-gray-200 focus:bg-gray-800 focus:text-white">💎 Price: High to Low</SelectItem>
                                            <SelectItem value="rating" className="text-gray-200 focus:bg-gray-800 focus:text-white">🌟 Top Rated</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {isLoading && currentPage > 1 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700"></div>
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 absolute top-0 left-0"></div>
                                </div>
                                <p className="mt-6 text-gray-400 font-medium">Loading page {currentPage}...</p>
                            </div>
                        ) : sortedProducts.length > 0 ? (
                            <>
                                <div className={`grid gap-3 sm:gap-4 
                                    grid-cols-1 
                                    ${gridCols === 4
                                        ? "md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
                                        : "md:grid-cols-2 lg:grid-cols-3"
                                    } 
                                    mb-6 place-items-center`}
                                >
                                    {sortedProducts.map((product, index) => (
                                        <div
                                            key={`${product._id}-${index}`}
                                            className="transform transition-all duration-300 hover:scale-[1.02]"
                                        >
                                            <ProductCard productDetails={product} />
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-5">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="text-sm text-gray-400 order-2 sm:order-1">
                                                Page <span className="text-white font-semibold">{currentPage}</span> of{" "}
                                                <span className="text-white font-semibold">{totalPages}</span>
                                            </div>

                                            <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
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
                                                            className={`h-9 w-9 p-0 font-medium transition-all ${
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
                                <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-800/50 border border-gray-700/50 rounded-3xl mb-6 backdrop-blur-sm">
                                    <Package className="h-12 w-12 text-gray-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">No Products Found</h3>
                                <p className="text-gray-400 text-center max-w-md mb-6">
                                    No products match your current filters. Try adjusting your criteria.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={handleClearFilters}
                                    className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-800"
                                >
                                    Clear All Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ProductsBySubcategory;