import { CardDefault } from "@/components/base/Card";
import { TextFieldValidation } from "@/components/base/Form/TextField";
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Autocomplete,
} from "@mui/material";
import { FastField, Form, FormikProvider, useFormik } from "formik";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Yup from "yup";

interface Option {
  key: string | number;
  value: string | number;
  label: string;
}
interface AdditionalDistrict {
  id: string | number;
  city_name: string;
  province_name: string;
}

interface CardShipmentProps {
  initialPrizes?: any[];
  initialDistricts?: Option[];
  initialValues?: any;
  onSubmit?: (values: any) => void;
}

const validationSchema = Yup.object({
  address1: Yup.string().required("Address 1 wajib diisi"),
  address2: Yup.string(),
  address3: Yup.string(),
  address4: Yup.string(),
  kodepos: Yup.string().required("Kode pos wajib diisi"),
  district_id: Yup.string().required("District wajib dipilih"),
  master_prize_id: Yup.string().required("Prize wajib dipilih"),
  quantity: Yup.number()
    .min(1, "Quantity minimal 1")
    .required("Quantity wajib diisi"),
  receiver_name: Yup.string().required("Nama penerima wajib diisi"),
  receiver_phone: Yup.string().required("Nomor telepon penerima wajib diisi"),
  approver: Yup.string().required("Approver wajib diisi"),
});

