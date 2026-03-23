import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Skeleton,
  TableCellProps,
} from "@mui/material";

interface TableRowData {
  [key: string]: string | number | undefined;
}

interface TablePrizeSummaryProps {
  headers: string[];
  rows: TableRowData[];
  loading: boolean;
  loadingRows: number;
}

const formatRupiah = (value: number | string) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value));
};

const TablePrizeSummaryComponent: React.FC<TablePrizeSummaryProps> = ({
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
            <TableCell
              key={idx}
              align={"left" as TableCellProps["align"]}
              sx={{
                borderBottom: "1px solid #36597D1A",
                px: 1.5,
                fontWeight: "bold",
                py: 1.5,
              }}
              aria-label={header}
            >
              {header}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {loading
          ? Array.from({ length: loadingRows }).map((_, idx) => (
              <TableRow key={`loading-${idx}`}>
                {headers.map((header, cellIdx) => (
                  <TableCell
                    key={cellIdx}
                    align={"left" as TableCellProps["align"]}
                    sx={{
                      borderBottom: "1px solid #36597D1A",
                      px: 1.5,
                      py: 1.5,
                      fontWeight: "",
                    }}
                    aria-label={header}
                  >
                    <Skeleton variant="text" width="80%" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : rows.map((row, idx) => {
              const keys = Object.keys(row);
              return (
                <TableRow key={idx}>
                  {keys.map((key, hIdx) => {
                    let cellValue = row[key];

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

                    if (typeof cellValue === "number" && key !== "date") {
                      cellValue = cellValue.toLocaleString("id-ID");
                    }

                    return (
                      <TableCell
                        key={hIdx}
                        align={"left" as TableCellProps["align"]}
                        sx={{
                          borderBottom: "1px solid #36597D1A",
                          px: 1.5,
                          py: 1.5,
                        }}
                        aria-label={headers[hIdx]}
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

export const TablePrizeSummary = React.memo(TablePrizeSummaryComponent);
