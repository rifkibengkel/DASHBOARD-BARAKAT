import { Menu, WinnerDetail, WinnerDetailImage } from ".";

export type DateRange = {
  startDate?: string;
  endDate?: string;
};

export type ApprovalFlags = {
  status?: number;
  isValid?: number;
  isApproved?: number;
  isValidAdmin?: number;
  isApprovedAdmin?: number;
};

export type ExtendedFlags = {
  type?: string;
  mediaId?: number;
  prizeId?: number;
  prizeCategoryId?: number;
  storeId?: number;
  agentId?: number;
};

export type ExtraFlags = Record<string, string | number | boolean | undefined>;

export type PromoPeriode = {
  periode_start: string;
  periode_end: string;
};

export type Dashboard = {
  collapsed: boolean;
  isMobile: boolean;
  currentMenu: Menu | null;
  menu: Menu[];
  session: {
    name: string;
    role: string;
  };
  promo: PromoPeriode;
};

export type UsersList = {
  id: number;
  name: string;
  sender: string;
  id_number?: string;
  status?: 0 | 1;
  status_text?: string;
};

export type OptionList = {
  id: number;
  name: string;
};

export type BaseQueryResult = {
  id: number;
  name: string;
  status?: number;
};

export type ConsumerData = {
  id?: string | number;
  fullname: string;
  hp: string;
  identity: string;
  city: string;
  created_at: string;
  balance: string | number;
  total_submit: number;
  total_submit_valid: number;
  total_submit_invalid: number;
};

export type RegistrationData = {
  id?: string | number;
  fullname: string;
  gender: string;
  identity: string;
  age: number;
  birthdate: string;
  hp: string;
  city: string;
  media: string;
  created_at: string;
};

export type KTPCheck = {
  identity: string;
  age: string | number;
  gender: "M" | "F";
  birthdate: string;
  province: string;
  city: string;
  district: string;
};
