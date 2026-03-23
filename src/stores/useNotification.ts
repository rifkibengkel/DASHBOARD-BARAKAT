import { create } from 'zustand';
import { AlertColor } from '@mui/material/Alert';

interface NotificationPosition {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
}

export interface Notification {
    id?: string;
    type: AlertColor;
    message: string;
    position?: NotificationPosition;
}

interface NotificationStore {
    queue: Notification[];
    current?: Notification;
    notify: (notification: Notification) => void;
    remove: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    queue: [],
    current: undefined,
    notify: (notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        const notifWithId = {
            ...notification,
            id,
            position: notification.position ?? { vertical: 'top', horizontal: 'right' },
        };
        set((state) => {
            const newQueue = [...state.queue, notifWithId];
            return { queue: newQueue, current: state.current ?? newQueue[0] };
        });
    },
    remove: () => {
        set((state) => {
            const [, ...rest] = state.queue;
            return { queue: rest, current: rest[0] };
        });
    },
}));
