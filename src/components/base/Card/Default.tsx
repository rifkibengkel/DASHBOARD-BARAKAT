import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

interface CardDefaultProps {
  children: React.ReactNode;
  minHeight?: number;
  gap?: number;
  padding?: number;
}

export function CardDefault(props: CardDefaultProps) {
  const { children, gap, padding } = props;
  return (
    <Card elevation={0} className="stats-modern">
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: gap ?? 2,
          minHeight: props.minHeight ? props.minHeight : 0,
          width: "100%",
          overflowX: "auto",
          p: padding ?? 2,
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
}
