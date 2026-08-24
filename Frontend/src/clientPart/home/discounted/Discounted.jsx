import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/clientPart/productCard/ProductCard";
import getAllDiscountedApi from "@/services/dashboard/discounted/getAllDiscountedApi";

function Discounted() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["discountedProducts"],
        queryFn: getAllDiscountedApi,
        staleTime: 5 * 60 * 1000,
    });

    const products = data?.data.products || [];

    if (isLoading || isError || products.length === 0) return null;

    return (
        <section className="relative overflow-hidden bg-black py-12 sm:py-16">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -right-32 top-0 h-full w-96 bg-green-600/20 blur-[100px]" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                        We're giving you a discount
                    </h2>
                    <p className="text-gray-400 text-sm sm:text-base">
                        You scrolled far down, here's a reward for you
                    </p>
                </div>

                {/* Grid — 2 cols on phone; fluid, medium-sized columns beyond that */}
                <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
                    {products.map((product) => (
                        <ProductCard key={product.productId} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Discounted;