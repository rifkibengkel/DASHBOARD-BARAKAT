import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { TextFieldDefault } from "@/components/base/Form/TextField";
import { useModalStore } from "@/stores/useModal";
import { Menu } from "@/types";
import { useFilterStore } from "@/stores/useFilter";
import { appendParams } from "@/lib/utils";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import ChipFilter from "@/components/base/Filter/ChipFilter";

interface HeaderProps {
  pageRole: Menu;
  prizeCategoryList?: { id: number; name: string }[];
}

function HeaderEntriesComponent(props: HeaderProps) {
  const { pageRole } = props;
  const { showModal } = useModalStore();
  const { filter, setFilter } = useFilterStore();
  const [localSearch, setLocalSearch] = React.useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(event.target.value);
  };

  React.useEffect(() => {
    setLocalSearch(filter.key ?? "");
  }, [filter.key]);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setFilter({ key: localSearch });
    }, 500);

    return () => clearTimeout(handler);
  }, [localSearch, setFilter]);

  const exportData = () => {
    const paramQuery = new URLSearchParams();
    appendParams(paramQuery, filter);

    const exportUrl = `/api/entries/export?${
      paramQuery.toString() ? `${paramQuery.toString()}` : ``
    }`;

    const link = document.createElement("a");
    link.href = exportUrl;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Stack
      flexDirection={"column"}
      justifyContent={"space-between"}
      alignItems={"start"}
      gap={2}
    >
      <Typography variant="h4">Entries</Typography>
      <Stack
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        gap={2}
      >
        <div style={{ flex: 1 }}>
          <ChipFilter prizeCategoryList={props.prizeCategoryList} />
        </div>
        <Stack
          flexDirection={"row"}
          justifyContent={"end"}
          alignItems={"center"}
          gap={2}
          sx={{ flexShrink: 0 }}
        >
          {pageRole?.m_insert === 1 && (
            <Button
              variant="outlined"
              onClick={exportData}
              sx={{ width: 150, flexShrink: 0 }}
              startIcon={<FileDownloadRoundedIcon />}
            >
              Export
            </Button>
          )}
          <TextFieldDefault
            size="small"
            fullWidth
            placeholder="Search"
            value={localSearch ?? ""}
            onChange={handleSearchChange}
            sx={{ width: 300 }}
          />

          <Button
            variant="contained"
            onClick={() =>
              showModal("entries-filter", { id: "", type: "filter" })
            }
            sx={{ width: 150, flexShrink: 0 }}
            startIcon={<FilterListRoundedIcon />}
          >
            Filter
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}

export const HeaderEntries = React.memo(HeaderEntriesComponent);
