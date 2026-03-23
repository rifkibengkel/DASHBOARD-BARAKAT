import React from 'react';
import { FieldProps, getIn } from 'formik';
import { Autocomplete, TextField, TextFieldProps } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { SelectComponentProps, SelectOption } from '../Form.types';

interface AutoValidationProps {
    onInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AutoValidationComponent: React.FC<FieldProps & TextFieldProps & SelectComponentProps & AutoValidationProps> = (
    props
) => {
    const { error, helperText, field, form, placeholder, options, disabled, onInputChange, ...rest } = props;

    const isTouched = getIn(form.touched, field.name);
    const errorMessage = getIn(form.errors, field.name);

    const selectedValue = options.find((opt: SelectOption) => opt.id === field.value) || undefined;

    const handleAutocompleteChange = (event: React.SyntheticEvent<Element, Event>, newValue: SelectOption | null) => {
        form.setFieldValue(field.name, newValue?.id || '');
        form.setFieldTouched(field.name, true);
    };

    const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
        if (onInputChange) {
            const syntheticEvent = {
                target: { value: newInputValue },
            } as React.ChangeEvent<HTMLInputElement>;
            onInputChange(syntheticEvent);
        }
    };

    return (
        <Autocomplete
            options={options}
            onChange={handleAutocompleteChange}
            onInputChange={handleInputChange}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, val) => option.id === val.id}
            value={selectedValue}
            disabled={disabled}
            disableClearable
            popupIcon={<KeyboardArrowDown />}
            renderInput={(params) => (
                <TextField
                    {...params}
                    {...rest}
                    name={field.name}
                    error={error ?? Boolean(isTouched && errorMessage)}
                    helperText={helperText ?? (isTouched && errorMessage)}
                    placeholder={placeholder}
                    slotProps={{
                        formHelperText: {
                            ...rest.slotProps?.formHelperText,
                        },
                    }}
                />
            )}
        />
    );
};

export const AutoValidation = React.memo(AutoValidationComponent);
