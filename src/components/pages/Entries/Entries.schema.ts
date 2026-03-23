import * as Yup from 'yup';

export const entrySchema = Yup.object({
    name: Yup.string().required('Name is required'),
    sender: Yup.string().required('WhatsApp number is required'),
    media: Yup.string().required('Media is required'),
    id_number: Yup.string().required('ID Number is required'),
    regency: Yup.string(),
    rcvd_time: Yup.date().nullable().required('Received date is required'),
    coupon: Yup.string(),
    purchase_date: Yup.date().nullable(),
    purchase_time: Yup.date().nullable(),
    store_name: Yup.string(),
    store_receipt: Yup.string(),
});
