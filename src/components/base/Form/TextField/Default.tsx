import React, { useState } from "react";
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

const TextFieldDefaultComponent: React.FC<TextFieldProps> = (props) => {
  const { disabled, value, ...rest } = props;
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

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
    if (value != null) {
      navigator.clipboard.writeText(value.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  return (
    <TextField
      {...rest}
      value={value}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      InputProps={{
        ...rest.InputProps,
        inputMode: props.inputMode === "numeric" ? "numeric" : "text",
        endAdornment:
          disabled && hovered && value != null && value !== "" ? ( // cek value
            <InputAdornment position="end">
              <Tooltip title={copied ? "Copied!" : "Copy"} arrow>
                <IconButton onClick={handleCopy} edge="end" size="small">
                  <ContentCopyRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ) : (
            rest.InputProps?.endAdornment
          ),
      }}
      slotProps={{
        htmlInput: {
          ...props.slotProps?.htmlInput,
          inputMode: props.inputMode === "numeric" ? "numeric" : "text",
          onKeyPress: handleKeyPress,
        },
        input: {
          ...props.slotProps?.input,
        },
        formHelperText: {
          ...props.slotProps?.formHelperText,
        },
      }}
    />
  );
};

export const TextFieldDefault = React.memo(TextFieldDefaultComponent);
