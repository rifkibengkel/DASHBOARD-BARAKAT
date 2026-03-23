import React from 'react';
import { useRouter } from 'next/navigation';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import { Menu, PaginatedResponse, Roles } from '@/types';
import { TableDefault } from '@/components/base/Table';
import { TableHeader } from '@/components/base/Table/Table.types';

interface RolesTableProps {
    pageRole: Menu;
    data: PaginatedResponse<Roles>;
    isLoading: boolean;
    isError: boolean;
}

export function TableRoles(props: RolesTableProps) {
    const navigate = useRouter();
    const { pageRole, data, isLoading, isError } = props;

    const header: TableHeader<Roles>[] = [
        { key: 'role', align: 'left', label: 'Name' },
        { key: 'status', align: 'center', label: 'Status' },
        { key: 'action', align: 'center', label: 'Action' },
    ];

    const ButtonActionGroup = (row: Roles) => {
        return (
            <TableCell key={'action_group'}>
                <Stack direction="row" spacing={2} justifyContent={'center'}>
                    {pageRole.m_update === 1 && (
                        <Link
                            component="button"
                            variant="body2"
                            sx={{ color: 'inherit', textDecoration: 'none' }}
                            onClick={() => navigate.push(`/settings/roles/update?id=${row.id}`)}
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
