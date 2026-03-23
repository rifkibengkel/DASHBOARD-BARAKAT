import * as Yup from 'yup';

export const RolesSchema = Yup.object({
    role: Yup.string().required('Role name diperlukan'),
    status: Yup.number().oneOf([0, 1]).required(),
    menu: Yup.array().of(
        Yup.object({
            menuId: Yup.number().required(),
            menu: Yup.string().required(),
            m_insert: Yup.number().oneOf([0, 1]),
            m_update: Yup.number().oneOf([0, 1]),
            m_delete: Yup.number().oneOf([0, 1]),
            m_view: Yup.number().oneOf([0, 1]),
        })
    ),
});
