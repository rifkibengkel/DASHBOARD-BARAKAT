export type Roles = {
    id: number;
    role: string;
    status?: 0 | 1;
    status_text?: string;
};

export type RoleMenu = {
    menuId: number;
    menu: string;
    m_insert: 0 | 1;
    m_update: 0 | 1;
    m_delete: 0 | 1;
    m_view: 0 | 1;
};

export type RolesDetail = Roles & {
    menu: RoleMenu[];
};
