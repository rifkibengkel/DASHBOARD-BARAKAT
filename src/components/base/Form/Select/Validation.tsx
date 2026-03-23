import React from 'react';
import { FieldProps, getIn } from 'formik';
import { MenuItem, TextField, TextFieldProps } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { SelectComponentProps } from '../Form.types';

const SelectValidationComponent: React.FC<FieldProps & TextFieldProps & SelectComponentProps> = (props) => {
    const { error, helperText, field, form, placeholder, options } = props;

    const isTouched = getIn(form.touched, field.name);
    const errorMessage = getIn(form.errors, field.name);

    return (
        <React.Fragment>
            <TextField
                {...field}
                {...props}
                select
                disabled={props.disabled}
                error={error ?? Boolean(isTouched && errorMessage)}
                helperText={helperText ?? (isTouched && errorMessage)}
                slotProps={{
                    select: {
                        displayEmpty: true,
                        renderValue: (value) => {
                            return options.find((opt) => opt.id === value)?.name ?? placeholder;
                        },
                        IconComponent: KeyboardArrowDown,
                    },
                    formHelperText: {
                        ...props.slotProps?.formHelperText,
                    },
                }}
            >
                {options.map((option) => (
                    <MenuItem sx={{ fontSize: '0.75rem' }} key={option.id} value={option.id}>
                        {option.name}
                    </MenuItem>
                ))}
            </TextField>
        </React.Fragment>
    );
};

export const SelectValidation = React.memo(SelectValidationComponent);
