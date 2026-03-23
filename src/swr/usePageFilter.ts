/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { useRouter } from 'next/router';
import { Filter, Pagination } from '@/types';
import { useFilterStore } from '@/stores/useFilter';
import { usePaginationStore } from '@/stores/usePagination';

export const usePageFilter = (initialPagination: Pagination, initialFilter: Filter) => {
    const { filter, setFilter, resetFilter } = useFilterStore();
    const { pagination, setPagination, resetPagination } = usePaginationStore();
    const router = useRouter();

    const previousPathRef = React.useRef<string>('');
    const previousFilterRef = React.useRef<Filter>(filter);

    React.useEffect(() => {
        const currentMainPath = router.asPath.split('?')[0];
        const previousMainPath = previousPathRef.current;

        if (previousMainPath && previousMainPath !== currentMainPath) {
            resetFilter();
            resetPagination();
            setFilter(initialFilter);
            setPagination(initialPagination);
        }

        previousPathRef.current = currentMainPath;
    }, [router.asPath]);

    React.useEffect(() => {
        const prev = previousFilterRef.current;

        const filterChanged = JSON.stringify(prev) !== JSON.stringify(filter);

        if (filterChanged) {
            setPagination({ ...initialPagination });
        }

        previousFilterRef.current = filter;
    }, [filter]);

    return {
        pagination: { ...pagination },
        filter: { ...filter },
        setFilter,
        setPagination,
    };
};
