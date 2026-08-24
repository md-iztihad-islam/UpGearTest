import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import cartStore from "@/state/clientPart/cartStore";

// product: expects the shape returned by your product list/group endpoints
// { productId, slug, title, subTitle, images, mainPrice, discount, price, tags, group }
function ProductCard({ product }) {
    const { addToCart } = cartStore();

    if (!product) return null;

    const mainPrice = Number(product.mainPrice) || 0;
    const discount = Number(product.discount) || 0;
    const price = Number(product.price) || 0;
    const hasDiscount = discount > 0 && mainPrice > price;
    const discountPercent = hasDiscount ? Math.round((discount / mainPrice) * 100) : 0;

    const image = product.images?.[0]?.imageURL || product.bannerImageURL;
    const tags = product.tags || product.group?.tags?.map((t) => t.tag) || [];

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
            id: product.productId,
            productId: product.productId,
            title: product.title,
            subTitle: product.subTitle,
            image,
            mainPrice,
            discountAmount: discount,
            price,
            quantity: 1,
            insideDhakaCharge: Number(product.group?.insideDhakaCharge) || 0,
            outsideDhakaCharge: Number(product.group?.outsideDhakaCharge) || 0,
        });
        window.showToast?.(`${product.title} added to cart`, { type: "success" });
    };

    return (
        <Link
            to={`/products/${product.slug}`}
            className="group flex flex-col w-full mx-auto max-w-[160px] sm:max-w-[300px] max-h-[300px] sm:max-h-[400px] bg-black border-2 border-[#333333] rounded-none rounded-tr-2xl rounded-bl-2xl overflow-hidden hover:border-[#4a4a4a] transition-colors duration-200"
        >
            {/* Image — padded on all sides so the product breathes inside the frame */}
            <div className="p-2 sm:p-4 shrink-0">
                <div className="w-full h-24 sm:h-40 rounded-none rounded-tr-lg rounded-bl-lg overflow-hidden bg-[#0a0a0a]">
                    <img
                        src={image}
                        alt={product.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 p-2.5 sm:p-4 pt-0 space-y-1.5 sm:space-y-3">
                {/* Title */}
                <h3 className="text-white text-xs sm:text-base font-medium leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.75rem]">
                    {product.title}
                    {product.subTitle ? ` ${product.subTitle}` : ""}
                </h3>

                {/* Tags — hidden on phone */}
                {tags.length > 0 && (
                    <div className="hidden sm:flex flex-wrap gap-1.5">
                        {tags.slice(0, 4).map((tag, i) => (
                            <span
                                key={i}
                                className="px-2.5 py-1 bg-gray-800 text-gray-300 text-xs rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-white text-sm sm:text-xl font-bold">
                        ৳{price.toLocaleString()}
                    </span>
                    {hasDiscount && (
                        <>
                            <span className="text-gray-500 text-[11px] sm:text-sm line-through">
                                ৳{mainPrice.toLocaleString()}
                            </span>
                            <span className="text-green-400 text-[11px] sm:text-sm font-semibold">
                                Save {discountPercent}%
                            </span>
                        </>
                    )}
                </div>

                {/* Add to Cart */}
                <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-[#1a1a1a] hover:bg-[#242424] border border-[#333333] text-white text-xs sm:text-base font-medium rounded-xl py-2 sm:py-3 transition-colors duration-200"
                >
                    <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Add to Cart
                </button>
            </div>
        </Link>
    );
}

export default ProductCard;