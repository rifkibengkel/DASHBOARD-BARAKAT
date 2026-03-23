import React from 'react';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import { useModalStore } from '@/stores/useModal';
import { Menu, PaginatedResponse, Users } from '@/types';
import { TableDefault } from '@/components/base/Table';
import { TableHeader } from '@/components/base/Table/Table.types';

interface MenuTableProps {
    pageRole: Menu;
    data: PaginatedResponse<Users>;
    isLoading: boolean;
    isError: boolean;
}

export function TableUsers(props: MenuTableProps) {
    const { showModal } = useModalStore();
    const { pageRole, data, isLoading, isError } = props;

    const header: TableHeader<Users>[] = [
        { key: 'fullname', align: 'left', label: 'Fullname' },
        { key: 'username', align: 'left', label: 'Username' },
        { key: 'role', align: 'left', label: 'Role' },
        { key: 'status', align: 'center', label: 'Status' },
        { key: 'action', align: 'center', label: 'Action' },
    ];

    const ButtonActionGroup = (row: Users) => {
        return (
            <TableCell key={'action_group'}>
                <Stack direction="row" spacing={2} justifyContent={'center'}>
                    {pageRole.m_update === 1 && (
                        <Link
                            component="button"
                            variant="body2"
                            sx={{ color: 'inherit', textDecoration: 'none' }}
                            onClick={() => showModal('users', { id: row.id, type: 'update' })}
                        >
                            Modify
                        </Link>
                    )}
                </Stack>
            </TableCell>
        );
    };

    return (
        <TableDefault action={ButtonActionGroup} header={header} data={data} isLoading={isLoading} isError={isError} />
    );
}
