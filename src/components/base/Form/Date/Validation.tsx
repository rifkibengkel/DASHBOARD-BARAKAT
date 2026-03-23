import React from "react";
import { FieldProps, getIn } from "formik";
import { TextFieldProps } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePickerComponentProps } from "../Form.types";
import { datePickerNeumorphismStyles } from "@/themes/component";

const DatePickerValidationComponent: React.FC<
  DateTimePickerComponentProps & FieldProps & TextFieldProps
> = (props) => {
  const {
    error,
    helperText,
    minDate,
    maxDate,
    field,
    form,
    disabled,
    label,
    size,
  } = props;

  const isTouched = getIn(form.touched, field.name);
  const errorMessage = getIn(form.errors, field.name);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={field.value}
        onChange={(e) => form.setFieldValue(field.name, e)}
        format={"DD/MM/YYYY"}
        disabled={disabled}
        label={label}
        minDate={minDate ?? undefined}
        maxDate={maxDate ?? undefined}
        slotProps={{
          textField: {
            size,
            error: error ?? Boolean(isTouched && errorMessage),
            helperText: helperText ?? (isTouched && errorMessage),
            fullWidth: true,
            sx: datePickerNeumorphismStyles.textField,
          },
          openPickerButton: {
            sx: datePickerNeumorphismStyles.openPickerButton,
          },
          layout: {
            sx: datePickerNeumorphismStyles.layout,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export const DatePickerValidation = React.memo(DatePickerValidationComponent);
