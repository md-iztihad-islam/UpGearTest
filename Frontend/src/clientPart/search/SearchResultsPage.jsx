import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Grid3X3, LayoutGrid, Star, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import searchProductsApi from "@/services/clientPart/search/searchProductsApi";
import ProductCard from "@/components/clientPart/productList/ProductCard";
import ProductLoadingState from "@/components/loader/ProductLoader";

function SearchResultsPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const [sortBy, setSortBy] = useState("relevance");
    const [gridCols, setGridCols] = useState(5);
    const [page, setPage] = useState(1);

    const { data: searchData, isLoading, isError } = useQuery({
        queryKey: ["search", query, page, sortBy],
        queryFn: () =>
            searchProductsApi({ query, page, limit: 10, sortBy }),
        enabled: !!query,
        cacheTime: 5 * 60 * 1000,
        staleTime: 2 * 60 * 1000,
    });

    const products = searchData?.data?.products || [];
    const totalResults = searchData?.data?.totalCount || 0;
    const totalPages = searchData?.data?.totalPages || 1;

    /* ── Loading ── */
    if (isLoading) return <ProductLoadingState />;

    /* ── Error ── */
    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black px-4">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-red-900/20 rounded-full mb-4">
                        <Package className="h-7 w-7 sm:h-8 sm:w-8 text-red-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Search Error</h3>
                    <p className="text-sm sm:text-base text-gray-400 mb-4">Failed to load search results</p>
                    <Button onClick={() => window.location.reload()} size="sm" className="sm:size-default">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    /* ── Pagination helper ── */
    const getPaginationRange = () => {
        const delta = 1; // pages shown around current on mobile
        const range = [];
        const left = Math.max(2, page - delta);
        const right = Math.min(totalPages - 1, page + delta);

        range.push(1);
        if (left > 2) range.push("...");
        for (let i = left; i <= right; i++) range.push(i);
        if (right < totalPages - 1) range.push("...");
        if (totalPages > 1) range.push(totalPages);
        return range;
    };

    /* ── Grid class map ── */
    const gridClass =
        gridCols === 4
            ? "grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            : "grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">

                {/* ── Search Header ── */}
                <div className="max-w-3xl mx-auto mb-6 sm:mb-8 text-center px-2">
                    {query ? (
                        <>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 break-words">
                                Results for &ldquo;{query}&rdquo;
                            </h1>
                            <p className="text-sm sm:text-base text-gray-400">
                                {totalResults} product{totalResults !== 1 ? "s" : ""} found
                            </p>
                        </>
                    ) : (
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
                            Search Products
                        </h1>
                    )}
                </div>

                {/* ── Results Section ── */}
                {query && (
                    <div className="mb-6">

                        {/* ── Toolbar ── */}
                        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 mb-5 sm:mb-6">

                            {/* Count */}
                            <p className="text-xs sm:text-sm text-gray-400 shrink-0">
                                Showing {products.length} of {totalResults} results
                            </p>

                            {/* Controls */}
                            <div className="flex items-center gap-2 w-full xs:w-auto flex-wrap xs:flex-nowrap justify-end">

                                {/* Grid toggle — hidden on mobile */}
                                <div className="hidden sm:flex items-center border border-gray-700 rounded-lg overflow-hidden bg-gray-900">
                                    <button
                                        onClick={() => setGridCols(4)}
                                        className={`flex items-center gap-1.5 px-3 py-2 text-xs transition-colors ${
                                            gridCols === 4
                                                ? "bg-gray-700 text-white"
                                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                        }`}
                                        aria-label="4 columns"
                                    >
                                        <Grid3X3 className="h-3.5 w-3.5" />
                                        <span>4</span>
                                    </button>
                                    <button
                                        onClick={() => setGridCols(5)}
                                        className={`flex items-center gap-1.5 px-3 py-2 text-xs transition-colors ${
                                            gridCols === 5
                                                ? "bg-gray-700 text-white"
                                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                        }`}
                                        aria-label="5 columns"
                                    >
                                        <LayoutGrid className="h-3.5 w-3.5" />
                                        <span>5</span>
                                    </button>
                                </div>

                                {/* Sort */}
                                <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                                    <SelectTrigger className="w-full xs:w-44 sm:w-48 bg-gray-900 border-gray-700 text-sm h-9">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black border-gray-700 text-white">
                                        <SelectItem value="relevance">
                                            <span className="flex items-center gap-2 text-sm">
                                                <Search className="h-3.5 w-3.5" /> Relevance
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="newest">
                                            <span className="flex items-center gap-2 text-sm">🆕 Newest First</span>
                                        </SelectItem>
                                        <SelectItem value="price-low">
                                            <span className="flex items-center gap-2 text-sm">💰 Price: Low → High</span>
                                        </SelectItem>
                                        <SelectItem value="price-high">
                                            <span className="flex items-center gap-2 text-sm">💎 Price: High → Low</span>
                                        </SelectItem>
                                        <SelectItem value="rating-high">
                                            <span className="flex items-center gap-2 text-sm">
                                                <Star className="h-3.5 w-3.5" /> Highest Rated
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* ── Products Grid / Empty State ── */}
                        {products.length > 0 ? (
                            <>
                                <div className={`grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 ${gridClass}`}>
                                    {products.map((product) => (
                                        <ProductCard key={product._id} productDetails={product} />
                                    ))}
                                </div>

                                {/* ── Pagination ── */}
                                {totalPages > 1 && (
                                    <nav
                                        aria-label="Pagination"
                                        className="flex justify-center items-center gap-1 sm:gap-2 mt-8 flex-wrap"
                                    >
                                        {/* Prev */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="h-8 w-8 sm:h-9 sm:w-9 border-gray-700 text-white hover:bg-gray-800 hover:text-white disabled:opacity-40"
                                            aria-label="Previous page"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>

                                        {/* Page numbers */}
                                        {getPaginationRange().map((item, idx) =>
                                            item === "..." ? (
                                                <span
                                                    key={`ellipsis-${idx}`}
                                                    className="px-1 text-gray-500 text-sm select-none"
                                                >
                                                    …
                                                </span>
                                            ) : (
                                                <Button
                                                    key={item}
                                                    variant={page === item ? "default" : "outline"}
                                                    size="icon"
                                                    onClick={() => setPage(item)}
                                                    className={`h-8 w-8 sm:h-9 sm:w-9 text-sm font-medium ${
                                                        page === item
                                                            ? "bg-white text-black hover:bg-gray-100"
                                                            : "border-gray-700 text-white hover:bg-gray-800 hover:text-white"
                                                    }`}
                                                    aria-label={`Page ${item}`}
                                                    aria-current={page === item ? "page" : undefined}
                                                >
                                                    {item}
                                                </Button>
                                            )
                                        )}

                                        {/* Next */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="h-8 w-8 sm:h-9 sm:w-9 border-gray-700 text-white hover:bg-gray-800 hover:text-white disabled:opacity-40"
                                            aria-label="Next page"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </nav>
                                )}
                            </>
                        ) : (
                            /* ── Empty State ── */
                            <div className="text-center py-12 sm:py-16 px-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-900 rounded-full mb-4 sm:mb-6">
                                    <Search className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                                    No products found
                                </h3>
                                <p className="text-sm sm:text-base text-gray-400 mb-4 break-words">
                                    No results for &ldquo;{query}&rdquo;
                                </p>
                                <ul className="text-sm text-gray-400 space-y-1">
                                    <li>• Check your spelling</li>
                                    <li>• Try more general keywords</li>
                                    <li>• Browse our categories</li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Search Tips (no query) ── */}
                {!query && (
                    <div className="max-w-3xl mx-auto mt-10 sm:mt-12 px-2">
                        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Search Tips</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {[
                                    {
                                        title: "Use Specific Keywords",
                                        body: "Try product names or model numbers for better results.",
                                    },
                                    {
                                        title: "Check Spelling",
                                        body: "Make sure your search terms are spelled correctly.",
                                    },
                                    {
                                        title: "Use Filters",
                                        body: "After searching, use sort options to refine results.",
                                    },
                                    {
                                        title: "Browse Categories",
                                        body: "Explore categories to discover related products.",
                                    },
                                ].map(({ title, body }) => (
                                    <div key={title}>
                                        <h4 className="text-xs sm:text-sm font-medium text-gray-300 mb-1">{title}</h4>
                                        <p className="text-xs sm:text-sm text-gray-400">{body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchResultsPage;