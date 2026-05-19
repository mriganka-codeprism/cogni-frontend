import React from "react";
import { Box, TablePagination, SxProps, Theme } from "@mui/material";

interface PaginationFooterProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  rowsPerPageOptions?: number[];
  labelRowsPerPage?: string;
  showFirstButton?: boolean;
  showLastButton?: boolean;
  paginationStyles?: SxProps<Theme>;
  isFullWidth?: boolean;
}

const PaginationFooter: React.FC<PaginationFooterProps> = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50, 100],
  labelRowsPerPage = "Rows per page:",
  showFirstButton = true,
  showLastButton = true,
  paginationStyles = {},
  isFullWidth = false,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        width: isFullWidth ? "100%" : "100%",
        boxSizing: "border-box",
        position: "fixed",
        bottom: 0,
        right: isFullWidth ? "auto" : 0,
        left: isFullWidth ? 0 : "auto",
        backgroundColor: "#fff",
        borderTop: "0.15vh solid rgba(224,224,224,0.5)",
        zIndex: 10,
        paddingRight: "2vh",
        "&:last-child": {
          padding: "0.5vh",
          minHeight: "5vh",
          width: isFullWidth ? "100%" : "100%",
        },
      }}
    >
      <TablePagination
        component="div"
        count={count}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage={labelRowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        showFirstButton={showFirstButton}
        showLastButton={showLastButton}
        sx={paginationStyles}
      />
    </Box>
  );
};

export default PaginationFooter;
