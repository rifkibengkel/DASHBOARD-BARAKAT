import { BaseQueryResult, OptionList } from "./common";

export type WinnerListResult = {
  entriesId: number;
  id: number;
  userId: number;
  prizeId: number;
  created_at: string;
  last_updated: string;
  name: string;
  ktp: string;
  no_wa: string;
  prize: string;
  prizeCat: number;
  kode_unik: string;
  status: number;
  status_text: string;
  is_approved: number;
  is_approved_text: string;
  mustReject: number;
  attachments: number;
  is_push: number;
  shipment_status?: string;
  sap_processed_date?: string;
  totalData: number;
};

export type Winner = {
  id: number;
  entries_id: number;
  user_id: number;
  prize_id: number;
  prize_name: string;
  prize_cat_id: number;
  fullname: string;
  identity: string;
  hp: string;
  city: string;
  coupon: string;
  store: string;
  prize: string;
  voucher: string;
  status: number;
  status_entries: number;
  status_text: string;
  is_approved: number;
  is_approved_text: string;
  created_at: string;
  last_updated: string;
  sap_processed_date?: string;
  shipment_status?: number;
  shipment_status_text?: string;
  status_dynamic?: string;
};

export type WinnerDetailImage = {
  src: string;
};

export type WinnerDetail = {
  id: number;
  allocation_id: number;
  entries_id: number;
  fullname: string;
  coupon: string;
  sender: string;
  store: string;
  media: string;
  regency: string;
  id_number: string;
  is_approved: number;
  rcvd_time: string;
  prize: string;
  invalid_reason_id: number;
  voucher: string;
  id_number_admin: string;
  ktp_name_admin: string;
};

export type PayloadSAP = {
  address1: string;
  address2: string;
  address3: string;
  address4: string;
  kodepos: string;
  district_id: string | number;
  master_program_id: string | number;
  master_prize_id: string | number;
  quantity: string | number;
  receiver_name: string;
  receiver_phone: string;
  receiver_phone2: string;
  approver: string;
};

export type TopupHistory = {
  rcvd_time: string;
  fullname: string;
  store: string;
  identity: string;
  reason: string;
  hp: string;
  regency: string;
  status: 0 | 1 | 2 | 3;
  is_approved: 0 | 1 | 2;
  status_text: string;
  prize: string;
  voucher: string;
  list: {
    created_at: string;
    reference: string;
    code: string;
    reason: string;
    tr_id: string;
    amount: number;
    status: 0 | 1 | 2 | 3;
    status_text: string;
  }[];
};

export type WinnerDetailProps = {
  winnerData: {
    winner: WinnerDetail;
    winnerImage: WinnerDetailImage[];
  };
  invalidReasonList: BaseQueryResult[];
  prevApprovedWinnerId: number;
  type: string;
};
