import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

function ProductImageGallery({ images = [], title, autoPlayInterval = 3000 }) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const sliderRef = useRef(null);

    const nextImage = useCallback(() => {
        setSelectedImage((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const prevImage = useCallback(() => {
        setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    useEffect(() => {
        if (images.length <= 1) return;
        const timer = setInterval(nextImage, autoPlayInterval);
        return () => clearInterval(timer);
    }, [nextImage, autoPlayInterval, images.length]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart(e.clientX);
        setDragOffset(0);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setDragOffset(e.clientX - dragStart);
    };

    const handleMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);
        if (dragOffset < -60) nextImage();
        else if (dragOffset > 60) prevImage();
        setDragOffset(0);
    };

    const handleTouchStart = (e) => {
        setDragStart(e.touches[0].clientX);
        setDragOffset(0);
    };

    const handleTouchMove = (e) => {
        setDragOffset(e.touches[0].clientX - dragStart);
    };

    const handleTouchEnd = () => {
        if (dragOffset < -60) nextImage();
        else if (dragOffset > 60) prevImage();
        setDragOffset(0);
    };

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
                <p className="text-gray-400">No images available</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 select-none">
            {/* Main Slider */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-xl" style={{ aspectRatio: "1/1" }}>
                <div
                    ref={sliderRef}
                    className="flex h-full"
                    style={{
                        width: `${images.length * 100}%`,
                        transform: `translateX(calc(-${(selectedImage / images.length) * 100}% + ${dragOffset / images.length}px))`,
                        transition: isDragging ? "none" : "transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)",
                        cursor: isDragging ? "grabbing" : "grab",
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="h-full flex-shrink-0"
                            style={{ width: `${100 / images.length}%` }}
                        >
                            <img
                                src={image}
                                alt={`${title} - ${index + 1}`}
                                className="w-full h-full object-cover pointer-events-none"
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                {/* Dot indicators */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                        {images.map((_, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "rounded-full transition-all duration-300",
                                    selectedImage === index
                                        ? "bg-white w-4 h-2"
                                        : "bg-white/50 w-2 h-2"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={cn(
                                "flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200",
                                selectedImage === index
                                    ? "border-blue-500 scale-105 shadow-md"
                                    : "border-transparent opacity-50 hover:opacity-80"
                            )}
                        >
                            <img
                                src={image}
                                alt={`${title} thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProductImageGallery;