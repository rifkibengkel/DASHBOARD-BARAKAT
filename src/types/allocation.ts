export type Allocation = {
  id?: string | number;
  allocation_date: string;
  prize: string;
  region: string;
  store: string;
  allocation_unused: number;
  allocation_used: number;
  allocation_total: number;
  allocation_percentage: number;
};
