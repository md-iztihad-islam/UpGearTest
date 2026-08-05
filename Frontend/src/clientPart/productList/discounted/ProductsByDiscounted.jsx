import { useState } from "react";
import ProductCard from "@/components/clientPart/productList/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3X3, LayoutGrid, Tag, Percent, DollarSign, TrendingDown, Calendar, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import getAllDiscountedApi from "@/services/dashboard/discounted/getAllDiscountedApi";
import getAllStockApi from "@/services/dashboard/stock/getAllStockApi";
import ProductLoadingState from "@/components/loader/ProductLoader";

function ProductsByDiscounted() {
    const [sortBy, setSortBy] = useState("discount-high");
    const [gridCols, setGridCols] = useState(4);

    // Fetch all discounted products
    const { data: discountedData, isLoading, isError } = useQuery({
        queryKey: ['discounted-products'],
        queryFn: () => getAllDiscountedApi(),
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
    const allProducts = discountedData?.data ? discountedData.data.flatMap(item => item.products || []) : [];

    for(let product of allProducts){
        const stockInfo = allStocksData?.data?.find(stock => stock.productId === product.productId);
        product.stock = stockInfo ? stockInfo.quantity : 0;
    }

    // Filter to only show products that have a discount
    const products = allProducts.filter(product => {
        const hasDiscountAmount = product.discountAmount && product.discountAmount > 0;
        const hasDiscountPercentage = product.discountAmount && product.mainPrice && 
                                     (product.discountAmount / product.mainPrice * 100) > 0;
        
        return hasDiscountAmount || hasDiscountPercentage;
    });

    // Calculate discount percentage for each product
    const productsWithDiscountInfo = products.map(product => {
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
        
        return {
            ...product,
            discountPercentage,
            savings,
            calculatedDiscount: discountPercentage
        };
    });

    // Calculate discount statistics
    const calculateDiscountStats = () => {
        if (productsWithDiscountInfo.length === 0) {
            return { 
                highestDiscount: 0, 
                averageDiscount: 0, 
                totalSavings: 0,
                averageSavings: 0 
            };
        }

        let highestDiscount = 0;
        let totalDiscount = 0;
        let totalSavings = 0;

        productsWithDiscountInfo.forEach(product => {
            const discount = product.discountPercentage;
            if (discount > highestDiscount) highestDiscount = discount;
            totalDiscount += discount;
            totalSavings += product.savings || 0;
        });

        return {
            highestDiscount,
            averageDiscount: Math.ceil(totalDiscount / productsWithDiscountInfo.length),
            totalSavings: Math.ceil(totalSavings),
            averageSavings: Math.ceil(totalSavings / productsWithDiscountInfo.length)
        };
    };

    const discountStats = calculateDiscountStats();

    // Apply sorting locally
    const sortedProducts = [...productsWithDiscountInfo].sort((a, b) => {
        const discountA = a.discountPercentage || 0;
        const discountB = b.discountPercentage || 0;
        const savingsA = a.savings || 0;
        const savingsB = b.savings || 0;
        const finalPriceA = a.finalPrice || 0;
        const finalPriceB = b.finalPrice || 0;
        const stockA = a.stock || 0;
        const stockB = b.stock || 0;

        switch (sortBy) {
            case "discount-high":
                return discountB - discountA;
            case "savings-high":
                return savingsB - savingsA;
            case "price-low":
                return finalPriceA - finalPriceB;
            case "price-high":
                return finalPriceB - finalPriceA;
            case "rating":
                return (b.rating || 0) - (a.rating || 0);
            case "newest":
                return new Date(b.createdAt) - new Date(a.createdAt);
            case "stock-high":
                return stockB - stockA;
            default:
                if (discountA !== discountB) {
                    return discountB - discountA;
                }
                return (b.rating || 0) - (a.rating || 0);
        }
    });

    // Group products by discount range
    const getDiscountRanges = () => {
        const ranges = {
            "0-10": 0,
            "11-20": 0,
            "21-30": 0,
            "31-40": 0,
            "41-50": 0,
            "51+": 0
        };

        productsWithDiscountInfo.forEach(product => {
            const discount = product.discountPercentage;
            if (discount <= 10) ranges["0-10"]++;
            else if (discount <= 20) ranges["11-20"]++;
            else if (discount <= 30) ranges["21-30"]++;
            else if (discount <= 40) ranges["31-40"]++;
            else if (discount <= 50) ranges["41-50"]++;
            else ranges["51+"]++;
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
                        <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Error Loading Products</h3>
                    <p className="text-sm sm:text-base text-gray-400 mb-6">
                        Please try again later
                    </p>
                    <Button 
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    // If no discounted products found
    if (sortedProducts.length === 0 && !isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-2xl mb-6">
                        <TrendingDown className="h-10 w-10 text-green-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">No Discounts Available</h3>
                    <p className="text-sm sm:text-base text-gray-400 mb-6">
                        Check back soon for amazing deals!
                    </p>
                    <Button 
                        variant="outline" 
                        className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                        onClick={() => window.history.back()}
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                {/* Page Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 sm:px-4 py-2 rounded-full mb-3 shadow-lg">
                                <Percent className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="font-bold text-xs sm:text-sm">ON SALE</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Discounted Products
                            </h1>
                            <p className="text-sm sm:text-base text-gray-400 mt-2">
                                Shop smart and save big with our exclusive discounted items
                            </p>
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-3">
                            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl px-3 sm:px-4 py-3 shadow-lg min-w-[120px] sm:min-w-[140px]">
                                <div className="flex items-center gap-2 mb-1">
                                    <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                                    <p className="text-xs text-gray-400">Products</p>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-white">{sortedProducts.length}</p>
                            </div>
                            
                            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl px-3 sm:px-4 py-3 shadow-lg min-w-[120px] sm:min-w-[140px]">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />
                                    <p className="text-xs text-gray-400">Top Discount</p>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-orange-400">{discountStats.highestDiscount}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Discount Distribution */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-3 sm:p-4 mb-6 shadow-lg">
                        <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
                            <Percent className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                            Discount Distribution
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
                            {Object.entries(discountRanges).map(([range, count]) => (
                                <div key={range} className="text-center">
                                    <div className={`p-2 sm:p-3 rounded-lg ${
                                        count > 0 
                                            ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20' 
                                            : 'bg-gray-900/50 border border-gray-700/50'
                                    }`}>
                                        <p className="text-base sm:text-lg font-bold text-white">{count}</p>
                                        <p className="text-xs text-gray-400 mt-1">{range}% off</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-3 sm:p-4 mb-6 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="text-xs sm:text-sm text-gray-300">
                            Showing <span className="font-semibold text-white">{sortedProducts.length}</span> products with discounts
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {/* Grid Toggle */}
                            <div className="hidden md:flex items-center bg-gray-900/50 border border-gray-700/50 rounded-xl p-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm ${gridCols === 3 ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400" : "text-gray-400 hover:bg-gray-800"}`}
                                    onClick={() => setGridCols(3)}
                                >
                                    <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                    3 Cols
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm ${gridCols === 4 ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400" : "text-gray-400 hover:bg-gray-800"}`}
                                    onClick={() => setGridCols(4)}
                                >
                                    <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                    4 Cols
                                </Button>
                            </div>

                            {/* Sort Dropdown */}
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full sm:w-56 bg-gray-900/50 border-gray-700/50 text-gray-200 hover:bg-gray-900 text-xs sm:text-sm">
                                    <div className="flex items-center gap-2">
                                        <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                                        <SelectValue placeholder="Sort by" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-700">
                                    <SelectItem value="discount-high" className="text-gray-200 focus:bg-gray-800 text-xs sm:text-sm">
                                        <div className="flex items-center gap-2">
                                            <Percent className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                                            <div>
                                                <div className="font-medium">Highest Discount %</div>
                                                <div className="text-xs text-gray-500">Biggest percentage off</div>
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
                                    <SelectItem value="savings-high" className="text-gray-200 focus:bg-gray-800 text-xs sm:text-sm">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                                            <div>
                                                <div className="font-medium">Highest Savings</div>
                                                <div className="text-xs text-gray-500">Most money saved</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="featured" className="text-gray-200 focus:bg-gray-800 text-xs sm:text-sm">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />
                                            <div>
                                                <div className="font-medium">Featured Deals</div>
                                                <div className="text-xs text-gray-500">Best discounts & ratings</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="price-low" className="text-gray-200 focus:bg-gray-800 text-xs sm:text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">$</span>
                                            <div>
                                                <div className="font-medium">Price: Low to High</div>
                                                <div className="text-xs text-gray-500">Cheapest first</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className={`grid gap-3 sm:gap-4 lg:gap-5 xl:gap-6 grid-cols-1 sm:grid-cols-2 ${gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} mb-8 place-items-center`}>
                    {sortedProducts.map((product, index) => {
                        const savings = product.savings || 0;
                        
                        return (
                            <div key={`${product._id}-${index}`} className="group relative">                            

                                <div className="h-full">
                                    <ProductCard 
                                        productDetails={product}
                                        showDiscountBadge={false}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Total Savings Banner */}
                {sortedProducts.length > 0 && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2 flex items-center gap-2">
                                    Total Potential Savings
                                </h3>
                                <p className="text-sm sm:text-base text-green-100">
                                    You could save up to <span className="font-bold text-xl sm:text-2xl text-white">BDT {discountStats.totalSavings} </span> 
                                    by purchasing all discounted items!
                                </p>
                                <p className="text-xs sm:text-sm text-green-200 mt-2">
                                    That's an average of BDT {discountStats.averageSavings} saved per item!
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center min-w-[140px] sm:min-w-[180px]">
                                <p className="text-xs sm:text-sm text-green-100 mb-1">Average Discount</p>
                                <p className="text-2xl sm:text-3xl font-bold text-white">{discountStats.averageDiscount}%</p>
                                <p className="text-xs text-green-200 mt-1">across all products</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ProductsByDiscounted;