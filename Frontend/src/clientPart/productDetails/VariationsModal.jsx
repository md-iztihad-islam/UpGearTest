import { useState, useMemo } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

function getStock(variant) {
    return (
        variant.stocks?.reduce((acc, s) => acc + ((s.remaining - s.reserved) || 0), 0) || 0
    );
}

// Pick quantities across every variant of the group and add them in one go.
// Hidden until the product page opens it.
function VariationsModal({ open, onOpenChange, variants = [], onAddToCart }) {
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
        onOpenChange(false);
    };

    if (variants.length === 0) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#181818] border border-[#2a2a2a] text-white rounded-none rounded-tr-2xl rounded-bl-2xl p-0 gap-0 sm:max-w-xl max-h-[85vh] flex flex-col overflow-hidden [&>button]:text-gray-400 [&>button:hover]:text-white">
                <DialogHeader className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-[#2a2a2a] text-left">
                    <DialogTitle className="text-xl font-bold text-white">Variations</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        Choose how many of each variant you want.
                    </DialogDescription>
                </DialogHeader>

                {/* Variant List */}
                <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-3">
                    {variants.map((v) => {
                        const stock = getStock(v);
                        const qty = quantities[v.productId] || 0;
                        const price = Number(v.price);
                        const mainPrice = Number(v.mainPrice);
                        const hasDiscount = mainPrice > price;

                        return (
                            <div
                                key={v.productId}
                                className="flex items-center gap-3 sm:gap-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-3"
                            >
                                <img
                                    src={v.images?.[0]?.imageURL || v.bannerImageURL}
                                    alt={v.subTitle || v.title}
                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-contain bg-[#0a0a0a] shrink-0"
                                />

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">
                                        {v.subTitle || v.title}
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-white font-bold">
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

                                <div className="flex items-center bg-black border border-[#333333] rounded-lg overflow-hidden shrink-0">
                                    <button
                                        onClick={() => setQty(v.productId, qty - 1, stock)}
                                        disabled={qty <= 0}
                                        aria-label="Decrease quantity"
                                        className="h-8 w-8 flex items-center justify-center hover:bg-[#242424] disabled:opacity-30 transition-colors"
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="w-8 text-center text-sm font-semibold select-none">
                                        {qty}
                                    </span>
                                    <button
                                        onClick={() => setQty(v.productId, qty + 1, stock)}
                                        disabled={qty >= stock}
                                        aria-label="Increase quantity"
                                        className="h-8 w-8 flex items-center justify-center hover:bg-[#242424] disabled:opacity-30 transition-colors"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-5 sm:px-6 py-4 border-t border-[#2a2a2a] flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-xs text-gray-500">
                            Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})
                        </p>
                        <p className="text-xl font-bold text-white">৳{subtotal.toLocaleString()}</p>
                    </div>
                    <button
                        onClick={handleAdd}
                        disabled={totalItems === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default VariationsModal;
