/* eslint-disable react-hooks/exhaustive-deps */
import DashboardLayout from "@/components/base/Layout";
import { getLoginSession } from "@/lib/auth/session";
import { APP_NAME } from "@/lib/common/constant";
import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FastField, Form, FormikProvider } from "formik";
import { GetServerSidePropsContext, NextApiRequest } from "next";
import dynamic from "next/dynamic";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import Head from "next/head";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { getEntriesDetail } from "../api/entries/[params]";
import { getProduct } from "../api/master/_model";
// import Divider from '@mui/material/Divider';
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
// import Table from '@mui/material/Table';
// import TableHead from '@mui/material/TableHead';
// import TableRow from '@mui/material/TableRow';
// import TableCell from '@mui/material/TableCell';
// import TableBody from '@mui/material/TableBody';
// import IconButton from '@mui/material/IconButton';
// import DeleteIcon from '@mui/icons-material/Delete';
import { CardDefault } from "@/components/base/Card";
import { TextFieldValidation } from "@/components/base/Form/TextField";
import ImageViewer from "@/components/base/Viewer";
import useCustomFormik from "@/hooks/useCustomFormik";
import {
  BaseQueryResult,
  EntriesDetail,
  EntriesDetailImage,
  EntriesDetailVariant,
} from "@/types";
import dayjs from "dayjs";
import { getInvalidReasonList } from "../api/master/[params]";
// import { TimePickerValidation } from '@/components/base/Form/Time';
import { SelectValidation } from "@/components/base/Form/Select";
import { entrySchema } from "@/components/pages/Entries/Entries.schema";
import { useModalStore } from "@/stores/useModal";
// import { formatNumber } from '@/lib/utils';
import { disabledTextBlack } from "@/lib/utils";
import { useNotificationStore } from "@/stores/useNotification";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

const ModalAddItem = dynamic(
  () => import("@/components/pages/Entries/Components/ModalAddItem")
);
const ModalCompare = dynamic(
  () => import("@/components/pages/Entries/Components/ModalCompare")
);
const ModalReject = dynamic(
  () => import("@/components/pages/Entries/Components/ModalReject")
);

interface Product {
  id: number;
  name: string;
}

interface EntriesDetailProps {
  invalidReason: BaseQueryResult[];
  entriesData: {
    entries: EntriesDetail;
    entriesImage: EntriesDetailImage[];
    entriesVariant: EntriesDetailVariant[];
  };
  products: Product[];
  type: string;
}

