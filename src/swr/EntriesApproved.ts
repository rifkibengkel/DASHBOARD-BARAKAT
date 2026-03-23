import useSWR from 'swr';
import { Filter, PaginatedResponse, Pagination, Entries } from '@/types';
import { appendParams } from '@/lib/utils';

export function useSWREntries({ filter, pagination }: { filter: Filter; pagination: Pagination }) {
    const paramQuery = new URLSearchParams();
    appendParams(paramQuery, { ...filter, isValid: 1, isValidAdmin: 1, isApprovedAdmin: 1 });
    appendParams(paramQuery, pagination);

    const getKeys = `/api/entries/list?${paramQuery.toString()}`;
    const { data, isLoading, error } = useSWR([getKeys], {
        keepPreviousData: true,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
    }) as { data: PaginatedResponse<Entries>; isLoading: boolean; error: unknown };

    return {
        keys: getKeys,
        isLoading: isLoading,
        isError: error ? true : false,
        list: data ? data.list : [],
        currentPage: data ? data.currentPage : 1,
        dataPerPage: data ? data.dataPerPage : 1,
        totalData: data ? data.totalData : 1,
        totalPage: data ? data.totalPage : 1,
    };
}
