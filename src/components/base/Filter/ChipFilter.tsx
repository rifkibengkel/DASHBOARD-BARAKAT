import * as React from "react";
import Chip from "@mui/material/Chip";
import { useFilterStore } from "@/stores/useFilter";
import dayjs from "dayjs";

interface ChipData {
  key: string;
  label: string;
  originalKey: string | string[];
}

interface ChipFilterProps {
  excludeFilters?: string[];
  prizeList?: { id: number; name: string }[];
  prizeCategoryList?: { id: number; name: string }[];
}

export default function ChipFilter({
  excludeFilters = [],
  prizeList = [],
  prizeCategoryList = [],
}: ChipFilterProps) {
  const { filter, setFilter } = useFilterStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const chipData = React.useMemo(() => {
    const chips: ChipData[] = [];

    // Valid
    if (
      !excludeFilters.includes("isValid") &&
      filter.isValid &&
      String(filter.isValid) !== "-1"
    ) {
      const label =
        String(filter.isValid) === "1"
          ? "Valid"
          : String(filter.isValid) === "0"
          ? "Invalid"
          : "Valid Status: " + filter.isValid;
      chips.push({ key: "isValid", label: label, originalKey: "isValid" });
    }

    // Date Range
    if (!excludeFilters.includes("dateRange")) {
      if (filter.startDate && filter.endDate) {
        const start = dayjs(filter.startDate).format("DD/MM/YYYY");
        const end = dayjs(filter.endDate).format("DD/MM/YYYY");
        chips.push({
          key: "dateRange",
          label: `${start} - ${end}`,
          originalKey: ["startDate", "endDate"],
        });
      } else if (filter.startDate) {
        const start = dayjs(filter.startDate).format("DD/MM/YYYY");
        chips.push({
          key: "startDate",
          label: `From: ${start}`,
          originalKey: "startDate",
        });
      } else if (filter.endDate) {
        const end = dayjs(filter.endDate).format("DD/MM/YYYY");
        chips.push({
          key: "endDate",
          label: `To: ${end}`,
          originalKey: "endDate",
        });
      }
    }

    // Approved Admin
    if (
      !excludeFilters.includes("isApprovedAdmin") &&
      filter.isApprovedAdmin &&
      String(filter.isApprovedAdmin) !== "-1"
    ) {
      const label =
        String(filter.isApprovedAdmin) === "1"
          ? "Approved"
          : String(filter.isApprovedAdmin) === "0"
          ? "Rejected"
          : "Approval: " + filter.isApprovedAdmin;
      chips.push({
        key: "isApprovedAdmin",
        label: label,
        originalKey: "isApprovedAdmin",
      });
    }

    // Approved (for Winner pages)
    if (
      !excludeFilters.includes("isApproved") &&
      filter.isApproved &&
      String(filter.isApproved) !== "-1"
    ) {
      const label =
        String(filter.isApproved) === "1"
          ? "Approved"
          : String(filter.isApproved) === "0"
          ? "Pending"
          : "Approval: " + filter.isApproved;
      chips.push({
        key: "isApproved",
        label: label,
        originalKey: "isApproved",
      });
    }

    // Prize (for Winner pages)
    if (
      !excludeFilters.includes("prizeId") &&
      filter.prizeId &&
      Number(filter.prizeId) !== -1
    ) {
      const prize = prizeList.find((p) => p.id === Number(filter.prizeId));
      const label = prize ? prize.name : `Prize ID: ${filter.prizeId}`;
      chips.push({
        key: "prizeId",
        label: label,
        originalKey: "prizeId",
      });
    }

    // Prize Category
    if (
      !excludeFilters.includes("prizeCategoryId") &&
      filter.prizeCategoryId &&
      Number(filter.prizeCategoryId) !== -1
    ) {
      let label: string;

      if (Number(filter.prizeCategoryId) === 99) {
        label = "Tidak Beruntung";
      } else {
        const prizeCategory = prizeCategoryList.find(
          (p) => p.id === Number(filter.prizeCategoryId)
        );
        label = prizeCategory
          ? prizeCategory.name
          : `Prize Category ID: ${filter.prizeCategoryId}`;
      }

      chips.push({
        key: "prizeCategoryId",
        label: label,
        originalKey: "prizeCategoryId",
      });
    }

    return chips;
  }, [filter, excludeFilters, prizeList, prizeCategoryList]);

  const handleDelete = (chipToDelete: ChipData) => () => {
    if (Array.isArray(chipToDelete.originalKey)) {
      const updates: Record<string, any> = {};
      chipToDelete.originalKey.forEach((k) => (updates[k] = ""));
      setFilter(updates);
    } else {
      let newValue: any = "";
      if (chipToDelete.originalKey.startsWith("is")) {
        newValue = -1;
      } else if (
        chipToDelete.originalKey === "prizeId" ||
        chipToDelete.originalKey === "prizeCategoryId"
      ) {
        newValue = -1;
      }
      setFilter({ [chipToDelete.originalKey]: newValue });
    }
  };

  if (!mounted || chipData.length === 0) {
    return null;
  }

  return (
    <ul
      style={{
        display: "flex",
        justifyContent: "flex-start",
        flexWrap: "wrap",
        listStyle: "none",
        padding: 0,
        margin: 0,
      }}
    >
      {chipData.map((data) => {
        return (
          <li key={data.key} style={{ margin: 4 }}>
            <Chip label={data.label} onDelete={handleDelete(data)} />
          </li>
        );
      })}
    </ul>
  );
}