export default function EntriesDetailPage({
  invalidReason,
  entriesData,
  products,
  type,
}: EntriesDetailProps) {
  const navigate = useRouter();
  const { showModal } = useModalStore();
  const { notify } = useNotificationStore();

  const [invalidImage, setInvalidImage] = React.useState<string>("");
  const [container, setContainer] = React.useState<HTMLElement | null>(null);

  const formik = useCustomFormik({
    initialValues: {
      name: entriesData.entries.fullname,
      sender: entriesData.entries.sender,
      media: entriesData.entries.media,
      id_number: entriesData.entries.id_number,
      regency: entriesData.entries.regency,
      rcvd_time: entriesData.entries.rcvd_time
        ? dayjs(entriesData.entries.rcvd_time)
        : null,
      store: entriesData.entries.store,
      coupon: entriesData.entries.coupon,
      prize: entriesData.entries.prize,
      purchase_date: entriesData.entries.purchase_date_admin
        ? dayjs(entriesData.entries.purchase_date_admin)
        : null,
      purchase_time: entriesData.entries.purchase_date_admin
        ? dayjs(entriesData.entries.purchase_date_admin)
        : null,
      store_name: entriesData.entries.store_name_admin,
      store_receipt: entriesData.entries?.purchase_no_admin,
      is_valid: entriesData.entries.is_valid,
      invalid_reason_id: entriesData.entries.invalid_reason_id || null,
      variant: entriesData.entriesVariant || [],
      is_check: type === "approve" ? true : false,
    },
    validationSchema: entrySchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch(
          `/api/entries/validate?id=${entriesData.entries.uuid}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              entries: {
                id: entriesData.entries.id,
                ...values,
                store_name_admin: values.store_name,
                purchase_no_admin: values.store_receipt,
                purchase_date_admin:
                  values.purchase_date && values.purchase_time
                    ? dayjs(values.purchase_date)
                        .hour(dayjs(values.purchase_time).hour())
                        .minute(dayjs(values.purchase_time).minute())
                        .second(dayjs(values.purchase_time).second())
                        .format("YYYY-MM-DD HH:mm:ss")
                    : null,
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to validate entry");
        }

        await response.json();

        notify({
          message: "Entry validated successfully",
          type: "success",
        });

        navigate.back();
      } catch (error) {
        console.error("Error validating entry:", error);
        notify({
          message: "Failed to validate entry",
          type: "error",
        });
      }
    },
  });

  React.useEffect(() => {
    setContainer(document.getElementById("containerImage"));
  }, []);

  const handleClose = () => {
    navigate.back();
  };

  const [submitLoading, setSubmitLoading] = React.useState<boolean>(false);
  const handleApprove = async () => {
    try {
      setSubmitLoading(true);
      const response = await fetch(
        `/api/entries/approve?id=${entriesData.entries.uuid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            entries: {
              ...formik.values,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        notify({
          message: data.message,
          type: "error",
        });

        return;
      }

      notify({
        message: "Success Approving Entries",
        type: "success",
      });

      navigate.back();
    } catch (error) {
      console.error("Error Approving entry:", error);
      notify({
        message: "Error When Approving Entries",
        type: "error",
      });
    }
  };

  const handleReject = () => {
    showModal("entries-reject", {
      id: entriesData.entries.uuid,
      type: "create",
    });
  };

  const handleCheck = async () => {
    try {
      const response = await fetch(
        `/api/entries/check?id=${entriesData.entries.uuid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            entries: {
              ...formik.values,
              id: entriesData.entries.id,
              store_name_admin: formik.values.store_name,
              purchase_no_admin: formik.values.store_receipt,
              purchase_date_admin:
                formik.values.purchase_date && formik.values.purchase_time
                  ? dayjs(formik.values.purchase_date)
                      .hour(dayjs(formik.values.purchase_time).hour())
                      .minute(dayjs(formik.values.purchase_time).minute())
                      .second(dayjs(formik.values.purchase_time).second())
                      .format("YYYY-MM-DD HH:mm:ss")
                  : null,
              is_valid: 0,
              invalid_reason_id: null,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check entry");
      }

      const result = await response.json();

      if (result.invalid) {
        formik.setFieldValue("is_valid", 0);
        formik.setFieldValue("invalid_reason_id", result.invalid_id);

        if (result.invalid_receipt) {
          setInvalidImage(result.invalid_receipt);
          showModal("entries-compare", { id: "", type: "view" });
        }

        notify({
          message: result.invalid_reason,
          type: "error",
        });
      } else {
        formik.setFieldValue("is_valid", 1);
        formik.setFieldValue("invalid_reason_id", "");
        notify({
          message: "Valid",
          type: "success",
        });
      }

      formik.setFieldValue("is_check", true);
    } catch (error) {
      console.error("Error checking entry:", error);
    }
  };

  // const handleDeleteItem = (index: number) => {
  //     const currentVariants = formik.values.variant || [];
  //     const updatedVariants = currentVariants.filter((_, i) => i !== index);
  //     formik.setFieldValue('variant', updatedVariants);

  //     notify({
  //         type: 'success',
  //         message: 'Product removed successfully',
  //         position: { vertical: 'top', horizontal: 'right' },
  //     });
  // };

  React.useEffect(() => {
    if (
      formik.values.invalid_reason_id &&
      formik.values.invalid_reason_id > 0 &&
      formik.values.invalid_reason_id !== 90
    ) {
      formik.setFieldValue("is_valid", 0);
    }
  }, [formik.values.invalid_reason_id]);

  const formattedDate = dayjs(formik.values.rcvd_time).format("DD/MM/YYYY");

  useEffect(() => {
    if (entriesData) {
      formik.setValues({
        ...formik.values,
        ...entriesData,
        is_valid: Number(entriesData.entries.is_valid),
      });
    }
  }, [entriesData]);
  return (
    <>
      <Head>
        <title>{`Entries - ${APP_NAME}`}</title>
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
                Entries Detail
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
                {type === "approve" && (
                  <>
                    <Button
                      loading={submitLoading}
                      variant="contained"
                      color="error"
                      onClick={handleReject}
                      sx={{ width: 150 }}
                      startIcon={<CancelRoundedIcon />}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleApprove}
                      sx={{ width: 150 }}
                      loading={submitLoading}
                      startIcon={<CheckCircleRoundedIcon />}
                    >
                      Approve
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{ xs: 8 }}>
            <CardDefault gap={0}>
              <CardHeader title="Entry" />
              <CardContent>
                <FormikProvider value={formik}>
                  <Form>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <FastField
                          name="name"
                          component={TextFieldValidation}
                          size="small"
                          fullWidth
                          label="Name"
                          disabled
                          sx={disabledTextBlack}
                        />
                      </Grid>

                      <Grid size={{ xs: 6 }}>
                        <FastField
                          name="store"
                          component={TextFieldValidation}
                          size="small"
                          fullWidth
                          label="Store"
                          disabled
                          sx={disabledTextBlack}
                        />
                      </Grid>

                      <Grid size={{ xs: 6 }}>
                        <FastField
                          name="sender"
                          component={TextFieldValidation}
                          size="small"
                          fullWidth
                          label="No Whatsapp"
                          disabled
                          sx={disabledTextBlack}
                        />
                      </Grid>

                      <Grid size={{ xs: 6 }}>
                        <FastField
                          name="media"
                          component={TextFieldValidation}
                          size="small"
                          fullWidth
                          label="Media"
                          disabled
                          sx={disabledTextBlack}
                        />
                      </Grid>

                      <Grid size={{ xs: 6 }}>
                        <FastField
                          name="id_number"
                          component={TextFieldValidation}
                          size="small"
                          fullWidth
                          label="ID Number (KTP)"
                          disabled
                          sx={disabledTextBlack}
                        />
                      </Grid>

                      <Grid size={{ xs: 6 }}>
                        <FastField
                          name="regency"
                          component={TextFieldValidation}
                          size="small"
                          fullWidth
                          label="City"
                          disabled
                          sx={disabledTextBlack}
                        />
                      </Grid>

                      <Grid size={{ xs: 6 }}>
                        <FastField
                          name="rcvd_time"
                          component={TextFieldValidation}
                          size="small"
                          fullWidth
                          label="Received Date"
                          value={formattedDate}
                          disabled
                          sx={disabledTextBlack}
                        />
                      </Grid>

                      <Grid size={{ xs: 6 }}>
                        <FastField
                          name="prize"
                          component={TextFieldValidation}
                          size="small"
                          fullWidth
                          label="Prize"
                          disabled
                          sx={disabledTextBlack}
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <FastField
                          name="coupon"
                          component={TextFieldValidation}
                          size="small"
                          fullWidth
                          multiline
                          minRows={2}
                          label="Kode Unik"
                          disabled
                          sx={disabledTextBlack}
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 6 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  // onChange={(e) =>
                                  //   formik.setFieldValue(
                                  //     "is_valid",
                                  //     e.target.checked ? 0 : null
                                  //   )
                                  // }
                                  checked={Number(formik.values.is_valid) === 0}
                                  onChange={() =>
                                    formik.setFieldValue("is_valid", 0)
                                  }
                                  disabled={
                                    type === "approve" || type === "view"
                                  }
                                  sx={{
                                    color: "rgba(0,0,0,0.7)", // default icon color
                                    "&.Mui-disabled": {
                                      color: "rgba(0,0,0,0.5)", // icon saat disabled
                                    },
                                  }}
                                />
                              }
                              label="INVALID"
                              sx={{
                                "&.Mui-disabled .MuiFormControlLabel-label": {
                                  color: "rgba(0,0,0,0.7)", // label saat disabled
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={Number(formik.values.is_valid) === 1}
                                  onChange={() =>
                                    formik.setFieldValue("is_valid", 1)
                                  }
                                  // onChange={(e) =>
                                  //   formik.setFieldValue(
                                  //     "is_valid",
                                  //     e.target.checked ? 1 : null
                                  //   )
                                  // }
                                  disabled={
                                    type === "approve" || type === "view"
                                  }
                                  sx={{
                                    color: "rgba(0,0,0,0.7)", // default icon color
                                    "&.Mui-disabled": {
                                      color: "rgba(0,0,0,0.5)", // icon saat disabled
                                    },
                                  }}
                                />
                              }
                              label="VALID"
                              sx={{
                                "&.Mui-disabled .MuiFormControlLabel-label": {
                                  color: "rgba(0,0,0,0.7)", // label saat disabled
                                },
                              }}
                            />
                          </Grid>
                          {/* <RadioGroup
                            row
                            value={formik.values.is_valid}
                            onChange={(e) =>
                              formik.setFieldValue(
                                "is_valid",
                                Number(e.target.value)
                              )
                            }
                          >
                            <FormControlLabel
                              value={formik.values.is_valid === 0}
                              control={<Radio />}
                              label="INVALID"
                              disabled={type === "approve" || type === "view"}
                            />
                            <FormControlLabel
                              value={formik.values.is_valid === 1}
                              control={<Radio />}
                              label="VALID"
                              disabled={type === "approve" || type === "view"}
                            />
                          </RadioGroup> */}
                        </Grid>
                      </Grid>

                      {formik.values.is_valid === 0 && (
                        <Grid size={{ xs: 12 }}>
                          <FastField
                            name="invalid_reason_id"
                            component={SelectValidation}
                            fullWidth
                            options={invalidReason.filter(
                              (item) => item.status === 1
                            )}
                            size="small"
                            placeholder="Select Invalid Reason"
                            disabled={type === "approve" || type === "view"}
                            sx={
                              (type === "approve" || type === "view") &&
                              disabledTextBlack
                            }
                          />
                        </Grid>
                      )}

                      {formik.values.is_valid === 1 && (
                        <Grid size={{ xs: 12 }}>
                          <FastField
                            name="invalid_reason_id"
                            component={SelectValidation}
                            fullWidth
                            options={invalidReason.filter(
                              (item) => item.status === 1
                            )}
                            size="small"
                            placeholder="Select Invalid Reason"
                            disabled={type === "approve" || type === "view"}
                            sx={
                              (type === "approve" || type === "view") &&
                              disabledTextBlack
                            }
                          />
                        </Grid>
                      )}

                      {type === "entry" && (
                        <>
                          <Grid size={{ xs: 12 }}>
                            <Button
                              variant="outlined"
                              color="primary"
                              fullWidth
                              onClick={handleCheck}
                            >
                              Check
                            </Button>
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <Button
                              variant="contained"
                              color="primary"
                              fullWidth
                              type="submit"
                              disabled={!formik.values.is_check}
                            >
                              Save
                            </Button>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Form>
                </FormikProvider>
              </CardContent>
            </CardDefault>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Box position="sticky" top={10}>
              <CardDefault gap={0}>
                <CardHeader title="Struct Photo" />
                <CardContent>
                  <Box
                    sx={{ width: "100%", height: "100%" }}
                    id="containerImage"
                  >
                    <ImageViewer
                      openViewer={true}
                      url={
                        entriesData.entriesImage &&
                        entriesData.entriesImage.length > 0
                          ? entriesData.entriesImage
                          : [{ src: "" }]
                      }
                      container={container}
                    />
                  </Box>
                </CardContent>
              </CardDefault>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <ModalAddItem
        entries_id={entriesData.entries.id}
        formik={formik}
        products={products}
      />
      <ModalCompare
        currentImage={entriesData.entriesImage[0].src}
        invalidImage={invalidImage}
      />
      <ModalReject invalidReasonList={invalidReason} />
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

  const { id, type } = query;
  const entriesData = await getEntriesDetail(id as string);
  const invalidReasonList = await getInvalidReasonList();

  const products = await getProduct();

  return {
    props: {
      invalidReason: invalidReasonList,
      entriesData: entriesData,
      products: products,
      type,
    },
  };
}

EntriesDetailPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
