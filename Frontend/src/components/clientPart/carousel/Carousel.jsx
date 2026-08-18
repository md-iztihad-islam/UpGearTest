import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import getActiveBannerApi from "@/services/dashboard/banner/getActiveBannerApi";
import { useNavigate } from "react-router-dom";

/* ─── Screen size tracking (mirrors Tailwind's sm / lg breakpoints) ── */
const BREAKPOINTS = {
    mobile: 640,  // below this: MOBILE
    tablet: 1024, // below this: TABLET, at/above: DESKTOP
};

function getScreenType(width) {
    if (width < BREAKPOINTS.mobile) return "MOBILE";
    if (width < BREAKPOINTS.tablet) return "TABLET";
    return "DESKTOP";
}

function useScreenType() {
    const [screenType, setScreenType] = useState(() =>
        typeof window !== "undefined" ? getScreenType(window.innerWidth) : "DESKTOP"
    );

    useEffect(() => {
        const handleResize = () => setScreenType(getScreenType(window.innerWidth));
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return screenType;
}

function CarouselComponent() {
    const navigate = useNavigate();
    const screenType = useScreenType();

    const { data: bannerData } = useQuery({
        queryKey: ["banners"],
        queryFn: () => getActiveBannerApi(),
        cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
        staleTime: 1 * 60 * 1000, // Data is fresh for 1 minute
    });

    const banners = bannerData?.data || [];

    // Only show banners explicitly tagged for the current screen size —
    // DESKTOP banners must never leak onto MOBILE/TABLET or vice versa.
    // displayType comparison is case-insensitive since stored values can be
    // "mobile", "Mobile", "MOBILE", etc. depending on how they were entered.
    const relevantBanners = useMemo(() => {
        return [...banners]
            .filter((b) => (b.displayType || "").toUpperCase() === screenType)
            .sort((a, b) => a.orderIndex - b.orderIndex);
    }, [banners, screenType]);

    const images = useMemo(
        () =>
            relevantBanners.map((banner) => ({
                url: banner.imageURL,
                title: banner.title,
                subtitle: banner.subTitle,
                link: banner.link,
                buttonText: banner.buttonText || "Shop Now",
            })),
        [relevantBanners]
    );

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Keep the index in range whenever the active banner set changes
    // (e.g. resizing across a breakpoint swaps in a shorter/longer list)
    useEffect(() => {
        setCurrentIndex(0);
    }, [images.length]);

    const nextSlide = useCallback(() => {
        if (isTransitioning || images.length === 0) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setTimeout(() => setIsTransitioning(false), 500);
    }, [images.length, isTransitioning]);

    const prevSlide = useCallback(() => {
        if (isTransitioning || images.length === 0) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setTimeout(() => setIsTransitioning(false), 500);
    }, [images.length, isTransitioning]);

    useEffect(() => {
        if (images.length <= 1) return;
        const intervalId = setInterval(nextSlide, 5000);
        return () => clearInterval(intervalId);
    }, [nextSlide, images.length]);

    if (images.length === 0) return null;

    return (
        <div className="relative w-full h-[100vw] sm:h-[70vh] sm:min-h-[400px] sm:max-h-[600px] overflow-hidden bg-gradient-to-r from-gray-900 to-black">
            {/* Navigation Buttons */}
            {images.length > 1 && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 border border-white/20 hidden sm:flex items-center justify-center"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-6 w-6 text-white" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 border border-white/20 hidden sm:flex items-center justify-center"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-6 w-6 text-white" />
                    </Button>
                </>
            )}

            {/* Carousel Images */}
            <div className="relative w-full h-full">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                            index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <img
                            src={image.url}
                            alt={image.title}
                            className="w-full h-full object-cover"
                            loading={index === 0 ? "eager" : "lazy"}
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        {/* Content — bottom-center */}
                        <div className="absolute bottom-16 left-0 right-0 flex justify-center items-end px-4 md:px-6 lg:px-8">
                            <div className="text-center text-white max-w-2xl">
                                <span className="inline-block px-3 py-1 mb-4 text-sm font-semibold bg-white/10 backdrop-blur-sm rounded-full">
                                    Featured
                                </span>
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                                    {image.title}
                                </h1>
                                {image.subtitle && (
                                    <p className="text-lg md:text-xl mb-8 text-gray-200">
                                        {image.subtitle}
                                    </p>
                                )}
                                {image.link && (
                                    <Button
                                        size="lg"
                                        className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg"
                                        onClick={() => navigate(image.link.slice(24))}
                                    >
                                        {image.buttonText}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Indicators/Dots */}
            {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                if (!isTransitioning) {
                                    setIsTransitioning(true);
                                    setCurrentIndex(index);
                                    setTimeout(() => setIsTransitioning(false), 500);
                                }
                            }}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                index === currentIndex
                                    ? 'w-8 bg-white'
                                    : 'w-2 bg-white/50 hover:bg-white/70'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default CarouselComponent;