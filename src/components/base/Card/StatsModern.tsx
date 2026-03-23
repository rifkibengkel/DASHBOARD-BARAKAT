import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { SvgIconComponent } from "@mui/icons-material";

interface CardStatsModernProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: SvgIconComponent;
  variant?: "primary" | "success" | "warning" | "info" | "error";
  loading?: boolean;
}

export function CardStatsModern({
  label,
  value,
  subtitle,
  icon: Icon,
  variant = "primary",
  loading = false,
}: CardStatsModernProps) {
  // Color mapping untuk icon background
  const colorMap = {
    primary: {
      bg: "rgba(254, 0, 0, 0.1)",
      color: "#FE0000",
    },
    success: {
      bg: "rgba(34, 197, 94, 0.1)",
      color: "#22C55E",
    },
    warning: {
      bg: "rgba(245, 158, 11, 0.1)",
      color: "#F59E0B",
    },
    info: {
      bg: "rgba(59, 130, 246, 0.1)",
      color: "#3B82F6",
    },
    error: {
      bg: "rgba(239, 68, 68, 0.1)",
      color: "#EF4444",
    },
  };

  const colors = colorMap[variant];

  return (
    <Card elevation={0} className="stats-modern">
      <CardContent
        sx={{
          p: 0,
          "&:last-child": {
            pb: 0,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {/* Header: Label + Icon */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "text.secondary",
                opacity: 0.7,
              }}
            >
              {label}
            </Typography>

            {Icon && (
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  backgroundColor: colors.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon
                  sx={{
                    fontSize: "1.25rem",
                    color: colors.color,
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Value */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              fontSize: "1.75rem",
              lineHeight: 1.2,
              color: "text.primary",
            }}
          >
            {loading ? "..." : value}
          </Typography>

          {/* Subtitle */}
          {subtitle && (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.75rem",
                fontWeight: 400,
                color: "text.secondary",
                opacity: 0.6,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
