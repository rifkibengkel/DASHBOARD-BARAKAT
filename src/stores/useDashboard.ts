import { create } from 'zustand';
import { Dashboard, Menu } from '@/types';

interface GlobalDashboard {
    dashboard: Dashboard;
    setCollapse: () => void;
    setMobileView: (view: boolean) => void;
    setUserMenu: (payload: Pick<Dashboard, 'menu' | 'promo' | 'session'>) => void;
    setCurrentMenu: (payload: Menu) => void;
    resetDashboard: () => void;
}

const initialDashboard: GlobalDashboard['dashboard'] = {
    isMobile: false,
    collapsed: false,
    currentMenu: null,
    menu: [],
    session: { name: '', role: '' },
    promo: { periode_start: '', periode_end: '' },
};

export const useDashboardStore = create<GlobalDashboard>((set) => ({
    dashboard: initialDashboard,
    setCollapse: () =>
        set((state) => ({
            dashboard: {
                ...state.dashboard,
                collapsed: !state.dashboard.collapsed,
            },
        })),
    setMobileView: (view) =>
        set((state) => ({
            dashboard: {
                ...state.dashboard,
                isMobile: view,
            },
        })),
    setUserMenu: (payload) =>
        set((state) => ({
            dashboard: {
                ...state.dashboard,
                ...payload,
            },
        })),
    setCurrentMenu: (payload) =>
        set((state) => ({
            dashboard: {
                ...state.dashboard,
                currentMenu: payload,
            },
        })),
    resetDashboard: () =>
        set({
            dashboard: initialDashboard,
        }),
}));
