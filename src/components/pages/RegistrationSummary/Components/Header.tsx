import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Menu } from '@/types';

interface HeaderProps {
    pageRole: Menu;
}

function HeaderRegistrationSummaryComponent(props: HeaderProps) {
    const {} = props;

    return (
        <Stack flexDirection={'column'} justifyContent={'space-between'} alignItems={'start'} gap={2}>
            <Typography variant="h4">Registration Summary</Typography>
            <Stack flexDirection={'row'} justifyContent={'end'} alignItems={'center'} alignSelf={'end'} gap={2}></Stack>
        </Stack>
    );
}

export const HeaderRegistrationSummary = React.memo(HeaderRegistrationSummaryComponent);
