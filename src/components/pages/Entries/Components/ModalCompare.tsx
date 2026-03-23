/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Close from '@mui/icons-material/Close';
import BrokenImage from '@mui/icons-material/BrokenImage';
import { useModalStore } from '@/stores/useModal';

interface ModalCompareProps {
    currentImage: string;
    invalidImage: string;
}

interface SafeImageProps {
    src?: string;
    alt: string;
}

const SafeImage: React.FC<SafeImageProps> = ({ src, alt }) => {
    const [hasError, setHasError] = React.useState(false);
    const isEmpty = !src || src.trim() === '';

    if (hasError || isEmpty) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: 300,
                    background: '#f5f5f5',
                    borderRadius: 8,
                }}
            >
                <BrokenImage color="disabled" fontSize="large" />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            style={{ width: '100%', height: 'auto', objectFit: 'contain', borderRadius: 8 }}
        />
    );
};

const ModalCompareComponent: React.FC<ModalCompareProps> = ({ currentImage, invalidImage }) => {
    const { modals, hideModal } = useModalStore();
    const modal = modals['entries-compare'];

    const handleClose = () => hideModal('entries-compare');

    return (
        <Dialog open={Boolean(modal?.show)} maxWidth="sm" fullWidth>
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h6" color="error">
                    Compare Receipt Image
                </Typography>
                <IconButton onClick={handleClose} sx={{ ':hover': { background: 'transparent' } }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                        <SafeImage src={currentImage} alt={'current image'} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <SafeImage src={invalidImage} alt={'invalid image'} />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ pb: 2, px: 3 }}>
                <Button variant="outlined" onClick={handleClose} sx={{ width: 125 }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(ModalCompareComponent);
