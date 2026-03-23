/* eslint-disable react-hooks/exhaustive-deps */
import { TextFieldDefault } from "@/components/base/Form/TextField";
import { useModalStore } from "@/stores/useModal";
import { useNotificationStore } from "@/stores/useNotification";
import { TestingDataDetail } from "@/types/developer-tools";
import Close from "@mui/icons-material/Close";
import {
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useSWRConfig } from "swr";

function ModalTestingDataViewComponent({ keys }: { keys: string }) {
  const { modals, hideModal } = useModalStore();
  const modal = modals["testingData-view"];
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<TestingDataDetail | null>(null);
  const { notify } = useNotificationStore();
  const { mutate } = useSWRConfig();

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
    hideModal("testingData-view");
  };

  const handleSubmit = async (isDelete: boolean) => {
    const deleteOrUpdate = isDelete ? "delete" : "update";
    try {
      const response = await fetch(
        `/api/developer-tools/testing-data/${deleteOrUpdate}?id=${modal.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const res = await response.json();

      if (response.ok) {
        mutate([keys]);
        notify({
          type: "success",
          message: res.message,
          position: { vertical: "top", horizontal: "right" },
        });
        handleClose();
      } else {
        notify({
          type: "error",
          message: res.message || "Something went wrong",
          position: { vertical: "top", horizontal: "right" },
        });
      }
    } catch (error) {
      notify({
        type: "error",
        message: (error as Error).message,
        position: { vertical: "top", horizontal: "right" },
      });
    }
  };

  useEffect(() => {
    if (!modal) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/developer-tools/testing-data/detail?id=${modal.id}`,
          {
            method: "GET",
          }
        );
        const data = await res.json();
        setDetail(data.data);
      } catch (err) {
        console.error("Failed to fetch testing data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (modal.id) {
      fetchHistory();
    }
  }, [modal]);

  const paginatedList =
    detail?.list?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) ||
    [];

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
          Tester Data Detail
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

      {/* --- Detail info --- */}
      <DialogContent>
        {loading ? (
          <CircularProgress sx={{ display: "block", margin: "30px auto" }} />
        ) : !detail ? (
          <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>
            No history available
          </Typography>
        ) : (
          <Grid container spacing={2}>
            <Grid size={{ xs: 4 }}>
              <FormLabel>Name</FormLabel>
              <TextFieldDefault
                size="small"
                fullWidth
                value={detail.name}
                placeholder="Name"
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <FormLabel>Sender</FormLabel>
              <TextFieldDefault
                size="small"
                fullWidth
                value={detail.sender}
                placeholder="Sender"
                inputMode="numeric"
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <FormLabel>Total Entries</FormLabel>
              <TextFieldDefault
                size="small"
                fullWidth
                value={detail.total_entries}
                placeholder="Total Entries"
                inputMode="numeric"
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <FormLabel>Total Winner</FormLabel>
              <TextFieldDefault
                size="small"
                fullWidth
                value={detail.total_winner}
                placeholder="Total Winner"
                inputMode="numeric"
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <FormLabel>Total Attachment</FormLabel>
              <TextFieldDefault
                size="small"
                fullWidth
                value={detail.total_attachment}
                placeholder="Total Attachment"
                inputMode="numeric"
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>

      {/* --- Table with pagination --- */}
      <DialogContent>
        {loading ? (
          <CircularProgress sx={{ display: "block", margin: "30px auto" }} />
        ) : !detail || (detail && detail.list.length === 0) ? (
          <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>
            No detail available
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ my: 1 }} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ py: 1.5 }}>Received Date</TableCell>
                    <TableCell sx={{ py: 1.5 }}>Created Date</TableCell>
                    <TableCell sx={{ py: 1.5 }}>Unique Code</TableCell>
                    <TableCell sx={{ py: 1.5 }}>Prize</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedList.map((d, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ py: 1.5 }}>
                        {dayjs(d.rcvd_time).format("DD/MM/YYYY HH:mm:ss")}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        {dayjs(d.created_at).format("DD/MM/YYYY HH:mm:ss")}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>{d.coupon}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>{d.prize}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5]}
                component="div"
                count={detail.list.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          variant="outlined"
          onClick={() => handleSubmit(false)}
          disabled={loading}
          sx={{ width: 200 }}
        >
          Change to Normal User
        </Button>
        <Button
          variant="contained"
          onClick={() => handleSubmit(true)}
          disabled={loading}
          sx={{ width: 130 }}
        >
          Delete Data
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const ModalTestingDataView = React.memo(ModalTestingDataViewComponent);
export default ModalTestingDataView;
