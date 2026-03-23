import React from "react";
import { useSWRConfig } from "swr";
import { FastField, Form, FormikProvider } from "formik";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Close from "@mui/icons-material/Close";

import { useModalStore } from "@/stores/useModal";
import { useNotificationStore } from "@/stores/useNotification";
import useCustomFormik from "@/hooks/useCustomFormik";
import { TextFieldValidation } from "@/components/base/Form/TextField";
import { SelectValidation } from "@/components/base/Form/Select";
import { AllocationSchema } from "../Allocation.schema";
import { DatePickerValidation } from "@/components/base/Form/Date";
import { BaseQueryResult } from "@/types";
import dayjs from "dayjs";

function ModalAllocationComponent({
  keys,
  prizeList,
  regionList,
  storeList,
}: {
  keys: string;
  prizeList: BaseQueryResult[];
  regionList: BaseQueryResult[];
  storeList: BaseQueryResult[];
}) {
  // Map prizeList to convert 'hadiah' field to 'name' for dropdown
  const mappedPrizeList = React.useMemo(() => {
    return prizeList.map((prize: any) => ({
      id: prize.id,
      name: prize.hadiah || prize.name, // Use 'hadiah' field as 'name'
    }));
  }, [prizeList]);

  const mappedRegionList = React.useMemo(() => {
    return [{ id: 0, name: "All" }, ...regionList];
  }, [regionList]);

  const mappedStoreList = React.useMemo(() => {
    return [{ id: 0, name: "All" }, ...storeList];
  }, [storeList]);

  const { modals, hideModal } = useModalStore();
  const modal = modals["allocation"];
  const { notify } = useNotificationStore();
  const { mutate } = useSWRConfig();

  const formik = useCustomFormik({
    initialValues: {
      allocation_date: null,
      regionId: 0,
      storeId: 0,
      prizeId: 0,
      quantity: 0,
    },
    validationSchema: AllocationSchema,
    onSubmit: async (values) => {
      try {
        const url = "/api/allocation/create";

        const response = await fetch(url, {
          method: "POST",
          body: JSON.stringify({
            ...values,
            allocation_date: dayjs(values.allocation_date).format("YYYY-MM-DD"),
          }),
          headers: { "Content-Type": "application/json" },
        });

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
    },
  });

  const handleClose = () => {
    formik.resetForm();
    hideModal("allocation");
  };

  const handleSubmit = () => {
    formik.submitForm();
  };

  return (
    <Dialog
      open={modal ? modal.show : false}
      maxWidth="xs"
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
          Create Allocation
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
        <FormikProvider value={formik}>
          <Form>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <FormLabel sx={{ color: "inherit", fontWeight: 500, mb: 1 }}>
                    Prize
                  </FormLabel>
                  <FastField
                    size="small"
                    value={formik.values.prizeId}
                    component={SelectValidation}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      formik.setFieldValue("prizeId", e.target.value)
                    }
                    name="prizeId"
                    placeholder="Select Prize"
                    options={mappedPrizeList}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <FormLabel sx={{ color: "inherit", fontWeight: 500, mb: 1 }}>
                    Allocation Date
                  </FormLabel>
                  <FastField
                    size="small"
                    component={DatePickerValidation}
                    name="allocation_date"
                    placeholder="Allocation Date"
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <FormLabel sx={{ color: "inherit", fontWeight: 500, mb: 1 }}>
                    Quantity
                  </FormLabel>
                  <FastField
                    size="small"
                    component={TextFieldValidation}
                    name="quantity"
                    inputMode="numeric"
                  />
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <FormLabel sx={{ color: "inherit", fontWeight: 500, mb: 1 }}>
                    Region{" "}
                    <span style={{ fontSize: "0.75rem", color: "#9e9e9e" }}>
                      (Optional)
                    </span>
                  </FormLabel>
                  <FastField
                    size="small"
                    value={formik.values.regionId}
                    component={SelectValidation}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      formik.setFieldValue("regionId", e.target.value)
                    }
                    name="regionId"
                    placeholder="Select Region"
                    options={mappedRegionList}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <FormLabel sx={{ color: "inherit", fontWeight: 500, mb: 1 }}>
                    Store{" "}
                    <span style={{ fontSize: "0.75rem", color: "#9e9e9e" }}>
                      (Optional)
                    </span>
                  </FormLabel>
                  <FastField
                    size="small"
                    value={formik.values.storeId}
                    component={SelectValidation}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      formik.setFieldValue("storeId", e.target.value)
                    }
                    name="storeId"
                    placeholder="Select Store"
                    options={mappedStoreList}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions sx={{ pb: 2.5, px: 3 }}>
        <Button variant="text" onClick={handleClose} sx={{ width: 125 }}>
          Kembali
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ width: 125 }}
          disabled={formik.isSubmitting || formik.isValidating || !formik.dirty}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const ModalAllocation = React.memo(ModalAllocationComponent);
export default ModalAllocation;
