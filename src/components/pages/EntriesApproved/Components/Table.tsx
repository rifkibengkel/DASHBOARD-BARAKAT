import { TableDefault } from "@/components/base/Table";
import { TableHeader } from "@/components/base/Table/Table.types";
import { Entries, Menu, PaginatedResponse } from "@/types";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { IconButton, Tooltip } from "@mui/material";
import Stack from "@mui/material/Stack";
import TableCell from "@mui/material/TableCell";
import { useRouter } from "next/navigation";

interface EntriesTableProps {
  pageRole: Menu;
  data: PaginatedResponse<Entries>;
  isLoading: boolean;
  isError: boolean;
}

export function TableEntries(props: EntriesTableProps) {
  const navigate = useRouter();
  const { pageRole, data, isLoading, isError } = props;

  const header: TableHeader<Entries>[] = [
    { key: "no", align: "center", label: "No", width: 75 },
    { key: "rcvd_time", align: "left", label: "Date", sort: true },
    { key: "fullname", align: "left", label: "Fullname" },
    { key: "sender", align: "left", label: "Sender", sort: true },
    { key: "id_number", align: "left", label: "KTP", sort: true },
    { key: "coupon", align: "left", label: "Coupon", sort: true },
    { key: "is_valid", align: "left", label: "Is Valid", sort: true },
    // {
    //   key: "is_valid_admin",
    //   align: "left",
    //   label: "Is Valid Admin",
    //   sort: true,
    // },
    {
      key: "is_approved_admin",
      align: "left",
      label: "Is Approved Admin",
      sort: true,
    },
    { key: "action", align: "center", label: "Action" },
  ];

  const ButtonActionGroup = (row: Entries) => {
    return (
      <TableCell key={"action_group"}>
        <Stack direction="row" spacing={2} justifyContent={"center"}>
          <Tooltip title="View" arrow>
            <IconButton
              onClick={() => navigate.push(`/entries/view?id=${row.id}`)}
              sx={{
                color: "inherit",
                width: 28,
                height: 28,
                padding: 0.5,
                borderRadius: "8px",
                boxShadow:
                  "2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  boxShadow:
                    "1px 1px 2px rgba(163, 177, 198, 0.4), -1px -1px 2px rgba(255, 255, 255, 0.7)",
                },
                "& svg": { fontSize: 16 },
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
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
