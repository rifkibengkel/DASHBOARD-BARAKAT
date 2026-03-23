import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { TextFieldDefault } from "@/components/base/Form/TextField";
import { useModalStore } from "@/stores/useModal";
import { Menu } from "@/types";
import { useFilterStore } from "@/stores/useFilter";
import { usePaginationStore } from "@/stores/usePagination";

interface HeaderProps {
  pageRole: Menu;
}

function HeaderTestingDataComponent(props: HeaderProps) {
  const { pageRole } = props;
  const { showModal } = useModalStore();
  const { filter, setFilter } = useFilterStore();
  const { setPagination } = usePaginationStore();
  const [localSearch, setLocalSearch] = React.useState(filter.key ?? "");

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
  }, [localSearch, setFilter, setPagination]);

  return (
    <Stack
      flexDirection={"column"}
      justifyContent={"space-between"}
      alignItems={"start"}
      gap={2}
    >
      <Typography variant="h4">Testing Data</Typography>
      <Stack
        flexDirection={"row"}
        justifyContent={"end"}
        alignItems={"center"}
        alignSelf={"end"}
        gap={2}
      >
        <TextFieldDefault
          size="small"
          fullWidth
          placeholder="Search"
          value={localSearch ?? ""}
          onChange={handleSearchChange}
          sx={{ width: 300 }}
        />
        {pageRole?.m_insert === 1 && (
          <Button
            variant="outlined"
            onClick={() =>
              showModal("testing-data-add", { id: "", type: "create" })
            }
            sx={{ width: 150 }}
          >
            Add Tester
          </Button>
        )}

        {/* {pageRole?.m_delete === 1 && (
          <Button
            variant="contained"
            onClick={() =>
              showModal("testing-data-delete", { id: "", type: "create" })
            }
            sx={{ width: 150 }}
          >
            Delete All
          </Button>
        )} */}
      </Stack>
    </Stack>
  );
}

export const HeaderTestingData = React.memo(HeaderTestingDataComponent);
