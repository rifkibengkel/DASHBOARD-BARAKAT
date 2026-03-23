import React from "react";
import { TextFieldProps } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePickerComponentProps } from "../Form.types";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { datePickerNeumorphismStyles } from "@/themes/component";

type DatePickerDefaultProps = DateTimePickerComponentProps &
  Omit<TextFieldProps, "onChange" | "value">;

const DatePickerDefaultComponent: React.FC<DatePickerDefaultProps> = (
  props
) => {
  const { minDate, maxDate, disabled, label, size, value, onChange } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={value}
        onChange={onChange}
        format={"DD/MM/YYYY"}
        disabled={disabled}
        label={label}
        minDate={minDate ?? undefined}
        maxDate={maxDate ?? undefined}
        slots={{
          openPickerIcon: CalendarTodayIcon,
        }}
        slotProps={{
          textField: {
            size,
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

export const DatePickerDefault = React.memo(DatePickerDefaultComponent);
