import React from 'react';
import { MenuItem, TextField, TextFieldProps } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { SelectComponentProps, SelectOption } from '../Form.types';

const SelectDefaultComponent: React.FC<TextFieldProps & SelectComponentProps> = (props) => {
    const { placeholder, options } = props;

    return (
        <React.Fragment>
            <TextField
                {...props}
                select
                slotProps={{
                    select: {
                        renderValue: (value: unknown) => {
                            if (!value) return placeholder;
                            const typedValue = value as string | number;
                            const data = options.find((v: SelectOption) => v.id === typedValue);
                            return data?.name;
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

export const SelectDefault = React.memo(SelectDefaultComponent);
