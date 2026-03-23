import React from "react";
import { Menu, PaginatedResponse, Allocation } from "@/types";
import { TableDefault } from "@/components/base/Table";
import { TableHeader } from "@/components/base/Table/Table.types";

interface AllocationTableProps {
  pageRole: Menu;
  data: PaginatedResponse<Allocation>;
  isLoading: boolean;
  isError: boolean;
}

export function TableAllocation(props: AllocationTableProps) {
  const { data, isLoading, isError } = props;

  const header: TableHeader<Allocation>[] = [
    { key: "no", align: "center", label: "No", width: 75 },
    { key: "allocation_date", align: "left", label: "Allocation Date" },
    { key: "prize", align: "left", label: "Prize" },
    { key: "region", align: "left", label: "Region" },
    { key: "store", align: "left", label: "Store" },
    { key: "allocation_unused", align: "center", label: "Unused" },
    { key: "allocation_used", align: "center", label: "Used" },
    { key: "allocation_total", align: "center", label: "Total" },
    { key: "allocation_percentage", align: "center", label: "Percentage" },
  ];

  return (
    <TableDefault
      header={header}
      data={data}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
