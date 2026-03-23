import { TableDefault } from "@/components/base/Table";
import { TableHeader } from "@/components/base/Table/Table.types";
import { Entries, Menu, PaginatedResponse } from "@/types";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircle";
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
    { key: "store", align: "left", label: "Store", sort: true },
    {
      key: "prize",
      align: "left",
      label: "Prize",
      sort: true,
    },
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
    const { is_valid, is_valid_admin, status } = row;

    const disabledEntry =
      status !== 1 || is_valid === 0 || [0, 1].includes(is_valid_admin);
    // const disabledApprove =
    //     is_valid === 0 ||
    //     (is_valid === 1 && (!is_valid_admin || [1, 2].includes(is_approved_admin) || is_valid_admin === 2));

    return (
      <TableCell key={"action_group"}>
        <Stack direction="row" spacing={1} justifyContent={"center"}>
          {pageRole.m_update === 1 && (
            <>
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
              {/* <Tooltip title={disabledEntry ? "Disabled" : "Approve"} arrow>
                <span>
                  <IconButton
                    disabled={disabledEntry}
                    onClick={() =>
                      navigate.push(`/entries/approve?id=${row.id}`)
                    }
                    sx={{
                      color: disabledEntry ? "lightgray" : "inherit",
                      width: 28,
                      height: 28,
                      padding: 0.5,
                      ml: 0.5,
                      borderRadius: "8px",
                      boxShadow: disabledEntry
                        ? "none"
                        : "2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.7)",
                      "&:hover": disabledEntry
                        ? {}
                        : {
                            boxShadow:
                              "1px 1px 2px rgba(163, 177, 198, 0.4), -1px -1px 2px rgba(255, 255, 255, 0.7)",
                          },
                      "& svg": { fontSize: 16 },
                    }}
                  >
                    <CheckCircleOutlineIcon />
                  </IconButton>
                </span>
              </Tooltip> */}
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
