// theme/index.ts
import { Poppins } from "next/font/google";
import { Plus_Jakarta_Sans } from "next/font/google";
import { createTheme } from "@mui/material/styles";

export const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const plusJakarta = Plus_Jakarta_Sans({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

// Default Theme
export const defaultTheme = createTheme({
  cssVariables: true,
  palette: {
    background: {
      default: "#F6F6F6",
    },
    primary: {
      main: "#FE0000",
    },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "inherit",
          textTransform: "capitalize",
          fontSize: "0.75rem",
          paddingLeft: 32,
          paddingRight: 32,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: "0.75rem",
        },
      },
    },
  },
  typography: {
    h1: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 900,
      fontSize: "2.5rem",
    },
    h2: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 800,
      fontSize: "2rem",
    },
    h3: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 700,
      fontSize: "1.75rem",
    },
    h4: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 700,
      fontSize: "1.5rem",
    },
    h5: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    h6: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 600,
      fontSize: "1rem",
    },
    body1: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 400,
      fontSize: "0.75rem",
    },
    body2: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 400,
      fontSize: "0.75rem",
    },
    subtitle1: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 600,
      fontSize: "0.75rem",
    },
    subtitle2: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 400,
      fontSize: "0.75rem",
    },
  },
});

// Neumorphism Theme - Red Brand Version (Compact) - Updated Alert Colors
export const neumorphismTheme = createTheme({
  cssVariables: true,
  shape: { borderRadius: 8 },
  palette: {
    mode: "light",
    background: {
      default: "#E0E5EC",
      paper: "#E0E5EC",
    },
    primary: {
      main: "#FE0000",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#FF4D4D",
    },
    success: {
      main: "#22C55E",
      light: "#D1FAE5",
      dark: "#16A34A",
      contrastText: "#ffffff",
    },
    info: {
      main: "#3B82F6",
      light: "#DBEAFE",
      dark: "#1E40AF",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#F59E0B",
      light: "#FEF3C7",
      dark: "#92400E",
      contrastText: "#ffffff",
    },
    error: {
      main: "#EF4444",
      light: "#FEE2E2",
      dark: "#7F1D1D",
      contrastText: "#ffffff",
    },
    text: {
      primary: "#2D3748",
      secondary: "#64748B",
    },
  },
  typography: {
    fontFamily: plusJakarta.style.fontFamily,
    h1: {
      fontWeight: 800,
      fontSize: "3rem",
      color: "#1E293B",
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 700,
      fontSize: "2.25rem",
      color: "#1E293B",
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 700,
      fontSize: "1.875rem",
      color: "#1E293B",
      letterSpacing: "-0.01em",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
      color: "#334155",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
      color: "#334155",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
      color: "#334155",
    },
    body1: {
      fontWeight: 400,
      fontSize: "0.9375rem",
      color: "#475569",
      lineHeight: 1.6,
    },
    body2: {
      fontWeight: 400,
      fontSize: "0.875rem",
      color: "#64748B",
      lineHeight: 1.6,
    },
    subtitle1: {
      fontWeight: 600,
      fontSize: "0.9375rem",
      color: "#334155",
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: "0.875rem",
      color: "#475569",
    },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiCssBaseline: {
      styleOverrides: `
    body {
      background-color: #E0E5EC;
      background-image: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(254, 0, 0, 0.03) 0%, transparent 50%);
    }
    
    input:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 100px #E0E5EC inset;
      -webkit-text-fill-color: #2D3748;
      transition: background-color 5000s ease-in-out 0s;
    }
    
    /* Fix untuk input date */
    input[type="date"],
    input[type="time"] {
      position: relative;
    }
    
    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="time"]::-webkit-calendar-picker-indicator {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      opacity: 0.6;
      width: 18px;
      height: 18px;
      padding: 0;
      margin: 0;
      filter: invert(0.4);
      transition: all 0.2s ease;
    }
    
    input[type="date"]::-webkit-calendar-picker-indicator:hover,
    input[type="time"]::-webkit-calendar-picker-indicator:hover {
      opacity: 1;
      filter: invert(0.2);
    }
    
    input[type="date"]::-webkit-datetime-edit {
      padding: 0;
      line-height: normal;
    }
    
    input[type="date"]::-webkit-datetime-edit-fields-wrapper {
      padding: 0;
    }
    
    /* Pastikan input date punya padding kanan yang cukup */
    .MuiInputBase-root input[type="date"],
    .MuiInputBase-root input[type="time"],
    .MuiOutlinedInput-root input[type="date"],
    .MuiOutlinedInput-root input[type="time"] {
      padding-right: 44px;
    }
    
    /* Neumorphic utility classes untuk Box dan elemen lainnya */
    .neumorphic {
      background-color: #E0E5EC;
      border-radius: 20px;
      box-shadow: 8px 8px 16px rgba(163, 177, 198, 0.5), -8px -8px 16px rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .neumorphic-flat {
      background-color: #E0E5EC;
      border-radius: 20px;
      box-shadow: inset 4px 4px 8px rgba(163, 177, 198, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.9);
    }
    
    .neumorphic-subtle {
      background-color: #E0E5EC;
      border-radius: 20px;
      box-shadow: 4px 4px 8px rgba(163, 177, 198, 0.3), -4px -4px 8px rgba(255, 255, 255, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .neumorphic-elevated {
      background-color: #E0E5EC;
      border-radius: 20px;
      box-shadow: 12px 12px 24px rgba(163, 177, 198, 0.6), -12px -12px 24px rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.4);
    }
    
    .neumorphic-compact {
      background-color: #E0E5EC;
      border-radius: 12px;
      box-shadow: 6px 6px 12px rgba(163, 177, 198, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    /* Hover effect untuk neumorphic */
    .neumorphic-hover:hover {
      box-shadow: 10px 10px 20px rgba(163, 177, 198, 0.6), -10px -10px 20px rgba(255, 255, 255, 0.9);
      transform: translateY(-2px);
      transition: all 0.3s ease;
    }
  `,
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#E0E5EC",
          boxShadow:
            "8px 8px 16px rgba(163, 177, 198, 0.5), -8px -8px 16px rgba(255, 255, 255, 0.8)",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow:
              "10px 10px 20px rgba(163, 177, 198, 0.6), -10px -10px 20px rgba(255, 255, 255, 0.9)",
          },
          ".MuiDialog-paper&": {
            boxShadow:
              "8px 8px 16px rgba(163, 177, 198, 0.5), -8px -8px 16px rgba(163, 177, 198, 0.1)",
            "&:hover": {
              boxShadow:
                "8px 8px 16px rgba(163, 177, 198, 0.5), -8px -8px 16px rgba(163, 177, 198, 0.1)",
              transform: "none",
            },
          },
        },
        elevation1: {
          boxShadow:
            "6px 6px 12px rgba(163, 177, 198, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.7)",
        },
        elevation2: {
          boxShadow:
            "10px 10px 20px rgba(163, 177, 198, 0.5), -10px -10px 20px rgba(255, 255, 255, 0.8)",
        },
        elevation3: {
          boxShadow:
            "14px 14px 28px rgba(163, 177, 198, 0.6), -14px -14px 28px rgba(255, 255, 255, 0.9)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "inherit",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          height: "2.25rem",
          padding: "0 1.25rem",
          backgroundColor: "#E0E5EC",
          color: "#2D3748",
          border: "none",
          borderRadius: "12px",
          boxShadow:
            "5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.8)",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            backgroundColor: "#E0E5EC",
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.8)",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(1px)",
            boxShadow:
              "inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.8)",
          },
          "&.Mui-disabled": {
            backgroundColor: "#E0E5EC",
            color: "#94A3B8",
            opacity: 0.6,
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.3), -3px -3px 6px rgba(255, 255, 255, 0.5)",
            cursor: "not-allowed",
            pointerEvents: "auto",
          },
        },
        sizeSmall: {
          height: "1.875rem",
          padding: "0 1rem",
          fontSize: "0.6525rem",
        },
        sizeLarge: {
          height: "2.75rem",
          padding: "0 1.75rem",
          fontSize: "0.9375rem",
        },
        contained: {
          background: "#E0E5EC",
          color: "#FE0000",
          fontWeight: 700,
          boxShadow:
            "5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.8)",
          "&:hover": {
            background: "#E0E5EC",
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.8)",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(1px)",
            boxShadow:
              "inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.8)",
          },
          "&.Mui-disabled": {
            backgroundColor: "#E0E5EC",
            color: "#94A3B8",
            opacity: 0.6,
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.3), -3px -3px 6px rgba(255, 255, 255, 0.5)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(145deg, #FE0000 0%, #DC0000 100%)",
          color: "#ffffff",
          boxShadow:
            "5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)",
          "&:hover": {
            background: "linear-gradient(145deg, #DC0000 0%, #C00000 100%)",
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(1px)",
            boxShadow:
              "inset 3px 3px 6px rgba(192, 0, 0, 0.6), inset -2px -2px 4px rgba(255, 60, 60, 0.3)",
          },
          "&.Mui-disabled": {
            background: "linear-gradient(145deg, #A0AEC0 0%, #8B9AAB 100%)",
            color: "#E0E5EC",
            opacity: 0.7,
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.3), -3px -3px 6px rgba(255, 255, 255, 0.5)",
          },
        },
        containedSuccess: {
          background: "linear-gradient(145deg, #22C55E 0%, #16A34A 100%)",
          color: "#ffffff",
          boxShadow:
            "5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)",
          "&:hover": {
            background: "linear-gradient(145deg, #16A34A 0%, #15803D 100%)",
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(1px)",
            boxShadow:
              "inset 3px 3px 6px rgba(21, 128, 61, 0.6), inset -2px -2px 4px rgba(34, 197, 94, 0.3)",
          },
          "&.Mui-disabled": {
            background: "linear-gradient(145deg, #A0AEC0 0%, #8B9AAB 100%)",
            color: "#E0E5EC",
            opacity: 0.7,
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.3), -3px -3px 6px rgba(255, 255, 255, 0.5)",
          },
        },
        containedWarning: {
          background: "linear-gradient(145deg, #F59E0B 0%, #D97706 100%)",
          color: "#ffffff",
          boxShadow:
            "5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)",
          "&:hover": {
            background: "linear-gradient(145deg, #D97706 0%, #B45309 100%)",
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(1px)",
            boxShadow:
              "inset 3px 3px 6px rgba(180, 83, 9, 0.6), inset -2px -2px 4px rgba(245, 158, 11, 0.3)",
          },
          "&.Mui-disabled": {
            background: "linear-gradient(145deg, #A0AEC0 0%, #8B9AAB 100%)",
            color: "#E0E5EC",
            opacity: 0.7,
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.3), -3px -3px 6px rgba(255, 255, 255, 0.5)",
          },
        },
        containedError: {
          background: "linear-gradient(145deg, #EF4444 0%, #DC2626 100%)",
          color: "#ffffff",
          boxShadow:
            "5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)",
          "&:hover": {
            background: "linear-gradient(145deg, #DC2626 0%, #B91C1C 100%)",
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(1px)",
            boxShadow:
              "inset 3px 3px 6px rgba(185, 28, 28, 0.6), inset -2px -2px 4px rgba(239, 68, 68, 0.3)",
          },
          "&.Mui-disabled": {
            background: "linear-gradient(145deg, #A0AEC0 0%, #8B9AAB 100%)",
            color: "#E0E5EC",
            opacity: 0.7,
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.3), -3px -3px 6px rgba(255, 255, 255, 0.5)",
          },
        },
        containedInfo: {
          background: "linear-gradient(145deg, #3B82F6 0%, #2563EB 100%)",
          color: "#ffffff",
          boxShadow:
            "5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)",
          "&:hover": {
            background: "linear-gradient(145deg, #2563EB 0%, #1D4ED8 100%)",
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(1px)",
            boxShadow:
              "inset 3px 3px 6px rgba(29, 78, 216, 0.6), inset -2px -2px 4px rgba(59, 130, 246, 0.3)",
          },
          "&.Mui-disabled": {
            background: "linear-gradient(145deg, #A0AEC0 0%, #8B9AAB 100%)",
            color: "#E0E5EC",
            opacity: 0.7,
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.3), -3px -3px 6px rgba(255, 255, 255, 0.5)",
          },
        },
        outlined: {
          backgroundColor: "#E0E5EC",
          color: "#FE0000",
          border: "none",
          boxShadow:
            "inset 2px 2px 4px rgba(163, 177, 198, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.7), 0 0 0 2px rgba(254, 0, 0, 0.3)",
          "&:hover": {
            backgroundColor: "#E0E5EC",
            boxShadow:
              "inset 3px 3px 6px rgba(163, 177, 198, 0.35), inset -3px -3px 6px rgba(255, 255, 255, 0.75), 0 0 0 2px rgba(254, 0, 0, 0.4)",
          },
          "&:active": {
            transform: "translateY(1px)",
            boxShadow:
              "inset 4px 4px 8px rgba(163, 177, 198, 0.5), inset -4px -4px 8px rgba(255, 255, 255, 0.8), 0 0 0 2px rgba(254, 0, 0, 0.5)",
          },
          "&.Mui-disabled": {
            backgroundColor: "#E0E5EC",
            color: "#94A3B8",
            opacity: 0.6,
            boxShadow:
              "inset 2px 2px 4px rgba(163, 177, 198, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.5), 0 0 0 2px rgba(163, 177, 198, 0.2)",
          },
        },
        text: {
          backgroundColor: "transparent",
          boxShadow: "none",
          color: "#FE0000",
          height: "2rem",
          padding: "0 1rem",
          "&:hover": {
            backgroundColor: "#E0E5EC",
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.3), -3px -3px 6px rgba(255, 255, 255, 0.6)",
          },
          "&:active": {
            boxShadow:
              "inset 2px 2px 4px rgba(163, 177, 198, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.7)",
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
            color: "#94A3B8",
            opacity: 0.5,
            boxShadow: "none",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#E0E5EC",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow:
            "8px 8px 16px rgba(163, 177, 198, 0.5), -8px -8px 16px rgba(255, 255, 255, 0.8)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "visible",
          position: "relative",

          // Hover effect dengan lift animation
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow:
              "12px 12px 24px rgba(163, 177, 198, 0.6), -12px -12px 24px rgba(255, 255, 255, 0.9)",
          },

          // Variant untuk stats card dengan accent border
          "&.stats-card": {
            borderRadius: "18px",
            padding: "18px",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #FE0000 0%, #DC0000 100%)",
              borderRadius: "18px 18px 0 0",
            },
            "&:hover": {
              transform: "translateY(-6px)",
              boxShadow:
                "14px 14px 28px rgba(163, 177, 198, 0.65), -14px -14px 28px rgba(255, 255, 255, 0.95)",
            },
          },

          // Variant untuk compact stats
          "&.stats-compact": {
            borderRadius: "16px",
            padding: "16px",
            boxShadow:
              "6px 6px 12px rgba(163, 177, 198, 0.45), -6px -6px 12px rgba(255, 255, 255, 0.75)",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow:
                "10px 10px 20px rgba(163, 177, 198, 0.55), -10px -10px 20px rgba(255, 255, 255, 0.85)",
            },
          },

          // Variant dengan gradient accent
          "&.stats-gradient": {
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "5px",
              background:
                "linear-gradient(90deg, #FE0000 0%, #FF4D4D 50%, #FE0000 100%)",
              borderRadius: "24px 24px 0 0",
              boxShadow: "0 2px 8px rgba(254, 0, 0, 0.3)",
            },
          },

          // Success variant
          "&.stats-success": {
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #22C55E 0%, #16A34A 100%)",
              borderRadius: "20px 20px 0 0",
            },
          },

          // Warning variant
          "&.stats-warning": {
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #F59E0B 0%, #D97706 100%)",
              borderRadius: "20px 20px 0 0",
            },
          },

          // Info variant
          "&.stats-info": {
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)",
              borderRadius: "20px 20px 0 0",
            },
          },

          // Elevated variant untuk highlight
          "&.stats-elevated": {
            boxShadow:
              "12px 12px 24px rgba(163, 177, 198, 0.6), -12px -12px 24px rgba(255, 255, 255, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            "&:hover": {
              transform: "translateY(-6px) scale(1.02)",
              boxShadow:
                "16px 16px 32px rgba(163, 177, 198, 0.7), -16px -16px 32px rgba(255, 255, 255, 0.95)",
            },
          },

          // Flat variant untuk subtle display
          "&.stats-flat": {
            boxShadow:
              "inset 2px 2px 4px rgba(163, 177, 198, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.5)",
            "&:hover": {
              boxShadow:
                "4px 4px 8px rgba(163, 177, 198, 0.4), -4px -4px 8px rgba(255, 255, 255, 0.7)",
              transform: "translateY(-2px)",
            },
          },

          // Modern variant - subtle design seperti button MUI
          "&.stats-modern": {
            borderRadius: "16px",
            padding: "20px",
            boxShadow:
              "5px 5px 10px rgba(163, 177, 198, 0.4), -5px -5px 10px rgba(255, 255, 255, 0.7)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow:
                "6px 6px 12px rgba(163, 177, 198, 0.45), -6px -6px 12px rgba(255, 255, 255, 0.75)",
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: "#E0E5EC",
          borderRadius: "12px",
          border: "none",
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "#2D3748",
          boxShadow:
            "inset 3px 3px 6px rgba(163, 177, 198, 0.4), inset -3px -3px 6px rgba(255, 255, 255, 0.9)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow:
              "inset 4px 4px 8px rgba(163, 177, 198, 0.45), inset -4px -4px 8px rgba(255, 255, 255, 0.95)",
          },
          "&:focus-within": {
            boxShadow:
              "inset 4px 4px 8px rgba(254, 0, 0, 0.15), inset -4px -4px 8px rgba(255, 255, 255, 0.95), 0 0 0 3px rgba(254, 0, 0, 0.1)",
          },
          "&.Mui-error": {
            boxShadow:
              "inset 3px 3px 6px rgba(220, 0, 0, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.9)",
            "&:focus-within": {
              boxShadow:
                "inset 4px 4px 8px rgba(220, 0, 0, 0.35), inset -4px -4px 8px rgba(255, 255, 255, 0.95), 0 0 0 3px rgba(220, 0, 0, 0.15)",
            },
          },
          "&.MuiInputBase-multiline": {
            padding: "8px 12px",
          },
        },
        input: {
          padding: "8px 12px",
          "&::placeholder": {
            color: "#94A3B8",
            opacity: 1,
          },
          "&:focus": {
            outline: "none",
          },
        },
        inputMultiline: {
          padding: 0,
        },
        sizeSmall: {
          fontSize: "0.6525rem",
          "& input": {
            padding: "6px 10px",
          },
          "&.MuiInputBase-multiline": {
            padding: "6px 10px",
          },
        },
        adornedStart: {
          paddingLeft: "10px",
        },
        adornedEnd: {
          paddingRight: "10px",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#E0E5EC",
          borderRadius: "12px",
          boxShadow:
            "inset 3px 3px 6px rgba(163, 177, 198, 0.4), inset -3px -3px 6px rgba(255, 255, 255, 0.9)",
          "& .MuiOutlinedInput-notchedOutline": {
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
        input: {
          padding: "10px 14px",
          fontWeight: 500,
          color: "#2D3748",
          "&::placeholder": {
            color: "#94A3B8",
            opacity: 1,
          },
        },
        sizeSmall: {
          fontSize: "0.6525rem",
          "& input": {
            padding: "8px 12px",
          },
        },
        adornedStart: {
          paddingLeft: "10px",
        },
        adornedEnd: {
          paddingRight: "10px",
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          marginLeft: "0",
          marginRight: "0",
          "& .MuiSvgIcon-root": {
            fontSize: "1.25rem",
            color: "#64748B",
          },
          "& .MuiIconButton-root": {
            padding: "6px",
            width: "32px",
            height: "32px",
            marginRight: "-4px",
          },
        },
        positionStart: {
          marginRight: "8px",
        },
        positionEnd: {
          marginLeft: "8px",
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "& .MuiInputLabel-root": {
            position: "relative",
            transform: "none",
            marginBottom: "8px",
            fontSize: "0.6525rem",
            fontWeight: 600,
            color: "#475569",
            letterSpacing: "0.01em",
            "&.Mui-focused": {
              color: "#FE0000",
            },
            "&.Mui-error": {
              color: "#DC0000",
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          position: "relative",
          transform: "none",
          marginBottom: "8px",
          fontSize: "0.6525rem",
          fontWeight: 600,
          color: "#475569",
          letterSpacing: "0.01em",
          "&.Mui-focused": {
            color: "#FE0000",
          },
          "&.Mui-error": {
            color: "#DC0000",
          },
        },
        shrink: {
          transform: "none",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        InputLabelProps: {
          shrink: true,
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: "0.75rem",
          marginLeft: "6px",
          marginTop: "4px",
          "&.Mui-error": {
            color: "#DC0000",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#E0E5EC",
          borderRadius: "12px",
          fontWeight: 600,
          fontSize: "0.6525rem",
          color: "#2D3748",
          border: "none",
          height: "32px",
          boxShadow:
            "4px 4px 8px rgba(163, 177, 198, 0.5), -4px -4px 8px rgba(255, 255, 255, 0.8)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow:
              "2px 2px 4px rgba(163, 177, 198, 0.5), -2px -2px 4px rgba(255, 255, 255, 0.8)",
          },
          // Success color
          "&.MuiChip-colorSuccess": {
            background: "linear-gradient(145deg, #22C55E 0%, #16A34A 100%)",
            color: "#ffffff",
            boxShadow:
              "4px 4px 8px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.3)",
            "&.MuiChip-outlined": {
              background: "#E0E5EC",
              color: "#22C55E",
              border: "2px solid #22C55E",
              boxShadow:
                "3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.7)",
            },
          },
          // Warning color
          "&.MuiChip-colorWarning": {
            background: "linear-gradient(145deg, #F59E0B 0%, #D97706 100%)",
            color: "#ffffff",
            boxShadow:
              "4px 4px 8px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.3)",
            "&.MuiChip-outlined": {
              background: "#E0E5EC",
              color: "#F59E0B",
              border: "2px solid #F59E0B",
              boxShadow:
                "3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.7)",
            },
          },
          // Error color
          "&.MuiChip-colorError": {
            background: "linear-gradient(145deg, #EF4444 0%, #DC2626 100%)",
            color: "#ffffff",
            boxShadow:
              "4px 4px 8px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.3)",
            "&.MuiChip-outlined": {
              background: "#E0E5EC",
              color: "#EF4444",
              border: "2px solid #EF4444",
              boxShadow:
                "3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.7)",
            },
          },
          // Info color
          "&.MuiChip-colorInfo": {
            background: "linear-gradient(145deg, #3B82F6 0%, #2563EB 100%)",
            color: "#ffffff",
            boxShadow:
              "4px 4px 8px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.3)",
            "&.MuiChip-outlined": {
              background: "#E0E5EC",
              color: "#3B82F6",
              border: "2px solid #3B82F6",
              boxShadow:
                "3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.7)",
            },
          },
          // Primary color
          "&.MuiChip-colorPrimary": {
            background: "linear-gradient(145deg, #FE0000 0%, #DC0000 100%)",
            color: "#ffffff",
            boxShadow:
              "4px 4px 8px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.3)",
            "&.MuiChip-outlined": {
              background: "#E0E5EC",
              color: "#FE0000",
              border: "2px solid #FE0000",
              boxShadow:
                "3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.7)",
            },
          },
        },
        filled: {
          // Default filled style sudah di root
        },
        outlined: {
          // Default outlined style sudah di root dengan nested selector
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 56,
          height: 32,
          padding: 0,
        },
        switchBase: {
          padding: 4,
          "&.Mui-checked": {
            transform: "translateX(24px)",
            color: "#fff",
            "& + .MuiSwitch-track": {
              background: "linear-gradient(145deg, #FE0000 0%, #DC0000 100%)",
              opacity: 1,
              boxShadow:
                "inset 3px 3px 6px rgba(192, 0, 0, 0.5), inset -2px -2px 4px rgba(255, 60, 60, 0.3)",
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
          backgroundColor: "#ffffff",
          boxShadow:
            "2px 2px 4px rgba(163, 177, 198, 0.5), -2px -2px 4px rgba(255, 255, 255, 0.8)",
        },
        track: {
          borderRadius: 32 / 2,
          backgroundColor: "#E0E5EC",
          opacity: 1,
          boxShadow:
            "inset 3px 3px 6px rgba(163, 177, 198, 0.4), inset -3px -3px 6px rgba(255, 255, 255, 0.9)",
          transition: "all 0.3s ease",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          backgroundColor: "#E0E5EC",
          borderRadius: "12px",
          width: "44px",
          height: "44px",
          boxShadow:
            "4px 4px 8px rgba(163, 177, 198, 0.5), -4px -4px 8px rgba(255, 255, 255, 0.8)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            backgroundColor: "#E0E5EC",
            boxShadow:
              "2px 2px 4px rgba(163, 177, 198, 0.5), -2px -2px 4px rgba(255, 255, 255, 0.8)",
            transform: "scale(0.98)",
          },
          "&:active": {
            boxShadow:
              "inset 2px 2px 4px rgba(163, 177, 198, 0.5), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
            transform: "scale(0.96)",
          },
          "&.Mui-disabled": {
            backgroundColor: "#E0E5EC",
            color: "#94A3B8",
            opacity: 0.6,
            boxShadow:
              "2px 2px 4px rgba(163, 177, 198, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.5)",
          },
        },
        sizeSmall: {
          width: "32px",
          height: "32px",
          borderRadius: "10px",
          padding: "6px",
          boxShadow:
            "3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.7)",
          "&:hover": {
            boxShadow:
              "2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.7)",
          },
          "&:active": {
            boxShadow:
              "inset 2px 2px 4px rgba(163, 177, 198, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.7)",
          },
          "& svg": {
            fontSize: "1.125rem",
          },
        },
        sizeLarge: {
          width: "52px",
          height: "52px",
          borderRadius: "14px",
          boxShadow:
            "5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.8)",
          "&:hover": {
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.8)",
          },
          "& svg": {
            fontSize: "1.75rem",
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          fontWeight: 500,
          border: "none",
          boxShadow:
            "6px 6px 12px rgba(163, 177, 198, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.7)",
          padding: "12px 16px",
        },
        standardSuccess: {
          backgroundColor: "#D1FAE5",
          color: "#16A34A",
          "& .MuiAlert-icon": {
            color: "#22C55E",
          },
        },
        standardError: {
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
          "& .MuiAlert-icon": {
            color: "#EF4444",
          },
        },
        standardWarning: {
          backgroundColor: "#FEF3C7",
          color: "#92400E",
          "& .MuiAlert-icon": {
            color: "#F59E0B",
          },
        },
        standardInfo: {
          backgroundColor: "#DBEAFE",
          color: "#1E40AF",
          "& .MuiAlert-icon": {
            color: "#3B82F6",
          },
        },
        filledSuccess: {
          background: "linear-gradient(145deg, #22C55E 0%, #16A34A 100%)",
          color: "#ffffff",
          "& .MuiAlert-icon": {
            color: "#ffffff",
          },
        },
        filledError: {
          background: "linear-gradient(145deg, #EF4444 0%, #DC2626 100%)",
          color: "#ffffff",
          "& .MuiAlert-icon": {
            color: "#ffffff",
          },
        },
        filledWarning: {
          background: "linear-gradient(145deg, #F59E0B 0%, #D97706 100%)",
          color: "#ffffff",
          "& .MuiAlert-icon": {
            color: "#ffffff",
          },
        },
        filledInfo: {
          background: "linear-gradient(145deg, #3B82F6 0%, #2563EB 100%)",
          color: "#ffffff",
          "& .MuiAlert-icon": {
            color: "#ffffff",
          },
        },
        outlinedSuccess: {
          backgroundColor: "#E0E5EC",
          color: "#16A34A",
          border: "2px solid #22C55E",
          boxShadow:
            "4px 4px 8px rgba(163, 177, 198, 0.4), -4px -4px 8px rgba(255, 255, 255, 0.7), inset 0 0 0 1px rgba(34, 197, 94, 0.1)",
          "& .MuiAlert-icon": {
            color: "#22C55E",
          },
        },
        outlinedError: {
          backgroundColor: "#E0E5EC",
          color: "#991B1B",
          border: "2px solid #EF4444",
          boxShadow:
            "4px 4px 8px rgba(163, 177, 198, 0.4), -4px -4px 8px rgba(255, 255, 255, 0.7), inset 0 0 0 1px rgba(239, 68, 68, 0.1)",
          "& .MuiAlert-icon": {
            color: "#EF4444",
          },
        },
        outlinedWarning: {
          backgroundColor: "#E0E5EC",
          color: "#92400E",
          border: "2px solid #F59E0B",
          boxShadow:
            "4px 4px 8px rgba(163, 177, 198, 0.4), -4px -4px 8px rgba(255, 255, 255, 0.7), inset 0 0 0 1px rgba(245, 158, 11, 0.1)",
          "& .MuiAlert-icon": {
            color: "#F59E0B",
          },
        },
        outlinedInfo: {
          backgroundColor: "#E0E5EC",
          color: "#1E40AF",
          border: "2px solid #3B82F6",
          boxShadow:
            "4px 4px 8px rgba(163, 177, 198, 0.4), -4px -4px 8px rgba(255, 255, 255, 0.7), inset 0 0 0 1px rgba(59, 130, 246, 0.1)",
          "& .MuiAlert-icon": {
            color: "#3B82F6",
          },
        },
        action: {
          paddingTop: 0,
          paddingBottom: 0,
          marginRight: -8,
          "& .MuiIconButton-root": {
            backgroundColor: "transparent",
            boxShadow: "none",
            width: "32px",
            height: "32px",
            "&:hover": {
              backgroundColor: "rgba(163, 177, 198, 0.15)",
              boxShadow:
                "inset 2px 2px 4px rgba(163, 177, 198, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.5)",
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "transparent",
          height: "2px",
          background:
            "linear-gradient(90deg, rgba(163, 177, 198, 0.2) 0%, rgba(163, 177, 198, 0.05) 100%)",
          boxShadow: "0 1px 1px rgba(255, 255, 255, 0.6)",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 10,
          borderRadius: 20,
          backgroundColor: "#E0E5EC",
          boxShadow:
            "inset 3px 3px 6px rgba(163, 177, 198, 0.4), inset -3px -3px 6px rgba(255, 255, 255, 0.9)",
        },
        bar: {
          borderRadius: 20,
          background: "linear-gradient(90deg, #FE0000 0%, #DC0000 100%)",
          boxShadow: "2px 2px 4px rgba(254, 0, 0, 0.3)",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#2D3748",
          fontSize: "0.6525rem",
          fontWeight: 500,
          borderRadius: "10px",
          padding: "8px 14px",
          boxShadow:
            "6px 6px 12px rgba(0, 0, 0, 0.2), -2px -2px 6px rgba(255, 255, 255, 0.1)",
        },
        arrow: {
          color: "#2D3748",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(145deg, #FE0000 0%, #DC0000 100%)",
          color: "#ffffff",
          fontWeight: 600,
          boxShadow:
            "4px 4px 8px rgba(163, 177, 198, 0.5), -4px -4px 8px rgba(255, 255, 255, 0.3)",
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          background: "linear-gradient(145deg, #FE0000 0%, #DC0000 100%)",
          color: "#ffffff",
          fontWeight: 600,
          boxShadow: "0 2px 6px rgba(254, 0, 0, 0.4)",
        },
        colorSuccess: {
          background: "linear-gradient(145deg, #22C55E 0%, #16A34A 100%)",
          boxShadow: "0 2px 6px rgba(34, 197, 94, 0.4)",
        },
        colorWarning: {
          background: "linear-gradient(145deg, #F59E0B 0%, #D97706 100%)",
          boxShadow: "0 2px 6px rgba(245, 158, 11, 0.4)",
        },
        colorError: {
          background: "linear-gradient(145deg, #EF4444 0%, #DC2626 100%)",
          boxShadow: "0 2px 6px rgba(239, 68, 68, 0.4)",
        },
        colorInfo: {
          background: "linear-gradient(145deg, #3B82F6 0%, #2563EB 100%)",
          boxShadow: "0 2px 6px rgba(59, 130, 246, 0.4)",
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {},
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#E0E5EC",
          boxShadow:
            "8px 8px 16px rgba(163, 177, 198, 0.5), -8px -8px 16px rgba(163, 177, 198, 0.1)",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          "&:hover": {
            boxShadow:
              "8px 8px 16px rgba(163, 177, 198, 0.5), -8px -8px 16px rgba(163, 177, 198, 0.1)",
            transform: "none",
          },
        },
        container: {
          boxShadow: "none",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: "#E0E5EC",
          boxShadow:
            "8px 8px 16px rgba(163, 177, 198, 0.5), -8px -8px 16px rgba(163, 177, 198, 0.1)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        },
      },
    },
    MuiPopper: {
      styleOverrides: {
        root: {
          "& .MuiPaper-root": {
            backgroundColor: "#E0E5EC",
            boxShadow:
              "8px 8px 16px rgba(163, 177, 198, 0.5), -8px -8px 16px rgba(163, 177, 198, 0.1)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#E0E5EC",
          boxShadow:
            "8px 8px 16px rgba(163, 177, 198, 0.5), -8px -8px 16px rgba(163, 177, 198, 0.1)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        },
        list: {
          padding: "8px",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          margin: "2px 0",
          padding: "8px 12px",
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "#2D3748",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "#E0E5EC",
            boxShadow:
              "inset 3px 3px 6px rgba(163, 177, 198, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.7)",
          },
          "&.Mui-selected": {
            backgroundColor: "#E0E5EC",
            boxShadow:
              "inset 3px 3px 6px rgba(163, 177, 198, 0.4), inset -3px -3px 6px rgba(255, 255, 255, 0.8)",
            "&:hover": {
              backgroundColor: "#E0E5EC",
              boxShadow:
                "inset 3px 3px 6px rgba(163, 177, 198, 0.4), inset -3px -3px 6px rgba(255, 255, 255, 0.8)",
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "#64748B",
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            padding: "4px 10px",
          },
        },
        input: {
          padding: "6px 10px !important",
        },
        endAdornment: {
          right: "10px !important",
          "& .MuiIconButton-root": {
            backgroundColor: "#E0E5EC",
            borderRadius: "10px",
            width: "28px",
            height: "28px",
            padding: "4px",
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.7)",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#E0E5EC",
              boxShadow:
                "2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.7)",
            },
            "& .MuiSvgIcon-root": {
              fontSize: "1.125rem",
              color: "#64748B",
            },
          },
        },
        clearIndicator: {
          marginRight: "4px",
        },
        popupIndicator: {
          marginRight: "0",
        },
        paper: {
          backgroundColor: "#E0E5EC",
          boxShadow:
            "8px 8px 16px rgba(163, 177, 198, 0.5), -8px -8px 16px rgba(163, 177, 198, 0.1)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          marginTop: "4px",
        },
        listbox: {
          padding: "8px",
          maxHeight: "300px",
          "& .MuiAutocomplete-option": {
            borderRadius: "10px",
            margin: "2px 0",
            padding: "8px 12px",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#2D3748",
            minHeight: "auto",
            "&:hover": {
              backgroundColor: "#E0E5EC",
              boxShadow:
                "inset 3px 3px 6px rgba(163, 177, 198, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.7)",
            },
            '&[aria-selected="true"]': {
              backgroundColor: "#E0E5EC",
              boxShadow:
                "inset 3px 3px 6px rgba(163, 177, 198, 0.4), inset -3px -3px 6px rgba(255, 255, 255, 0.8)",
              "&:hover": {
                backgroundColor: "#E0E5EC",
                boxShadow:
                  "inset 3px 3px 6px rgba(163, 177, 198, 0.4), inset -3px -3px 6px rgba(255, 255, 255, 0.8)",
              },
            },
            '&[data-focus="true"]': {
              backgroundColor: "#E0E5EC",
              boxShadow:
                "inset 2px 2px 4px rgba(163, 177, 198, 0.25), inset -2px -2px 4px rgba(255, 255, 255, 0.6)",
            },
          },
        },
        noOptions: {
          padding: "12px 16px",
          fontSize: "0.875rem",
          color: "#64748B",
          fontWeight: 500,
        },
        loading: {
          padding: "12px 16px",
          fontSize: "0.875rem",
          color: "#64748B",
          fontWeight: 500,
        },
        tag: {
          backgroundColor: "#E0E5EC",
          borderRadius: "8px",
          height: "24px",
          margin: "2px",
          fontSize: "0.6525rem",
          boxShadow:
            "2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.7)",
          "& .MuiChip-deleteIcon": {
            fontSize: "1rem",
            color: "#64748B",
            margin: "0 4px 0 -4px",
            "&:hover": {
              color: "#FE0000",
            },
          },
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(224, 229, 236, 0.8)", // Lebih terang dengan warna neumorphic
          backdropFilter: "blur(4px)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#E0E5EC",
          borderRadius: "0 24px 24px 0",
          border: "none",
          boxShadow:
            "8px 8px 16px rgba(163, 177, 198, 0.5), -4px 0 8px rgba(255, 255, 255, 0.8)",
          "&.MuiDrawer-paperAnchorRight": {
            borderRadius: "24px 0 0 24px",
            boxShadow:
              "-8px 8px 16px rgba(163, 177, 198, 0.5), 4px 0 8px rgba(255, 255, 255, 0.8)",
          },
          "&.MuiDrawer-paperAnchorTop": {
            borderRadius: "0 0 24px 24px",
            boxShadow:
              "0 8px 16px rgba(163, 177, 198, 0.5), 0 -4px 8px rgba(255, 255, 255, 0.8)",
          },
          "&.MuiDrawer-paperAnchorBottom": {
            borderRadius: "24px 24px 0 0",
            boxShadow:
              "0 -8px 16px rgba(163, 177, 198, 0.5), 0 4px 8px rgba(255, 255, 255, 0.8)",
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: "separate",
          borderSpacing: "0 4px",
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: "#E0E5EC",
          borderRadius: "16px",
          boxShadow:
            "inset 3px 3px 6px rgba(163, 177, 198, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.7)",
          padding: "10px",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#475569",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            padding: "6px 10px",
            backgroundColor: "transparent",
            borderBottom: "none",
            lineHeight: 1.2,
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableRow-root": {
            backgroundColor: "#E0E5EC",
            borderRadius: "10px",
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.7)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow:
                "5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.8)",
            },
            "& .MuiTableCell-body": {
              fontSize: "0.6525rem",
              fontWeight: 500,
              color: "#2D3748",
              padding: "8px 10px",
              borderBottom: "none",
              "&:first-of-type": {
                borderTopLeftRadius: "10px",
                borderBottomLeftRadius: "10px",
              },
              "&:last-of-type": {
                borderTopRightRadius: "10px",
                borderBottomRightRadius: "10px",
              },
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "8px 10px",
          fontSize: "0.6525rem",
          borderBottom: "none",
        },
        head: {
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "#475569",
          padding: "6px 10px",
          lineHeight: 1.2,
        },
        body: {
          fontSize: "0.6525rem",
          fontWeight: 500,
          color: "#2D3748",
          padding: "8px 10px",
        },
        sizeSmall: {
          padding: "4px 8px",
          fontSize: "0.75rem",
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          borderBottom: "none",
          color: "#64748B",
        },
        toolbar: {
          padding: "6px 10px",
          minHeight: "44px",
        },
        selectLabel: {
          fontSize: "0.75rem",
          fontWeight: 500,
        },
        displayedRows: {
          fontSize: "0.75rem",
          fontWeight: 500,
        },
        select: {
          backgroundColor: "#E0E5EC",
          borderRadius: "8px",
          padding: "4px 8px",
          fontSize: "0.75rem",
          boxShadow:
            "inset 2px 2px 4px rgba(163, 177, 198, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.7)",
        },
        actions: {
          "& .MuiIconButton-root": {
            padding: "6px",
            width: "32px",
            height: "32px",
            boxShadow:
              "3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.7)",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&.compact": {
            "& .MuiTableCell-root": {
              padding: "5px 8px",
              fontSize: "0.75rem",
            },
          },
        },
      },
    },
  },
});
