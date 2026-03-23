import React, { useState } from "react";
import { FieldProps, getIn } from "formik";
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

const TextFieldValidationComponent: React.FC<FieldProps & TextFieldProps> = (
  props
) => {
  const { error, helperText, field, form, disabled, ...rest } = props;

  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const isTouched = getIn(form?.touched, field?.name);
  const errorMessage = getIn(form?.errors, field?.name);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      !/[0-9]/.test(e.key) &&
      props.inputMode === "numeric" &&
      e.key !== "Enter"
    ) {
      e.preventDefault();
    }
  };

  const handleCopy = () => {
    const copyValue = props.value ?? field.value;
    if (copyValue != null) {
      navigator.clipboard.writeText(copyValue.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  return (
    <TextField
      {...field}
      {...rest}
      disabled={disabled}
      error={error ?? Boolean(isTouched && errorMessage)}
      helperText={helperText ?? (isTouched && errorMessage)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      InputProps={{
        ...rest.InputProps,
        inputMode: props.inputMode === "numeric" ? "numeric" : "text",
        endAdornment:
          disabled &&
          hovered &&
          (props.value ?? field.value) != null &&
          (props.value ?? field.value) !== "" ? ( // cek value
            <InputAdornment position="end">
              <Tooltip title={copied ? "Copied!" : "Copy"} arrow>
                <IconButton onClick={handleCopy} edge="end" size="small">
                  <ContentCopyRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ) : null,
      }}
    />
  );
};

export const TextFieldValidation = React.memo(TextFieldValidationComponent);
