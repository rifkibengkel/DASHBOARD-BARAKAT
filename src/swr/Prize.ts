import { BaseQueryResult } from "@/types";
import useSWR from "swr";

interface ResponsePrize {
  prizeList: (BaseQueryResult & { quantity: number; typeId: number })[];
}

export function useSWRPrize() {
  const getKeys = `/api/prize/list`;
  const { data, isLoading, error } = useSWR([getKeys], {
    revalidateOnFocus: false,
  });

  return {
    keys: getKeys,
    data: data as ResponsePrize,
    isLoading: isLoading,
    isError: Boolean(error),
  };
}
