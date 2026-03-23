import * as Yup from 'yup';

export const MenuSchema = Yup.object().shape({
    menu: Yup.string().required('Menu Name diperlukan'),
    path: Yup.string().required('Menu Path diperlukan'),
    icon: Yup.string().optional(),
    sort: Yup.number().min(0, 'Pilih Menu Order lebih dari 0').required('Menu Order diperlukan'),
    status: Yup.number().oneOf([0, 1]).required(),
});
