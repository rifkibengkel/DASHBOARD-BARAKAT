import React from "react";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TableCell from "@mui/material/TableCell";
import { useModalStore } from "@/stores/useModal";
import { Menu, PaginatedResponse } from "@/types";
import { TableDefault } from "@/components/base/Table";
import { TableHeader } from "@/components/base/Table/Table.types";
import { TestingDataList } from "@/types/developer-tools";

interface TestingDataTableProps {
  pageRole: Menu;
  data: PaginatedResponse<TestingDataList>;
  isLoading: boolean;
  isError: boolean;
}

export function TableTestingData(props: TestingDataTableProps) {
  const { showModal } = useModalStore();
  const { pageRole, data, isLoading, isError } = props;

  const header: TableHeader<TestingDataList>[] = [
    { key: "no", align: "center", label: "No", width: 75 },
    { key: "name", align: "left", label: "Name" },
    { key: "sender", align: "left", label: "Sender" },
    { key: "entries", align: "left", label: "Total Entries" },
    { key: "winner", align: "left", label: "Total Winner" },
    { key: "status", align: "center", label: "Status" },
    { key: "action", align: "center", label: "Action" },
  ];

  const ButtonActionGroup = (row: TestingDataList) => {
    return (
      <TableCell key={"action_group"}>
        <Stack direction="row" spacing={2} justifyContent={"center"}>
          {pageRole.m_update === 1 && (
            <>
              <Link
                component="button"
                variant="body2"
                sx={{ color: "inherit", textDecoration: "none" }}
                onClick={() =>
                  showModal("testingData-view", { id: row.id, type: "view" })
                }
              >
                View
              </Link>
              <Link
                component="button"
                variant="body2"
                sx={{ color: "red", textDecoration: "none" }}
                onClick={() =>
                  showModal("testingData-delete", {
                    id: row.id,
                    type: "delete",
                  })
                }
              >
                Delete
              </Link>
            </>
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
    />
  );
}
