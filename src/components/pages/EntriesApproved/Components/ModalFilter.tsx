import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Close from "@mui/icons-material/Close";
import dayjs, { Dayjs } from "dayjs";

import { useModalStore } from "@/stores/useModal";
import { DatePickerDefault } from "@/components/base/Form/Date";
import { useFilterStore } from "@/stores/useFilter";
import { Filter } from "@/types";

export interface FilterFormValues {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  isValid: string | null;
  isValidAdmin: string | null;
  isApprovedAdmin: string | null;
}

function ModalFilterComponent() {
  const { modals, hideModal } = useModalStore();
  const { filter, setFilter } = useFilterStore();
  const modal = modals["entries-filter"];

  const [filters, setFilters] = React.useState<Omit<Filter, "key">>({
    startDate: filter.startDate ?? "",
    endDate: filter.endDate ?? "",
  });

  // Sync local state with global filter store
  React.useEffect(() => {
    setFilters({
      startDate: filter.startDate ?? "",
      endDate: filter.endDate ?? "",
    });
  }, [filter.startDate, filter.endDate]);

  const handleClose = () => {
    hideModal("entries-filter");
  };

  const handleReset = () => {
    const resetFilters = {
      startDate: "",
      endDate: "",
    };
    setFilters(resetFilters);
    setFilter(resetFilters);
    handleClose();
  };

  const handleApplyFilter = () => {
    setFilter(filters);
    handleClose();
  };

  const updateFilter = (key: keyof Filter, value: string | number | null) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === null ? undefined : value,
    }));
  };

  return (
    <Dialog
      open={Boolean(modal?.show)}
      maxWidth="sm"
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
          Filter Entries
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
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 6 }}>
            <DatePickerDefault
              size="small"
              fullWidth
              label="Start Date"
              value={
                filters.startDate === ""
                  ? null
                  : dayjs(filters.startDate as string)
              }
              onChange={(value: Dayjs | null) =>
                updateFilter(
                  "startDate",
                  dayjs(value).startOf("day").format("YYYY-MM-DD")
                )
              }
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <DatePickerDefault
              size="small"
              fullWidth
              label="End Date"
              disabled={!filters.startDate || filters.startDate === ""}
              value={
                filters.endDate === "" ? null : dayjs(filters.endDate as string)
              }
              onChange={(value: Dayjs | null) =>
                updateFilter(
                  "endDate",
                  dayjs(value).endOf("day").format("YYYY-MM-DD")
                )
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ pb: 2.5, px: 3, gap: 1 }}>
        <Button variant="outlined" onClick={handleReset} sx={{ width: 125 }}>
          Reset
        </Button>
        <Button
          variant="contained"
          onClick={handleApplyFilter}
          sx={{ width: 125 }}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const ModalFilter = React.memo(ModalFilterComponent);
export default ModalFilter;
