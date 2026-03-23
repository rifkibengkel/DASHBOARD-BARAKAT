import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Close from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';

import { useModalStore } from '@/stores/useModal';
import { SelectDefault } from '@/components/base/Form/Select';
import { useNotificationStore } from '@/stores/useNotification';
import { BaseQueryResult } from '@/types';

interface ModalRejectProps {
    invalidReasonList: BaseQueryResult[];
}

function ModalRejectComponent({ invalidReasonList }: ModalRejectProps) {
    const navigate = useRouter();
    const { modals, hideModal } = useModalStore();
    const { notify } = useNotificationStore();
    const modal = modals['entries-reject'];

    const [selectedReason, setSelectedReason] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleClose = () => {
        setSelectedReason(null);
        setError(null);
        hideModal('entries-reject');
    };

    const handleReject = async () => {
        if (!selectedReason) {
            setError('Please select an invalid reason');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/entries/reject?id=${modal.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    invalid_id: selectedReason,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reject entry');
            }

            notify({
                message: 'Entry rejected successfully',
                type: 'success',
            });

            handleClose();

            navigate.back();
        } catch (error) {
            console.error('Error rejecting entry:', error);
            setError(error instanceof Error ? error.message : 'Failed to reject entry');
            notify({
                message: 'Failed to reject entry',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog
            open={Boolean(modal?.show)}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        maxHeight: 400,
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
                <Typography textTransform={'capitalize'} variant="h6" color="error">
                    Reject Entry
                </Typography>
                <IconButton
                    onClick={handleClose}
                    disabled={isLoading}
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
                <Grid container spacing={2}>
                    {error && (
                        <Grid size={{ xs: 12 }}>
                            <Alert severity="error">{error}</Alert>
                        </Grid>
                    )}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Please select a reason for rejecting this entry:
                        </Typography>
                        <SelectDefault
                            fullWidth
                            options={invalidReasonList.filter((item) => item.status === 1)}
                            size="small"
                            label="Invalid Reason"
                            placeholder="Select a reason..."
                            value={selectedReason}
                            onChange={(e) => {
                                setSelectedReason(Number(e.target.value) || null);
                                setError(null);
                            }}
                            disabled={isLoading}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ pb: 2.5, px: 3, gap: 1 }}>
                <Button variant="outlined" onClick={handleClose} disabled={isLoading} sx={{ width: 125 }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleReject}
                    disabled={isLoading || !selectedReason}
                    sx={{ width: 125 }}
                >
                    {isLoading ? 'Rejecting...' : 'Reject'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

const ModalReject = React.memo(ModalRejectComponent);
export default ModalReject;
