import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import getAllHotDealsApi from "@/services/dashboard/hotDeals/getAllHotDealsApi";
import { motion } from "framer-motion";

// --- Custom Tailwind-like CSS for gradient background ---
const cardBackgroundGradient = {
  background: 'linear-gradient(180deg, #1A1A1D 0%, #111114 100%)',
};

// --- ProductCard Component ---
const ProductCard = ({ product }) => {
  const title = product?.title || "Unknown Product";
  const imageURL = product?.images?.[0]?.imageURL || "https://via.placeholder.com/400";
  
  const currentPrice = Number(product?.price || 0);
  const originalPrice = Number(product?.mainPrice || 0);
  const isDiscounted = product?.isDiscounted && originalPrice > currentPrice;
  const discountPercentage = isDiscounted 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : 0;

  const category = product?.group?.category?.title;
  const subCategory = product?.group?.subCategory?.title;
  const tags = product?.group?.tags?.map((t) => t.tag) || [];
  
  const allTags = [...new Set([category, subCategory, ...tags])].filter(Boolean).slice(0, 4);

  return (
    <div 
      style={cardBackgroundGradient}
      className="border-2 border-[#333333] rounded-xl p-4 flex flex-col gap-4 hover:border-gray-500 transition-colors cursor-pointer 
        w-[340px] h-[520px] 
        sm:w-[320px] sm:h-[500px]"
    >
      {/* Product Image */}
      <div className="w-full aspect-square bg-[#0F0F11] rounded-lg overflow-hidden flex items-center justify-center p-2">
        <img 
          src={imageURL} 
          alt={title} 
          className="w-full h-full object-cover rounded-md"
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1 gap-3">
        <h3 className="text-white font-medium text-base sm:text-lg line-clamp-2 leading-tight">
          {title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag, index) => (
            <span 
            key={index} 
            className="px-3 py-1 bg-[#2C2C2E] text-[#A1A1AA] text-[10px] sm:text-xs rounded-full capitalize"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Price Section */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          <span className="text-white font-bold text-xl">
            {currentPrice.toLocaleString()} ৳
          </span>
          {isDiscounted && (
            <>
              <span className="text-red-500 text-sm line-through">
                {originalPrice.toLocaleString()} ৳
              </span>
              <span className="text-green-500 text-sm font-bold ml-1">
                Save {discountPercentage}%
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- HotDeals Component ---
function HotDeals() {
    const { data: hotDealsData, isLoading, isError } = useQuery({
        queryKey: ['hotDealsData'],
        queryFn: () => getAllHotDealsApi(),
        cacheTime: 5 * 60 * 1000,
        staleTime: 2 * 60 * 1000,
    });

    // Extracting data safely based on your provided mapping structure
    const rawData = hotDealsData?.data || [];
    const products = Array.isArray(rawData) 
        ? (rawData[0]?.products ? rawData.map(g => g.products[0]).filter(Boolean) : rawData) 
        : (rawData.products || []);
        
    // Slicing to 6 to perfectly match the 3-column grid design shown in the image
    const displayedProducts = products.slice(0, 6); 

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <section className="relative py-16 lg:py-24 bg-[#09090B] overflow-hidden min-h-screen">
            {/* Subtle red glow positioned on the left side to match the image */}
            <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-red-600/15 rounded-full blur-[120px] pointer-events-none"></div>
            
            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                
                {/* Header matching the reference image */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 sm:mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight mb-3">
                        Selling too fast!
                    </h2>
                    <p className="text-[#A1A1AA] text-sm sm:text-base md:text-lg">
                        Get before these are out of stock
                    </p>
                </motion.div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                    </div>
                )}

                {/* Error State */}
                {isError && !isLoading && (
                    <div className="text-center py-16 px-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
                            <AlertCircle className="h-8 w-8 text-red-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Failed to load</h3>
                        <p className="text-gray-400">Please check your connection and try again.</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && products.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                        No hot deals available right now. Check back soon!
                    </div>
                )}

                {/* Products Grid */}
                {!isLoading && !isError && products.length > 0 && (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center"
                    >
                        {displayedProducts.map((product) => (
                            <motion.div key={product.productId || product._id} variants={itemVariants}>
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
}

export default HotDeals;