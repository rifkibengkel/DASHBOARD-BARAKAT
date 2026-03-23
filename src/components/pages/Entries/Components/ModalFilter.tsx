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
import { SelectDefault } from "@/components/base/Form/Select";
import { useFilterStore } from "@/stores/useFilter";
import { Filter } from "@/types";

export interface FilterFormValues {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  isValid: string | null;
  isValidAdmin: string | null;
  isApprovedAdmin: string | null;
}

const validOptions = [
  { id: -1, name: "All" },
  { id: "1", name: "Valid" },
  { id: "0", name: "Invalid" },
  { id: "2", name: "Is Valid Proccess" },
];

const prizeCategoryOptions = [
  { id: -1, name: "All" },
  { id: 1, name: "Hadiah Fisik" },
  { id: 2, name: "Hadiah Digital" },
  { id: 99, name: "Tidak Beruntung" },
];

const approveOptions = [
  { id: -1, name: "All" },
  { id: "0", name: "Unprocessed" },
  { id: "1", name: "Approved" },
  { id: "2", name: "Rejected" },
];

function ModalFilterComponent() {
  const { modals, hideModal } = useModalStore();
  const { filter, setFilter } = useFilterStore();
  const modal = modals["entries-filter"];

  const [filters, setFilters] = React.useState<Omit<Filter, "key">>({
    startDate: filter.startDate ?? "",
    endDate: filter.endDate ?? "",
    isValid: filter.isValid ?? -1,
    isValidAdmin: filter.isValidAdmin ?? -1,
    isApprovedAdmin: filter.isApprovedAdmin ?? -1,
    prizeCategoryId: filter.prizeCategoryId ?? -1,
  });

  // Sync local state with global filter store
  React.useEffect(() => {
    setFilters({
      startDate: filter.startDate ?? "",
      endDate: filter.endDate ?? "",
      isValid: filter.isValid ?? -1,
      isValidAdmin: filter.isValidAdmin ?? -1,
      isApprovedAdmin: filter.isApprovedAdmin ?? -1,
      prizeCategoryId: filter.prizeCategoryId ?? -1,
    });
  }, [
    filter.startDate,
    filter.endDate,
    filter.isValid,
    filter.isValidAdmin,
    filter.isApprovedAdmin,
    filter.prizeCategoryId,
  ]);

  const handleClose = () => {
    hideModal("entries-filter");
  };

  const handleReset = () => {
    const resetFilters = {
      startDate: "",
      endDate: "",
      isValid: -1,
      isValidAdmin: -1,
      isApprovedAdmin: -1,
      prizeCategoryId: -1,
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
          <Grid size={{ xs: 12 }}>
            <SelectDefault
              fullWidth
              options={validOptions}
              size="small"
              label="Is Valid"
              value={filters.isValid}
              onChange={(e) => updateFilter("isValid", e.target.value || null)}
            />
          </Grid>
          {/* <Grid size={{ xs: 12 }}>
            <SelectDefault
              fullWidth
              options={validAdminOptions}
              size="small"
              label="Is Valid Admin"
              value={filters.isValidAdmin}
              onChange={(e) =>
                updateFilter("isValidAdmin", e.target.value || null)
              }
            />
          </Grid> */}
          <Grid size={{ xs: 12 }}>
            <SelectDefault
              fullWidth
              options={approveOptions}
              size="small"
              label="Is Approve Admin"
              value={filters.isApprovedAdmin}
              onChange={(e) =>
                updateFilter("isApprovedAdmin", e.target.value || null)
              }
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SelectDefault
              fullWidth
              options={prizeCategoryOptions}
              size="small"
              label="Prize Category"
              value={filters.prizeCategoryId}
              onChange={(e) =>
                updateFilter("prizeCategoryId", e.target.value || null)
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
