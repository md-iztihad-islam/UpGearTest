import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/clientPart/productCard/ProductCard";
import HorizontalScroller from "@/components/clientPart/scroller/HorizontalScroller";

// The home page shows at most this many products per section; the rest are
// on the section's "View all" page.
export const HOME_SECTION_LIMIT = 8;

/**
 * A home page product section rendered as a horizontal scroller.
 * Hidden entirely when the section has no products.
 */
function ProductRow({ title, subtitle, queryKey, fetchProducts, viewAllTo, glowClass }) {
    const { data, isLoading, isError } = useQuery({
        queryKey,
        queryFn: () => fetchProducts({ page: 1, limit: HOME_SECTION_LIMIT }),
        staleTime: 5 * 60 * 1000,
    });

    const products = (data?.data?.products || []).slice(0, HOME_SECTION_LIMIT);

    if (isLoading || isError || products.length === 0) return null;

    return (
        <section className="relative overflow-hidden bg-black py-10 sm:py-14">
            {glowClass && <div className={`pointer-events-none absolute top-0 h-full w-96 blur-[100px] ${glowClass}`} />}

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">{title}</h2>
                        {subtitle && <p className="text-gray-400 text-sm sm:text-base">{subtitle}</p>}
                    </div>
                    {viewAllTo && (
                        <Link
                            to={viewAllTo}
                            className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            View all
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>

                <HorizontalScroller ariaLabel={title}>
                    {products.map((product) => (
                        <div key={product.productId} role="listitem" className="snap-start shrink-0 w-[160px] sm:w-[240px]">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </HorizontalScroller>
            </div>
        </section>
    );
}

export default ProductRow;
