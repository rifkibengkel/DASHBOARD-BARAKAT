import * as Yup from 'yup';

export const UserCreateSchema = Yup.object({
    username: Yup.string()
        .required('Username diperlukan')
        .min(3, 'Username minimal 3 karakter')
        .max(50, 'Username maksimal 50 karakter')
        .matches(/^[a-zA-Z0-9]+$/, 'Username hanya boleh huruf dan angka (a-z, A-Z, 0-9)'),
    fullname: Yup.string()
        .required('Fullname diperlukan')
        .min(3, 'Fullname minimal 3 karakter')
        .max(100, 'Fullname maksimal 100 karakter'),
    roleId: Yup.number().min(1, 'Role diperlukan').required('Silakan memilih Role yang sesuai'),
    status: Yup.number().oneOf([0, 1], 'Status tidak valid').required('Status diperlukan'),
    newPassword: Yup.string()
        .required('Password diperlukan')
        .min(8, 'Password minimal 8 karakter')
        .matches(/[A-Z]/, 'Harus mengandung huruf besar')
        .matches(/[a-z]/, 'Harus mengandung huruf kecil')
        .matches(/[0-9]/, 'Harus mengandung angka'),
    newPasswordConfirm: Yup.string()
        .required('Konfirmasi password diperlukan')
        .oneOf([Yup.ref('newPassword')], 'Konfirmasi password tidak cocok'),
});

export const UserUpdateSchema = Yup.object({
    username: Yup.string()
        .required('Username diperlukan')
        .min(3, 'Username minimal 3 karakter')
        .max(50, 'Username maksimal 50 karakter')
        .matches(/^[a-zA-Z0-9]+$/, 'Username hanya boleh huruf dan angka (a-z, A-Z, 0-9)'),
    fullname: Yup.string()
        .required('Fullname diperlukan')
        .min(3, 'Fullname minimal 3 karakter')
        .max(100, 'Fullname maksimal 100 karakter'),
    roleId: Yup.number().min(1, 'Role diperlukan').required('Silakan memilih Role yang sesuai'),
    status: Yup.number().oneOf([0, 1], 'Status tidak valid').required('Status diperlukan'),
    oldPassword: Yup.string().when('newPassword', {
        is: (val: string) => val && val.length > 0,
        then: (schema) => schema.required('Password lama diperlukan untuk mengganti password'),
        otherwise: (schema) => schema.notRequired(),
    }),
    newPassword: Yup.string()
        .min(8, 'Password baru minimal 8 karakter')
        .matches(/[A-Z]/, 'Harus mengandung huruf besar')
        .matches(/[a-z]/, 'Harus mengandung huruf kecil')
        .matches(/[0-9]/, 'Harus mengandung angka')
        .notRequired(),
    newPasswordConfirm: Yup.string().when('newPassword', {
        is: (val: string) => val && val.length > 0,
        then: (schema) =>
            schema
                .required('Konfirmasi password diperlukan')
                .oneOf([Yup.ref('newPassword')], 'Konfirmasi password tidak cocok'),
        otherwise: (schema) => schema.notRequired(),
    }),
});
