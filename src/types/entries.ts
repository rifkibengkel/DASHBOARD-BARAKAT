export type Entries = {
  id: string;
  rcvd_time: string;
  coupon: string;
  prize: string;
  store: string;
  fullname: string;
  sender: string;
  id_number: string;
  status: number;
  is_valid: number;
  is_valid_text: string;
  is_valid_admin: number;
  is_valid_admin_text: string;
  is_approved: number;
  is_approved_text: string;
  is_approved_admin: number;
  is_approved_admin_text: string;
};

export type EntriesDetail = {
  id: number;
  uuid: string;
  coupon: string;
  fullname: string;
  sender: string;
  media: string;
  regency: string;
  id_number: string;
  store: string;
  message: string;
  rcvd_time: string;
  is_valid: number;
  is_valid_admin: number | null;
  invalid_reason_id: number | null;
  store_id: number | null;
  store_name_admin: string;
  purchase_no_admin: string;
  purchase_date_admin: string | null;
  purchase_amount_admin: string;
  prize: string | null;
};

export type EntriesDetailImage = {
  src: string;
};

export type EntriesDetailVariant = {
  name: string;
  entries_id: number;
  product_id: number;
  quantity: number;
  price: number;
  total_price: number;
};
