/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useSWRConfig } from "swr";
import { FastField, Field, Form, FormikProvider } from "formik";
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
import InputAdornment from "@mui/material/InputAdornment";
import Close from "@mui/icons-material/Close";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import { useNotificationStore } from "@/stores/useNotification";
import { useModalStore } from "@/stores/useModal";
import { Roles } from "@/types";
import useCustomFormik from "@/hooks/useCustomFormik";
import { TextFieldValidation } from "@/components/base/Form/TextField";
import { SelectValidation } from "@/components/base/Form/Select";
import { UserCreateSchema, UserUpdateSchema } from "../TestingCoupon.schema";

function ModalUsersComponent({
  keys,
  roles,
}: {
  keys: string;
  roles: Roles[];
}) {
  const { mutate } = useSWRConfig();
  const { modals, resetModals } = useModalStore();
  const modal = modals["users"];
  const { notify } = useNotificationStore();
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const schema =
    modal && modal.type === "update" ? UserUpdateSchema : UserCreateSchema;

  const formik = useCustomFormik({
    initialValues: {
      username: "",
      fullname: "",
      roleId: 0,
      status: 1,
      oldPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const body = {
        username: values.username,
        fullname: values.fullname,
        roleId: values.roleId,
        status: values.status,
        oldPassword: values.oldPassword,
        password: values.newPassword,
      };
      try {
        const url =
          modal.type === "create"
            ? "/api/settings/users/create"
            : `/api/settings/users/update?id=${modal.id}`;

        const response = await fetch(url, {
          method: "POST",
          body: JSON.stringify(body),
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

    const fetchUser = async () => {
      try {
        const response = await fetch(
          `/api/settings/users/detail?id=${modal.id}`,
          {
            method: "GET",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const res = await response.json();
        const { data } = res;

        formik.setValues({
          username: data.username ?? "",
          fullname: data.fullname ?? "",
          roleId: data.roleId ?? 0,
          status: data.status ?? 1,
          oldPassword: "",
          newPassword: "",
          newPasswordConfirm: "",
        });
      } catch (error) {
        notify({
          type: "error",
          message: (error as Error).message,
          position: { vertical: "top", horizontal: "right" },
        });
      }
    };

    if (modal.id) {
      fetchUser();
    }
  }, [modal]);

  return (
    <Dialog
      open={modal ? modal.show : false}
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
          {modal ? modal.type : ""} Users
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
          <Form autoComplete="off">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <FormLabel sx={{ color: "inherit", fontWeight: 500, mb: 1 }}>
                    Username
                  </FormLabel>
                  <FastField
                    size="small"
                    component={TextFieldValidation}
                    name="username"
                    placeholder="Username"
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <FormLabel sx={{ color: "inherit", fontWeight: 500, mb: 1 }}>
                    Fullname
                  </FormLabel>
                  <FastField
                    size="small"
                    component={TextFieldValidation}
                    name="fullname"
                    placeholder="Fullname"
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth>
                  <FormLabel sx={{ color: "inherit", fontWeight: 500, mb: 1 }}>
                    Role
                  </FormLabel>
                  <FastField
                    size="small"
                    value={formik.values.roleId}
                    component={SelectValidation}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      formik.setFieldValue("roleId", e.target.value);
                    }}
                    name="roleId"
                    placeholder="Select Role"
                    options={roles}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
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

              {modal && modal.type === "update" && (
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <FormLabel
                      sx={{ color: "inherit", fontWeight: 500, mb: 1 }}
                    >
                      Old Password
                    </FormLabel>
                    <Field
                      size="small"
                      component={TextFieldValidation}
                      name="oldPassword"
                      placeholder="Old Password"
                      type={showPassword ? "text" : "password"}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={
                                  showPassword
                                    ? "hide the password"
                                    : "display the password"
                                }
                                onClick={handleShowPassword}
                                edge="end"
                              >
                                {showPassword ? (
                                  <VisibilityOutlined />
                                ) : (
                                  <VisibilityOffOutlined />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </FormControl>
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <FormLabel sx={{ color: "inherit", fontWeight: 500, mb: 1 }}>
                    New Password
                  </FormLabel>
                  <Field
                    size="small"
                    component={TextFieldValidation}
                    name="newPassword"
                    placeholder="New Password"
                    type={showPassword ? "text" : "password"}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={
                                showPassword
                                  ? "hide the password"
                                  : "display the password"
                              }
                              onClick={handleShowPassword}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOutlined />
                              ) : (
                                <VisibilityOffOutlined />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <FormLabel sx={{ color: "inherit", fontWeight: 500, mb: 1 }}>
                    New Password Confirm
                  </FormLabel>
                  <Field
                    size="small"
                    component={TextFieldValidation}
                    name="newPasswordConfirm"
                    placeholder="New Password Cofirm"
                    type={showPassword ? "text" : "password"}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={
                                showPassword
                                  ? "hide the password"
                                  : "display the password"
                              }
                              onClick={handleShowPassword}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOutlined />
                              ) : (
                                <VisibilityOffOutlined />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
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

const ModalUsers = React.memo(ModalUsersComponent);
export default ModalUsers;
