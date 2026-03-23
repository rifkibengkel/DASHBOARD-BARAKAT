import React from 'react';
import { useSWRConfig } from 'swr';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Close from '@mui/icons-material/Close';

import { useModalStore } from '@/stores/useModal';
import { useNotificationStore } from '@/stores/useNotification';

function ModalWhitelistComponent({ keys }: { keys: string }) {
    const { modals, hideModal } = useModalStore();
    const modal = modals['whitelist-delete'];
    const { notify } = useNotificationStore();
    const { mutate } = useSWRConfig();

    const handleClose = () => {
        hideModal('whitelist-delete');
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch(`/api/whitelist/delete?id=${modal.id}`, {
                method: 'POST',
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
    };

    return (
        <Dialog
            open={Boolean(modal?.show)}
            maxWidth="xs"
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
                    {modal?.type} Whitelist
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
                <Typography variant="body1">Apakah anda yakin untuk menghapus data ini?</Typography>
            </DialogContent>
            <DialogActions sx={{ pb: 2.5, px: 3 }}>
                <Button variant="text" onClick={handleClose} sx={{ width: 125 }}>
                    Kembali
                </Button>
                <Button variant="contained" onClick={handleSubmit} sx={{ width: 125 }}>
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
}

const ModalWhitelist = React.memo(ModalWhitelistComponent);
export default ModalWhitelist;
