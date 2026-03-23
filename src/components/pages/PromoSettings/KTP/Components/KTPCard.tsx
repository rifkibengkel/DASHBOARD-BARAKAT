import { KTPCheck } from '@/types';
import { Divider, Stack, Typography, Paper } from '@mui/material';

interface KTPResultCardProps {
    item: KTPCheck;
}

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
            {label}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
            : {value ?? '-'}
        </Typography>
    </Stack>
);

export const KTPResultCard: React.FC<KTPResultCardProps> = ({ item }) => (
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
            <Typography variant="subtitle1" fontWeight={700}>
                {item.identity}
            </Typography>

            <Divider flexItem sx={{ my: 0.5 }} />

            <InfoRow label="Age" value={`${item.age.toLocaleString()} Tahun`} />
            <InfoRow label="Gender" value={item.gender === 'M' ? 'Laki-Laki' : 'Perempuan'} />
            <InfoRow label="Birth Date" value={item.birthdate} />
            <InfoRow label="Province" value={item.province} />
            <InfoRow label="City" value={item.city} />
            <InfoRow label="District" value={item.district} />
        </Stack>
    </Paper>
);
