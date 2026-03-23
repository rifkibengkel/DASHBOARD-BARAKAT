import { PaginatedResponse } from '@/types';

export type TableHeader<T> = {
    key: keyof T | 'action' | 'expand' | 'no';
    label: string;
    align?: 'left' | 'center' | 'right';
    sort?: boolean;
    width?: number | string;
    render?: (row: T) => React.ReactNode;
};

export interface TableProps<T> {
    header: TableHeader<T>[];
    data: PaginatedResponse<T>;
    isLoading: boolean;
    isError: boolean;
    action?: (row: T) => React.ReactNode;
    enableTotal?: boolean;
    disablePagination?: boolean;
}
