import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function GroupProduct({ groupProducts }) {
    const navigate = useNavigate();
    const sliderRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    if (!groupProducts || groupProducts.length === 0) return null;

    const CARD_WIDTH = 200; // px — matches the w-[180px] card + gap
    const SCROLL_AMOUNT = CARD_WIDTH * 2;

    const updateScrollState = () => {
        const el = sliderRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    const scroll = (direction) => {
        const el = sliderRef.current;
        if (!el) return;
        el.scrollBy({ left: direction * SCROLL_AMOUNT, behavior: "smooth" });
        setTimeout(updateScrollState, 350);
    };

    return (
        <div className="relative">
            {/* Left arrow */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll(-1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 text-white" />
                </button>
            )}

            {/* Right arrow */}
            {canScrollRight && (
                <button
                    onClick={() => scroll(1)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
                >
                    <ChevronRight className="w-4 h-4 text-white" />
                </button>
            )}

            {/* Scroll container */}
            <div
                ref={sliderRef}
                onScroll={updateScrollState}
                className="flex gap-3 overflow-x-auto pb-2 scroll-smooth"
                style={{ scrollbarWidth: "none" }}
            >
                {groupProducts.map((product, index) => (
                    <button
                        key={product.productId || index}
                        onClick={() => navigate(`/products/${product.slug}`)}
                        className="flex-shrink-0 w-[168px] sm:w-[184px] bg-gray-800/50 border border-gray-700/50 hover:border-blue-500/50 rounded-2xl p-3 flex flex-col items-center gap-3 transition-all duration-200 hover:bg-gray-700/50 hover:shadow-lg hover:shadow-blue-500/10 group"
                    >
                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-900/50">
                            <img
                                src={product.images?.[0]?.imageURL || "https://via.placeholder.com/150"}
                                alt={product.title || `Variant ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div className="w-full text-left space-y-0.5">
                            <p className="text-xs font-semibold text-white leading-snug line-clamp-2">
                                {product.title}
                            </p>
                            {product.subTitle && (
                                <p className="text-[11px] text-gray-400 line-clamp-1">
                                    {product.subTitle}
                                </p>
                            )}
                            <p className="text-sm font-bold text-blue-400 pt-0.5">
                                ৳{Number(product.price).toLocaleString()}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default GroupProduct;