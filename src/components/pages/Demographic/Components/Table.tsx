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

interface TableDemographicProps {
  headers: string[];
  rows: TableRowData[];
  loading: boolean;
  loadingRows: number;
}

const TableDemographicComponent: React.FC<TableDemographicProps> = ({
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
                  <TableCell key={cellIdx}>
                    <Skeleton variant="text" width="80%" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : rows.map((row, idx) => {
              const isLastRow = idx === rows.length - 1;
              return (
                <TableRow key={idx}>
                  {headers.map((header, hIdx) => (
                    <TableCell
                      key={hIdx}
                      sx={isLastRow ? { fontWeight: "bold" } : {}}
                    >
                      {row[header.toLowerCase()] ?? "-"}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
      </TableBody>
    </Table>
  );
};

export const TableDemographic = React.memo(TableDemographicComponent);
