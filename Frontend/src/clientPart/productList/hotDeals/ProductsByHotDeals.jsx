import { useState } from "react";
import ProductCard from "@/components/clientPart/productList/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3X3, LayoutGrid, Tag, Percent, DollarSign, TrendingDown, Flame, Clock, Star, Users, Calendar, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import getAllHotDealsApi from "@/services/dashboard/hotDeals/getAllHotDealsApi";
import getAllStockApi from "@/services/dashboard/stock/getAllStockApi";
import ProductLoadingState from "@/components/loader/ProductLoader";

function ProductsByHotDeals() {
    const [sortBy, setSortBy] = useState("featured");
    const [gridCols, setGridCols] = useState(4);

    // Fetch all hot deals
    const { data: hotDealsData, isLoading, isError } = useQuery({
        queryKey: ['hot-deals'],
        queryFn: () => getAllHotDealsApi(),
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
    const allProducts = hotDealsData?.data ? hotDealsData.data.flatMap(item => item.products || []) : [];

    console.log("Fetched Hot Deals Products:", allProducts);

    for(let product of allProducts){
        const stockInfo = allStocksData?.data?.find(stock => stock.productId === product.productId);
        product.stock = stockInfo ? stockInfo.quantity : 0;
    }

    // Helper function to calculate rating from reviews
    const calculateRatingFromReviews = (product) => {
        const reviews = product.review || [];
        if (!reviews.length) return 0;
        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        const averageRating = totalRating / reviews.length;
        return Math.round(averageRating * 10) / 10;
    };

    // Helper function to count reviews
    const countReviews = (product) => {
        return product.review?.length || 0;
    };

    // Process products for hot deals
    const processedProducts = allProducts
        .map(product => {
            const calculatedRating = calculateRatingFromReviews(product);
            const reviewCount = countReviews(product);
            
            const mainPrice = product.mainPrice || 0;
            const discountAmount = product.discountAmount || 0;
            const finalPrice = product.finalPrice || mainPrice;
            
            let discountPercentage = 0;
            if (mainPrice > 0 && discountAmount > 0) {
                discountPercentage = Math.ceil((discountAmount / mainPrice) * 100);
            } else if (mainPrice > 0 && finalPrice < mainPrice) {
                discountPercentage = Math.ceil(((mainPrice - finalPrice) / mainPrice) * 100);
            }
            
            const savings = mainPrice - finalPrice;
            
            const hotnessScore = (
                (discountPercentage * 3) +
                (calculatedRating * 20) +
                (reviewCount * 0.5) +
                (savings / 100)
            );
            
            return {
                ...product,
                calculatedRating,
                reviewCount,
                discountPercentage,
                savings,
                mainPrice,
                finalPrice,
                discountAmount,
                hotnessScore
            };
        })
        .filter(product => product.discountPercentage >= 5);

    // Calculate hot deals statistics
    const calculateHotDealsStats = () => {
        if (processedProducts.length === 0) {
            return { 
                highestDiscount: 0, 
                averageDiscount: 0, 
                totalSavings: 0,
                averageSavings: 0,
                averageRating: 0,
                totalReviews: 0,
                totalValue: 0
            };
        }

        let highestDiscount = 0;
        let totalDiscount = 0;
        let totalSavings = 0;
        let totalRating = 0;
        let totalReviews = 0;
        let totalValue = 0;

        processedProducts.forEach(product => {
            const discount = product.discountPercentage;
            if (discount > highestDiscount) highestDiscount = discount;
            totalDiscount += discount;
            totalSavings += product.savings || 0;
            totalRating += product.calculatedRating || 0;
            totalReviews += product.reviewCount || 0;
            totalValue += product.mainPrice || 0;
        });

        return {
            highestDiscount,
            averageDiscount: Math.ceil(totalDiscount / processedProducts.length),
            totalSavings: Math.ceil(totalSavings),
            averageSavings: Math.ceil(totalSavings / processedProducts.length),
            averageRating: Math.ceil((totalRating / processedProducts.length) * 10) / 10,
            totalReviews,
            totalValue: Math.ceil(totalValue),
            valueAfterDiscount: Math.ceil(totalValue - totalSavings)
        };
    };

    console.log("Processed Hot Deals Products:", processedProducts);

    const hotDealsStats = calculateHotDealsStats();

    // Apply sorting locally
    const sortedProducts = [...processedProducts].sort((a, b) => {
        const discountA = a.discountPercentage || 0;
        const discountB = b.discountPercentage || 0;
        const savingsA = a.savings || 0;
        const savingsB = b.savings || 0;
        const finalPriceA = a.finalPrice || 0;
        const finalPriceB = b.finalPrice || 0;
        const ratingA = a.calculatedRating || 0;
        const ratingB = b.calculatedRating || 0;
        const hotnessA = a.hotnessScore || 0;
        const hotnessB = b.hotnessScore || 0;
        const stockA = a.stock || 0;
        const stockB = b.stock || 0;

        switch (sortBy) {
            case "featured":
                return hotnessB - hotnessA;
            case "discount-high":
                return discountB - discountA;
            case "savings-high":
                return savingsB - savingsA;
            case "price-low":
                return finalPriceA - finalPriceB;
            case "price-high":
                return finalPriceB - finalPriceA;
            case "rating-high":
                return ratingB - ratingA;
            case "newest":
                return new Date(b.createdAt) - new Date(a.createdAt);
            case "stock-high":
                return stockB - stockA;
            default:
                return hotnessB - hotnessA;
        }
    });

    // console.log("Processed and Sorted Hot Deals Products:", sortedProducts);

    // Group products by discount range
    const getDiscountRanges = () => {
        const ranges = {
            "15-25%": 0,
            "26-35%": 0,
            "36-45%": 0,
            "46-55%": 0,
            "56%+": 0
        };

        processedProducts.forEach(product => {
            const discount = product.discountPercentage;
            if (discount <= 25) ranges["15-25%"]++;
            else if (discount <= 35) ranges["26-35%"]++;
            else if (discount <= 45) ranges["36-45%"]++;
            else if (discount <= 55) ranges["46-55%"]++;
            else ranges["56%+"]++;
        });

        return ranges;
    };

    const discountRanges = getDiscountRanges();

    // Loading state
    if (isLoading) {
        return <ProductLoadingState />;
    }

    // Error state
    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6 backdrop-blur-sm">
                        <Flame className="h-8 w-8 sm:h-10 sm:w-10 text-red-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">Unable to Load Hot Deals</h3>
                    <p className="text-sm sm:text-base text-gray-400 mb-6">
                        Please check your connection and try again.
                    </p>
                    <div className="flex gap-3 justify-center flex-wrap">
                        <Button 
                            variant="outline" 
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </Button>
                        <Button 
                            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                            onClick={() => window.history.back()}
                        >
                            Go Back
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // If no hot deals found
    if (sortedProducts.length === 0 && !isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl sm:rounded-3xl mb-6 shadow-lg backdrop-blur-sm">
                        <Flame className="h-10 w-10 sm:h-12 sm:w-12 text-red-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">No Hot Deals Right Now</h3>
                    <p className="text-sm sm:text-base text-gray-400 mb-4">
                        🔥 The fire's cooling down! Check back soon for sizzling new deals.
                    </p>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <Clock className="h-4 w-4 text-orange-400" />
                            <span>Hot deals refresh every 24 hours</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Animated Background Element */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
            </div>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10">
                {/* Page Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-full mb-3 sm:mb-4 shadow-lg animate-pulse">
                                <Flame className="h-4 w-4 sm:h-5 sm:w-5 animate-bounce" />
                                <span className="font-bold text-xs sm:text-sm tracking-wider">🔥 HOT DEALS 🔥</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Sizzling Hot Deals
                            </h1>
                            <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-2xl">
                                Limited-time offers with massive discounts! These deals won't last long.
                            </p>
                        </div>
                    </div>

                    {/* Hot Deals Statistics */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-sm border border-red-500/30 text-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-300">Highest Discount</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-white">{hotDealsStats.highestDiscount}%</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400">Unbeatable offer</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-sm border border-orange-500/30 text-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-300">Total Savings</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-white">৳{hotDealsStats.totalSavings}</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400">You could save</div>
                        </div>
                    </div>

                    {/* Discount Distribution */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg mb-6">
                        <h3 className="font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                            <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                            Hotness Distribution
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                            {Object.entries(discountRanges).map(([range, count]) => {
                                const percentage = sortedProducts.length > 0 ? (count / sortedProducts.length) * 100 : 0;
                                return (
                                    <div key={range} className="text-center">
                                        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border ${
                                            count > 0 
                                                ? 'bg-gradient-to-b from-red-500/10 to-orange-500/10 border-red-500/30' 
                                                : 'bg-gray-900/50 border-gray-700/50'
                                        }`}>
                                            <p className="text-lg sm:text-xl font-bold text-white">{count}</p>
                                            <p className="text-xs text-gray-400 mt-1">{range}</p>
                                            {count > 0 && (
                                                <div className="mt-2">
                                                    <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
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
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-3 sm:p-4 mb-6 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="text-xs sm:text-sm text-gray-300">
                            <span className="font-bold text-red-400">{sortedProducts.length}</span> sizzling hot deals • 
                            <span className="font-bold text-green-400 ml-2">৳{hotDealsStats.totalSavings}</span> total savings
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {/* Grid Toggle */}
                            <div className="hidden md:flex items-center bg-gray-900/50 border border-gray-700/50 rounded-xl p-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm ${gridCols === 3 ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400" : "text-gray-400 hover:bg-gray-800"}`}
                                    onClick={() => setGridCols(3)}
                                >
                                    <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                                    <span className="hidden lg:inline">3 Cols</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm ${gridCols === 4 ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400" : "text-gray-400 hover:bg-gray-800"}`}
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
                                        <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
                                        <SelectValue placeholder="Sort hot deals" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-700">
                                    <SelectItem value="featured" className="text-gray-200 focus:bg-gray-800 text-xs sm:text-sm">
                                        <div className="flex items-center gap-2">
                                            <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
                                            <div>
                                                <div className="font-medium">🔥 Hottest First</div>
                                                <div className="text-xs text-gray-500">Best overall deals</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="stock-high" className="text-gray-200 focus:bg-gray-800 text-xs sm:text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                                            <div>
                                                <div className="font-medium">Stock</div>
                                                <div className="text-xs text-gray-500">More Stock</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="discount-high" className="text-gray-200 focus:bg-gray-800 text-xs sm:text-sm">
                                        <div className="flex items-center gap-2">
                                            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />
                                            <div>
                                                <div className="font-medium">Highest Discount</div>
                                                <div className="text-xs text-gray-500">Biggest % off</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="savings-high" className="text-gray-200 focus:bg-gray-800 text-xs sm:text-sm">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                                            <div>
                                                <div className="font-medium">Highest Savings</div>
                                                <div className="text-xs text-gray-500">Most money saved</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="rating-high" className="text-gray-200 focus:bg-gray-800 text-xs sm:text-sm">
                                        <div className="flex items-center gap-2">
                                            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                                            <div>
                                                <div className="font-medium">Top Rated</div>
                                                <div className="text-xs text-gray-500">Best reviews</div>
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
                <div className={`grid gap-3 sm:gap-4 lg:gap-5 xl:gap-6 grid-cols-1 sm:grid-cols-2 ${gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} mb-8 sm:mb-12 place-items-center`}>
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

                {/* Safety & Guarantee */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 sm:p-5 text-center hover:border-red-500/30 transition-all">
                        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full mb-3">
                            <span className="text-white font-bold text-lg">✓</span>
                        </div>
                        <h4 className="font-bold text-white mb-2 text-sm sm:text-base">Quality Guaranteed</h4>
                        <p className="text-xs sm:text-sm text-gray-400">All hot deals are quality-checked products</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 sm:p-5 text-center hover:border-orange-500/30 transition-all">
                        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-full mb-3">
                            <span className="text-white font-bold text-lg">⚡</span>
                        </div>
                        <h4 className="font-bold text-white mb-2 text-sm sm:text-base">Fast Shipping</h4>
                        <p className="text-xs sm:text-sm text-gray-400">Priority shipping for all hot deal items</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 sm:p-5 text-center hover:border-amber-500/30 transition-all">
                        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-full mb-3">
                            <span className="text-white font-bold text-lg">🛡️</span>
                        </div>
                        <h4 className="font-bold text-white mb-2 text-sm sm:text-base">Easy Returns</h4>
                        <p className="text-xs sm:text-sm text-gray-400">30-day return policy on all purchases</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ProductsByHotDeals;