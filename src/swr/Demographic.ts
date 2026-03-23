import useSWR from "swr";

interface ResponseDemographics {
  store: {
    categories: string[];
    series: number[];
    list: { rows: string[] };
  };
  demo: { table: string[] };
  gender: {
    categories: string[];
    series: number[];
  };
  age: {
    categories: string[];
    series: number[];
  };
  ktp: {
    overall: {
      categories: string[];
      series: number[];
    };
    perCity: {
      categories: string[];
      series: number[];
    };
    list: {
      city: string;
      valid: number;
      invalid: number;
      total: number;
      uniqueUsers: number;
    }[];
  };
}

export function useSWRDemographic() {
  const getKeys = `/api/demographic/list`;
  const { data, isLoading, error } = useSWR([getKeys], {
    revalidateOnFocus: false,
  });

  return {
    keys: getKeys,
    data: data as ResponseDemographics,
    isLoading: isLoading,
    isError: Boolean(error),
  };
}
