import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Close from "@mui/icons-material/Close";
import Table from "@mui/material/Table";
import FormLabel from "@mui/material/FormLabel";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import { useModalStore } from "@/stores/useModal";
import { formatToIDR } from "@/lib/utils";
import Grid from "@mui/material/Grid";
import { TextFieldDefault } from "@/components/base/Form/TextField";
import dayjs from "dayjs";
import { TopupHistory } from "@/types";
import { useNotificationStore } from "@/stores/useNotification";
import { mutate } from "swr";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { TablePagination, Tooltip } from "@mui/material";

function ModalTransactionComponent({ keys }: { keys: string }) {
  const { modals, hideModal } = useModalStore();
  const { notify } = useNotificationStore();
  const modal = modals["winner-transaction"];

  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<TopupHistory | null>(null);
  const [topup, isTopup] = useState<boolean>(false);
  const [isFailedTopup, setIsFailedTopup] = useState<boolean>(false);

  // --- Pagination state ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClose = () => {
    setHistory(null);
    hideModal("winner-transaction");
    isTopup(false);
  };

  useEffect(() => {
    if (!modal) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/winner/history?id=${modal.id}`);
        const data = await res.json();
        setHistory(data.data);
      } catch (err) {
        console.error("Failed to fetch winner history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (modal.id) {
      fetchHistory();
    }
  }, [modal]);

  useEffect(() => {
    if (!history) return;

    if (history.list.length > 0) {
      for (let i = 0; i < history.list.length; i++) {
        const status = history.list[i].status;
        if (status === 3) {
          setIsFailedTopup(true);
          break;
        } else {
          setIsFailedTopup(false);
          break;
        }
      }
    }
  }, [history]);

  const disableEdit =
    history && history.is_approved === 1 && [3].includes(history.status)
      ? false
      : true;

  const handleEdit = () => {
    isTopup(true);
  };

  const handleChangeTopup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setHistory((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        hp: value,
      } as TopupHistory;
    });
  };

  const handleTopup = async () => {
    if (!modal?.id || !history?.hp) {
      notify({ message: "Missing required data", type: "error" });
      return;
    }

    try {
      const res = await fetch("/api/winner/retopup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: modal.id,
          hp: history.hp,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        notify({ message: "Success Topup", type: "success" });
        mutate([keys]);
        handleClose();
      } else {
        notify({
          message: result?.message || "Topup failed",
          type: "error",
        });
      }
    } catch (error: unknown) {
      console.error("Failed to execute topup:", error);
      notify({ message: "Internal Server Error", type: "error" });
    }
  };

  const paginatedList =
    history?.list?.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    ) || [];

  return (
    <Dialog
      open={Boolean(modal?.show)}
      maxWidth="md"
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
          Balance History
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
        ) : !history ? (
          <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>
            No history available
          </Typography>
        ) : (
          <Grid container spacing={2}>
            <Grid size={{ xs: 4 }}>
              <FormLabel>Received Date</FormLabel>
              <TextFieldDefault
                size="small"
                value={dayjs(history.rcvd_time).format("DD/MM/YYYY HH:mm:ss")}
                fullWidth
                placeholder="Received Date"
                disabled
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <FormLabel>Fullname</FormLabel>
              <TextFieldDefault
                size="small"
                fullWidth
                value={history.fullname}
                placeholder="Fullname"
                disabled
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <FormLabel>Identity</FormLabel>
              <TextFieldDefault
                size="small"
                fullWidth
                value={history.identity}
                placeholder="Identity"
                disabled
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <FormLabel>Account Number</FormLabel>
              <TextFieldDefault
                size="small"
                fullWidth
                value={history.hp}
                placeholder="HP"
                inputMode="numeric"
                disabled={!topup}
                onChange={handleChangeTopup}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <FormLabel>City</FormLabel>
              <TextFieldDefault
                size="small"
                fullWidth
                value={history.regency}
                placeholder="City"
                disabled
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <FormLabel>Status</FormLabel>
              <TextFieldDefault
                size="small"
                fullWidth
                value={history.status_text.toUpperCase()}
                placeholder="Status"
                disabled
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormLabel>Prize</FormLabel>
              <TextFieldDefault
                size="small"
                fullWidth
                value={history.prize}
                placeholder="Prize"
                disabled
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormLabel>Prize Type</FormLabel>
              <TextFieldDefault
                size="small"
                fullWidth
                value={history.voucher}
                placeholder="Prize Type"
                disabled
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <FormLabel>Store</FormLabel>
              <TextFieldDefault
                size="small"
                fullWidth
                value={history.store}
                placeholder="Store"
                disabled
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <FormLabel>Reason Reject</FormLabel>
              <TextFieldDefault
                size="small"
                fullWidth
                value={history.reason}
                placeholder="Reason Reject"
                disabled
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogContent>
        {loading ? (
          <CircularProgress sx={{ display: "block", margin: "30px auto" }} />
        ) : !history || (history && history.list.length === 0) ? (
          <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>
            No history available
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ my: 1 }} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ py: 1.5 }}>Date</TableCell>
                  <TableCell sx={{ py: 1.5 }}>Reference</TableCell>
                  <TableCell sx={{ py: 1.5 }}>Reason</TableCell>
                  <TableCell sx={{ py: 1.5 }}>Code</TableCell>
                  <TableCell sx={{ py: 1.5 }}>Serial Number</TableCell>
                  <TableCell sx={{ py: 1.5 }}>Amount</TableCell>
                  <TableCell sx={{ py: 1.5 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedList.map((h, index) => (
                  <TableRow key={index}>
                    <TableCell
                      sx={{
                        py: 1.5,
                        maxWidth: 150,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <Tooltip
                        title={dayjs(h.created_at).format(
                          "DD/MM/YYYY HH:mm:ss"
                        )}
                      >
                        <span>
                          {dayjs(h.created_at).format("DD/MM/YYYY HH:mm:ss")}
                        </span>
                      </Tooltip>
                    </TableCell>

                    <TableCell
                      sx={{
                        py: 1.5,
                        maxWidth: 150,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <Tooltip title={h.reference}>
                        <span>{h.reference}</span>
                      </Tooltip>
                    </TableCell>

                    <TableCell
                      sx={{
                        py: 1.5,
                        maxWidth: 200,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <Tooltip title={h.reason}>
                        <span>{h.reason}</span>
                      </Tooltip>
                    </TableCell>

                    <TableCell
                      sx={{
                        py: 1.5,
                        maxWidth: 100,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <Tooltip title={h.code}>
                        <span>{h.code}</span>
                      </Tooltip>
                    </TableCell>

                    <TableCell
                      sx={{
                        py: 1.5,
                        maxWidth: 150,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <Tooltip title={h.tr_id}>
                        <span>{h.tr_id}</span>
                      </Tooltip>
                    </TableCell>

                    <TableCell sx={{ py: 1.5 }}>
                      {formatToIDR(h.amount)}
                    </TableCell>

                    <TableCell sx={{ py: 1.5 }}>
                      {h.status_text.toUpperCase()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5]}
              component="div"
              count={history.list.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={handleEdit}
          disabled={disableEdit}
          sx={{ width: 150 }}
        >
          Edit
        </Button>
        <Button
          variant="contained"
          color="info"
          onClick={handleTopup}
          disabled={
            !isFailedTopup ||
            history?.is_approved === 0 ||
            history?.is_approved === 2
          }
          loading={loading}
          sx={{ width: 150 }}
          startIcon={<AutorenewIcon />}
        >
          Re-Topup
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const ModalTransaction = React.memo(ModalTransactionComponent);
export default ModalTransaction;
