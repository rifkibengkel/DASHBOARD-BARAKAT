import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

interface TabDefaultProps {
  type: string;
  value: string | number;
  listValue: { id: string | number; name: string }[];
  handleChange: (
    e: React.SyntheticEvent,
    type: string,
    value: string | number
  ) => void;
}

export function TabsDefault(props: TabDefaultProps) {
  const { value, listValue, handleChange, type } = props;

  return (
    <Box
      sx={{
        width: "100%",
        mb: 2,
        // Add padding to prevent shadow clipping
        py: 1,
        px: 0.5,
        overflow: "visible",
      }}
    >
      <Tabs
        value={value}
        onChange={(e, newValue) => handleChange(e, type, newValue)}
        textColor="primary"
        TabIndicatorProps={{
          style: { display: "none" }, // Hide default indicator
        }}
        sx={{
          minHeight: "auto",
          overflow: "visible",
          "& .MuiTabs-flexContainer": {
            gap: 1,
            overflow: "visible",
          },
          "& .MuiTabs-scroller": {
            overflow: "visible !important",
          },
        }}
      >
        {listValue.map((item, index) => (
          <Tab
            key={index}
            value={item.id}
            label={item.name}
            sx={{
              textTransform: "capitalize",
              fontWeight: 600,
              fontSize: "0.8125rem",
              minHeight: "auto",
              minWidth: "auto",
              padding: "6px 16px",
              borderRadius: "10px",
              backgroundColor: "#E0E5EC",
              color: "#64748B",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

              // Default state (inactive)
              boxShadow:
                "3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.7)",

              "&:hover": {
                backgroundColor: "#E0E5EC",
                boxShadow:
                  "2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.7)",
                color: "#475569",
              },

              // Active state
              "&.Mui-selected": {
                color: "#FE0000",
                backgroundColor: "#E0E5EC",
                boxShadow:
                  "inset 2px 2px 4px rgba(163, 177, 198, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.7)",
                fontWeight: 700,
              },
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
}
