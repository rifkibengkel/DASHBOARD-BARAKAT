import React from 'react';
import { FastField, Form, FormikProvider } from 'formik';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Close from '@mui/icons-material/Close';
import { useModalStore } from '@/stores/useModal';
import { useNotificationStore } from '@/stores/useNotification';
import useCustomFormik from '@/hooks/useCustomFormik';
import { TextFieldValidation } from '@/components/base/Form/TextField';
import { formatNumber } from '@/lib/utils';
import { AutoValidation } from '@/components/base/Form/AutoCompleted';

interface Product {
    id: number;
    name: string;
}

interface ModalAddItemProps {
    entries_id: number;
    products: Product[];
    formik: {
        values: {
            variant?: Array<{
                name: string;
                entries_id: number;
                product_id: number;
                quantity: number;
                price: number;
                total_price: number;
            }>;
        };
        setFieldValue: (field: string, value: unknown) => void;
    };
}

function ModalAddItemComponent({ entries_id, products, formik }: ModalAddItemProps) {
    const { modals, hideModal } = useModalStore();
    const modal = modals['entries-add-item'];
    const { notify } = useNotificationStore();

    const addItemFormik = useCustomFormik({
        initialValues: {
            product_id: '',
            quantity: '',
            price: '',
        },
        onSubmit: async (values) => {
            try {
                const selectedProduct = products.find((p) => p.id === Number(values.product_id));
                if (!selectedProduct) {
                    notify({
                        type: 'error',
                        message: 'Please select a product',
                        position: { vertical: 'top', horizontal: 'right' },
                    });
                    return;
                }

                const newVariant = {
                    name: selectedProduct.name,
                    entries_id,
                    product_id: values.product_id,
                    quantity: values.quantity,
                    price: values.price,
                    total_price: +values.price * +(+values.quantity),
                };

                const currentVariants = formik.values.variant || [];
                formik.setFieldValue('variant', [...currentVariants, newVariant]);

                notify({
                    type: 'success',
                    message: 'Product added successfully',
                    position: { vertical: 'top', horizontal: 'right' },
                });

                handleClose();
            } catch {
                notify({
                    type: 'error',
                    message: 'Failed to add product',
                    position: { vertical: 'top', horizontal: 'right' },
                });
            }
        },
    });

    const handleClose = () => {
        hideModal('entries-add-item');
        addItemFormik.resetForm();
    };

    const totalPrice = React.useMemo(() => {
        const quantity = Number(addItemFormik.values.quantity) || 0;
        const price = Number(addItemFormik.values.price) || 0;
        return quantity * price;
    }, [addItemFormik.values.quantity, addItemFormik.values.price]);

    return (
        <Dialog
            open={Boolean(modal?.show)}
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
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography textTransform={'capitalize'} variant="h6">
                    Add Item Product
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
                <FormikProvider value={addItemFormik}>
                    <Form>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 12 }}>
                                <FastField
                                    name="product_id"
                                    component={AutoValidation}
                                    fullWidth
                                    size="small"
                                    options={products}
                                    loading={false}
                                    placeholder="Pilih Produk"
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <FastField
                                    name="quantity"
                                    component={TextFieldValidation}
                                    fullWidth
                                    size="small"
                                    label="Quantity"
                                    type="number"
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <FastField
                                    name="price"
                                    component={TextFieldValidation}
                                    fullWidth
                                    size="small"
                                    label="Price Per Item"
                                    type="number"
                                    inputProps={{ min: 0, step: 1 }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                    Total: {formatNumber(totalPrice)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Form>
                </FormikProvider>
            </DialogContent>
            <DialogActions sx={{ pb: 2.5, px: 3, gap: 1 }}>
                <Button variant="outlined" onClick={handleClose} sx={{ width: 125 }}>
                    Close
                </Button>
                <Button
                    variant="contained"
                    sx={{ width: 125 }}
                    onClick={() => addItemFormik.handleSubmit()}
                    disabled={
                        !addItemFormik.values.product_id ||
                        !addItemFormik.values.quantity ||
                        !addItemFormik.values.price
                    }
                >
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
}

const ModalAddItem = React.memo(ModalAddItemComponent);
export default ModalAddItem;
