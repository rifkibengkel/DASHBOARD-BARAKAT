export type TestingDataList = {
  id: number;
  name: string;
  sender: string;
  entries: number;
  winner: number;
  id_number?: string;
  status?: 0 | 1;
  status_text?: string;
};

export type TestingDataDetail = {
  name: string;
  sender: string;
  total_entries: number;
  total_winner: number;
  total_attachment: number;
  list: {
    rcvd_time: string;
    created_at: string;
    coupon: string;
    prize: string;
  }[];
};
