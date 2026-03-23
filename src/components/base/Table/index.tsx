/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { default as MUITable } from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { TableCellProps } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import Skeleton from "@mui/material/Skeleton";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import { TableHeader, TableProps } from "./Table.types";
import Alert, { AlertColor } from "@mui/material/Alert";
import Chip, { ChipProps } from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import { usePaginationStore } from "@/stores/usePagination";
import TableSortLabel from "@mui/material/TableSortLabel";
import { useFilterStore } from "@/stores/useFilter";
import Tooltip from "@mui/material/Tooltip";

interface ExpandedRowsState {
  [key: string]: boolean;
}

const LoadingRow = React.memo<{ header: TableHeader<never>[]; index: number }>(
  ({ header, index }) => (
    <TableRow key={`skeleton-${index}`}>
      {header.map((header) => (
        <TableCell key={String(header.key)} align={header.align || "left"}>
          <Skeleton variant="text" animation="wave" />
        </TableCell>
      ))}
    </TableRow>
  )
);
LoadingRow.displayName = "LoadingRow";

const ErrorRow = React.memo<{ colSpan: number }>(({ colSpan }) => (
  <TableRow>
    <TableCell colSpan={colSpan} align="center">
      <Alert severity="error" sx={{ justifyContent: "center" }}>
        An error occurred while loading data
      </Alert>
    </TableCell>
  </TableRow>
));
ErrorRow.displayName = "ErrorRow";

const EmptyRow = React.memo<{ colSpan: number }>(({ colSpan }) => (
  <TableRow>
    <TableCell colSpan={colSpan} align="center">
      No data available
    </TableCell>
  </TableRow>
));
EmptyRow.displayName = "EmptyRow";

const StatusChip = React.memo<{ statusText: string; statusColor: AlertColor }>(
  ({ statusText, statusColor }) => {
    const chipColor = statusColor as ChipProps["color"];
    return (
      <Chip
        label={statusText}
        color={chipColor}
        sx={{
          fontSize: "0.625rem",
          height: 25,
          textTransform: "uppercase",
        }}
      />
    );
  }
);
StatusChip.displayName = "StatusChip";

