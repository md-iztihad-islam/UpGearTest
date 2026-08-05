import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Flame, Clock, Zap, AlertCircle, TrendingUp } from "lucide-react";
import ProductCard from "@/components/clientPart/productCard/ProductCard";
import getAllHotDealsApi from "@/services/dashboard/hotDeals/getAllHotDealsApi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function HotDeals() {
    const navigate = useNavigate();
    
    const { data: hotDealsData, isLoading, isError } = useQuery({
        queryKey: ['hotDealsData'],
        queryFn: () => getAllHotDealsApi(),
        cacheTime: 5 * 60 * 1000,
        staleTime: 2 * 60 * 1000,
    });

    const products = hotDealsData?.data?.map(group => group.products[0]) || [];
    const displayedProducts = products.slice(0, 8);
    const hasMore = products.length > 8;

    const highestDiscountFraction = products.reduce((max, product) => {
        const originalPrice = product.mainPrice || 0;
        const discount = product.discountAmount || 0;
        const discountPercentage = originalPrice > 0 ? (discount / originalPrice) * 100 : 0;
        return discountPercentage > max ? discountPercentage : max;
    }, 0);

    const highestDiscount = Math.ceil(highestDiscountFraction);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-red-500/5 to-transparent pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-8 md:mb-12"
                >
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-semibold rounded-full mb-3 shadow-lg shadow-orange-500/30 animate-pulse">
                            <Flame className="w-3.5 h-3.5" />
                            <span>Limited Time</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                            Hot Deals
                        </h2>
                        <div className="flex items-center gap-2 text-gray-400 text-sm sm:text-base">
                            <Clock className="w-4 h-4" />
                            <span>Grab them before they're gone!</span>
                        </div>
                    </div>
                    
                    <Button
                        variant="outline"
                        className="gap-2 group min-w-[140px] bg-gray-800 border-gray-700 text-white hover:bg-gradient-to-r hover:from-orange-600 hover:to-red-600 hover:border-transparent transition-all"
                        onClick={() => navigate('/hot-deals')}
                    >
                        View All {products.length > 0 && `(${products.length})`}
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </motion.div>

                {/* Stats Banner */}
                {!isLoading && !isError && products.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid grid-cols-3 gap-2 sm:gap-4 mb-8 md:mb-12"
                    >
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-900/40 to-orange-800/20 border border-orange-700/50 p-2.5 sm:p-4 backdrop-blur-sm">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/20 rounded-full blur-2xl" />
                            <div className="relative">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                    <Flame className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-orange-400 shrink-0 animate-pulse" />
                                    <span className="text-sm sm:text-2xl font-bold text-white">Up to {highestDiscount}%</span>
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-400 leading-tight">Maximum Discount</div>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-700/50 p-2.5 sm:p-4 backdrop-blur-sm">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/20 rounded-full blur-2xl" />
                            <div className="relative">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                    <Zap className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-red-400 shrink-0" />
                                    <span className="text-base sm:text-2xl font-bold text-white">{products.length}</span>
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-400 leading-tight">Hot Deals Available</div>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-900/40 to-pink-800/20 border border-pink-700/50 p-2.5 sm:p-4 backdrop-blur-sm">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/20 rounded-full blur-2xl" />
                            <div className="relative">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                    <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-pink-400 shrink-0" />
                                    <span className="text-base sm:text-2xl font-bold text-white">Limited</span>
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-400 leading-tight">Stock Available</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Products Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-[400px] rounded-xl bg-gray-800/50 border border-gray-700"></div>
                            </div>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="text-center py-16 px-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
                            <AlertCircle className="h-8 w-8 text-red-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            Failed to load hot deals
                        </h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            We couldn't fetch the latest deals. Please try again later.
                        </p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 border border-gray-700 mb-4">
                            <Flame className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            No hot deals available
                        </h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Check back soon for exciting limited-time offers
                        </p>
                    </div>
                ) : (
                    <>
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 place-items-center"
                        >
                            {displayedProducts.map((product) => (
                                <motion.div key={product._id} variants={itemVariants}>
                                    <ProductCard 
                                        productDetails={product} 
                                        badge="Hot Deal"
                                    />
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* View All Button - Mobile/Tablet */}
                        {hasMore && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 }}
                                className="mt-8 text-center lg:hidden"
                            >
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="gap-2 group min-w-[200px] bg-gradient-to-r from-orange-600 to-red-600 border-transparent text-white hover:from-orange-700 hover:to-red-700"
                                    onClick={() => navigate('/hot-deals')}
                                >
                                    <Flame className="w-4 h-4" />
                                    View All {products.length} Deals
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

export default HotDeals;