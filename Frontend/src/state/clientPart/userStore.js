import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

const userStore = create(
    devtools(
        persist(
            (set) => ({
                user: null,
                setUser: (userData) => set({ user: userData }),
                clearUser: () => set({ user: null }),
            }),
            {
                name: "user-storage",
                storage: createJSONStorage(() => localStorage),
            }
        ),
        { name: "UserStore" }
    )
);

export default userStore;