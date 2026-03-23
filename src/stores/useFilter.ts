import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Filter } from '@/types';

interface FilterStore {
    filter: Filter;
    isHydrated: boolean;
    setFilter: (filter: Partial<Filter>) => void;
    resetFilter: () => void;
    setHydrated: (state: boolean) => void;
}

export const useFilterStore = create<FilterStore>()(
    persist(
        (set) => ({
            filter: {} as Filter,
            isHydrated: false,
            setFilter: (filter) =>
                set((state) => ({
                    filter: { ...state.filter, ...filter },
                })),
            resetFilter: () => set({ filter: {} as Filter }),
            setHydrated: (state) => set({ isHydrated: state }),
        }),
        {
            name: 'filter-storage',
            onRehydrateStorage: () => (state) => {
                if (state) state.setHydrated(true);
            },
        }
    )
);
