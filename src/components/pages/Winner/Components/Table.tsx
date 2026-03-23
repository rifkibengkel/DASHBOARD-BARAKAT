import { TableDefault } from "@/components/base/Table";
import { TableHeader } from "@/components/base/Table/Table.types";
import { useModalStore } from "@/stores/useModal";
import { Menu, PaginatedResponse, Winner } from "@/types";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { IconButton, Tooltip } from "@mui/material";
import Stack from "@mui/material/Stack";
import TableCell from "@mui/material/TableCell";
import { useRouter } from "next/navigation";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { useNotificationStore } from "@/stores/useNotification";

interface TableWinnerProps {
  pageRole: Menu;
  data: PaginatedResponse<Winner>;
  isLoading: boolean;
  isError: boolean;
  type: number;
}

export function TableWinner(props: TableWinnerProps) {
  const navigate = useRouter();
  const { notify } = useNotificationStore();
  const { showModal } = useModalStore();
  const { pageRole, data, isLoading, isError } = props;

  const winnerTypeString = props.type === 1 ? "digital" : "physical";

  const header: TableHeader<Winner>[] = [
    { key: "no", align: "center", label: "No", width: 50 },
    { key: "created_at", align: "left", label: "Date", sort: true },
    { key: "fullname", align: "left", label: "Fullname", sort: true },
    { key: "identity", align: "left", label: "identity", sort: true },
    { key: "hp", align: "left", label: "Account Number", sort: true },
    { key: "prize", align: "left", label: "Prize", sort: true },
    { key: "coupon", align: "left", label: "Unique Code", sort: true },
    { key: "city", align: "left", label: "City", sort: true },
    { key: "store", align: "left", label: "Store", sort: true },
    ...(winnerTypeString === "digital"
      ? [
          {
            key: "status",
            align: "left",
            label: "Status Topup",
            sort: true,
          } as TableHeader<Winner>,
          {
            key: "is_approved",
            align: "left",
            label: "Is Approved",
            sort: true,
          } as TableHeader<Winner>,
        ]
      : [
          {
            key: "status_dynamic",
            align: "left",
            label: "Status",
            sort: true,
          } as TableHeader<Winner>,
        ]),
    { key: "action", align: "center", label: "Action" },
  ];

  const ButtonActionGroup = (row: Winner) => {
    const disabled = row.is_approved > 0 || row.status_entries !== 1;
    const setShipment = row.is_approved === 1 && !row.shipment_status;
    const setDelivered = row.shipment_status === 1;
    const setCompleted = row.shipment_status === 2;
    const onModify = () => {
      if (disabled) return;
      navigate.push(`/winner/${winnerTypeString}/approve?id=${row.id}`);
    };
    const handleShipmentSubmit = async (
      id: number,
      type: "delivered" | "received"
    ) => {
      try {
        // Kirim ke API
        const response = await fetch(`/api/winner/${type}?id=${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          // Handle success
          const word = type === "received" ? "completed" : type;
          notify({
            message: `Successfuly set as ${word}`,
            type: "success",
          });
        }
      } catch (error) {
        console.error("Error set status shipment:", error);
      }
    };

    return (
      <TableCell key={"action_group"}>
        <Stack direction="row" spacing={1} justifyContent={"center"}>
          {pageRole.m_update === 1 && (
            <>
              <Tooltip title="View" arrow>
                <IconButton
                  onClick={() =>
                    navigate.push(
                      `/winner/${winnerTypeString}/view?id=${row.id}`
                    )
                  }
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

              <Tooltip title="Images" arrow>
                <span>
                  <IconButton
                    onClick={() =>
                      showModal("winner-images", {
                        id: row.id,
                        type: "update",
                      })
                    }
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
                    <ImageOutlinedIcon />
                  </IconButton>
                </span>
              </Tooltip>
              {!disabled && (
                <Tooltip title="Modify" arrow>
                  <span>
                    <IconButton
                      onClick={onModify} // ganti sesuai fungsi handler kamu
                      disabled={disabled}
                      sx={{
                        color: disabled ? "lightgray" : "inherit",
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
                      <EditOutlinedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {winnerTypeString === "digital" && disabled && (
                <Tooltip title="Detail" arrow>
                  <span>
                    <IconButton
                      onClick={() =>
                        showModal("winner-transaction", {
                          id: row.id,
                          type: "view",
                        })
                      }
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
                      <InfoOutlinedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {winnerTypeString === "physical" && setShipment && (
                <Tooltip title="Set Shipment" arrow>
                  <span>
                    <IconButton
                      onClick={() =>
                        navigate.push(
                          `/winner/${winnerTypeString}/shipment?id=${row.id}`
                        )
                      }
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
                      <LocalShippingOutlinedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {winnerTypeString === "physical" && setDelivered && (
                <Tooltip title="Set as Delivered" arrow>
                  <span>
                    <IconButton
                      onClick={() => handleShipmentSubmit(row.id, "delivered")}
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
                      <Inventory2OutlinedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {winnerTypeString === "physical" && setCompleted && (
                <Tooltip title="Set as Completed" arrow>
                  <span>
                    <IconButton
                      onClick={() => handleShipmentSubmit(row.id, "received")}
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
                      <CheckCircleOutlinedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
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
