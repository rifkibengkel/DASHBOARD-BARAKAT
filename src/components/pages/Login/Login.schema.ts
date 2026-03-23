import * as Yup from 'yup';

export const LoginSchema = Yup.object().shape({
    username: Yup.string().required('Username diperlukan'),
    password: Yup.string().required('Password diperlukan'),
});
