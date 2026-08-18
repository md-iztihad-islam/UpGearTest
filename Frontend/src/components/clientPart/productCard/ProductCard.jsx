import { ShoppingBag, ShoppingCart, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Color tokens pulled directly from the Figma "Selection colors" panels.
 * Each variant = { accentDark (top-of-card glow / badge tint), border: [from, to] }.
 * Tokens shared across every variant (white text, save-green, strike-red)
 * live in COMMON below instead of being repeated per variant.
 */
const VARIANTS = {
    discounted: {
        // green panel
        accentDark: "#07471A",
        borderFrom: "#124E24",
        borderTo: "#1A8B3C",
    },
    newArrival: {
        // blue panel
        accentDark: "#101C48",
        borderFrom: "#2218A8",
        borderTo: "#224D9D",
    },
    hotDeal: {
        // red panel
        accentDark: "#520608",
        borderFrom: "#6D1819",
        borderTo: "#6E0A0B",
    },
    normal: {
        // black/gray panel — no colored border gradient, just a flat gray ring
        accentDark: "#373737",
        borderFrom: "#626262",
        borderTo: "#626262",
    },
};

const COMMON = {
    textPrimary: "#FFFFFF",
    textSecondary: "#F5EFF7",
    badgeBg: "#322F35",
    save: "#66FF7D",
    strike: "#FF7B7B",
};

/**
 * Picks a single visual variant when a product has multiple flags set.
 * Priority: hot deal > new arrival > discounted > normal.
 * Adjust this order if a different precedence makes more sense for the store.
 */
function resolveVariant(product) {
    if (product.isHotDeal) return "hotDeal";
    if (product.isNewArrival) return "newArrival";
    if (product.isDiscounted) return "discounted";
    return "normal";
}

function formatTaka(value) {
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return num.toLocaleString("en-US");
}

/**
 * ProductCard
 *
 * Props:
 * - product: shape as returned by the products list API (title, subTitle,
 *   bannerImageURL, mainPrice, discount, price, isNewArrival, isHotDeal,
 *   isDiscounted, slug, group.tags, stocks, ...)
 * - onAddToCart?(product): called when the cart icon is clicked. If omitted,
 *   the button still renders but is a no-op — wire this to your actual
 *   cart store's add-item action.
 * - onToggleWishlist?(product): same idea for the heart icon. No wishlist
 *   store exists yet in this codebase, so this is left as a callback.
 * - onBuyNow?(product): called when "Buy Now" is clicked. Defaults to
 *   navigating to the product detail page via its slug.
 */
function ProductCard({ product, onAddToCart, onToggleWishlist, onBuyNow }) {
    const navigate = useNavigate();
    const variant = VARIANTS[resolveVariant(product)];

    const tags = (product.group?.tags ?? []).slice(0, 4);
    const discount = Number(product.discount) || 0;
    const hasSavings = discount > 0;
    const totalStock = (product.stocks ?? []).reduce((sum, s) => sum + (s.remaining || 0), 0);
    const isOutOfStock = (product.stocks?.length ?? 0) > 0 && totalStock <= 0;

    const handleBuyNow = () => {
        if (onBuyNow) return onBuyNow(product);
        navigate(`/products/${product.slug}`);
    };

    return (
        <div
            className="rounded-2xl p-[1.5px] shrink-0 w-full max-w-[300px]"
            style={{ background: `linear-gradient(160deg, ${variant.borderFrom}, ${variant.borderTo})` }}
        >
            <div className="rounded-2xl overflow-hidden bg-[#0B0B0B] h-full flex flex-col">
                {/* Image area */}
                <div
                    className="relative aspect-square"
                    style={{
                        background: `radial-gradient(120% 90% at 50% 0%, ${variant.accentDark}80, transparent 65%), #0B0B0B`,
                    }}
                >
                    <img
                        src={product.bannerImageURL}
                        alt={product.title}
                        className="w-full h-full object-contain p-4"
                        loading="lazy"
                    />

                    {isOutOfStock && (
                        <div className="absolute top-2 right-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold text-white/80 uppercase tracking-wide">
                            Out of stock
                        </div>
                    )}

                    {/* Buy Now / cart / wishlist bar */}
                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 bg-black/55 backdrop-blur-sm px-3 py-2.5">
                        <button
                            onClick={handleBuyNow}
                            className="flex items-center gap-1.5 text-sm font-semibold text-white hover:opacity-80 transition-opacity"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            Buy Now
                        </button>
                        <span className="h-4 w-px bg-white/25" />
                        <button
                            onClick={() => onAddToCart?.(product)}
                            aria-label="Add to cart"
                            className="text-white hover:opacity-80 transition-opacity"
                        >
                            <ShoppingCart className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onToggleWishlist?.(product)}
                            aria-label="Add to wishlist"
                            className="text-white hover:opacity-80 transition-opacity"
                        >
                            <Heart className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col gap-2.5 p-4">
                    <h3
                        className="text-base font-bold leading-snug line-clamp-2"
                        style={{ color: COMMON.textPrimary }}
                    >
                        {product.title}
                    </h3>

                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {tags.map((t) => (
                                <span
                                    key={t.tagId}
                                    className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                                    style={{ backgroundColor: COMMON.badgeBg, color: COMMON.textSecondary }}
                                >
                                    {t.tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-baseline gap-2 mt-auto pt-1">
                        <span className="text-lg font-bold" style={{ color: COMMON.textPrimary }}>
                            {formatTaka(product.price)} ৳
                        </span>
                        {hasSavings && (
                            <>
                                <span
                                    className="text-sm line-through"
                                    style={{ color: COMMON.strike }}
                                >
                                    {formatTaka(product.mainPrice)}৳
                                </span>
                                <span className="text-sm font-semibold" style={{ color: COMMON.save }}>
                                    Save {discount}%
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;