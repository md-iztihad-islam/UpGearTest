import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Sparkles, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import ProductCard from "@/components/clientPart/productCard/ProductCard";
import getAllNewArraivalsApi from "@/services/clientPart/newArraivals/getAllNewArraivalsApi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function NewArrivals() {
    const navigate = useNavigate();
    
    const { data: newArrivalsData, isLoading, isError } = useQuery({
        queryKey: ['newArrivalsData'],
        queryFn: () => getAllNewArraivalsApi(),
        cacheTime: 5 * 60 * 1000,
        staleTime: 2 * 60 * 1000,
    });

    const products = newArrivalsData?.data?.map(group => group.products[0]) || [];
    const displayedProducts = products.slice(0, 8);
    const hasMore = products.length > 8;

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
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
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
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-semibold rounded-full mb-3 shadow-lg shadow-blue-500/30">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Just Arrived</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            New Arrivals
                        </h2>
                        <p className="text-gray-400 text-sm sm:text-base max-w-xl">
                            Discover our latest collection of cutting-edge products
                        </p>
                    </div>
                    
                    <Button
                        variant="outline"
                        className="gap-2 group min-w-[140px] bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:border-blue-500 transition-all"
                        onClick={() => navigate('/new-arraivals')}
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
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/50 p-2.5 sm:p-4 backdrop-blur-sm">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl" />
                            <div className="relative">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                    <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
                                    <span className="text-base sm:text-2xl font-bold text-white">{products.length}</span>
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-400 leading-tight">New Products</div>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 border border-cyan-700/50 p-2.5 sm:p-4 backdrop-blur-sm">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/20 rounded-full blur-2xl" />
                            <div className="relative">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                    <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
                                    <span className="text-base sm:text-2xl font-bold text-white">Fresh</span>
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-400 leading-tight">Latest Collection</div>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-700/50 p-2.5 sm:p-4 backdrop-blur-sm">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl" />
                            <div className="relative">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                    <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
                                    <span className="text-base sm:text-2xl font-bold text-white">Top</span>
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-400 leading-tight">Popular Picks</div>
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
                            Failed to load new arrivals
                        </h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            We couldn't fetch the latest products. Please check your connection and try again.
                        </p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 border border-gray-700 mb-4">
                            <Sparkles className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            No new arrivals yet
                        </h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Check back soon for exciting new products
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
                                        badge="New"
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
                                    className="gap-2 group min-w-[200px] bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:border-blue-500"
                                    onClick={() => navigate('/new-arraivals')}
                                >
                                    View All {products.length} Items
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

export default NewArrivals;