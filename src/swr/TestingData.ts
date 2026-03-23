import useSWR from "swr";
import { Filter, PaginatedResponse, Pagination, UsersList } from "@/types";
import { appendParams } from "@/lib/utils";
import { TestingDataList } from "@/types/developer-tools";

export function useSWRTestingData({
  filter,
  pagination,
}: {
  filter: Filter;
  pagination: Pagination;
}) {
  const paramQuery = new URLSearchParams();
  appendParams(paramQuery, filter);
  appendParams(paramQuery, pagination);

  const getKeys = `/api/developer-tools/testing-data/list?${paramQuery.toString()}`;
  const { data, isLoading, error } = useSWR([getKeys], {
    keepPreviousData: true,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  }) as {
    data: PaginatedResponse<TestingDataList>;
    isLoading: boolean;
    error: unknown;
  };

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
