import { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import getAllSubCategoriesApi from "@/services/dashboard/category/getAllSubCategoriesApi";
import { useNavigate } from "react-router-dom";

const ACCENTS = [
    { pill: "bg-blue-500/15 border-blue-500/60 text-blue-300",       bar: "bg-blue-500" },
    { pill: "bg-purple-500/15 border-purple-500/60 text-purple-300", bar: "bg-purple-500" },
    { pill: "bg-cyan-500/15 border-cyan-500/60 text-cyan-300",       bar: "bg-cyan-500" },
    { pill: "bg-amber-500/15 border-amber-500/60 text-amber-300",    bar: "bg-amber-500" },
    { pill: "bg-emerald-500/15 border-emerald-500/60 text-emerald-300", bar: "bg-emerald-500" },
    { pill: "bg-rose-500/15 border-rose-500/60 text-rose-300",       bar: "bg-rose-500" },
];

function Subcategories() {
    const navigate = useNavigate();
    const { data: subcategoriesData, isLoading } = useQuery({
        queryKey: ["subcategories"],
        queryFn: () => getAllSubCategoriesApi(),
        cacheTime: 5 * 60 * 1000,
        staleTime: 5 * 60 * 1000,
    });

    const subcategories = subcategoriesData?.data || [];
    const scrollRef = useRef(null);
    const [showFade, setShowFade] = useState(true);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setShowFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => el.removeEventListener("scroll", handleScroll);
    }, [subcategories]);

    if (isLoading) {
        return (
            <div className="sm:hidden px-4 py-5 space-y-3">
                <div className="h-2.5 w-24 rounded-full bg-gray-800 animate-pulse" />
                <div className="flex gap-2">
                    {[88, 72, 104, 68, 92, 80].map((w, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 h-8 rounded-full bg-gray-800 animate-pulse"
                            style={{ width: w }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!subcategories.length) return null;

    return (
        <div className="sm:hidden relative py-5">

            {/* Section header */}
            <div className="flex items-center px-4 mb-3">
                <div className="flex items-center gap-2">
                    <span className="inline-block w-1 h-4 rounded-full bg-blue-500" />
                    <span className="text-xs font-semibold tracking-widest uppercase text-gray-500">
                        Categories
                    </span>
                </div>
            </div>

            {/* Right-side fade */}
            {showFade && (
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-l from-black to-transparent" />
            )}

            {/* Scrollable pill strip */}
            <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto px-4 pb-0.5"
                style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
            >
                {subcategories.map((sub, i) => {
                    const accent = ACCENTS[i % ACCENTS.length];

                    return (
                        <motion.button
                            key={sub._id}
                            onClick={() => navigate(`/products/sub-category/${sub.slug}`)}
                            whileTap={{ scale: 0.94 }}
                            className={`
                                flex-shrink-0 px-4 py-1.5 rounded-full
                                text-sm font-semibold tracking-wide whitespace-nowrap
                                border transition-all duration-200
                                ${accent.pill}
                                hover:brightness-125
                            `}
                        >
                            {sub.title}
                        </motion.button>
                    );
                })}
            </div>

            {/* Bottom rule */}
            <div className="mx-4 mt-4 h-px rounded-full bg-blue-500 opacity-20" />
        </div>
    );
}

export default Subcategories;