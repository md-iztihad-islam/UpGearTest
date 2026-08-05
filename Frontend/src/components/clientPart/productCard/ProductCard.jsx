import { Heart, ShoppingCart, Star, PackageX, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import cartStore from "@/state/clientPart/cartStore";
import getStockByProductIdWOPriceApi from "@/services/dashboard/stock/getStockByProductIdWOPrice";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Skeleton Loader
const ProductCardSkeleton = () => (
    <div className="w-[280px] sm:w-[260px] rounded-2xl overflow-hidden bg-gray-100 animate-pulse border border-gray-200">
        <div className="w-[280px] sm:w-[260px] h-[280px] sm:h-[260px] bg-gray-200"></div>
        <div className="p-4 space-y-2.5 bg-black">
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-3.5 w-3.5 bg-gray-700 rounded-full"></div>
                ))}
            </div>
            <div className="h-3.5 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3.5 bg-gray-700 rounded w-1/2"></div>
            <div className="h-5 bg-gray-700 rounded w-1/3"></div>
            <div className="h-9 bg-gray-700 rounded w-full mt-3"></div>
        </div>
    </div>
);

const ProductCard = ({ productDetails, badge }) => {
    const navigate = useNavigate();
    const { addToCart } = cartStore();
    const [isWishlisted, setIsWishlisted] = useState(false);

    const product = productDetails || {};
    const productId = product._id || product.id;

    const { data: stocksData, isLoading: stockLoading, isError: stockError } = useQuery({
        queryKey: ["stocks", productId],
        queryFn: () => getStockByProductIdWOPriceApi(productId),
        enabled: !!productId,
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });

    const stock = stocksData?.data?.reduce((acc, s) => acc + (s.remainingQuantity || 0), 0) || 0;
    const isOutOfStock = stock === 0;
    const isLowStock = !isOutOfStock && stock > 0 && stock <= 5;
    const hasDiscount = product?.mainPrice && product?.finalPrice && product.mainPrice > product.finalPrice;
    const discountPercentage = hasDiscount
        ? Math.round(((product.mainPrice - product.finalPrice) / product.mainPrice) * 100)
        : 0;

    const rating = product?.review?.reduce((acc, review) => acc + review.rating, 0) / (product?.review?.length || 1) || 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!product || isOutOfStock) return;

        try {
            addToCart({
                id: product._id,
                productId: product.productId,
                title: product.title,
                subTitle: product.subTitle,
                image: product?.images?.[0] || product?.bannerImage,
                mainPrice: product.mainPrice,
                discountAmount: product.discountAmount,
                price: product.finalPrice || product.price,
                quantity: 1,
                stock: stock,
                maxQuantity: stock,
                insideDhakaCharge: product.insideDhakaCharge,
                outsideDhakaCharge: product.outsideDhakaCharge,
            });

            if (typeof window !== "undefined" && window.showToast) {
                window.showToast(`${product.title} added to cart`, { type: "success" });
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
        }
    };

    const toggleWishlist = (e) => {
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
    };

    if (stockLoading) return <ProductCardSkeleton />;

    if (stockError) {
        return (
            <div className="w-[280px] sm:w-[260px] rounded-2xl overflow-hidden border border-destructive/20 bg-destructive/5 p-5 flex flex-col items-center justify-center min-h-[200px]">
                <PackageX className="h-10 w-10 text-destructive mb-3" />
                <p className="text-destructive font-medium text-center text-sm mb-1">Failed to load stock information</p>
                <p className="text-xs text-muted-foreground text-center">Please try again later</p>
            </div>
        );
    }

    return (
        <div
            onClick={() => navigate(`/products/${product.slug}`)}
            className={`group w-[280px] sm:w-[260px] relative rounded-2xl overflow-hidden border border-border bg-card shadow-elegant transition-all duration-500 animate-fade-in ${
                isOutOfStock
                    ? "opacity-70 cursor-not-allowed"
                    : "cursor-pointer hover:-translate-y-1 hover:shadow-xl"
            }`}
        >
            {/* Badges */}
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
                {badge === "Hot Deal" && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-2.5 py-1 text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        Hot Deal
                    </Badge>
                )}
                {badge === "Discounted" && discountPercentage > 0 && !isOutOfStock && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-2.5 py-1 text-xs">
                        -{discountPercentage}%
                    </Badge>
                )}
                {isOutOfStock && (
                    <Badge variant="destructive" className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold animate-pulse">
                        <PackageX className="h-3 w-3" />
                        Sold Out
                    </Badge>
                )}
                {isLowStock && !isOutOfStock && (
                    <Badge className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-500 text-white border-0">
                        <PackageX className="h-3 w-3" />
                        Only {stock} left
                    </Badge>
                )}
            </div>

            {/* Quick Actions */}
            {!isOutOfStock && (
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white border"
                        onClick={toggleWishlist}
                    >
                        <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                </div>
            )}

            {/* Image — 1:1 ratio */}
            <div className="relative overflow-hidden bg-muted w-[280px] sm:w-[260px] h-[280px] sm:h-[260px]">
                <img
                    src={product?.bannerImage || product?.images?.[0]}
                    alt={product?.title || "Product"}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                        isOutOfStock ? "opacity-50" : ""
                    }`}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                    }}
                />
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="text-white text-sm font-semibold bg-black/50 px-4 py-1.5 rounded-lg">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 bg-black text-white">

                {/* Rating */}
                <div className="flex items-center gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`h-3 w-3 ${
                                i < Math.floor(rating)
                                    ? "fill-[goldenrod] text-[goldenrod]"
                                    : "text-gray-600"
                            } ${isOutOfStock ? "opacity-50" : ""}`}
                        />
                    ))}
                    <span className="text-[11px] text-gray-400 ml-1">
                        ({product.review?.length || 0})
                    </span>
                </div>

                {/* Title */}
                <h3 className={`font-semibold text-sm mb-0.5 line-clamp-2 transition-colors ${
                    isOutOfStock ? "text-gray-500" : "group-hover:text-accent"
                }`}>
                    {product?.title || "Unnamed Product"}
                </h3>

                {/* Subtitle */}
                {product?.subTitle && (
                    <p className={`text-xs mb-1 line-clamp-1 ${
                        isOutOfStock ? "text-gray-500" : "text-gray-300"
                    }`}>
                        {product.subTitle}
                    </p>
                )}

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                    <span className={`text-base font-bold ${
                        isOutOfStock ? "text-gray-500" : "text-white"
                    }`}>
                        ৳{product?.finalPrice || product?.price || "0.00"}
                    </span>
                    {hasDiscount && product?.mainPrice && (
                        <span className="text-xs text-gray-400 line-through">
                            ৳{product.mainPrice}
                        </span>
                    )}
                    {hasDiscount && discountPercentage > 0 && !isOutOfStock && (
                        <span className="text-xs font-semibold text-green-400">
                            Save {discountPercentage}%
                        </span>
                    )}
                </div>

                {/* Add to Cart Button */}
                <Button
                    className={`w-full transition-all duration-300 cursor-pointer h-9 text-sm ${
                        isOutOfStock
                            ? "bg-gray-700 text-gray-500 hover:bg-gray-700 border-gray-700"
                            : "bg-primary hover:bg-white hover:text-black hover:shadow-lg"
                    }`}
                    size="sm"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    type="button"
                >
                    {isOutOfStock ? (
                        <>
                            <PackageX className="h-3.5 w-3.5 mr-1.5" />
                            Out of Stock
                        </>
                    ) : isLowStock ? (
                        <>
                            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                            Buy Now — Only {stock} left!
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                            Add to Cart
                        </>
                    )}
                </Button>
            </div>

            {/* Hover Effect Border */}
            {!isOutOfStock && (
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent/20 rounded-2xl pointer-events-none transition-all duration-500"></div>
            )}
        </div>
    );
};

export default ProductCard;


// This is for Homepage only