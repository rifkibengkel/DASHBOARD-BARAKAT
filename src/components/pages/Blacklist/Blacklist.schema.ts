import * as Yup from 'yup';

export const BlackListSchema = Yup.object().shape({
    name: Yup.string().required('Name diperlukan'),
    sender: Yup.string().required('Sender diperlukan'),
    id_number: Yup.string().optional(),
    status: Yup.number().oneOf([0, 1]).required(),
});
