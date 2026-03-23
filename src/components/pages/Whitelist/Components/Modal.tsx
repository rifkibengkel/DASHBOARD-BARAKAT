/* eslint-disable react-hooks/exhaustive-deps */
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
import { WhiteListSchema } from "../Whitelist.schema";

function ModalWhitelistComponent({ keys }: { keys: string }) {
  const { modals, resetModals } = useModalStore();
  const modal = modals["whitelist"];
  const { notify } = useNotificationStore();
  const { mutate } = useSWRConfig();

  const formik = useCustomFormik({
    initialValues: {
      name: "",
      sender: "",
      id_number: "",
      is_tester: 0,
      status: 0,
    },
    validationSchema: WhiteListSchema,
    onSubmit: async (values) => {
      try {
        const url =
          modal.type === "create"
            ? "/api/whitelist/create"
            : `/api/whitelist/update?id=${modal.id}`;

        const response = await fetch(url, {
          method: "POST",
          body: JSON.stringify(values),
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
    resetModals();
  };

  const handleSubmit = () => {
    formik.submitForm();
  };

  React.useEffect(() => {
    if (!modal) return;

    const fetchMenu = async () => {
      try {
        const response = await fetch(`/api/whitelist/detail?id=${modal.id}`, {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const res = await response.json();
        const { data } = res;

        formik.setValues({
          name: data.name ?? "",
          sender: data.sender ?? "",
          id_number: data.id_number ?? "",
          is_tester: data.is_tester ?? 0,
          status: data.status ?? 0,
        });
      } catch (error) {
        notify({
          type: "error",
          message: (error as Error).message,
          position: { vertical: "top", horizontal: "right" },
        });
      }
    };

    if (modal.type === "update") {
      fetchMenu();
    }
  }, [modal]);

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
          {modal ? modal.type : ""} Whitelist
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
                    {" "}
                    Name
                  </FormLabel>
                  <FastField
                    size="small"
                    component={TextFieldValidation}
                    name="name"
                    placeholder="Name"
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <FormLabel sx={{ color: "inherit", fontWeight: 500, mb: 1 }}>
                    Sender
                  </FormLabel>
                  <FastField
                    size="small"
                    component={TextFieldValidation}
                    name="sender"
                    placeholder="Sender"
                    inputMode="numeric"
                  />
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <FormLabel sx={{ color: "inherit", fontWeight: 500, mb: 1 }}>
                    Is Tester?
                  </FormLabel>
                  <FastField
                    size="small"
                    value={formik.values.is_tester}
                    component={SelectValidation}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      formik.setFieldValue("is_tester", e.target.value)
                    }
                    name="is_tester"
                    options={[
                      { id: 0, name: "Tidak" },
                      { id: 1, name: "Ya" },
                    ]}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <FormLabel sx={{ color: "inherit", fontWeight: 500, mb: 1 }}>
                    Status
                  </FormLabel>
                  <FastField
                    size="small"
                    value={formik.values.status}
                    component={SelectValidation}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      formik.setFieldValue("status", e.target.value)
                    }
                    name="status"
                    options={[
                      { id: 0, name: "Inactive" },
                      { id: 1, name: "Active" },
                    ]}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions sx={{ pb: 2.5, px: 3 }}>
        <Button
          variant="text"
          onClick={handleClose}
          sx={{
            width: 125,
          }}
        >
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

const ModalWhitelist = React.memo(ModalWhitelistComponent);
export default ModalWhitelist;