const ExpandButton = React.memo<{
  hasChildren: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}>(({ hasChildren, isExpanded, onToggle }) => {
  if (!hasChildren) return null;

  return (
    <IconButton size="small" onClick={onToggle} aria-label="Toggle expand">
      {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
    </IconButton>
  );
});
ExpandButton.displayName = "ExpandButton";

export function TableDefault<
  T extends { id?: string | number; children?: T[] }
>({
  header,
  data,
  isLoading,
  isError,
  action,
  enableTotal,
  disablePagination,
}: TableProps<T>) {
  const { filter, setFilter } = useFilterStore();
  const { pagination, setPagination } = usePaginationStore();
  const { list, currentPage, dataPerPage, totalData } = data;
  const [expandedRows, setExpandedRows] = useState<ExpandedRowsState>({});

  const handleLimitChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPagination({ limit: parseInt(event.target.value, 10) });
  };

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    page: number
  ) => {
    setPagination({ page: page + 1 });
  };

  const handleSort = (key: string) => {
    let newOrder: "asc" | "desc" = "asc";
    if (filter.column === key && filter.direction === "asc") newOrder = "desc";
    setFilter({ column: key, direction: newOrder });
  };

  const loadingRows = React.useMemo(
    () =>
      Array.from({ length: pagination.limit }, (_, index) => (
        <LoadingRow key={index} header={header} index={index} />
      )),
    [pagination.limit, header]
  );

  const toggleExpanded = React.useCallback((rowId: string | number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  }, []);

  // Render content dengan ellipsis dinamis yang responsif
  const renderCellContent = (value: any) => {
    const text = String(value ?? "");
    return (
      <Tooltip title={text} placement="top-start">
        <span
          style={{
            display: "inline-block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%",
          }}
        >
          {text}
        </span>
      </Tooltip>
    );
  };

  const renderRows = (rows: any[], isChild = false) => {
    return rows.map((row: any, index: number) => {
      const rowId = row.id || index;
      const isExpanded = expandedRows[rowId] || false;
      const hasChildren = row.children?.length > 0;
      const isLastRow = index === rows.length - 1;
      const isTotalRow = enableTotal && !isChild && isLastRow;

      return (
        <React.Fragment key={rowId}>
          <TableRow
            hover={!isTotalRow}
            aria-expanded={isExpanded}
            aria-label={`Row ${rowId}${hasChildren ? " expandable" : ""}`}
            sx={{
              bgcolor: isTotalRow
                ? "#f9fafb"
                : isChild
                ? "rgba(54, 89, 125, 0.02)"
                : "inherit",
              fontWeight: isTotalRow ? "bold" : "normal",
              borderTop: isTotalRow ? "2px solid #36597D1A" : undefined,
            }}
          >
            {header.map((item, idx) => {
              const cellKey = `${String(item.key)}-${rowId}`;
              const commonCellProps: TableCellProps = {
                align: item.align || "left",
                sx: {
                  borderBottom: "1px solid #36597D1A",
                  px: 1.5,
                  fontWeight: isTotalRow ? "bold" : "normal",
                  // Width dinamis berdasarkan header width atau auto
                  width: item.width || "auto",
                  minWidth: item.width ? undefined : 100,
                  maxWidth: item.width ? item.width : 300, // Set maxWidth untuk memaksa ellipsis
                },
                "aria-label": item.label,
              };

              if (isTotalRow) {
                if (idx === 0)
                  return (
                    <TableCell key={cellKey} {...commonCellProps}>
                      Total
                    </TableCell>
                  );
                if (
                  ["created_at", "expand", "action", "status"].includes(
                    String(item.key)
                  )
                )
                  return <TableCell key={cellKey} {...commonCellProps} />;
                return (
                  <TableCell key={cellKey} {...commonCellProps}>
                    {String(row[item.key] ?? "")}
                  </TableCell>
                );
              }

              switch (item.key) {
                case "expand":
                  return (
                    <TableCell
                      key={cellKey}
                      {...commonCellProps}
                      sx={{
                        ...commonCellProps.sx,
                        width: 50,
                        minWidth: 50,
                        maxWidth: 50,
                      }}
                    >
                      <ExpandButton
                        hasChildren={hasChildren}
                        isExpanded={isExpanded}
                        onToggle={() => toggleExpanded(rowId)}
                      />
                    </TableCell>
                  );
                case "status":
                case "is_valid":
                case "is_valid_admin":
                case "is_approved":
                case "is_approved_admin":
                case "shipment_status": {
                  const statusMap: Record<
                    string,
                    { text: string; color: AlertColor }
                  > = {
                    status: { text: row.status_text, color: row.status_color },
                    is_valid: {
                      text: row.is_valid_text,
                      color: row.is_valid_color,
                    },
                    is_valid_admin: {
                      text: row.is_valid_admin_text,
                      color: row.is_valid_admin_color,
                    },
                    is_approved: {
                      text: row.is_approved_text,
                      color: row.is_approved_color,
                    },
                    is_approved_admin: {
                      text: row.is_approved_admin_text,
                      color: row.is_approved_admin_color,
                    },
                    shipment_status: {
                      text: row.shipment_status_text,
                      color: row.shipment_status_color,
                    },
                  };
                  return (
                    <TableCell
                      key={cellKey}
                      {...commonCellProps}
                      sx={{
                        ...commonCellProps.sx,
                        overflow: "visible", // Status chip tidak perlu ellipsis
                      }}
                    >
                      <StatusChip
                        statusText={
                          statusMap[item.key as keyof typeof statusMap]?.text ??
                          ""
                        }
                        statusColor={
                          statusMap[item.key as keyof typeof statusMap]
                            ?.color ?? "info"
                        }
                      />
                    </TableCell>
                  );
                }
                case "status_dynamic": {
                  const key =
                    row.shipment_status !== null
                      ? "shipment_status"
                      : "is_approved";

                  const statusMap: Record<
                    string,
                    { text: string; color: AlertColor }
                  > = {
                    status: { text: row.status_text, color: row.status_color },
                    is_valid: {
                      text: row.is_valid_text,
                      color: row.is_valid_color,
                    },
                    is_valid_admin: {
                      text: row.is_valid_admin_text,
                      color: row.is_valid_admin_color,
                    },
                    is_approved: {
                      text: row.is_approved_text,
                      color: row.is_approved_color,
                    },
                    is_approved_admin: {
                      text: row.is_approved_admin_text,
                      color: row.is_approved_admin_color,
                    },
                    shipment_status: {
                      text: row.shipment_status_text,
                      color: row.shipment_status_color,
                    },
                  };

                  return (
                    <TableCell key={cellKey} {...commonCellProps}>
                      <StatusChip
                        statusText={statusMap[key].text}
                        statusColor={statusMap[key].color}
                      />
                    </TableCell>
                  );
                }

                case "action":
                  return action ? action(row) : null;
                default:
                  // Special handling for menu column in child rows
                  if (item.key === "menu" && isChild) {
                    return (
                      <TableCell
                        key={cellKey}
                        {...commonCellProps}
                        sx={{
                          ...commonCellProps.sx,
                          paddingLeft: 4,
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              color: "rgba(54, 89, 125, 0.4)",
                              fontSize: "0.875rem",
                              fontWeight: 400,
                            }}
                          >
                            └─
                          </span>
                          {renderCellContent(row[item.key])}
                        </span>
                      </TableCell>
                    );
                  }

                  return (
                    <TableCell key={cellKey} {...commonCellProps}>
                      {renderCellContent(row[item.key])}
                    </TableCell>
                  );
              }
            })}
          </TableRow>

          {hasChildren && isExpanded && renderRows(row.children, true)}
        </React.Fragment>
      );
    });
  };

  return (
    <Paper elevation={1}>
      <TableContainer
        sx={{
          overflowX: "auto",
          width: "100%",
        }}
      >
        <MUITable
          stickyHeader
          sx={{
            tableLayout: "fixed", // Fixed layout agar lebar kolom terkontrol
            width: "100%",
          }}
        >
          <TableHead>
            <TableRow>
              {header.map((header) => (
                <TableCell
                  key={String(header.key)}
                  align={header.align || "left"}
                  sx={{
                    width: header.width || "auto",
                    minWidth: header.width ? undefined : 100,
                    maxWidth: header.width || "none",
                    fontWeight: 600,
                    bgcolor: "background.default",
                    cursor: header.sort ? "pointer" : undefined,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  onClick={
                    header.sort
                      ? () => handleSort(String(header.key))
                      : undefined
                  }
                >
                  {header.sort ? (
                    <TableSortLabel
                      active={filter.column === header.key}
                      direction={filter.direction}
                    >
                      {header.label}
                    </TableSortLabel>
                  ) : (
                    header.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && loadingRows}
            {!isLoading && isError && <ErrorRow colSpan={header.length} />}
            {!isLoading && !isError && totalData === 0 && (
              <EmptyRow colSpan={header.length} />
            )}
            {!isLoading && !isError && totalData > 0 && renderRows(list)}
          </TableBody>
        </MUITable>
      </TableContainer>
      {!disablePagination && !isLoading && !isError && totalData > 0 && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          page={currentPage - 1}
          count={totalData}
          rowsPerPage={dataPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleLimitChange}
          sx={{
            "& .MuiInputBase-root": {
              fontSize: "0.75rem",
            },
            borderTop: "1px solid rgba(224, 224, 224, 1)",
          }}
        />
      )}
    </Paper>
  );
}