const CardShipment = ({
  initialPrizes = [],
  initialDistricts = [],
  initialValues,
  onSubmit,
}: CardShipmentProps) => {
  const [districts, setDistricts] = useState<Option[]>(initialDistricts || []);
  const [additionalDistricts, setAdditionalDistricts] = useState<
    AdditionalDistrict[]
  >([]);
  const [prizes, setPrizes] = useState<Option[]>(initialPrizes || []);

  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [loadingPrize, setLoadingPrize] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [programId, setProgramId] = useState(0);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(false);
  const lastQueryRef = useRef("");

  // Formik terpisah untuk shipment
  const formik = useFormik({
    initialValues: {
      address1: initialValues?.address1 || "",
      address2: initialValues?.address2 || "",
      address3: initialValues?.address3 || "",
      address4: initialValues?.address4 || "",
      kodepos: initialValues?.kodepos || "",
      district_id: initialValues?.district_id || "",
      master_prize_id: initialValues?.master_prize_id || "",
      quantity: initialValues?.quantity || 1,
      receiver_name: initialValues?.receiver_name || "",
      receiver_phone: initialValues?.receiver_phone || "",
      approver: initialValues?.approver || "",
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (onSubmit) {
          const cityAndProvince = additionalDistricts.filter(
            (a) => a.id === values.district_id
          );

          const mapped = {
            ...values,
            master_program_id: programId,
            city: cityAndProvince[0].city_name,
            province: cityAndProvince[0].province_name,
            receiver_phone2: "",
          };
          onSubmit(mapped);
        }
      } catch (error) {
        console.error("Submit error:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Fetch districts
  const fetchDistricts = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) {
        if (initialDistricts && initialDistricts.length > 0) {
          setDistricts(initialDistricts);
        }
        return;
      }

      if (lastQueryRef.current === query) return;

      lastQueryRef.current = query;
      setLoadingDistrict(true);

      try {
        const res = await fetch(
          `/api/master/district?key=${encodeURIComponent(query)}`
        );

        const json = await res.json();

        if (isMounted.current) {
          const mapped: Option[] = (json.data || []).map(
            (item: { id: string | number; name: string }) => ({
              key: item.id,
              value: item.id,
              label: item.name,
            })
          );
          const mappedAdditional = (json.data || []).map(
            (item: {
              id: string | number;
              city_name: string;
              province_name: string;
            }) => ({
              id: item.id,
              city_name: item.city_name,
              province_name: item.province_name,
            })
          );
          setAdditionalDistricts(mappedAdditional);
          setDistricts(mapped);
        }
      } catch (e) {
        console.error("District fetch error:", e);
        if (isMounted.current) setDistricts([]);
      } finally {
        if (isMounted.current) setLoadingDistrict(false);
      }
    },
    [initialDistricts]
  );

  // Fetch prizes
  const fetchPrize = useCallback(async () => {
    setLoadingPrize(true);
    try {
      const res = await fetch(`/api/master/prize`);

      const json = await res.json();

      if (isMounted.current) {
        setProgramId(json.programId);
        setPrizes(json.data);
      }
    } catch (e) {
      console.error("Prize fetch error:", e);
      if (isMounted.current) setPrizes([]);
    } finally {
      if (isMounted.current) setLoadingPrize(false);
    }
  }, []);

  // Debounce search
  const handleInputChange = useCallback(
    (newInputValue: string) => {
      setInputValue(newInputValue);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!newInputValue || newInputValue.length < 2) {
        if (initialDistricts && initialDistricts.length > 0) {
          setDistricts(initialDistricts);
        }
        return;
      }

      debounceRef.current = setTimeout(() => {
        fetchDistricts(newInputValue);
      }, 500);
    },
    [fetchDistricts, initialDistricts]
  );

  // Initialize
  useEffect(() => {
    isMounted.current = true;

    if (initialDistricts && initialDistricts.length > 0) {
      setDistricts(initialDistricts);
    }

    // Fetch prizes jika initialPrizes kosong
    if (!initialPrizes || initialPrizes.length === 0) {
      fetchPrize();
    }

    return () => {
      isMounted.current = false;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [initialDistricts, initialPrizes, fetchPrize]);

  // Memoize selected district
  const selectedDistrict = useMemo(
    () => districts.find((d) => d.value === formik.values.district_id) || null,
    [districts, formik.values.district_id]
  );

  // Handle district change
  const handleDistrictChange = useCallback(
    (_: any, newValue: Option | null) => {
      formik.setFieldValue("district_id", newValue?.value || "", false);
    },
    [formik]
  );

  // Handle prize change
  const handlePrizeChange = useCallback(
    (event: any) => {
      formik.setFieldValue("master_prize_id", event.target.value, false);
    },
    [formik]
  );

  return (
    <Box position="sticky" top={10}>
      <CardDefault gap={0}>
        <CardHeader title="Input Shipment" />
        <CardContent>
          <FormikProvider value={formik}>
            <Form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <FastField
                    name="address1"
                    component={TextFieldValidation}
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    label="Address 1"
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FastField
                    name="address2"
                    component={TextFieldValidation}
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    label="Address 2"
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FastField
                    name="address3"
                    component={TextFieldValidation}
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    label="Address 3"
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FastField
                    name="address4"
                    component={TextFieldValidation}
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    label="Address 4"
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FastField
                    name="kodepos"
                    component={TextFieldValidation}
                    size="small"
                    fullWidth
                    label="Postal Code"
                  />
                </Grid>

                {/* District - Autocomplete */}
                <Grid size={{ xs: 6 }}>
                  <Autocomplete
                    options={districts}
                    getOptionLabel={(option) => option.label || ""}
                    value={selectedDistrict}
                    loading={loadingDistrict}
                    onChange={handleDistrictChange}
                    onInputChange={(_, newInputValue, reason) => {
                      if (reason === "input") {
                        handleInputChange(newInputValue);
                      } else if (reason === "clear") {
                        setInputValue("");
                        if (initialDistricts && initialDistricts.length > 0) {
                          setDistricts(initialDistricts);
                        }
                      }
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option.value === value?.value
                    }
                    noOptionsText={
                      inputValue.length < 2
                        ? "Ketik minimal 2 karakter untuk mencari"
                        : "Tidak ada hasil"
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="District"
                        size="small"
                        error={
                          formik.touched.district_id &&
                          Boolean(formik.errors.district_id)
                        }
                        helperText={
                          formik.touched.district_id &&
                          (formik.errors.district_id as string)
                        }
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingDistrict ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Prize Change */}
                <Grid size={{ xs: 6 }}>
                  <FormControl
                    fullWidth
                    size="small"
                    error={
                      formik.touched.master_prize_id &&
                      Boolean(formik.errors.master_prize_id)
                    }
                    disabled={loadingPrize}
                  >
                    <InputLabel>Prize</InputLabel>
                    <Select
                      name="master_prize_id"
                      label="Prize"
                      value={formik.values.master_prize_id || ""}
                      onChange={handlePrizeChange}
                      onBlur={formik.handleBlur}
                      endAdornment={
                        loadingPrize ? (
                          <CircularProgress
                            size={20}
                            sx={{ mr: 2 }}
                            color="inherit"
                          />
                        ) : null
                      }
                    >
                      {prizes.length === 0 && !loadingPrize && (
                        <MenuItem value="" disabled>
                          Tidak ada data prize
                        </MenuItem>
                      )}
                      {prizes.map((item) => (
                        <MenuItem key={item.key} value={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.master_prize_id &&
                      formik.errors.master_prize_id && (
                        <Box
                          sx={{
                            color: "error.main",
                            fontSize: "0.75rem",
                            mt: 0.5,
                            ml: 2,
                          }}
                        >
                          {formik.errors.master_prize_id as string}
                        </Box>
                      )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FastField
                    name="quantity"
                    component={TextFieldValidation}
                    size="small"
                    fullWidth
                    type="number"
                    label="Quantity"
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FastField
                    name="receiver_name"
                    component={TextFieldValidation}
                    size="small"
                    fullWidth
                    label="Receiver Name"
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FastField
                    name="receiver_phone"
                    component={TextFieldValidation}
                    size="small"
                    fullWidth
                    type="tel"
                    label="Receiver Phone"
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FastField
                    name="approver"
                    component={TextFieldValidation}
                    size="small"
                    fullWidth
                    label="Approver"
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={formik.isSubmitting}
                      fullWidth
                    >
                      {formik.isSubmitting ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          </FormikProvider>
        </CardContent>
      </CardDefault>
    </Box>
  );
};

export default CardShipment;
