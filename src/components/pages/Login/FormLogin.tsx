import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FastField, Field, Form, FormikProvider } from "formik";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import HttpsOutlined from "@mui/icons-material/HttpsOutlined";
import PersonOutlineOutlined from "@mui/icons-material/PersonOutlineOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { APP_NAME } from "@/lib/common/constant";
import { TextFieldValidation } from "@/components/base/Form/TextField";
import useCustomFormik from "@/hooks/useCustomFormik";
import { useNotificationStore } from "@/stores/useNotification";
import { LoginSchema } from "@/components/pages/Login/Login.schema";

export default function FormLogin() {
  const router = useRouter();
  const { notify } = useNotificationStore();
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const createNotif = (type: "success" | "error", message: string) =>
    notify({
      type,
      message,
      position: { vertical: "top", horizontal: "right" },
    });

  const formik = useCustomFormik({
    initialValues: { username: "", password: "" },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const resJson = await response.json();

        if (response.ok) {
          createNotif("success", "Login Berhasil");
          router.push("/login/redirect");
        } else {
          createNotif("error", resJson.message);
        }
      } catch (error: unknown) {
        console.error(error);
        createNotif("error", "Terjadi Kesalahan, Silakan Coba Lagi Nanti");
      }
    },
  });

  return (
    <Card
      sx={{
        width: 360,
        maxWidth: "95vw", // Responsive
        background: "white",
        borderRadius: 4,
        padding: 2,
        // Static shadow that doesn't change on hover
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        transition: "none", // Disable transition
        // Force no lift and no shadow change
        "&:hover": {
          transform: "none !important",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1) !important",
        },
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          alignItems: "center",
        }}
      >
        <Image
          src="/images/logo.png"
          width={180}
          height={180}
          alt="redbox logo"
          priority
        />
        <Typography variant="h6" textAlign="center" mt={2}>
          {APP_NAME}
        </Typography>
        <FormikProvider value={formik}>
          <Form autoComplete="off">
            <Grid container spacing={2} width={"100%"} mt={2}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <FastField
                    component={TextFieldValidation}
                    size="small"
                    name="username"
                    placeholder="Username"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlineOutlined />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <Field
                    component={TextFieldValidation}
                    size="small"
                    name="password"
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <HttpsOutlined />
                          </InputAdornment>
                        ),
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
                <Button
                  variant="contained"
                  type="submit"
                  fullWidth
                  disabled={
                    !formik.dirty || !formik.isValid || formik.isSubmitting
                  }
                >
                  {formik.isSubmitting ? "Loading..." : "Login"}
                </Button>
              </Grid>
            </Grid>
          </Form>
        </FormikProvider>
      </CardContent>
    </Card>
  );
}
