function ProductDescription({ productDetails }) {
    const content = productDetails?.details;
    const images = productDetails?.descImages;

    const hasContent = !!content;
    const hasImages = images && images.length > 0;

    if (!hasContent && !hasImages) return null;

    return (
        <div className="space-y-6">
            {hasImages && (
                <div>
                    <h3 className="text-base font-bold text-white mb-4">Product Images</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {images.map((imgSrc, index) => (
                            <div
                                key={index}
                                className="rounded-none rounded-tr-xl rounded-bl-xl overflow-hidden border border-[#2a2a2a] bg-[#0f0f0f]"
                            >
                                <img
                                    src={imgSrc}
                                    alt={`Description image ${index + 1}`}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {hasContent && (
                <div>
                    <h3 className="text-base font-bold text-white mb-4">Description</h3>
                    <div
                        className="prose prose-sm max-w-none text-gray-300 prose-headings:text-white prose-strong:text-white prose-a:text-white prose-a:underline hover:prose-a:text-gray-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            )}
        </div>
    );
}

export default ProductDescription;