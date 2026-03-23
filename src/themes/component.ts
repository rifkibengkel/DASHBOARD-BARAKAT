export const datePickerNeumorphismStyles = {
  openPickerButton: {
    backgroundColor: "transparent", // Hilangkan background
    boxShadow: "none", // Hilangkan shadow
    borderRadius: "8px",
    width: "32px",
    height: "32px",
    marginRight: "8px",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(163, 177, 198, 0.1)",
    },
    "&:active": {
      backgroundColor: "rgba(163, 177, 198, 0.15)",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1.25rem",
      color: "#64748B",
    },
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#E0E5EC",
      borderRadius: "14px",
      // Sama seperti input biasa - emboss effect
      boxShadow:
        "inset 3px 3px 6px rgba(163, 177, 198, 0.4), inset -3px -3px 6px rgba(255, 255, 255, 0.9)",
      paddingRight: "14px", // Konsisten dengan input biasa
      border: "none",
      "& fieldset": {
        border: "none",
      },
      "&:hover": {
        backgroundColor: "#E0E5EC",
        boxShadow:
          "inset 4px 4px 8px rgba(163, 177, 198, 0.45), inset -4px -4px 8px rgba(255, 255, 255, 0.95)",
      },
      "&.Mui-focused": {
        backgroundColor: "#E0E5EC",
        boxShadow:
          "inset 4px 4px 8px rgba(254, 0, 0, 0.15), inset -4px -4px 8px rgba(255, 255, 255, 0.95), 0 0 0 3px rgba(254, 0, 0, 0.1)",
      },
      "&.Mui-disabled": {
        opacity: 0.6,
        boxShadow:
          "inset 2px 2px 4px rgba(163, 177, 198, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.7)",
      },
      "&.Mui-error": {
        boxShadow:
          "inset 3px 3px 6px rgba(220, 0, 0, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.9)",
        "&:hover": {
          boxShadow:
            "inset 4px 4px 8px rgba(220, 0, 0, 0.35), inset -4px -4px 8px rgba(255, 255, 255, 0.95)",
        },
        "&.Mui-focused": {
          boxShadow:
            "inset 4px 4px 8px rgba(220, 0, 0, 0.35), inset -4px -4px 8px rgba(255, 255, 255, 0.95), 0 0 0 3px rgba(220, 0, 0, 0.15)",
        },
      },
    },
    "& .MuiInputBase-input": {
      padding: "13px 18px", // Sama dengan tema global
      fontWeight: 500,
      fontSize: "0.9375rem",
      color: "#2D3748",
      "&::placeholder": {
        color: "#94A3B8",
        opacity: 1,
      },
    },
    "& .MuiInputAdornment-root": {
      marginLeft: 0,
      marginRight: "-8px", // Tarik icon lebih ke dalam
    },
  },
  layout: {
    backgroundColor: "#E0E5EC",
    boxShadow:
      "8px 8px 16px rgba(163, 177, 198, 0.5), -8px -8px 16px rgba(255, 255, 255, 0.8)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.3)",

    "& .MuiPickersCalendarHeader-root": {
      backgroundColor: "#E0E5EC",
      paddingTop: "16px",
      paddingBottom: "8px",
    },
    "& .MuiPickersCalendarHeader-label": {
      color: "#2D3748",
      fontWeight: 600,
      fontSize: "1rem",
    },

    "& .MuiPickersArrowSwitcher-button": {
      backgroundColor: "#E0E5EC",
      boxShadow:
        "3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.8)",
      borderRadius: "10px",
      width: "32px",
      height: "32px",
      transition: "all 0.2s ease",
      "&:hover": {
        boxShadow:
          "2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)",
      },
      "&:active": {
        boxShadow:
          "inset 2px 2px 4px rgba(163, 177, 198, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
      },
    },

    "& .MuiPickersYear-yearButton": {
      backgroundColor: "#E0E5EC",
      boxShadow:
        "2px 2px 4px rgba(163,177,198,.3), -2px -2px 4px rgba(255,255,255,.8)",
      borderRadius: "10px",
      height: 32,
      minWidth: 64,
      padding: "6px 12px",
      fontSize: "0.875rem",
      fontWeight: 500,
      color: "#2D3748",
      transition: "all .2s ease",
      "&:hover": {
        boxShadow:
          "1px 1px 2px rgba(163,177,198,.3), -1px -1px 2px rgba(255,255,255,.8)",
      },
      "&:active": {
        boxShadow:
          "inset 2px 2px 4px rgba(163,177,198,.4), inset -2px -2px 4px rgba(255,255,255,.8)",
      },
      "&.Mui-selected": {
        background: "linear-gradient(145deg, #FE0000 0%, #DC0000 100%)",
        color: "#fff",
        fontWeight: 600,
        boxShadow:
          "inset 2px 2px 4px rgba(0,0,0,.2), inset -2px -2px 4px rgba(255,255,255,.3)",
      },
    },

    "& .MuiPickersCalendarHeader-switchViewButton": {
      maxWidth: 100,
      height: 28,
      padding: "4px 10px",
      fontSize: "0.75rem",
      fontWeight: 600,
      backgroundColor: "#E0E5EC",
      boxShadow:
        "2px 2px 4px rgba(163,177,198,.3), -2px -2px 4px rgba(255,255,255,.8)",
      borderRadius: "8px",
      transition: "all .2s ease",
      "&:hover": {
        boxShadow:
          "1px 1px 2px rgba(163,177,198,.3), -1px -1px 2px rgba(255,255,255,.8)",
      },
      "&:active": {
        boxShadow:
          "inset 2px 2px 4px rgba(163,177,198,.4), inset -2px -2px 4px rgba(255,255,255,.8)",
      },
    },

    "& .MuiDayCalendar-header": {
      backgroundColor: "#E0E5EC",
      paddingTop: "8px",
      "& .MuiDayCalendar-weekDayLabel": {
        color: "#64748B",
        fontWeight: 600,
        fontSize: "0.875rem",
      },
    },

    "& .MuiDayCalendar-weekContainer": {
      backgroundColor: "#E0E5EC",
    },

    "& .MuiPickersDay-root": {
      backgroundColor: "#E0E5EC",
      color: "#2D3748",
      fontWeight: 500,
      fontSize: "0.9375rem",
      boxShadow:
        "3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.8)",
      borderRadius: "12px",
      margin: "4px",
      transition: "all 0.2s ease",
      "&:hover": {
        boxShadow:
          "2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)",
        transform: "translateY(-1px)",
      },
      "&:active": {
        transform: "translateY(0)",
        boxShadow:
          "inset 2px 2px 4px rgba(163, 177, 198, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
      },
      "&.Mui-selected": {
        background: "linear-gradient(145deg, #FE0000 0%, #DC0000 100%)",
        color: "#ffffff",
        fontWeight: 600,
        boxShadow:
          "inset 2px 2px 4px rgba(0, 0, 0, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.3)",
        "&:hover": {
          background: "linear-gradient(145deg, #DC0000 0%, #C00000 100%)",
          transform: "none",
        },
      },
      "&.MuiPickersDay-today": {
        border: "2px solid rgba(254, 0, 0, 0.3)",
        fontWeight: 600,
      },
      "&.Mui-disabled": {
        color: "#94A3B8",
        opacity: 0.5,
      },
    },
  },
};
