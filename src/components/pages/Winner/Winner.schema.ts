import * as Yup from "yup";

// export const winnerApprove = Yup.object({
//     ktp_name_admin: Yup.string().required('Name KTP is required'),
//     id_number_admin: Yup.string()
//         .required('KTP Number is Required')
//         .test('same-as-user', 'Admin KTP number must match user KTP number', function (value) {
//             const { id_number } = this.parent;
//             if (!value || !id_number) return false;
//             return value === id_number;
//         }),
//     id_number: Yup.string().required('User KTP Number is Required'),
// });
export const winnerApprove = Yup.object({
  ktp_name_admin: Yup.string().required("Name KTP is required"),
  id_number_admin: Yup.string().required("KTP Number is Required"),
  id_number: Yup.string().required("User KTP Number is Required"),
});
