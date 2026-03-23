import * as Yup from "yup";

export const WhiteListSchema = Yup.object().shape({
  name: Yup.string().required("Name diperlukan"),
  sender: Yup.string().required("Sender diperlukan"),
  id_number: Yup.string().optional(),
  is_tester: Yup.number().oneOf([0, 1]).required(),
  status: Yup.number().oneOf([0, 1]).required(),
});
