import * as Yup from "yup";

export const AllocationSchema = Yup.object({
  allocation_date: Yup.date()
    .nullable()
    .required("Allocation date is required"),
  regionId: Yup.number().nullable(),
  storeId: Yup.number().nullable(),
  prizeId: Yup.number()
    .min(1, "Prize is required")
    .required("Prize is required"),
  quantity: Yup.number()
    .integer("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .required("Quantity is required"),
});
