/* eslint-disable react-hooks/exhaustive-deps */
import useCustomFormik from "@/hooks/useCustomFormik";
import { useModalStore } from "@/stores/useModal";
import { useNotificationStore } from "@/stores/useNotification";
import { OptionList } from "@/types";
import Close from "@mui/icons-material/Close";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Form, FormikProvider, useField } from "formik";
import React from "react";
import { useSWRConfig } from "swr";

interface Option {
  id: number;
  name: string;
  value?: number;
}

// Komponen Autocomplete untuk Formik
const AutocompleteField = ({ name, options, disabled }: any) => {
  const [field, meta, helpers] = useField(name);

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(opt: Option) => opt.name}
      value={field.value} // langsung object atau null
      onChange={(e, newValue: Option | null) => helpers.setValue(newValue)}
      isOptionEqualToValue={(option: Option, value: Option) =>
        value ? option.id === value.id : false
      }
      renderInput={(params) => (
        <TextField
          {...params}
          error={meta.touched && Boolean(meta.error)}
          helperText={meta.touched && meta.error}
          size="small"
        />
      )}
    />
  );
};

function ModalTestingDataComponent({ keys }: { keys: string }) {
  const { modals, resetModals } = useModalStore();
  const modal = modals["testing-data-add"];
  const { notify } = useNotificationStore();
  const { mutate } = useSWRConfig();
  const [userOptions, setUserOptions] = React.useState<OptionList[]>([]);

  const formik = useCustomFormik({
    initialValues: {
      user: null as Option | null,
    },
    onSubmit: async (values) => {
      try {
        const url = `/api/developer-tools/testing-data/create?id=${values.user?.value}`;

        const response = await fetch(url, {
          method: "POST",
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

    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `/api/developer-tools/testing-data/userOption`,
          {
            method: "GET",
          }
        );
        if (!response.ok) throw new Error("Failed to fetch users");
        const res = await response.json();
        setUserOptions(res.data);
      } catch (error) {
        notify({
          type: "error",
          message: (error as Error).message,
          position: { vertical: "top", horizontal: "right" },
        });
      }
    };

    if (modal.type === "create") {
      fetchUsers();
    }
  }, [modal]);

  return (
    <Dialog
      open={modal ? modal.show : false}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: { sx: { maxHeight: 735 } },
      }}
    >
      <DialogTitle
        component={"div"}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography textTransform={"capitalize"} variant="h6">
          Add Tester
        </Typography>
        <IconButton
          onClick={handleClose}
          sx={{ ":hover": { background: "transparent" } }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <FormikProvider value={formik}>
          <Form>
            <Grid container spacing={2}>
              <Grid size={12}>
                <FormControl fullWidth>
                  <FormLabel sx={{ color: "inherit", fontWeight: 500, mb: 1 }}>
                    Select User
                  </FormLabel>
                  <AutocompleteField
                    name="user"
                    options={userOptions || []}
                    disabled={userOptions.length === 0}
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

export default React.memo(ModalTestingDataComponent);
