import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Pagination } from '@/types';

interface PaginationStore {
    pagination: Pagination;
    isHydrated: boolean;
    setPagination: (pagination: Partial<Pagination>) => void;
    resetPagination: () => void;
    setHydrated: (state: boolean) => void;
}

export const usePaginationStore = create<PaginationStore>()(
    persist(
        (set) => ({
            pagination: { page: 1, limit: 10 } as Pagination,
            isHydrated: false,
            setPagination: (pagination) =>
                set((state) => ({
                    pagination: { ...state.pagination, ...pagination },
                })),
            resetPagination: () => set({ pagination: { page: 1, limit: 10 } as Pagination }),
            setHydrated: (state) => set({ isHydrated: state }),
        }),
        {
            name: 'pagination-storage',
            onRehydrateStorage: () => (state) => {
                if (state) state.setHydrated(true);
            },
        }
    )
);
