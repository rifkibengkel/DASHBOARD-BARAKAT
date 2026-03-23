import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

interface CardStatsProps {
  children: React.ReactNode;
  minHeight?: number;
  gap?: number;
  variant?: "primary" | "success" | "warning" | "info" | "error";
}

export function CardStats(props: CardStatsProps) {
  const { children, gap, variant = "primary" } = props;

  // Map variant to className
  const variantClass = variant ? `stats-${variant}` : "";

  return (
    <Card elevation={0} className={`stats-card ${variantClass}`.trim()}>
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: gap ?? 1.5,
          minHeight: props.minHeight ? props.minHeight : 0,
          width: "100%",
          // Remove padding karena stats-card sudah punya padding
          p: 0,
          "&:last-child": {
            pb: 0,
          },
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
}
