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
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 flex items-center justify-center bg-[#181818] border border-[#333333] rounded-full shadow-lg hover:bg-[#242424] transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 text-white" />
                </button>
            )}

            {/* Right arrow */}
            {canScrollRight && (
                <button
                    onClick={() => scroll(1)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 flex items-center justify-center bg-[#181818] border border-[#333333] rounded-full shadow-lg hover:bg-[#242424] transition-colors"
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
                        className="flex-shrink-0 w-[168px] sm:w-[184px] bg-black border-2 border-[#333333] hover:border-[#4a4a4a] rounded-none rounded-tr-2xl rounded-bl-2xl p-3 flex flex-col items-center gap-3 transition-colors duration-200 group"
                    >
                        <div className="w-full aspect-square rounded-none rounded-tr-lg rounded-bl-lg overflow-hidden bg-[#0a0a0a]">
                            <img
                                src={product.bannerImageURL || product.images?.[0]?.imageURL || "https://via.placeholder.com/150"}
                                alt={product.title || `Variant ${index + 1}`}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
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
                            <p className="text-sm font-bold text-white pt-0.5">
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