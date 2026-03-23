import useSWR from "swr";

interface ResponseEntrySummary {
  statistic: {
    categories: string[];
    series: {
      name: string;
      data: number[];
    }[];
    list: Record<string, string | number>[];
  };
  summary: {
    entryStatusChart: {
      categories: string[];
      series: number[];
    };
    invalidReasonChart: {
      categories: string[];
      series: number[];
    };
    list: Record<string, string | number>[];
  };
}

export function useSWREntrySummary({ type }: { type: string }) {
  const getKeys = `/api/entries-summary/list?type=${type}`;
  const { data, isLoading, error } = useSWR([getKeys], {
    revalidateOnFocus: false,
  });

  return {
    keys: getKeys,
    data: data as ResponseEntrySummary,
    isLoading: isLoading,
    isError: Boolean(error),
  };
}
