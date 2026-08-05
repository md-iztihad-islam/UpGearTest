import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const cartStore = create(
    persist(
        (set) => ({
            cartItems: [],
            isOpen: false,

            toggleCart: () => set((state) => ({isOpen: !state.isOpen})),

            addToCart: (item) => set((state) => {
                const id = item._id || item.id;

                const existingIndex = state.cartItems.findIndex(
                    (cartItem) => (cartItem._id || cartItem.id) === id
                );

                if (existingIndex !== -1) {
                    const updated = [...state.cartItems];
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        quantity:
                            (updated[existingIndex].quantity || 0) +
                            (item.quantity || 1),
                    };
                    return { cartItems: updated };
                }

                return {
                    cartItems: [
                        ...state.cartItems,
                        { ...item, quantity: item.quantity || 1 },
                    ],
                };
            }),

            removeFromCart: (itemId) => set((state) => ({
                cartItems: state.cartItems.filter(
                    (item) => (item._id || item.id) !== itemId
                )
            })),

            updateQuantity: (itemId, quantity) => set((state) => {
                const updated = state.cartItems.map((item) => {
                    if ((item._id || item.id) === itemId) {
                        return { ...item, quantity };
                    }
                    return item;
                });
                return { cartItems: updated };
            }),
            clearCart: () => set({ cartItems: [] }),
        }),
        {
            name: "cart-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
)

export default cartStore;