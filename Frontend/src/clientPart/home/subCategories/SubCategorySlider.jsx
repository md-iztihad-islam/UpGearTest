import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import getAllSubCategoriesApi from "@/services/dashboard/category/getAllSubCategoriesApi";
import HorizontalScroller from "@/components/clientPart/scroller/HorizontalScroller";

// Right after the hero carousel: one square tile per sub-category, its image
// filling the box and the title inside it. Sub-categories without an image
// still get a tile, just without the picture.
function SubCategorySlider() {
    const { data, isLoading } = useQuery({
        queryKey: ["subcategories"],
        queryFn: () => getAllSubCategoriesApi(),
        staleTime: 5 * 60 * 1000,
    });

    const subCategories = data?.data || [];

    if (isLoading) {
        return (
            <section className="bg-black py-8 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-3 sm:gap-5 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="shrink-0 w-[136px] sm:w-[200px] aspect-square bg-[#181818] border-2 border-[#2a2a2a] rounded-none rounded-tr-2xl rounded-bl-2xl animate-pulse"
                        />
                    ))}
                </div>
            </section>
        );
    }

    if (subCategories.length === 0) return null;

    return (
        <section className="bg-black py-8 sm:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-5 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">Get what you want!</h2>
                    <p className="text-gray-400 text-sm sm:text-base">Browse by category</p>
                </div>

                <HorizontalScroller ariaLabel="Categories">
                    {subCategories.map((sub) => (
                        <Link
                            key={sub.subCategoryId}
                            to={`/products/sub-category/${sub.slug}`}
                            role="listitem"
                            className="group relative snap-start shrink-0 w-[136px] sm:w-[200px] aspect-square overflow-hidden bg-[#111111] border-2 border-[#333333] hover:border-[#555555] rounded-none rounded-tr-2xl rounded-bl-2xl transition-colors"
                        >
                            {sub.imageURL ? (
                                <img
                                    src={sub.imageURL}
                                    alt={sub.title}
                                    loading="lazy"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-0 flex items-center justify-center text-6xl sm:text-7xl font-bold text-white/5 select-none"
                                >
                                    {sub.title?.charAt(0)}
                                </span>
                            )}

                            {/* Title sits inside the box over a fade so it stays readable on any image */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 sm:px-4 pt-10 pb-3 sm:pb-4">
                                <h3 className="text-sm sm:text-lg font-semibold text-white leading-tight line-clamp-2">
                                    {sub.title}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </HorizontalScroller>
            </div>
        </section>
    );
}

export default SubCategorySlider;
