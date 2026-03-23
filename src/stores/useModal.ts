import { create } from 'zustand';

interface Modal {
    show: boolean;
    id: string | number;
    type: 'create' | 'update' | 'delete' | 'view' | 'filter';
}

interface GlobalModal {
    modals: Record<string, Modal>;
    showModal: (key: string, modal: Omit<Modal, 'show'>) => void;
    hideModal: (key: string) => void;
    resetModals: () => void;
}

export const useModalStore = create<GlobalModal>((set) => ({
    modals: {},

    showModal: (key, modal) =>
        set((state) => ({
            modals: {
                ...state.modals,
                [key]: { ...modal, show: true },
            },
        })),

    hideModal: (key) =>
        set((state) => ({
            modals: {
                ...state.modals,
                [key]: { ...state.modals[key], show: false },
            },
        })),

    resetModals: () => set({ modals: {} }),
}));
