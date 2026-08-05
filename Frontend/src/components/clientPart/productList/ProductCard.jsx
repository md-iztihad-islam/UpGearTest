import { Heart, ShoppingCart, Star, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import cartStore from "@/state/clientPart/cartStore";
import getStockByProductIdWOPriceApi from "@/services/dashboard/stock/getStockByProductIdWOPrice";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// Separate Badge Components
const OutOfStockBadge = () => (
    <Badge
        variant="destructive"
        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold animate-pulse whitespace-nowrap w-fit"
    >
        <PackageX className="h-3 w-3 shrink-0" />
        Out of Stock
    </Badge>
);

const LowStockBadge = ({ stock }) => (
    <Badge
        variant="warning"
        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 whitespace-nowrap w-fit"
    >
        <PackageX className="h-3 w-3 shrink-0" />
        Only {stock} left
    </Badge>
);

const SaleBadge = ({ discount }) => (
    <Badge
        variant="default"
        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white whitespace-nowrap w-fit"
    >
        🔥 {discount}% OFF
    </Badge>
);

// Skeleton Loader Component
const ProductCardSkeleton = () => (
    <div className="w-[280px] sm:w-[260px] rounded-2xl overflow-hidden bg-gray-100 animate-pulse border border-gray-200">
        <div className="w-[280px] sm:w-[260px] h-[280px] sm:h-[260px] bg-gray-200"></div>
        <div className="p-4 space-y-2.5">
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-3.5 w-3.5 bg-gray-200 rounded-full"></div>
                ))}
            </div>
            <div className="space-y-1.5">
                <div className="h-3.5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3.5 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            <div className="h-9 bg-gray-200 rounded w-full mt-3"></div>
        </div>
    </div>
);

const ProductCard = ({ productDetails }) => {
    const navigate = useNavigate();
    const { addToCart } = cartStore();
    const product = productDetails || {};

    const { data: stocksData, isLoading: stockLoading, isError: stockError } = useQuery({
        queryKey: ["stocks", product._id],
        queryFn: () => getStockByProductIdWOPriceApi(product._id),
        enabled: !!product._id,
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });

    // console.log("Stock data for product", product._id, stocksData);

    const stock = stocksData?.data?.reduce((acc, stock) => acc + (stock.remainingQuantity || 0), 0) || 0;
    const isOutOfStock = stock === 0;
    const isLowStock = !isOutOfStock && stock > 0 && stock <= 5;
    const hasDiscount = product?.mainPrice && product?.finalPrice && product.mainPrice > product.finalPrice;
    const discountPercentage = hasDiscount
        ? Math.round(((product.mainPrice - product.finalPrice) / product.mainPrice) * 100)
        : 0;

    const rating =
        product?.review?.reduce((acc, review) => acc + review.rating, 0) /
        (product?.review?.length || 1);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!product || isOutOfStock) {
            console.warn("Cannot add to cart: product unavailable or out of stock");
            return;
        }

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
            } else {
                alert(`${product.title} added to cart!`);
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            if (typeof window !== "undefined" && window.showToast) {
                window.showToast("Failed to add item to cart", { type: "error" });
            }
        }
    };

    const handleCardClick = () => {
        navigate(`/products/${product.slug}`);
    };

    if (stockLoading) return <ProductCardSkeleton />;

    if (stockError) {
        return (
            <div className="w-[280px] sm:w-[260px] rounded-2xl overflow-hidden border border-destructive/20 bg-destructive/5 p-5 flex flex-col items-center justify-center min-h-[200px]">
                <PackageX className="h-10 w-10 text-destructive mb-3" />
                <p className="text-destructive font-medium text-center text-sm mb-1">
                    Failed to load stock information
                </p>
                <p className="text-xs text-muted-foreground text-center">Please try again later</p>
            </div>
        );
    }

    return (
        <div
            onClick={handleCardClick}
            className="group w-[280px] sm:w-[260px] relative rounded-2xl overflow-hidden border border-border bg-card shadow-elegant transition-all duration-500 animate-fade-in cursor-pointer"
        >
            {/* Image Container — badges scoped inside so overflow:hidden clips them */}
            <div className="relative overflow-hidden bg-muted w-[280px] sm:w-[260px] h-[280px] sm:h-[260px]">
                <img
                    src={product?.bannerImage || product?.images?.[0]}
                    alt={product?.title || "Product Image"}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                        isOutOfStock ? "opacity-50" : ""
                    }`}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                    }}
                />

                {isOutOfStock && (
                    <div className="absolute inset-0 bg-gray-800/20 backdrop-blur-[1px]" />
                )}

                {/* Badges — top-left, clipped by parent overflow-hidden */}
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 max-w-[55%]">
                    {isOutOfStock && <OutOfStockBadge />}
                    {isLowStock && <LowStockBadge stock={stock} />}
                    {hasDiscount && discountPercentage > 0 && !isOutOfStock && (
                        <SaleBadge discount={discountPercentage} />
                    )}
                </div>

                {/* Heart button — top-right, only when in stock */}
                {!isOutOfStock && (
                    <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full shadow-lg backdrop-blur-sm bg-white/80 hover:bg-white border"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Heart className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Product Content */}
            <div className="p-4 bg-black text-white">
                {/* Rating */}
                <div className="flex items-center gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`h-3 w-3 shrink-0 ${
                                i < Math.floor(rating || 0)
                                    ? "fill-[goldenrod] text-[goldenrod]"
                                    : "text-muted-foreground"
                            } ${isOutOfStock ? "opacity-50" : ""}`}
                        />
                    ))}
                </div>

                {/* Product Name */}
                <h3
                    className={`font-semibold text-sm mb-0.5 line-clamp-2 transition-colors ${
                        isOutOfStock ? "text-gray-500" : "group-hover:text-accent"
                    }`}
                >
                    {product?.title || "Unnamed Product"}
                </h3>

                {/* Product Subtitle */}
                {product?.subTitle && (
                    <p
                        className={`text-xs mb-1 line-clamp-1 ${
                            isOutOfStock ? "text-gray-400" : "text-white"
                        }`}
                    >
                        {product.subTitle}
                    </p>
                )}

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                    <span
                        className={`text-base font-bold ${
                            isOutOfStock ? "text-gray-500" : "text-white"
                        }`}
                    >
                        ৳{product?.finalPrice || product?.price || "0.00"}
                    </span>
                    {hasDiscount && product?.mainPrice && (
                        <span
                            className={`text-xs line-through ${
                                isOutOfStock ? "text-gray-400" : "text-muted-foreground"
                            }`}
                        >
                            ৳{product.mainPrice}
                        </span>
                    )}
                </div>

                {/* Add to Cart Button */}
                <Button
                    className={`w-full transition-all duration-300 cursor-pointer h-9 text-sm ${
                        isOutOfStock
                            ? "bg-gray-300 text-gray-500 hover:bg-gray-300 border-gray-300"
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
                            Buy Now - {stock} left!
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
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent/20 rounded-2xl pointer-events-none transition-all duration-500" />
            )}
        </div>
    );
};

export default ProductCard;