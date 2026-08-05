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
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                        <h3 className="text-base font-bold text-white">Product Images</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {images.map((imgSrc, index) => (
                            <div
                                key={index}
                                className="rounded-xl overflow-hidden border border-gray-700/50 bg-gray-900/30"
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
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                        <h3 className="text-base font-bold text-white">Description</h3>
                    </div>
                    <div
                        className="prose prose-sm max-w-none text-gray-300 prose-headings:text-white prose-strong:text-white prose-a:text-blue-400 hover:prose-a:text-blue-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            )}
        </div>
    );
}

export default ProductDescription;