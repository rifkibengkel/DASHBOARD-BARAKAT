import { Coupon } from '@/types';
import { Divider, Stack, Typography, Paper, Chip } from '@mui/material';
import dayjs from 'dayjs';

interface CouponResultCardProps {
    item: Coupon;
}

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
            {label}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
            {value ?? '-'}
        </Typography>
    </Stack>
);

export const CouponResultCard: React.FC<CouponResultCardProps> = ({ item }) => {
    const isUsed = item.status === 1;
    const usedColor = isUsed ? 'error' : 'success';
    const usedLabel = isUsed ? 'USED' : 'AVAILABLE';

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                transition: 'all 0.2s ease',
                '&:hover': { boxShadow: 3 },
            }}
        >
            <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1" fontWeight={700}>
                        {item.coupon}
                    </Typography>
                    <Chip
                        label={usedLabel}
                        color={usedColor}
                        size="small"
                        variant={isUsed ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 600 }}
                    />
                </Stack>

                <Divider flexItem sx={{ my: 0.5 }} />

                <InfoRow label="Used By:" value={item.sender || '-'} />
                <InfoRow
                    label="Used Date:"
                    value={item.use_date ? dayjs(item.use_date).format('DD/MM/YYYY HH:mm:ss') : '-'}
                />
            </Stack>
        </Paper>
    );
};
