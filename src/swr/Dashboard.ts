import { appendParams } from "@/lib/utils";
import useSWR from "swr";

interface ResponseUsers {
  users: {
    [x: string]: any;
  };
  entries: {
    [x: string]: any;
  };
}

interface ResponseDemographics {
  gender: {
    categories: string[];
    series: number[];
  };
  age_group: {
    categories: string[];
    series: number[];
  };
}

interface ResponseStatistic {
  type: "daily" | "weekly" | "monthly";
  categories: string[];
  series: {
    name: string;
    data: number[];
  }[];
}

export function useSWRUsers() {
  const paramQuery = new URLSearchParams();
  const getKeys = `/api/dashboard/users?${paramQuery.toString()}`;
  const { data, isLoading, error } = useSWR([getKeys], {
    revalidateOnFocus: false,
  });

  return {
    keys: getKeys,
    userData: data as ResponseUsers,
    userDataLoading: isLoading,
    userDataError: error,
    isEnableDetailStats: data?.isEnableDetailStats as Number,
  };
}

export function useSWRDemographic() {
  const getKeys = `/api/dashboard/demographics`;
  const { data, isLoading, error } = useSWR([getKeys], {
    revalidateOnFocus: false,
  });

  return {
    keys: getKeys,
    demographicsData: data as ResponseDemographics,
    demographicsDataLoading: isLoading,
    demographicsDataError: error,
  };
}

export function useSWREntriesStatistic({ type }: { type: string }) {
  const paramQuery = new URLSearchParams();
  appendParams(paramQuery, { type });

  const getKeys = `/api/dashboard/entries-statistic?${paramQuery.toString()}`;
  const { data, isLoading, error } = useSWR([getKeys], {
    revalidateOnFocus: false,
  });

  return {
    keys: getKeys,
    entryStatistic: data as ResponseStatistic,
    entryStatisticLoading: isLoading,
    entryStatisticError: error,
  };
}

export function useSWRUsersStatistic({ type }: { type: string }) {
  const paramQuery = new URLSearchParams();
  appendParams(paramQuery, { type });

  const getKeys = `/api/dashboard/users-statistic?${paramQuery.toString()}`;
  const { data, isLoading, error } = useSWR([getKeys], {
    revalidateOnFocus: false,
  });

  return {
    keys: getKeys,
    userStatistic: data as ResponseStatistic,
    userStatisticLoading: isLoading,
    userStatisticError: error,
  };
}
