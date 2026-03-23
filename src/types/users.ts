export type Users = {
  id: number;
  role: string;
  username: string;
  fullname: string;
  status: number;
  status_text: string;
};

export type UserHistory = {
  created_at: string;
  amount: number;
  is_valid: string;
  coupon: string;
  type: string;
  topup_voucher: string;
  approval_status: string;
  topup_status: string;
  prize_category: string;
  prize_name: string;
  fulfillment_status: string;
};
