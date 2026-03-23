import React from 'react';
import { Menu, PaginatedResponse, RegistrationData } from '@/types';
import { TableDefault } from '@/components/base/Table';
import { TableHeader } from '@/components/base/Table/Table.types';

interface RegistrationDataTableProps {
    pageRole: Menu;
    data: PaginatedResponse<RegistrationData>;
    isLoading: boolean;
    isError: boolean;
}

export function TableRegistration(props: RegistrationDataTableProps) {
    const { data, isLoading, isError } = props;

    const header: TableHeader<RegistrationData>[] = [
        { key: 'no', align: 'center', label: 'No', width: 75 },
        { key: 'created_at', align: 'left', label: 'Created At' },
        { key: 'fullname', align: 'left', label: 'Fullname' },
        { key: 'gender', align: 'left', label: 'Gender' },
        { key: 'identity', align: 'left', label: 'Identity' },
        { key: 'age', align: 'left', label: 'Age' },
        { key: 'birthdate', align: 'left', label: 'Birth Date' },
        { key: 'hp', align: 'left', label: 'HP' },
        { key: 'city', align: 'left', label: 'City' },
    ];

    return <TableDefault header={header} data={data} isLoading={isLoading} isError={isError} />;
}
