import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Close from "@mui/icons-material/Close";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";

import { useModalStore } from "@/stores/useModal";
import { formatToIDR } from "@/lib/utils";
import { UserHistory } from "@/types";
import dayjs from "dayjs";

function ModalTransactionComponent() {
  const { modals, hideModal } = useModalStore();
  const modal = modals["consumer-transaction"];

  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<UserHistory[]>([]);

  const handleClose = () => {
    setHistory([]);
    hideModal("consumer-transaction");
  };

  useEffect(() => {
    if (!modal) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/history/user?id=${modal.id}`);
        const data = await res.json();
        setHistory(data.data);
      } catch (err) {
        console.error("Failed to fetch user history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (modal.id) {
      fetchHistory();
    }
  }, [modal]);

  return (
    <Dialog
      open={Boolean(modal?.show)}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            maxHeight: 735,
          },
        },
      }}
    >
      <DialogTitle
        component={"div"}
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography textTransform={"capitalize"} variant="h6">
          Consumer History
        </Typography>
        <IconButton
          onClick={handleClose}
          sx={{
            ":hover": {
              background: "transparent",
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <CircularProgress sx={{ display: "block", margin: "30px auto" }} />
        ) : history.length === 0 ? (
          <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>
            No history available
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ my: 1 }} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ py: 1.5 }}>Date</TableCell>
                  <TableCell sx={{ py: 1.5 }}>Coupon</TableCell>
                  <TableCell sx={{ py: 1.5 }}>Is Valid</TableCell>
                  <TableCell sx={{ py: 1.5 }}>Approval Status</TableCell>
                  <TableCell sx={{ py: 1.5 }}>Prize Category</TableCell>
                  <TableCell sx={{ py: 1.5 }}>Prize Name</TableCell>
                  <TableCell sx={{ py: 1.5 }}>Fulfillment Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((h, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ py: 1.5 }}>
                      {dayjs(h.created_at).format("DD/MM/YYYY HH:mm:ss")}
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>{h.coupon || "-"}</TableCell>
                    <TableCell sx={{ py: 1.5, textTransform: "capitalize" }}>
                      {h.is_valid || "-"}
                    </TableCell>
                    <TableCell sx={{ py: 1.5, textTransform: "capitalize" }}>
                      {h.approval_status || "-"}
                    </TableCell>
                    <TableCell sx={{ py: 1.5, textTransform: "capitalize" }}>
                      {h.prize_category || "-"}
                    </TableCell>
                    <TableCell sx={{ py: 1.5, textTransform: "capitalize" }}>
                      {h.prize_name || "-"}
                    </TableCell>
                    <TableCell sx={{ py: 1.5, textTransform: "capitalize" }}>
                      {h.fulfillment_status || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}

const ModalTransaction = React.memo(ModalTransactionComponent);
export default ModalTransaction;
