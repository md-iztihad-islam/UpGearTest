import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import cartStore from "@/state/clientPart/cartStore";
import { Button } from "@/components/ui/button";

function CartInner() {
    const navigate = useNavigate();
    const {
        cartItems,
        isOpen,
        toggleCart,
        removeFromCart,
        updateQuantity,
    } = cartStore();

    const subtotal = cartItems?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0) || 0;

    const handleCheckout = () => {
        toggleCart();
        navigate("/checkout");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Background overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
                        onClick={toggleCart}
                    />

                    {/* Cart panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 z-[101] h-screen w-full sm:w-[480px] bg-card shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border px-6 py-5">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold text-card-foreground">
                                    Shopping Cart
                                </h2>
                                {cartItems && cartItems.length > 0 && (
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                        {cartItems.length}
                                    </span>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleCart}
                                className="h-9 w-9 rounded-full hover:bg-muted"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Cart items */}
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            {!cartItems || cartItems.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex h-full flex-col items-center justify-center text-center"
                                >
                                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                        <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-medium text-card-foreground">
                                        Your cart is empty
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Add items to get started
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map((item, index) => {
                                        const id = item._id || item.id;
                                        return (
                                            <motion.div
                                                key={id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="group relative flex gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md"
                                            >
                                                {/* Image */}
                                                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.title || "Product"}
                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex flex-1 flex-col justify-between">
                                                    <div>
                                                        <h3 className="font-medium text-card-foreground line-clamp-1">
                                                            {item.title || "Product"}
                                                        </h3>
                                                        <p className="mt-1 text-lg font-semibold text-primary">
                                                            ৳{item.price?.toLocaleString() || 0}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        {/* Quantity controls */}
                                                        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 rounded-md hover:bg-background"
                                                                onClick={() =>
                                                                updateQuantity(
                                                                    id,
                                                                    Math.max(1, (item.quantity || 1) - 1)
                                                                )
                                                                }
                                                                disabled={(item.quantity || 1) <= 1}
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <span className="w-8 text-center text-sm font-medium text-card-foreground">
                                                                {item.quantity || 1}
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 rounded-md hover:bg-background"
                                                                onClick={() =>
                                                                updateQuantity(id, (item.quantity || 1) + 1)
                                                                }
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </div>

                                                        {/* Remove button */}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => removeFromCart(id)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cartItems && cartItems.length > 0 && (
                            <div className="border-t border-border bg-card px-6 py-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Subtotal
                                    </span>
                                    <span className="text-2xl font-bold text-card-foreground">
                                        ৳{subtotal.toLocaleString()}
                                    </span>
                                </div>
                                <Button onClick={handleCheckout} className="w-full" size="lg">
                                    Proceed to Checkout
                                </Button>
                                <p className="mt-3 text-center text-xs text-muted-foreground">
                                    Shipping and taxes calculated at checkout
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function Cart() {
  // render into <body> so no parent layout/transform can break fixed positioning
  return createPortal(<CartInner />, document.body);
}

export default Cart;
