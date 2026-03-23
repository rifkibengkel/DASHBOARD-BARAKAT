/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { useRouter } from 'next/router';
import { Filter, Pagination } from '@/types';
import { useFilterStore } from '@/stores/useFilter';
import { usePaginationStore } from '@/stores/usePagination';

/**
 * Hook: usePageFilter
 * - Syncs filter/pagination state with current path.
 * - Resets pagination when filters change.
 * - Automatically reinitializes state on route change.
 */
export const usePageFilter = (initialPagination: Pagination, initialFilter: Filter) => {
    const router = useRouter();

    const { filter, setFilter, resetFilter } = useFilterStore();
    const { pagination, setPagination, resetPagination } = usePaginationStore();

    // Track previous filter for change detection
    const previousFilterRef = React.useRef<Filter | null>(null);

    // Memoize initial states to avoid object identity changes
    const stableInitialFilter = React.useMemo(() => initialFilter, [initialFilter]);
    const stableInitialPagination = React.useMemo(() => initialPagination, [initialPagination]);

    /**
     * EFFECT 1: Handle path-based reinitialization.
     */
    React.useEffect(() => {
        const currentPath = router.asPath.split('?')[0];
        const storedPath = filter.currentPath;

        if (storedPath !== currentPath) {
            // Reset both filter and pagination
            resetFilter();
            resetPagination();

            // Initialize with defaults and set currentPath
            setFilter({ ...stableInitialFilter, currentPath });
            setPagination({ ...stableInitialPagination });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.asPath]);

    /**
     * EFFECT 2: Reset pagination when filters change (excluding currentPath).
     */
    React.useEffect(() => {
        const prevFilter = previousFilterRef.current;
        if (!prevFilter) {
            previousFilterRef.current = filter;
            return;
        }

        const { currentPath: _, ...prevWithoutPath } = prevFilter;
        const { currentPath: __, ...currWithoutPath } = filter;

        const filterChanged = JSON.stringify(prevWithoutPath) !== JSON.stringify(currWithoutPath);

        if (filterChanged) {
            setPagination({ ...stableInitialPagination });
        }

        previousFilterRef.current = filter;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    return {
        filter,
        pagination,
        setFilter,
        setPagination,
    };
};
