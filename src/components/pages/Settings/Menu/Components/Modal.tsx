/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { useSWRConfig } from 'swr';
import { FastField, Form, FormikProvider } from 'formik';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Close from '@mui/icons-material/Close';
import { useModalStore } from '@/stores/useModal';
import { useNotificationStore } from '@/stores/useNotification';
import { Menu } from '@/types';
import useCustomFormik from '@/hooks/useCustomFormik';
import { TextFieldValidation } from '@/components/base/Form/TextField';
import { SelectValidation } from '@/components/base/Form/Select';
import { MenuSchema } from '../Menu.schema';

function ModalMenuComponent({ keys, menu }: { keys: string; menu: Menu[] }) {
    const { modals, resetModals } = useModalStore();
    const modal = modals['menu'];
    const { notify } = useNotificationStore();
    const { mutate } = useSWRConfig();

    const formik = useCustomFormik({
        initialValues: {
            menu: '',
            path: '',
            sub: 0,
            level: 1,
            icon: '',
            sort: 0,
            status: 0,
        },
        validationSchema: MenuSchema,
        onSubmit: async (values) => {
            try {
                const url =
                    modal.type === 'create' ? '/api/settings/menu/create' : `/api/settings/menu/update?id=${modal.id}`;

                const response = await fetch(url, {
                    method: 'POST',
                    body: JSON.stringify(values),
                    headers: { 'Content-Type': 'application/json' },
                });

                const res = await response.json();

                if (response.ok) {
                    mutate([keys]);
                    notify({
                        type: 'success',
                        message: res.message,
                        position: { vertical: 'top', horizontal: 'right' },
                    });
                    handleClose();
                } else {
                    notify({
                        type: 'error',
                        message: res.message || 'Something went wrong',
                        position: { vertical: 'top', horizontal: 'right' },
                    });
                }
            } catch (error) {
                notify({
                    type: 'error',
                    message: (error as Error).message,
                    position: { vertical: 'top', horizontal: 'right' },
                });
            }
        },
    });

    const handleClose = () => {
        formik.resetForm();
        resetModals();
    };

    const handleSubmit = () => {
        formik.submitForm();
    };

    React.useEffect(() => {
        if (!modal) return;

        const fetchMenu = async () => {
            try {
                const response = await fetch(`/api/settings/menu/detail?id=${modal.id}`, {
                    method: 'GET',
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch menu');
                }
                const res = await response.json();
                const { data } = res;

                formik.setValues({
                    menu: data.menu ?? '',
                    path: data.path ?? '',
                    sub: data.sub ?? 0,
                    level: data.level ?? 1,
                    icon: data.icon ?? '',
                    sort: data.sort ?? 0,
                    status: data.status ?? 0,
                });
            } catch (error) {
                notify({
                    type: 'error',
                    message: (error as Error).message,
                    position: { vertical: 'top', horizontal: 'right' },
                });
            }
        };

        fetchMenu();
    }, [modal]);

    return (
        <Dialog
            open={modal ? modal.show : false}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        maxHeight: 735,
                    },
                },
            }}
        >
            <DialogTitle
                component={'div'}
                sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
                <Typography textTransform={'capitalize'} variant="h6">
                    {modal ? modal.type : ''} Menu
                </Typography>
                <IconButton
                    onClick={handleClose}
                    sx={{
                        ':hover': {
                            background: 'transparent',
                        },
                    }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <FormikProvider value={formik}>
                    <Form>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <FormControl fullWidth>
                                    <FormLabel sx={{ color: 'inherit', fontWeight: 500, mb: 1 }}>Menu Name</FormLabel>
                                    <FastField
                                        size="small"
                                        component={TextFieldValidation}
                                        name="menu"
                                        placeholder="Menu Name"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <FormControl fullWidth>
                                    <FormLabel sx={{ color: 'inherit', fontWeight: 500, mb: 1 }}>Menu Path</FormLabel>
                                    <FastField
                                        size="small"
                                        component={TextFieldValidation}
                                        name="path"
                                        placeholder="Menu Path"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <FormControl fullWidth>
                                    <FormLabel sx={{ color: 'inherit', fontWeight: 500, mb: 1 }}>Menu Header</FormLabel>
                                    <FastField
                                        size="small"
                                        value={formik.values.sub}
                                        component={SelectValidation}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            if (+e.target.value > 0) {
                                                formik.setFieldValue('level', 2);
                                            } else {
                                                formik.setFieldValue('level', 1);
                                            }
                                            formik.setFieldValue('sub', e.target.value);
                                        }}
                                        name="sub"
                                        options={[{ id: 0, name: 'No Header' }, ...menu]}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <FormControl fullWidth>
                                    <FormLabel sx={{ color: 'inherit', fontWeight: 500, mb: 1 }}>Menu Icon</FormLabel>
                                    <FastField
                                        size="small"
                                        component={TextFieldValidation}
                                        name="icon"
                                        placeholder="Menu Icon"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <FormControl fullWidth>
                                    <FormLabel sx={{ color: 'inherit', fontWeight: 500, mb: 1 }}>Menu Order</FormLabel>
                                    <FastField
                                        size="small"
                                        component={TextFieldValidation}
                                        name="sort"
                                        placeholder="Menu Sort"
                                        inputMode="numeric"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <FormControl fullWidth>
                                    <FormLabel sx={{ color: 'inherit', fontWeight: 500, mb: 1 }}>Menu Status</FormLabel>
                                    <FastField
                                        size="small"
                                        value={formik.values.status}
                                        component={SelectValidation}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            formik.setFieldValue('status', e.target.value)
                                        }
                                        name="status"
                                        options={[
                                            { id: 0, name: 'Inactive' },
                                            { id: 1, name: 'Active' },
                                        ]}
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Form>
                </FormikProvider>
            </DialogContent>
            <DialogActions sx={{ pb: 2.5, px: 3 }}>
                <Button
                    variant="text"
                    onClick={handleClose}
                    sx={{
                        width: 125,
                    }}
                >
                    Kembali
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    sx={{ width: 125 }}
                    disabled={formik.isSubmitting || formik.isValidating || !formik.dirty}
                >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
}

const ModalMenu = React.memo(ModalMenuComponent);
export default ModalMenu;
