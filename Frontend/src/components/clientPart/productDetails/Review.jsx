import { Star } from "lucide-react";

function Review({ reviews = [] }) {
    const hasReviews = reviews && reviews.length > 0;

    const averageRating = hasReviews ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0;

    return (
        <div className="w-full border border-border rounded-xl p-6 space-y-6">
            {/* Header / Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold">Customer Reviews</h2>
                    <p className="text-sm text-muted-foreground">
                        {hasReviews ? `${reviews.length} review${reviews.length > 1 ? "s" : ""}` : "No reviews yet. Be the first to review this product."}
                    </p>
                </div>

                {hasReviews && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                        i < Math.round(averageRating ?? 0)
                                        ? "fill-[goldenrod]"
                                        : "fill-none "
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-medium">
                            {averageRating.toFixed(1)} / 5
                        </span>
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Review List */}
            {hasReviews ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                    {reviews.map((review, idx) => (
                        <div
                            key={idx}
                            className="border border-border rounded-lg p-4 flex flex-col gap-2"
                        >
                            {/* Top row: name + rating */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="font-semibold">
                                    {review.userName || "Anonymous"}
                                </div>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                                i < (review.rating || 0)
                                                ? "fill-[goldenrod]"
                                                : "fill-none "
                                            }`}
                                        />
                                    ))}
                                    {typeof review.rating === "number" && (
                                        <span className="text-xs ml-1">
                                            {review.rating.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Comment */}
                            {review.comment && (
                                <p className="text-sm leading-relaxed">
                                    {review.comment}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-sm">
                    This product doesn’t have any reviews yet.
                </div>
            )}
        </div>
    );
}

export default Review;