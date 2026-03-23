import React from "react";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TableCell from "@mui/material/TableCell";
import { useModalStore } from "@/stores/useModal";
import { Menu, PaginatedResponse } from "@/types";
import { TableDefault } from "@/components/base/Table";
import { TableHeader } from "@/components/base/Table/Table.types";

interface MenuTableProps {
  pageRole: Menu;
  data: PaginatedResponse<Menu>;
  isLoading: boolean;
  isError: boolean;
}

export function TableMenu(props: MenuTableProps) {
  const { showModal } = useModalStore();
  const { pageRole, data, isLoading, isError } = props;

  const header: TableHeader<Menu>[] = [
    { key: "expand", align: "center", label: "", width: 75 },
    { key: "menu", align: "left", label: "Name" },
    { key: "path", align: "left", label: "Path", width: 300 },
    { key: "status", align: "center", label: "Status" },
    { key: "sort", align: "center", label: "Sort", sort: true },
    { key: "action", align: "center", label: "Action" },
  ];

  const ButtonActionGroup = (row: Menu) => {
    return (
      <TableCell key={"action_group"}>
        <Stack direction="row" spacing={2} justifyContent={"center"}>
          {pageRole.m_update === 1 && (
            <Link
              component="button"
              variant="body2"
              sx={{ color: "inherit", textDecoration: "none" }}
              onClick={() => showModal("menu", { id: row.id, type: "update" })}
            >
              Modify
            </Link>
          )}
        </Stack>
      </TableCell>
    );
  };

  return (
    <TableDefault
      action={ButtonActionGroup}
      header={header}
      data={data}
      isLoading={isLoading}
      isError={isError}
      disablePagination
    />
  );
}
