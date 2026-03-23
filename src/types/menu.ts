export type Menu = {
    id: number;
    menu: string;
    path: string;
    level: number;
    sub: number;
    icon: string | null;
    sort?: number;
    status?: 0 | 1;
    status_text?: string;
    m_insert: 0 | 1;
    m_update: 0 | 1;
    m_delete: 0 | 1;
    m_view: 0 | 1;
    children: Menu[];
};
