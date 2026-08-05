import { useState } from "react";
import ProductCard from "@/components/clientPart/productList/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3X3, LayoutGrid, Sparkles, Calendar, TrendingUp, Star, Clock, Package, Zap, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import getAllNewArraivalsApi from "@/services/clientPart/newArraivals/getAllNewArraivalsApi";
import getAllStockApi from "@/services/dashboard/stock/getAllStockApi";
import ProductLoadingState from "@/components/loader/ProductLoader";

function ProductsByNewArrivals() {
    const [sortBy, setSortBy] = useState("newest");
    const [gridCols, setGridCols] = useState(4);

    // Fetch all new arrivals
    const { data: newArrivalsData, isLoading, isError } = useQuery({
        queryKey: ['new-arrivals'],
        queryFn: () => getAllNewArraivalsApi(),
        cacheTime: 5 * 60 * 1000,
        staleTime: 2 * 60 * 1000,
    });

    const { data: allStocksData } = useQuery({
        queryKey: ['all-stocks'],
        queryFn: () => getAllStockApi(),
        cacheTime: 10 * 60 * 1000,
        staleTime: 5 * 60 * 1000,
    });

    // Flatten the nested products arrays
    const allProducts = newArrivalsData?.data ? newArrivalsData.data.flatMap(item => item.products || []) : [];

    for(let product of allProducts){
        const stockInfo = allStocksData?.data?.find(stock => stock.productId === product.productId);
        product.stock = stockInfo ? stockInfo.quantity : 0;
    }

    // Helper functions
    const calculateRatingFromReviews = (product) => {
        const reviews = product.review || [];
        if (!reviews.length) return 0;
        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        const averageRating = totalRating / reviews.length;
        return Math.round(averageRating * 10) / 10;
    };

    const countReviews = (product) => product.review?.length || 0;

    const calculateDaysNew = (createdAt) => {
        if (!createdAt) return 0;
        const createdDate = new Date(createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Process products for new arrivals
    const processedProducts = allProducts
        .map(product => {
            const calculatedRating = calculateRatingFromReviews(product);
            const reviewCount = countReviews(product);
            const daysNew = calculateDaysNew(product.createdAt);
            
            const mainPrice = product.mainPrice || 0;
            const discountAmount = product.discountAmount || 0;
            const finalPrice = product.finalPrice || mainPrice;
            
            let discountPercentage = 0;
            if (mainPrice > 0 && discountAmount > 0) {
                discountPercentage = Math.round((discountAmount / mainPrice) * 100);
            } else if (mainPrice > 0 && finalPrice < mainPrice) {
                discountPercentage = Math.round(((mainPrice - finalPrice) / mainPrice) * 100);
            }
            
            const savings = mainPrice - finalPrice;
            const freshnessScore = (
                (100 / Math.max(daysNew, 1)) +
                (calculatedRating * 5) +
                (reviewCount * 0.2)
            );
            
            return {
                ...product,
                calculatedRating,
                reviewCount,
                daysNew,
                discountPercentage,
                savings,
                mainPrice,
                finalPrice,
                discountAmount,
                freshnessScore,
                isBrandNew: daysNew <= 7
            };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate statistics
    const calculateNewArrivalsStats = () => {
        if (processedProducts.length === 0) {
            return { 
                brandNewCount: 0, 
                averageRating: 0, 
                totalReviews: 0,
                averageDaysNew: 0,
                withDiscount: 0
            };
        }

        let brandNewCount = 0;
        let totalRating = 0;
        let totalReviews = 0;
        let totalDaysNew = 0;
        let withDiscount = 0;

        processedProducts.forEach(product => {
            if (product.isBrandNew) brandNewCount++;
            totalRating += product.calculatedRating || 0;
            totalReviews += product.reviewCount || 0;
            totalDaysNew += product.daysNew || 0;
            if (product.discountPercentage > 0) withDiscount++;
        });

        return {
            brandNewCount,
            averageRating: Math.round((totalRating / processedProducts.length) * 10) / 10,
            totalReviews,
            averageDaysNew: Math.round(totalDaysNew / processedProducts.length),
            withDiscount,
            discountPercentage: Math.round((withDiscount / processedProducts.length) * 100)
        };
    };

    const newArrivalsStats = calculateNewArrivalsStats();

    // Apply sorting
    const sortedProducts = [...processedProducts].sort((a, b) => {
        switch (sortBy) {
            case "newest":
                return (a.daysNew || 0) - (b.daysNew || 0);
            case "freshness":
                return (b.freshnessScore || 0) - (a.freshnessScore || 0);
            case "rating-high":
                return (b.calculatedRating || 0) - (a.calculatedRating || 0);
            case "price-low":
                return (a.finalPrice || 0) - (b.finalPrice || 0);
            case "price-high":
                return (b.finalPrice || 0) - (a.finalPrice || 0);
            case "discount-high":
                return (b.discountPercentage || 0) - (a.discountPercentage || 0);
            case "stock-high":
                return (b.stock || 0) - (a.stock || 0);
            default:
                return (a.daysNew || 0) - (b.daysNew || 0);
        }
    });

    // Group products by arrival period
    const getArrivalPeriods = () => {
        const periods = {
            "Today": 0,
            "This Week": 0,
            "This Month": 0,
            "Earlier": 0
        };

        processedProducts.forEach(product => {
            const daysNew = product.daysNew;
            if (daysNew === 0) periods["Today"]++;
            else if (daysNew <= 7) periods["This Week"]++;
            else if (daysNew <= 30) periods["This Month"]++;
            else periods["Earlier"]++;
        });

        return periods;
    };

    const arrivalPeriods = getArrivalPeriods();

    if (isLoading) {
        return <ProductLoadingState />;
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-6">
                        <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-blue-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">Unable to Load New Arrivals</h3>
                    <p className="text-sm sm:text-base text-gray-400 mb-6">
                        Please check your connection and try again.
                    </p>
                    <div className="flex gap-3 justify-center flex-wrap">
                        <Button 
                            variant="outline" 
                            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </Button>
                        <Button 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                            onClick={() => window.history.back()}
                        >
                            Go Back
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (sortedProducts.length === 0 && !isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl sm:rounded-3xl mb-6 shadow-lg backdrop-blur-sm">
                        <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">No New Arrivals Yet</h3>
                    <p className="text-sm sm:text-base text-gray-400 mb-4">
                        ✨ Stay tuned! Exciting new products are coming soon.
                    </p>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <Clock className="h-4 w-4 text-blue-400" />
                            <span>Check back daily for fresh arrivals</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10">
                {/* Page Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-full mb-3 sm:mb-4 shadow-lg">
                                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="font-bold text-xs sm:text-sm tracking-wider">✨ NEW ARRIVALS ✨</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Fresh New Arrivals
                            </h1>
                            <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-2xl">
                                Discover the latest additions to our collection. Be the first to explore!
                            </p>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 text-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-300">Brand New</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-white">{newArrivalsStats.brandNewCount}</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400">Added this week</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 backdrop-blur-sm border border-indigo-500/30 text-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400" />
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-300">With Discount</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-white">{newArrivalsStats.withDiscount}</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400">Special launch offers</div>
                        </div>
                    </div>

                    {/* Arrival Timeline
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg mb-6">
                        <h3 className="font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                            Arrival Timeline
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                            {Object.entries(arrivalPeriods).map(([period, count]) => {
                                const percentage = sortedProducts.length > 0 ? (count / sortedProducts.length) * 100 : 0;
                                return (
                                    <div key={period} className="text-center">
                                        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border ${
                                            count > 0 
                                                ? 'bg-gradient-to-b from-blue-500/10 to-purple-500/10 border-blue-500/30' 
                                                : 'bg-gray-900/50 border-gray-700/50'
                                        }`}>
                                            <p className="text-lg sm:text-xl font-bold text-white">{count}</p>
                                            <p className="text-xs text-gray-400 mt-1">{period}</p>
                                            {count > 0 && (
                                                <div className="mt-2">
                                                    <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div> */}
                </div>

                {/* Toolbar */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-3 sm:p-4 mb-6 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="text-xs sm:text-sm text-gray-300">
                            <span className="font-bold text-blue-400">{sortedProducts.length}</span> fresh arrivals • 
                            <span className="font-bold text-purple-400 ml-2">{newArrivalsStats.brandNewCount}</span> brand new this week
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {/* Grid Toggle */}
                            <div className="hidden md:flex items-center bg-gray-900/50 border border-gray-700/50 rounded-xl p-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm ${gridCols === 3 ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400" : "text-gray-400 hover:bg-gray-800"}`}
                                    onClick={() => setGridCols(3)}
                                >
                                    <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                                    <span className="hidden lg:inline">3 Cols</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm ${gridCols === 4 ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400" : "text-gray-400 hover:bg-gray-800"}`}
                                    onClick={() => setGridCols(4)}
                                >
                                    <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                                    <span className="hidden lg:inline">4 Cols</span>
                                </Button>
                            </div>

                            {/* Sort Dropdown */}
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full sm:w-56 lg:w-64 bg-gray-900/50 border-gray-700/50 text-gray-200 hover:bg-gray-900 text-xs sm:text-sm">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                                        <SelectValue placeholder="Sort new arrivals" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-700">
                                    <SelectItem value="newest" className="text-gray-200 focus:bg-gray-800 text-xs sm:text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                                            <div>
                                                <div className="font-medium">Newest First</div>
                                                <div className="text-xs text-gray-500">Latest arrivals</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="stock-high" className="text-gray-200 focus:bg-gray-800 text-xs sm:text-sm">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-400" />
                                            <div>
                                                <div className="font-medium">Stock</div>
                                                <div className="text-xs text-gray-500">More Stock</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="freshness" className="text-gray-200 focus:bg-gray-800 text-xs sm:text-sm">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                                            <div>
                                                <div className="font-medium">Freshness Score</div>
                                                <div className="text-xs text-gray-500">New + Rated well</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="rating-high" className="text-gray-200 focus:bg-gray-800 text-xs sm:text-sm">
                                        <div className="flex items-center gap-2">
                                            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                                            <div>
                                                <div className="font-medium">Highest Rated</div>
                                                <div className="text-xs text-gray-500">Best reviews</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="discount-high" className="text-gray-200 focus:bg-gray-800 text-xs sm:text-sm">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                                            <div>
                                                <div className="font-medium">Best Discounts</div>
                                                <div className="text-xs text-gray-500">Launch offers</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="price-low" className="text-gray-200 focus:bg-gray-800 text-xs sm:text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">$</span>
                                            <div>
                                                <div className="font-medium">Lowest Price</div>
                                                <div className="text-xs text-gray-500">Budget friendly</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className={`grid gap-3 sm:gap-4 lg:gap-5 xl:gap-6 grid-cols-1 sm:grid-cols-2 ${gridCols === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} mb-8 sm:mb-12 place-items-center`}>
                    {sortedProducts.map((product, index) => {
                        const rating = product.calculatedRating || 0;
                        const reviewCount = product.reviewCount || 0;
                        
                        return (
                            <div key={`${product._id}-${index}`} className="group relative">

                                <div className="h-full transform transition-transform duration-300 group-hover:scale-[1.02]">
                                    <ProductCard 
                                        productDetails={{
                                            ...product,
                                            rating: rating,
                                            reviewCount: reviewCount
                                        }}
                                        showDiscountBadge={false}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 sm:p-5 text-center hover:border-blue-500/30 transition-all">
                        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full mb-3">
                            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                        </div>
                        <h4 className="font-bold text-white mb-2 text-sm sm:text-base">Daily Updates</h4>
                        <p className="text-xs sm:text-sm text-gray-400">Fresh products added every single day</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 sm:p-5 text-center hover:border-purple-500/30 transition-all">
                        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full mb-3">
                            <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                        </div>
                        <h4 className="font-bold text-white mb-2 text-sm sm:text-base">Early Access</h4>
                        <p className="text-xs sm:text-sm text-gray-400">Be the first to discover new products</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 sm:p-5 text-center hover:border-pink-500/30 transition-all">
                        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-full mb-3">
                            <Star className="h-5 w-5 sm:h-6 sm:w-6 text-pink-400" />
                        </div>
                        <h4 className="font-bold text-white mb-2 text-sm sm:text-base">Verified Quality</h4>
                        <p className="text-xs sm:text-sm text-gray-400">All new arrivals are quality checked</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ProductsByNewArrivals;