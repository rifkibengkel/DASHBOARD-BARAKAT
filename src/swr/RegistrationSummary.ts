import useSWR from 'swr';

interface ResponseEntrySummary {
    statistic: {
        categories: string[];
        series: {
            name: string;
            data: number[];
        }[];
        list: Record<string, string | number>[];
    };
}

export function useSWRRegistrationSummary(type: string) {
    const getKeys = `/api/registration-summary/list?type=${type}`;
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
