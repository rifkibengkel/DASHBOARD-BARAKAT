import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Skeleton,
} from "@mui/material";

interface TableRowData {
  [key: string]: string | number | undefined;
}

interface TableEntrySummaryProps {
  headers: string[];
  rows: TableRowData[];
  loading: boolean;
  loadingRows: number;
}

const TableEntrySummaryComponent: React.FC<TableEntrySummaryProps> = ({
  headers,
  rows,
  loading,
  loadingRows,
}) => {
  return (
    <Table sx={{ minWidth: 200 }} size="small">
      <TableHead>
        <TableRow>
          {headers.map((header, idx) => (
            <TableCell key={idx} sx={{ fontWeight: "bold" }}>
              {header}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {loading
          ? Array.from({ length: loadingRows }).map((_, idx) => (
              <TableRow key={`loading-${idx}`}>
                {headers.map((_, cellIdx) => (
                  <TableCell key={cellIdx} sx={{ py: 1.5 }}>
                    <Skeleton variant="text" width="80%" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : rows.map((row, idx) => {
              const isLastRow = idx === rows.length - 1;
              const keys = Object.keys(row);
              return (
                <TableRow key={idx}>
                  {keys.map((key, hIdx) => {
                    let cellValue = row[key];

                    // Format date values
                    if (key === "date" && typeof cellValue === "string") {
                      const date = new Date(cellValue);
                      if (!isNaN(date.getTime())) {
                        cellValue = date.toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });
                      }
                    }

                    // Format numbers with thousand separators
                    if (typeof cellValue === "number" && key !== "date") {
                      cellValue = cellValue.toLocaleString("id-ID");
                    }

                    return (
                      <TableCell
                        key={hIdx}
                        sx={
                          isLastRow
                            ? { fontWeight: "bold", py: 1.5 }
                            : { py: 1.5 }
                        }
                      >
                        {cellValue ?? "-"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
      </TableBody>
    </Table>
  );
};

export const TableEntrySummary = React.memo(TableEntrySummaryComponent);
