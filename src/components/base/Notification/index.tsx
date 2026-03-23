import React, { useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useNotificationStore } from '@/stores/useNotification';

export default function Notification() {
    const { current, remove } = useNotificationStore();

    useEffect(() => {
        if (current) {
            const timer = setTimeout(() => remove(), 3000);
            return () => clearTimeout(timer);
        }
    }, [current, remove]);

    if (!current) return null;

    return (
        <Snackbar open={!!current} anchorOrigin={current.position} onClose={remove} autoHideDuration={3000}>
            <Alert onClose={remove} severity={current.type} variant="filled">
                {current.message}
            </Alert>
        </Snackbar>
    );
}
