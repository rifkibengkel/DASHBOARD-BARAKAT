import { DateRange, ApprovalFlags, ExtendedFlags, ExtraFlags } from '.';

type BaseFilter = {
    key: string;
    column?: string;
    direction?: 'asc' | 'desc';
    currentPath?: string;
};

export type Filter = BaseFilter & DateRange & ApprovalFlags & ExtendedFlags & ExtraFlags;
