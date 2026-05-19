/**
 * Category Management Component
 *
 * This component provides an interface for managing colleges and their associated streams.
 * It allows administrators to:
 * - View all colleges and their streams
 * - Search for specific colleges
 * - Add new colleges
 * - Upload resumes in bulk
 * - View, edit, and manage college-stream configurations
 * - Generate and copy invite links for specific college-stream combinations
 */

import { useEffect, useRef, useState } from "react";
import { useMemo } from "react";
import {
  Box,
  Divider,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Paper,
  Pagination,
  InputAdornment,
  Popover,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import {
  Add,
  CheckCircleOutline,
  DeleteOutlined,
  EditOutlined,
  LinkOutlined,
  SearchOutlined,
  VisibilityOutlined,
  ArrowBackIosNew as ArrowBackIosNewIcon,
} from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import CustomButton from "../components/button";
import Text from "../components/textComponent";
import PaginationFooter from "../components/PaginationFooter";
import { categoryStyles } from "../styles/categoryManagement.styles";
import { deleteCollege, getColleges, getStatus, getStreams } from "../api/api";
import ConfirmationDialog from "../components/confirmationDialog";
import { useNavigate } from "react-router-dom";
import { useRowsPerPage } from "../hooks/useRowsPerPage";
import { routes } from "../constants/routes";
import CustomSelect from "../components/customSelect";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { globalStyles } from "../config";
import copy from "copy-to-clipboard";
import dayjs from "dayjs";
import { loadSessionStorageObject } from "../utils/sessionStorage";

// Define a type for the row objects
interface CategoryRow {
  college: string;
  collegeId: string;
  stream: string;
  streamId: string;
  status: boolean;
  createdAt: string;
}

const searchStorageKey = "categoryManagement_search";
type SortColumn = "college" | "createdAt" | null;
type SortOrder = "asc" | "desc";

function CategoryManagement() {
  const navigate = useNavigate();
  // Number of items to display per page in the table
  const { rowsPerPage, setRowsPerPage, handleRowsPerPageChange } =
    useRowsPerPage({
      defaultRowsPerPage: 10,
      storageKey: "categoryManagement_rowsPerPage",
    });

  // State management for the component
  const [data, setData] = useState<any>([]); // Stores the complete dataset
  const [page, setPage] = useState(1); // Current page number for pagination
  const [totalCount, setTotalCount] = useState(1); // Total count of colleges

  const initialSearchQueryRef = useRef(
    loadSessionStorageObject<{ searchQuery?: string }>(searchStorageKey)
      ?.searchQuery ?? ""
  );
  const [searchQuery, setSearchQuery] = useState(
    initialSearchQueryRef.current
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(
    initialSearchQueryRef.current.trim()
  );

  // State for invite link dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<{
    collegeId: string;
    collegeName: string;
    streams: { streamId: string; streamName: string }[];
  } | null>(null);
  const [copiedStreamId, setCopiedStreamId] = useState<string | null>(null);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [activeCollegeId, setActiveCollegeId] = useState<string | null>(null);
  const [streamPopoverType, setStreamPopoverType] = useState<
    "stream" | "status" | null
  >(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "error" | "success" | "info" | "warning",
  });

  const [sortBy, setSortBy] = useState<SortColumn>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    collegeId: string;
    collegeName: string;
  } | null>(null);

  const toggleSort = (column: Exclude<SortColumn, null>) => {
    if (sortBy !== column) {
      setSortBy(column);
      setSortOrder("asc");
      setPage(1);
    } else {
      if (sortOrder === "desc") {
        setSortBy(null);
        setSortOrder("asc");
        setPage(1);
        return;
      }
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      setPage(1);
    }
  };

  const handlePopoverClick = (
    event: React.MouseEvent<HTMLElement>,
    collegeId: string,
    type: "stream" | "status"
  ) => {
    setPopoverAnchorEl(event.currentTarget);
    setActiveCollegeId(collegeId);
    setStreamPopoverType(type);
  };

  const handlePopoverClose = () => {
    setPopoverAnchorEl(null);
    setActiveCollegeId(null);
    setStreamPopoverType(null);
  };

  const isPopoverOpen = Boolean(popoverAnchorEl);

  // Open delete confirmation dialog
  const handleDeleteCollege = (collegeId: string, collegeName: string) => {
    setDeleteTarget({ collegeId, collegeName });
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete (placeholder; hook actual API when available)
  const confirmDeleteCollege = async () => {
    try {
      if (!deleteTarget) return;

      // Call the delete college API
      await deleteCollege(deleteTarget.collegeId);

      // Remove the deleted college from the local data
      setData((prevData: any[]) =>
        prevData.filter((row: CategoryRow) => row.collegeId !== deleteTarget.collegeId)
      );

      // Update total count
      setTotalCount((prevTotal) => Math.max(0, prevTotal - 1));

      // Reset to first page if current page is empty
      if (data.filter((row: CategoryRow) => row.collegeId !== deleteTarget.collegeId).length === 0 && page > 1) {
        setPage(1);
      }

      showMessage("College deleted successfully", "success");
    } catch (e) {
      showMessage("Failed to delete college", "error");
      console.error("Delete college error:", e);
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };


  const cancelDeleteCollege = () => {
    setIsDeleteDialogOpen(false);
    setTimeout(() => {
      setDeleteTarget(null);
    }, 200);
  };

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setPage(1); // reset to first page on search
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      sessionStorage.setItem(
        searchStorageKey,
        JSON.stringify({ searchQuery })
      );
    } catch { }
  }, [searchQuery, searchStorageKey]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiSortBy =
          sortBy === "college"
            ? "name"
            : sortBy === "createdAt"
              ? "created_at"
              : undefined;
        const apiSortOrder = sortBy
          ? sortOrder === "asc"
            ? "ASC"
            : "DESC"
          : undefined;
        const [colleges, streams, status] = await Promise.all([
          getColleges(
            page,
            rowsPerPage,
            debouncedSearchQuery || undefined,
            apiSortBy as any,
            apiSortOrder as any
          ),
          getStreams(),
          getStatus(),
        ]);

        setTotalCount(colleges.total);

        // Build a lookup map for status
        const statusMap: { [collegeId: string]: Set<string> } = {};
        status.forEach((item: any) => {
          statusMap[item.collegeId] = new Set(item.streamIds);
        });

        const parsedData = colleges.data.flatMap((college: any) =>
          college.streamIds.map((streamId: string) => {
            const streamObj = streams.find((s: any) => s.id === streamId);

            // Check status
            const hasStatus =
              statusMap[college.id] && statusMap[college.id].has(streamId);

            return {
              college: college.name,
              collegeId: college.id,
              createdAt: college.created_at,
              stream: streamObj?.name ?? "Unknown Stream",
              streamId,
              status: !!hasStatus, // true if present, false otherwise
            };
          })
        );

        setData(parsedData);
      } catch (err) {
        console.error("Error loading colleges or streams:", err);
      }
    };

    fetchData();
  }, [page, rowsPerPage, debouncedSearchQuery, sortBy, sortOrder]);

  const groupedData = useMemo(() => {
    return data.reduce(
      (acc: Record<string, CategoryRow[]>, row: CategoryRow) => {
        (acc[row.college] ||= []).push(row);
        return acc;
      },
      {}
    );
  }, [data]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const showMessage = (
    message: string,
    severity: "error" | "success" | "info" | "warning" = "success"
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  return (
    <Box p={"0vh 2.5vh 2.5vh"} pb={"4vh"} pt={"0vh"}>
      {/* Header Banner */}
      <Box
        sx={{
          background: "#fff",
          borderRadius: 0,
          padding: "1.5vh 0vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: "2vh",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "1.5vh" }}>
          <IconButton onClick={() => navigate(routes.adminHome)} sx={categoryStyles.backButton}>
            <ArrowBackIosNewIcon sx={categoryStyles.backIcon} />
          </IconButton>
          <Box
            sx={{
              width: "5.5vh",
              height: "5.5vh",
              borderRadius: "1.5vh",
              backgroundColor: "#00695c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SchoolOutlinedIcon sx={{ fontSize: "3vh", color: "#fff" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "2.2vh", fontWeight: 700, color: "#1a1a1a", fontFamily: "Poppins, sans-serif" }}>
              Admin Management
            </Typography>
            <Typography sx={{ fontSize: "1.4vh", fontWeight: 400, color: "#99A1AF", fontFamily: "Poppins, sans-serif" }}>
              Fresher category — college & interview configuration
            </Typography>
          </Box>
        </Box>

        {/* Fresher/Lateral Toggle removed */}
        {/* <Box sx={{ display: "flex", alignItems: "center", gap: "4vh" }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: "2.4vh", fontWeight: 700, color: "#00695c" }}>
              {totalCount}
            </Typography>
            <Typography sx={{ fontSize: "1.2vh", fontWeight: 500, color: "#9e9e9e" }}>
              Total Colleges
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: "2.4vh", fontWeight: 700, color: "#00695c" }}>
              {data.length}
            </Typography>
            <Typography sx={{ fontSize: "1.2vh", fontWeight: 500, color: "#9e9e9e" }}>
              Total Resumes
            </Typography>
          </Box>
        </Box> */}
      </Box>

      {/* Search and Action Buttons Row */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      //mb="2vh"
      >
        {/* Search and Year Filter Container */}
        <Box display="flex" alignItems="center" gap="2vh">
          {/* Search input field with debounced search */}
          <TextField
            variant="outlined"
            placeholder="Search college name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ color: "#9e9e9e", fontSize: "2.2vh" }} />
                </InputAdornment>
              ),
            }}
            sx={{ ...categoryStyles.textfield, mb: "0vh" }}
          />

        </Box>
        {/* Action buttons for adding college and uploading resumes */}
        <Box display="flex" gap="1.5vh">
          <CustomButton
            type="primary"
            onClick={() => navigate(routes.collegeConfig)}
            additionalStyles={{ fontSize: "1.6vh", height: "4vh", borderRadius: "0.8vh", fontWeight: 600, backgroundColor: "#00695c", color: "#fff", fontFamily: "Poppins, sans-serif" }}
          >
            <Add sx={{ fontSize: "2vh" }} /> Add College
          </CustomButton>
          <CustomButton
            type="secondary"
            onClick={() => navigate(routes.aptitudeEvaluation)}
            additionalStyles={{ fontSize: "1.6vh", height: "4vh", borderRadius: "0.8vh", fontWeight: 600, color: "#FFFFFF", backgroundColor: "#00695C", borderColor: "#00695C", fontFamily: "Poppins, sans-serif" }}
          >
            <SettingsOutlinedIcon sx={{ fontSize: "1.8vh", mr: "0.5vh" }} /> Evaluate muAPT
          </CustomButton>
          <CustomButton
            type="secondary"
            onClick={() => navigate(routes.resumeUpload)}
            additionalStyles={{ fontSize: "1.6vh", height: "4vh", borderRadius: "0.8vh", fontWeight: 600, fontFamily: "Poppins, sans-serif", color: "#FFFFFF", backgroundColor: "#00695C", borderColor: "#00695C" }}
          >
            <UploadFileIcon sx={{ fontSize: "1.8vh", mr: "0.5vh" }} /> Upload Resume
          </CustomButton>
        </Box>
      </Box>

      {/* <Divider
        sx={{
          mb: "2vh",
          borderColor: "#e5e7eb",
        }}
      /> */}

      {/* Main table displaying colleges and their streams */}
      <Paper sx={categoryStyles.tableWrapperPaper}>
        {/* Header table - fixed outside scrollable area */}
        <Table sx={categoryStyles.tableStyles} size="small">
          {<colgroup>
            <col style={{ width: "25.5%" }} />
            <col style={{ width: "20.5%" }} />
            <col style={{ width: "20.7%" }} />
            <col style={{ width: "19%" }} />
            <col style={{ width: "28%" }} />
          </colgroup>}
          <TableHead sx={categoryStyles.tableHead}>
            <TableRow sx={categoryStyles.teableHeadRow}>
              <TableCell
                sx={{
                  ...categoryStyles.tableHeadCell,
                  ...categoryStyles.tableHeadCellSortable,
                }}
                onClick={() => toggleSort("college")}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "0.8vh", fontSize: "1.6vh" }}>
                  <SchoolOutlinedIcon sx={{ fontSize: "1.6vh", color: "#374151" }} />
                  College
                  {sortBy === "college" ? (
                    <ArrowDownwardIcon
                      className="sortIcon"
                      sx={{
                        fontSize: "1.6vh",
                        opacity: 1,
                        transition: "transform 0.2s ease, opacity 0.2s ease",
                        color: "#a00",
                        transform: sortOrder === "asc" ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  ) : (
                    <SwapVertIcon
                      className="sortIcon"
                      sx={{
                        fontSize: "1.6vh",
                        opacity: 0.5,
                        transition: "transform 0.2s ease, opacity 0.2s ease",
                        color: "#383838",
                      }}
                    />
                  )}
                </Box>
              </TableCell>
              <TableCell sx={categoryStyles.tableHeadCell}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "0.8vh" }}>
                  <CheckBoxOutlinedIcon sx={{ fontSize: "1.6vh", color: "#374151" }} />
                  Stream
                </Box>
              </TableCell>
              <TableCell sx={categoryStyles.tableHeadCell}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "0.8vh" }}>
                  <UploadFileIcon sx={{ fontSize: "1.6vh", color: "#374151" }} />
                  Resumes Uploaded
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  ...categoryStyles.tableHeadCell,
                  ...categoryStyles.tableHeadCellSortable,
                }}
                onClick={() => toggleSort("createdAt")}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "0.8vh" }}>
                  <SettingsOutlinedIcon sx={{ fontSize: "1.6vh", color: "#374151" }} />
                  Scheduled At
                  {sortBy === "createdAt" ? (
                    <ArrowDownwardIcon
                      className="sortIcon"
                      sx={{
                        fontSize: "1.6vh",
                        opacity: 0.3,
                        transition: "transform 0.2s ease, opacity 0.2s ease",
                        color: "#a00",
                        transform: sortOrder === "asc" ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  ) : (
                    <SwapVertIcon
                      className="sortIcon"
                      sx={{
                        fontSize: "1.6vh",
                        opacity: 0.5,
                        transition: "transform 0.2s ease, opacity 0.2s ease",
                        color: "#383838",
                      }}
                    />
                  )}
                </Box>
              </TableCell>
              <TableCell sx={categoryStyles.tableHeadCell}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "0.8vh" }}>
                  <SettingsOutlinedIcon sx={{ fontSize: "1.6vh", color: "#374151" }} />
                  Actions
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
        </Table>

        {/* Scrollable body table */}
        <TableContainer component="div" sx={categoryStyles.tableContainer}>
          <Table sx={categoryStyles.tableStyles} size="small">
            {<colgroup>
              <col style={{ width: "25.5%" }} />
              <col style={{ width: "20.5%" }} />
              <col style={{ width: "21%" }} />
              <col style={{ width: "19%" }} />
              <col style={{ width: "19%" }} />
            </colgroup>}
            <TableBody>
              {Object.entries(groupedData).map(([collegeName, rows]) => {
                const typedRows = rows as CategoryRow[];
                const collegeId = typedRows[0].collegeId;

                return (
                  <TableRow key={collegeId}>
                    <TableCell sx={categoryStyles.tableBodyCell}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: "1vh" }}>
                        <Box
                          sx={{
                            width: "3.5vh",
                            height: "3.5vh",
                            minWidth: "3.5vh",
                            borderRadius: "50%",
                            backgroundColor: "#e0f2f1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <SchoolOutlinedIcon sx={{ fontSize: "2vh", color: "#00695c" }} />
                        </Box>
                        <Tooltip title={collegeName} placement="top" arrow>
                          <span>{collegeName.length > 35 ? collegeName.substring(0, 35) + "..." : collegeName}</span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell sx={categoryStyles.tableBodyCell}>
                      {(() => {
                        const firstFour = typedRows.slice(0, 4);
                        const remaining = typedRows.slice(4);

                        return (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "0.75vh",
                            }}
                          >
                            {firstFour.map((row: CategoryRow) => (
                              <Box
                                key={row.streamId}
                                sx={{
                                  padding: "0.25vh 1vh",
                                  borderRadius: "1vh",
                                  // backgroundColor: "#f0f0f0",
                                  fontSize: "1.5vh",
                                  fontWeight: 500,
                                  color: "#333",
                                }}
                              >
                                {row.stream}
                              </Box>
                            ))}

                            {remaining.length > 0 && (
                              <>
                                <Box
                                  onClick={(e: React.MouseEvent<HTMLElement>) =>
                                    handlePopoverClick(e, collegeId, "stream")
                                  }
                                  sx={{
                                    padding: "0.25vh 1vh",
                                    borderRadius: "1vh",
                                    backgroundColor: "#f0f0f0",
                                    fontSize: "1.5vh",
                                    fontWeight: 600,
                                    color: "#333",
                                    cursor: "pointer",
                                  }}
                                >
                                  +{remaining.length} more
                                </Box>

                                <Popover
                                  open={
                                    isPopoverOpen &&
                                    activeCollegeId === collegeId &&
                                    streamPopoverType === "stream"
                                  }
                                  anchorEl={popoverAnchorEl}
                                  onClose={handlePopoverClose}
                                  anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "left",
                                  }}
                                  transformOrigin={{
                                    vertical: "top",
                                    horizontal: "left",
                                  }}
                                >
                                  <Box sx={{ p: 2 }}>
                                    <Typography
                                      fontWeight="bold"
                                      fontSize="1.8vh"
                                      mb={1}
                                    >
                                      All Streams
                                    </Typography>
                                    <Box
                                      display="flex"
                                      flexDirection="column"
                                      gap={1}
                                    >
                                      {remaining.map((row: CategoryRow) => (
                                        <Box
                                          key={row.streamId}
                                          sx={{
                                            padding: "0.25vh 1vh",
                                            borderRadius: "1vh",
                                            backgroundColor: "#f0f0f0",
                                            fontSize: "1.5vh",
                                            color: "#333",
                                          }}
                                        >
                                          {row.stream}
                                        </Box>
                                      ))}
                                    </Box>
                                  </Box>
                                </Popover>
                              </>
                            )}
                          </Box>
                        );
                      })()}
                    </TableCell>

                    <TableCell sx={categoryStyles.tableBodyCell}>
                      {(() => {
                        const uploadedStreams = typedRows.filter(
                          (r: CategoryRow) => r.status === true
                        );
                        const firstThree = uploadedStreams.slice(0, 3);
                        const remaining = uploadedStreams.slice(3);

                        if (uploadedStreams.length === 0) {
                          return (
                            <Box
                              sx={{
                                display: "inline-block",
                                padding: "0.5vh 1.5vh",
                                borderRadius: "1.5vh",
                                fontSize: "1.8vh",
                                fontWeight: 500,
                                color: "#777",
                                backgroundColor: "#e0e0e0",
                                width: "fit-content",
                              }}
                            >
                              No resumes uploaded
                            </Box>
                          );
                        }

                        return (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "0.75vh",
                            }}
                          >
                            {firstThree.map((s: CategoryRow) => (
                              <Box
                                key={s.streamId}
                                sx={{
                                  padding: "0.25vh 1vh",
                                  borderRadius: "1vh",
                                  fontSize: "1.6vh",
                                  fontWeight: 500,
                                  color: "#007A55",
                                  backgroundColor: "#ECFDF5",
                                  border: "1px solid #D0FAE5",
                                  width: "fit-content",
                                }}
                              >
                                {s.stream}
                              </Box>
                            ))}

                            {remaining.length > 0 && (
                              <>
                                <Box
                                  onClick={(e: React.MouseEvent<HTMLElement>) =>
                                    handlePopoverClick(e, collegeId, "status")
                                  }
                                  sx={{
                                    padding: "0.25vh 1vh",
                                    borderRadius: "1vh",
                                    fontSize: "1.6vh",
                                    fontWeight: 600,
                                    color: "#05642a",
                                    backgroundColor: "#cef4dd",
                                    border: "1px solid #05642a",
                                    width: "fit-content",
                                    cursor: "pointer",
                                  }}
                                >
                                  +{remaining.length} more
                                </Box>

                                <Popover
                                  open={
                                    isPopoverOpen &&
                                    activeCollegeId === collegeId &&
                                    streamPopoverType === "status"
                                  }
                                  anchorEl={popoverAnchorEl}
                                  onClose={handlePopoverClose}
                                  anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "left",
                                  }}
                                  transformOrigin={{
                                    vertical: "top",
                                    horizontal: "left",
                                  }}
                                >
                                  <Box sx={{ p: 2 }}>
                                    <Typography
                                      fontWeight="bold"
                                      fontSize="1.8vh"
                                      mb={1}
                                    >
                                      Uploaded Streams
                                    </Typography>
                                    <Box
                                      display="flex"
                                      flexDirection="column"
                                      gap={1}
                                    >
                                      {remaining.map((s: CategoryRow) => (
                                        <Box
                                          key={s.streamId}
                                          sx={{
                                            padding: "0.25vh 1vh",
                                            borderRadius: "1vh",
                                            backgroundColor: "#cef4dd",
                                            border: "1px solid #05642a",
                                            fontSize: "1.5vh",
                                            color: "#05642a",
                                          }}
                                        >
                                          {s.stream}
                                        </Box>
                                      ))}
                                    </Box>
                                  </Box>
                                </Popover>
                              </>
                            )}
                          </Box>
                        );
                      })()}
                    </TableCell>

                    <TableCell sx={categoryStyles.tableBodyCell}>
                      {dayjs(typedRows[0].createdAt).format(
                        "DD MMMM YYYY hh:mm A"
                      )}
                    </TableCell>

                    <TableCell sx={categoryStyles.tableBodyCell}>
                      <Box display="flex" alignItems="center" gap={"1vh"}>
                        <Tooltip title="View" arrow placement="top">
                          <VisibilityOutlined
                            sx={{ cursor: "pointer", fontSize: "2vh" }}
                            onClick={() =>
                              navigate(routes.collegeConfig, {
                                state: {
                                  mode: "view",
                                  collegeId,
                                  streamIds: typedRows.map(
                                    (r: CategoryRow) => r.streamId
                                  ),
                                },
                              })
                            }
                          />
                        </Tooltip>

                        <Tooltip title="Edit" arrow placement="top">
                          <EditOutlined
                            sx={{ cursor: "pointer", fontSize: "2vh" }}
                            onClick={() =>
                              navigate(routes.collegeConfig, {
                                state: {
                                  mode: "edit",
                                  collegeId,
                                  streamIds: typedRows.map(
                                    (r: CategoryRow) => r.streamId
                                  ),
                                },
                              })
                            }
                          />
                        </Tooltip>

                        <Tooltip title="Invite link" arrow placement="top">
                          <LinkOutlined
                            sx={{ cursor: "pointer", fontSize: "2vh" }}
                            onClick={() => {
                              setSelectedCollege({
                                collegeId,
                                collegeName,
                                streams: typedRows.map((r: CategoryRow) => ({
                                  streamId: r.streamId,
                                  streamName: r.stream,
                                })),
                              });
                              setOpenDialog(true);
                            }}
                          />
                        </Tooltip>

                        <Tooltip title="Delete" arrow placement="top">
                          <DeleteOutlined
                            sx={{ cursor: "pointer", fontSize: "2vh" }}
                            onClick={() => {
                              handleDeleteCollege(collegeId, collegeName);
                            }}
                          />
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/* Pagination Footer */}
      <PaginationFooter
        count={totalCount}
        page={page - 1}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage + 1)}
        onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          handleRowsPerPageChange(event);
          setPage(1);
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
        showFirstButton
        showLastButton
        paginationStyles={categoryStyles.pagination}
      />

      {/* Dialog for displaying and copying invite links */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setCopiedStreamId(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "1.2vh", backgroundColor: "#f9fafb" } }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(108deg, #004d40 0%, #00605a 45%, #004d40 100%)",
            padding: "2vh 2.5vh",
            fontWeight: 700,
            fontSize: "1.8vh",
            fontFamily: "Poppins, sans-serif",
            color: "white",
          }}
        >
          Invite Links
        </DialogTitle>
        <DialogContent sx={{ padding: "2.5vh" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1.6vh", fontFamily: "Poppins, sans-serif", color: "#111827", mb: "0.5vh" }}>
            {selectedCollege?.collegeName}
          </Typography>
          <Typography sx={{ fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#6b7280", mb: "2vh" }}>
            Use these links to invite candidates for each specific stream
          </Typography>

          {selectedCollege?.streams.map(({ streamId, streamName }) => {
            const baseUrl = (process.env.REACT_APP_LINK_PATH || "").replace(/\/+$/, "");
            const inviteLink = `${baseUrl}/candidate-home?collegeId=${selectedCollege?.collegeId}&streamId=${streamId}`;
            return (
              <Box key={streamId} sx={{ mb: "2vh" }}>
                <Typography sx={{ fontWeight: 600, fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#374151", mb: "0.8vh" }}>
                  {streamName}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: "0.8vh", backgroundColor: "white", padding: "0.8vh 1.2vh", borderRadius: "0.6vh", border: "1px solid #e5e7eb" }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={inviteLink}
                    InputProps={{ readOnly: true }}
                    variant="standard"
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      "& .MuiInput-underline:before, & .MuiInput-underline:after": { display: "none" },
                      "& .MuiInputBase-input": {
                        padding: "0.4vh 0",
                        fontSize: "1.3vh",
                        fontFamily: "Poppins, sans-serif",
                        color: "#374151",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    }}
                  />
                  <Tooltip title={copiedStreamId === streamId ? "Copied!" : "Copy to clipboard"}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const timestamp = Date.now();
                        const expiryTime = timestamp + 525600 * 60 * 1000;
                        const inviteLinkWithTimestamp = `${inviteLink}&expiry=${expiryTime}`;
                        const copied = copy(inviteLinkWithTimestamp);
                        if (copied) {
                          setCopiedStreamId(streamId);
                          showMessage("Link copied to clipboard!", "success");
                        } else {
                          showMessage("Failed to copy link", "error");
                        }
                      }}
                      sx={{ color: "#6b7280", "&:hover": { color: "#111827", backgroundColor: "#f3f4f6" } }}
                    >
                      {copiedStreamId === streamId ? (
                        <CheckCircleOutline color="success" sx={{ fontSize: "1.8vh" }} />
                      ) : (
                        <ContentCopyIcon sx={{ fontSize: "1.6vh" }} />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          })}
        </DialogContent>
        <DialogActions sx={{ padding: "1.5vh 2.5vh", backgroundColor: "#f9fafb" }}>
          <Button
            onClick={() => {
              setOpenDialog(false);
              setCopiedStreamId(null);
            }}
            sx={{
              textTransform: "none",
              fontSize: "1.3vh",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              color: "#fff",
              backgroundColor: "#00695C",
              borderRadius: "0.6vh",
              padding: "0.6vh 2vh",
              "&:hover": { backgroundColor: "#004d40" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        title="Delete College"
        confirmText="Yes"
        cancelText="No"
        message={<Box>
          Are you sure you want to delete{" "}
          <strong>{deleteTarget?.collegeName}</strong>? <br />This action will delete
          all the users and conversations associated with this college.
          <br />
          <strong>Do you want to proceed?</strong>
        </Box>}
        onConfirm={confirmDeleteCollege}
        onClose={cancelDeleteCollege}
      />

      {/* Add Snackbar component at the end of the Box */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={100000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          padding: "1vh",
          minWidth: "15vw",
          "& .MuiPaper-root-MuiAlert-root .MuiAlert-icon": {
            fontSize: "3vh",
          },
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            fontSize: "2.5vh",
            padding: "1vh",
            alignItems: "center",
            "& .MuiSvgIcon-root": {
              fontSize: "5.5vh",
              marginRight: "1.5vh",
              padding: "1vh 0vh",
            },
            "& .MuiAlert-message": {
              padding: "1vh 0vh",
            },
            "& .MuiAlert-icon": {
              fontSize: "5.5vh",
              marginRight: "1.5vh",
              padding: "1vh 0vh",
            },
            "& .MuiAlert-action": {
              padding: "0.5vh 0vh 0vh 2vh",
              marginRight: "-2vh",
              fontSize: "3vh",
              // marginLeft:'3vw'
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CategoryManagement;
