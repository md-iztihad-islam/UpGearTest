import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Horizontal, swipeable row with prev/next buttons (buttons from sm up;
// phones just swipe). Children are the items; give them a fixed width.
function HorizontalScroller({ children, className = "", ariaLabel }) {
    const trackRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollState = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        updateScrollState();
        el.addEventListener("scroll", updateScrollState, { passive: true });
        const observer = new ResizeObserver(updateScrollState);
        observer.observe(el);
        return () => {
            el.removeEventListener("scroll", updateScrollState);
            observer.disconnect();
        };
    }, [updateScrollState, children]);

    const scrollByPage = (direction) => {
        const el = trackRef.current;
        if (!el) return;
        el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
    };

    const arrowCls =
        "hidden sm:flex absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-[#181818]/95 border border-[#333333] text-white shadow-lg hover:bg-[#242424] transition-colors";

    return (
        <div className={`relative ${className}`}>
            {canScrollLeft && (
                <button onClick={() => scrollByPage(-1)} aria-label="Scroll left" className={`${arrowCls} -left-3 lg:-left-5`}>
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}

            <div
                ref={trackRef}
                role="list"
                aria-label={ariaLabel}
                className="flex gap-3 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2"
                style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
            >
                {children}
            </div>

            {canScrollRight && (
                <button onClick={() => scrollByPage(1)} aria-label="Scroll right" className={`${arrowCls} -right-3 lg:-right-5`}>
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}

export default HorizontalScroller;
