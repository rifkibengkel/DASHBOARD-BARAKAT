export type PaginatedResponse<T> = {
    dataPerPage: number;
    currentPage: number;
    totalData: number;
    totalPage: number;
    list: T[];
    key?: string | null;
};
