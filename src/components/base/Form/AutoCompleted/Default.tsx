import React from 'react';
import { Autocomplete, TextField, TextFieldProps } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { SelectComponentProps, SelectOption } from '../Form.types';

interface AutoDefaultProps {
    onInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AutoDefaultComponent: React.FC<TextFieldProps & SelectComponentProps & AutoDefaultProps> = (props) => {
    const { options, value, placeholder, onChange, onInputChange, ...rest } = props;

    const selectedValue = options.find((opt: SelectOption) => opt.id === value) || undefined;

    const handleAutocompleteChange = (event: React.SyntheticEvent<Element, Event>, newValue: SelectOption | null) => {
        if (onChange && newValue) {
            const syntheticEvent = {
                target: { value: newValue.id },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
        }
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
            disableClearable
            popupIcon={<KeyboardArrowDown />}
            renderInput={(params) => <TextField {...params} {...rest} placeholder={placeholder} />}
        />
    );
};

export const AutoDefault = React.memo(AutoDefaultComponent);
