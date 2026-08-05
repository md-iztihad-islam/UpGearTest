import {create} from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const pageStore = create(
    persist(
        (set) => ({
            currentPage: 1,
            setCurrentPage: (page) => set(() => ({ currentPage: page })),
            resetPage: () => set(() => ({ currentPage: 1 })),
        }),
        {
            name: "page-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
)

export default pageStore;