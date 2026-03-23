import { Dayjs } from 'dayjs';

export type DateTimePickerComponentProps = {
    inputMode?: 'numeric' | 'text';
    helperText?: string;
    minDate?: Dayjs | null;
    maxDate?: Dayjs | null;
    minTime?: Dayjs | null;
    maxTime?: Dayjs | null;
    value: Dayjs | null;
    onChange: (value: Dayjs | null) => void;
};

export type SelectOption = {
    id: string | number;
    name: string;
};

export type SelectComponentProps = {
    options: SelectOption[];
    onClear?: () => void;
};
