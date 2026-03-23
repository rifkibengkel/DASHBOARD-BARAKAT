import { CardDefault } from "@/components/base/Card";
import { SelectValidation } from "@/components/base/Form/Select";
import { TextFieldValidation } from "@/components/base/Form/TextField";
import CardShipment from "@/components/pages/Winner/Components/CardShipment";
import ImageViewer from "@/components/base/Viewer";
import ImageLabelingViewer, {
  ImageLabel,
} from "@/components/pages/Winner/Components/ImageLabelingViewer";
import { useWinnerDetailFormik } from "@/hooks/useWinnerDetailFormik";
import { APP_NAME } from "@/lib/common/constant";
import { disabledTextBlack } from "@/lib/utils";
import { useModalStore } from "@/stores/useModal";
import { useNotificationStore } from "@/stores/useNotification";
import { WinnerDetailProps } from "@/types";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTour } from "@reactour/tour";
import dayjs from "dayjs";
import { FastField, Form, FormikProvider } from "formik";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const ModalReject = dynamic(
  () => import("@/components/pages/Winner/Components/ModalReject"),
);

export default function WinnerDetailContent({
  winnerData,
  type,
  invalidReasonList,
  prevApprovedWinnerId,
}: WinnerDetailProps) {
  const router = useRouter();
  const { notify } = useNotificationStore();
  const { showModal } = useModalStore();
  const { setIsOpen, setCurrentStep, setSteps } = useTour();
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  const [imageLabels, setImageLabels] = useState<Record<number, ImageLabel>>(
    {},
  );
  const [allLabelsComplete, setAllLabelsComplete] = useState(false);

  const formik = useWinnerDetailFormik({ winnerData });

  const formattedDate = dayjs(winnerData.winner.rcvd_time).format("DD/MM/YYYY");

  React.useEffect(() => {
    setContainer(document.getElementById("containerImage"));
  }, []);

  React.useEffect(() => {
    if (prevApprovedWinnerId && winnerData.winner.is_approved === 0) {
      const fetchPreviousWinner = async () => {
        try {
          const response = await fetch(
            `/api/winner/detail?id=${prevApprovedWinnerId}`,
          );
          if (response.ok) {
            const data = await response.json();
            if (data?.winner) {
              formik.setFieldValue(
                "ktp_name_admin",
                data.winner.ktp_name_admin || "",
              );
              formik.setFieldValue(
                "id_number_admin",
                data.winner.id_number_admin || "",
              );
            }
          }
        } catch (error) {
          console.error("Failed to fetch previous winner details", error);
        }
      };
      fetchPreviousWinner();
    }
  }, [prevApprovedWinnerId, winnerData.winner.is_approved]);

  const handleClose = () => {
    router.back();
  };

  const handleReject = () => {
    showModal("winner-reject", { id: winnerData.winner.id, type: "create" });
  };

  const handleLabelsComplete = (labels: Record<number, ImageLabel>) => {
    setImageLabels(labels);
    const hasKTP = Object.values(labels).includes("ktp");
    const hasKK = Object.values(labels).includes("kk");
    setAllLabelsComplete(hasKTP && hasKK);
  };

  const handleSubmit = () => {
    if (type === "approve") {
      const isKtpNameEmpty = !formik.values.ktp_name_admin?.trim();
      const isIdNumberEmpty = !formik.values.id_number_admin?.trim();

      const steps = [];

      if (isKtpNameEmpty) {
        steps.push({
          selector: '[data-tour="ktp-name-admin"]',
          content:
            "Mohon isi Nama (KTP) dari Admin terlebih dahulu sebelum approve.",
        });
      }
      if (isIdNumberEmpty) {
        steps.push({
          selector: '[data-tour="id-number-admin"]',
          content:
            "Mohon isi Nomor ID (KTP) dari Admin terlebih dahulu sebelum approve.",
        });
      }

      if (steps.length > 0) {
        setSteps?.(steps);
        setCurrentStep?.(0);
        setIsOpen?.(true);
        return;
      }
    }

    // Add image labels to formik values before submit
    formik.setFieldValue("image_labels", imageLabels);
    formik.setFieldValue("prevApprovedWinnerId", prevApprovedWinnerId);
    formik.submitForm();
  };

  // Handler untuk submit shipment
  const handleShipmentSubmit = async (shipmentValues: any) => {
    try {
      // Kirim ke API
      const response = await fetch(
        `/api/winner/shipment?id=${winnerData.winner.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(shipmentValues),
        },
      );

      if (response.ok) {
        // Handle success
        notify({
          message: "Winner approved successfully",
          type: "success",
        });

        router.back();
      }
    } catch (error) {
      console.error("Error creating shipment:", error);
    }
  };

  return (
    <>
      <Head>
        <title>{`Winner - ${APP_NAME}`}</title>
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
                Winner Detail
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
                      variant="contained"
                      color="error"
                      onClick={handleReject}
                      sx={{ width: 150 }}
                      loading={formik.isSubmitting}
                      startIcon={<CancelRoundedIcon />}
                    >
                      Reject
                    </Button>

                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleSubmit}
                      sx={{ width: 150 }}
                      loading={formik.isSubmitting}
                      disabled={
                        prevApprovedWinnerId < 1 ? !allLabelsComplete : false
                      }
                      startIcon={<CheckCircleRoundedIcon />}
                    >
                      Approve
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{ xs: type === "shipment" ? 5 : 8 }}>
            <CardDefault gap={0}>
              <CardHeader title="Entry" />
              <CardContent>
                <FormikProvider value={formik}>
                  <Form>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <FastField
                          name="fullname"
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

                      <Grid size={{ xs: winnerData.winner.voucher ? 12 : 6 }}>
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

                      {winnerData.winner.voucher && (
                        <Grid size={{ xs: 6 }}>
                          <FastField
                            name="voucher"
                            component={TextFieldValidation}
                            size="small"
                            fullWidth
                            label="Prize Type"
                            disabled
                            sx={disabledTextBlack}
                          />
                        </Grid>
                      )}

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

                      <Divider sx={{ width: "100%", my: 2 }} />

                      <Grid size={{ xs: 6 }} data-tour="ktp-name-admin">
                        <FastField
                          name="ktp_name_admin"
                          component={TextFieldValidation}
                          size="small"
                          fullWidth
                          label="Name (KTP) From Admin"
                          disabled={type === "view" || type === "shipment"}
                          sx={
                            (type === "view" || type === "shipment") &&
                            disabledTextBlack
                          }
                          onChange={(e: any) => {
                            formik.setFieldValue(
                              "ktp_name_admin",
                              e.target.value.toUpperCase(),
                            );
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 6 }} data-tour="id-number-admin">
                        <FastField
                          name="id_number_admin"
                          component={TextFieldValidation}
                          size="small"
                          fullWidth
                          label="ID Number (KTP) From Admin"
                          disabled={type === "view" || type === "shipment"}
                          sx={
                            (type === "view" || type === "shipment") &&
                            disabledTextBlack
                          }
                        />
                      </Grid>

                      {formik.values.invalid_reason_id > 0 && (
                        <>
                          <Divider sx={{ width: "100%", my: 2 }} />
                          <Grid size={{ xs: 12 }}>
                            <FastField
                              name="invalid_reason_id"
                              component={SelectValidation}
                              fullWidth
                              options={invalidReasonList.filter(
                                (item) => item.status === 1,
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
                        </>
                      )}
                    </Grid>
                  </Form>
                </FormikProvider>
              </CardContent>
            </CardDefault>
          </Grid>
          {type !== "shipment" && (
            <Grid size={{ xs: 4 }}>
              <Box position="sticky" top={10}>
                <CardDefault gap={0}>
                  <CardHeader title="Struct Photo" />
                  {!prevApprovedWinnerId ? (
                    <CardContent>
                      <Box
                        sx={{ width: "100%", height: "100%" }}
                        id="containerImage"
                        data-tour="image-labeling"
                      >
                        <ImageLabelingViewer
                          images={
                            winnerData.winnerImage &&
                            winnerData.winnerImage.length > 0
                              ? winnerData.winnerImage
                              : [{ src: "" }]
                          }
                          container={container}
                          onLabelsComplete={handleLabelsComplete}
                          disabled={type === "view"}
                        />
                      </Box>
                    </CardContent>
                  ) : (
                    <CardContent>
                      <Box
                        sx={{ width: "100%", height: "100%" }}
                        id="containerImage"
                      >
                        <ImageViewer
                          openViewer={true}
                          url={
                            winnerData.winnerImage &&
                            winnerData.winnerImage.length > 0
                              ? winnerData.winnerImage
                              : [{ src: "" }]
                          }
                          container={container}
                        />
                      </Box>
                    </CardContent>
                  )}
                </CardDefault>
              </Box>
            </Grid>
          )}
          {type === "shipment" && (
            <Grid size={{ xs: 7 }}>
              <CardShipment
                initialPrizes={[]}
                initialDistricts={[]}
                initialValues={{
                  address: "",
                  address2: "",
                  address3: "",
                  address4: "",
                  kodepos: "",
                  district_id: "",
                  prizeChange: "",
                  quantity: 1,
                  receiver_name: "",
                  receiver_phone: "",
                  approver: "",
                }}
                onSubmit={handleShipmentSubmit}
              />
            </Grid>
          )}
        </Grid>
      </Container>
      <ModalReject invalidReasonList={invalidReasonList} />
    </>
  );
}
