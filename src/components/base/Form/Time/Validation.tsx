import React from 'react';
import { FieldProps, getIn } from 'formik';
import { TextFieldProps } from '@mui/material';
import { TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePickerComponentProps } from '../Form.types';

const TimePickerValidationComponent: React.FC<DateTimePickerComponentProps & FieldProps & TextFieldProps> = (props) => {
    const { error, helperText, field, form, disabled, label, minTime, maxTime, size } = props;

    const isTouched = getIn(form.touched, field.name);
    const errorMessage = getIn(form.errors, field.name);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
                ampm={false}
                value={field.value}
                onChange={(e) => form.setFieldValue(field.name, e)}
                disabled={disabled}
                label={label}
                minTime={minTime ?? undefined}
                maxTime={maxTime ?? undefined}
                slotProps={{
                    textField: {
                        size,
                        error: error ?? Boolean(isTouched && errorMessage),
                        helperText: helperText ?? (isTouched && errorMessage),
                        fullWidth: true,
                    },
                }}
            />
        </LocalizationProvider>
    );
};

export const TimePickerValidation = React.memo(TimePickerValidationComponent);
