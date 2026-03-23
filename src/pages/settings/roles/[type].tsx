import React from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { GetServerSidePropsContext, NextApiRequest } from "next";
import DashboardLayout from "@/components/base/Layout";
import { getLoginSession } from "@/lib/auth/session";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { APP_NAME } from "@/lib/common/constant";
import { getRolesById } from "@/pages/api/settings/roles/_model";
import { getMenuList } from "@/pages/api/settings/menu/_model";
import { Menu, RoleMenu, RolesDetail } from "@/types";
import useCustomFormik from "@/hooks/useCustomFormik";
import {
  FieldArray,
  Form,
  FormikProps,
  FormikProvider,
  FastField,
} from "formik";
import { TextFieldValidation } from "@/components/base/Form/TextField";
import { SelectValidation } from "@/components/base/Form/Select";
import { useNotificationStore } from "@/stores/useNotification";
import { useDashboardStore } from "@/stores/useDashboard";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

interface RolesCRUDProps {
  type: "create" | "update";
  detail: RolesDetail;
}

const MenuRow = React.memo(function MenuRow({
  menu,
  idx,
  formik,
}: {
  menu: RoleMenu;
  idx: number;
  formik: FormikProps<{ role: string; status: 0 | 1; menu: RoleMenu[] }>;
}) {
  return (
    <TableRow key={menu.menuId}>
      <TableCell>{menu.menu}</TableCell>
      <TableCell key={"m_insert"}>
        <Checkbox
          checked={formik.values.menu[idx].m_insert === 1 ? true : false}
          onChange={(e) =>
            formik.setFieldValue(
              `menu[${idx}].m_insert`,
              e.target.checked ? 1 : 0
            )
          }
        />
      </TableCell>
      <TableCell key={"m_update"}>
        <Checkbox
          checked={formik.values.menu[idx].m_update === 1 ? true : false}
          onChange={(e) =>
            formik.setFieldValue(
              `menu[${idx}].m_update`,
              e.target.checked ? 1 : 0
            )
          }
        />
      </TableCell>
      <TableCell key={"m_delete"}>
        <Checkbox
          checked={formik.values.menu[idx].m_delete === 1 ? true : false}
          onChange={(e) =>
            formik.setFieldValue(
              `menu[${idx}].m_delete`,
              e.target.checked ? 1 : 0
            )
          }
        />
      </TableCell>
      <TableCell key={"m_view"}>
        <Checkbox
          checked={formik.values.menu[idx].m_view === 1 ? true : false}
          onChange={(e) =>
            formik.setFieldValue(
              `menu[${idx}].m_view`,
              e.target.checked ? 1 : 0
            )
          }
        />
      </TableCell>
    </TableRow>
  );
});

export default function RolesCRUD(props: RolesCRUDProps) {
  const { notify } = useNotificationStore();
  const { resetDashboard } = useDashboardStore();
  const navigate = useRouter();
  const { type, detail } = props;

  const formik = useCustomFormik({
    initialValues: {
      role: detail.role ?? "",
      status: detail.status ?? 0,
      menu: detail.menu,
    },
    onSubmit: async (values) => {
      try {
        const url =
          type === "create"
            ? "/api/settings/roles/create"
            : `/api/settings/roles/update?id=${detail.id}`;

        const response = await fetch(url, {
          method: "POST",
          body: JSON.stringify(values),
          headers: { "Content-Type": "application/json" },
        });

        const res = await response.json();

        if (response.ok) {
          notify({
            type: "success",
            message: res.message,
            position: { vertical: "top", horizontal: "right" },
          });
          resetDashboard();
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
    navigate.back();
  };

  const handleSubmit = () => {
    formik.submitForm();
  };

  return (
    <>
      <Head>
        <title>{`Roles Settings - ${APP_NAME}`}</title>
      </Head>
      <Container disableGutters maxWidth={false} sx={{ height: "100%" }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Stack
              flexDirection={"column"}
              justifyContent={"space-between"}
              alignItems={"start"}
              gap={2}
            >
              <Typography variant="h4" textTransform={"capitalize"}>
                {type} Roles
              </Typography>
              <Stack
                flexDirection={"row"}
                justifyContent={"end"}
                alignItems={"center"}
                alignSelf={"end"}
                gap={2}
              >
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  sx={{ width: 150 }}
                  startIcon={<ArrowBackRoundedIcon />}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  sx={{ width: 150 }}
                >
                  Save
                </Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormikProvider value={formik}>
              <Form>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <FormControl fullWidth>
                      <FormLabel
                        sx={{ color: "inherit", fontWeight: 500, mb: 1 }}
                      >
                        Role Name
                      </FormLabel>
                      <FastField
                        size="small"
                        component={TextFieldValidation}
                        name="role"
                        placeholder="Role Name"
                      />
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FormControl fullWidth>
                      <FormLabel
                        sx={{ color: "inherit", fontWeight: 500, mb: 1 }}
                      >
                        Menu Status
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
                  <Grid size={{ xs: 12 }}>
                    <FieldArray name="menu">
                      {() => (
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Menu</TableCell>
                              <TableCell>Insert</TableCell>
                              <TableCell>Update</TableCell>
                              <TableCell>Delete</TableCell>
                              <TableCell>View</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {formik.values.menu.map((item, idx) => (
                              <MenuRow
                                key={item.menuId}
                                menu={item}
                                idx={idx}
                                formik={formik}
                              />
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </FieldArray>
                  </Grid>
                </Grid>
              </Form>
            </FormikProvider>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req, query } = context;

  const session = await getLoginSession(req as NextApiRequest);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  let rolesDetail: RolesDetail | null = null;

  if (query.type === "create") {
    const menus = await getMenuList({ key: "", column: "", direction: "asc" });
    rolesDetail = {
      id: 0,
      role: "",
      status: 0,
      status_text: "active",
      menu: menus.list.map((m: Menu) => ({
        menuId: m.id,
        menu: m.menu,
        m_insert: 0,
        m_update: 0,
        m_delete: 0,
        m_view: 0,
      })),
    };
  }
  if (query.type === "update") {
    const { id } = query;
    rolesDetail = await getRolesById(parseInt(id as string));
  }

  return {
    props: {
      type: query.type,
      detail: rolesDetail ?? null,
    },
  };
}

RolesCRUD.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
