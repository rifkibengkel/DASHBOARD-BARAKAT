import React from 'react';
import { TextFieldProps } from '@mui/material';
import { TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePickerComponentProps } from '../Form.types';

const TimePickerDefaultComponent: React.FC<DateTimePickerComponentProps & TextFieldProps> = (props) => {
    const { minTime, maxTime, disabled, label, size, value, onChange } = props;

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
                ampm={false}
                value={value}
                onChange={onChange}
                disabled={disabled}
                label={label}
                minTime={minTime ?? undefined}
                maxTime={maxTime ?? undefined}
                slotProps={{
                    textField: {
                        size,
                        fullWidth: true,
                    },
                }}
            />
        </LocalizationProvider>
    );
};

export const TimePickerDefault = React.memo(TimePickerDefaultComponent);
