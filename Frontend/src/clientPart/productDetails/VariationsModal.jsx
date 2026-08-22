import { useState, useMemo } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";

function getStock(variant) {
    return (
        variant.stocks?.reduce((acc, s) => acc + ((s.remaining - s.reserved) || 0), 0) || 0
    );
}

function VariationsModal({ variants = [], onAddToCart }) {
    const [quantities, setQuantities] = useState({});

    const subtotal = useMemo(() => {
        return variants.reduce((sum, v) => {
            const qty = quantities[v.productId] || 0;
            return sum + qty * Number(v.price);
        }, 0);
    }, [quantities, variants]);

    const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

    const setQty = (productId, value, max) => {
        setQuantities((prev) => ({
            ...prev,
            [productId]: Math.max(0, Math.min(max, value)),
        }));
    };

    const handleAdd = () => {
        const selected = variants
            .filter((v) => (quantities[v.productId] || 0) > 0)
            .map((v) => ({ product: v, quantity: quantities[v.productId] }));

        if (selected.length === 0) return;

        onAddToCart(selected);
        setQuantities({});
    };

    if (variants.length === 0) return null;

    return (
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                <h2 className="text-xl sm:text-2xl font-bold">Variations</h2>
            </div>

            {/* Variant List */}
            <div className="space-y-3">
                {variants.map((v) => {
                    const stock = getStock(v);
                    const qty = quantities[v.productId] || 0;
                    const price = Number(v.price);
                    const mainPrice = Number(v.mainPrice);
                    const hasDiscount = mainPrice > price;

                    return (
                        <div
                            key={v.productId}
                            className="flex items-center gap-4 bg-gray-900/40 border border-gray-700/50 rounded-xl p-3"
                        >
                            <img
                                src={v.images?.[0]?.imageURL || v.bannerImageURL}
                                alt={v.subTitle || v.title}
                                className="w-16 h-16 rounded-lg object-cover bg-gray-700 shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                    {v.subTitle || v.title}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-blue-400 font-bold">
                                        ৳{price.toLocaleString()}
                                    </span>
                                    {hasDiscount && (
                                        <span className="text-xs text-gray-500 line-through">
                                            ৳{mainPrice.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <p className={`text-xs mt-0.5 ${stock > 0 ? "text-gray-500" : "text-red-400"}`}>
                                    {stock > 0 ? `${stock} in stock` : "Out of stock"}
                                </p>
                            </div>

                            <div className="flex items-center bg-gray-900/60 border border-gray-700/50 rounded-lg overflow-hidden shrink-0">
                                <button
                                    onClick={() => setQty(v.productId, qty - 1, stock)}
                                    disabled={qty <= 0}
                                    className="h-8 w-8 flex items-center justify-center hover:bg-gray-700/50 disabled:opacity-30 transition-colors"
                                >
                                    <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold select-none">
                                    {qty}
                                </span>
                                <button
                                    onClick={() => setQty(v.productId, qty + 1, stock)}
                                    disabled={qty >= stock}
                                    className="h-8 w-8 flex items-center justify-center hover:bg-gray-700/50 disabled:opacity-30 transition-colors"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-5 pt-5 border-t border-gray-700/50 flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <p className="text-xs text-gray-500">
                        Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})
                    </p>
                    <p className="text-xl font-bold text-white">৳{subtotal.toLocaleString()}</p>
                </div>
                <button
                    onClick={handleAdd}
                    disabled={totalItems === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold transition-all"
                >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                </button>
            </div>
        </div>
    );
}

export default VariationsModal;