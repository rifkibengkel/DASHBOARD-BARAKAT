import React from "react";
import { Menu, PaginatedResponse, ConsumerData } from "@/types";
import { TableDefault } from "@/components/base/Table";
import { TableHeader } from "@/components/base/Table/Table.types";
import TableCell from "@mui/material/TableCell";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import { useModalStore } from "@/stores/useModal";

interface ConsumerDataTableProps {
  pageRole: Menu;
  data: PaginatedResponse<ConsumerData>;
  isLoading: boolean;
  isError: boolean;
}

export function TableConsumerData(props: ConsumerDataTableProps) {
  const { data, isLoading, isError } = props;
  const { showModal } = useModalStore();

  const header: TableHeader<ConsumerData>[] = [
    { key: "no", align: "center", label: "No", width: 75 },
    { key: "created_at", align: "left", label: "Created At" },
    { key: "fullname", align: "left", label: "Name" },
    { key: "identity", align: "left", label: "KTP" },
    { key: "hp", align: "left", label: "HP" },
    { key: "city", align: "left", label: "City" },
    { key: "total_submit_valid", align: "left", label: "Total Valid" },
    { key: "total_submit_invalid", align: "left", label: "Total Invalid" },
    { key: "total_submit", align: "left", label: "Total" },
    { key: "action", align: "center", label: "Record" },
  ];

  const ButtonActionGroup = (row: ConsumerData) => {
    return (
      <TableCell key={"action_group"}>
        <Stack direction="row" spacing={2} justifyContent={"center"}>
          <Link
            component="button"
            variant="body2"
            sx={{ color: "inherit", textDecoration: "none" }}
            onClick={() =>
              showModal("consumer-transaction", { id: row.id!, type: "view" })
            }
          >
            History
          </Link>
        </Stack>
      </TableCell>
    );
  };

  return (
    <TableDefault
      header={header}
      data={data}
      isLoading={isLoading}
      isError={isError}
      action={ButtonActionGroup}
      enableTotal
    />
  );
}
