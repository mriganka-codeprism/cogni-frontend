import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  TextField,
  Input,
  InputAdornment,
  CircularProgress,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  IconButton,
  Tooltip,
  Grid,
  Card,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Checkbox,
  Select,
  MenuItem,
  ListItemText,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  AccessTime,
  DateRange,
  SearchOutlined,
  GridView,
  ViewList,
  ContentCopy,
  ExpandMore,
  ExpandLess,
  FilterList,
  TuneOutlined,
} from "@mui/icons-material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { CallStatus, logoConfig } from "../constants/screensData";
import { adminHomeStyles } from "../styles/adminHome.styles";
import { styles as createJobPageStyles } from "../styles/createjob.styles";
import { statusColors } from "../constants/screensData";
import Text from "../components/textComponent";
import CustomButton from "../components/button";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { WarningAmberOutlined } from "@mui/icons-material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { globalStyles } from "../config";
import CustomSelect from "../components/customSelect";
import DateRangeSelector from "../components/dateRange/dateRangeFilter";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useNavigate, useNavigationType } from "react-router-dom";
import { routes } from "../constants/routes";
import {
  getAllInterviews,
  deleteConversationById,
  getColleges,
  getConversationDates,
  getRecordingUrl,
  getUserModels,
  getConversationMessages,
} from "../api/api";
import ConfirmationDialog from "../components/confirmationDialog";
import ProctoringViolationsModal from "../components/ProctoringViolationsModal";
import PaginationFooter from "../components/PaginationFooter";
import { categoryStyles } from "../styles/categoryManagement.styles";
import { useRowsPerPage } from "../hooks/useRowsPerPage";
import { loadSessionStorageObject } from "../utils/sessionStorage";

dayjs.extend(timezone);
dayjs.extend(utc);

interface ApiResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
}

type ColumnKey =
  | "name"
  | "email"
  | "job"
  | "date"
  | "duration"
  | "status"
  | "eval";
type SortDir = "asc" | "desc" | null;

const FILTER_STORAGE_KEY = "adminHomeFilters";

interface AdminHomeFilters {
  selectedStatus?: string;
  search?: string;
  currentPage?: number;
  startDate?: string | null;
  endDate?: string | null;
  selectedColleges?: { label: string; value: string }[];
  selectedModel?: string;
  sortKey?: ColumnKey | null;
  sortDir?: SortDir;
}

// Map UI sort keys to backend-supported sort fields
const mapSortKeyToBackend = (key: ColumnKey | null): string | null => {
  if (!key) return null;
  if (key === "name") return "name";
  if (key === "email") return "email";
  if (key === "job") return "job_title";
  if (key === "date") return "endedAt";
  if (key === "duration") return "durationMs";
  if (key === "status") return "status";
  if (key === "eval") return "evaluationStatus";
  return null;
};

const getEvaluationStatusColors = (
  status?: string
): { background: string; text: string } => {
  const s = String(status || "")
    .toLowerCase()
    .replaceAll("_", " ")
    .trim();

  switch (s) {
    case "selected":
      return { background: "#DCFCE7", text: "#006b66" };

    case "not selected":
      return { background: "#FEE2E2", text: "#B91C1C" };

    case "defaulted":
      return { background: "#F3F4F6", text: "#374151" };

    case "re interview":
      return { background: "#DBEAFE", text: "#1D4ED8" };

    case "in progress":
      return { background: "#FEF3C7", text: "#B45309" };

    case "on hold":
      return { background: "#EDE9FE", text: "#5B21B6" };

    default:
      return { background: "#E0F2FE", text: "#0369A1" };
  }
};

const AdminHome = () => {
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  // Snackbar state for recording deletion notification
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [violationsDialog, setViolationsDialog] = useState<{
    open: boolean;
    conversationId: string;
    candidateName: string;
  }>({ open: false, conversationId: "", candidateName: "" });

  // Rows per page for admin list (persisted)
  const { rowsPerPage, handleRowsPerPageChange } = useRowsPerPage({
    defaultRowsPerPage: 100,
    storageKey: "adminHome_rowsPerPage",
  });


  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>(() => {
    try {
      return sessionStorage.getItem("selectedStatus") || "";
    } catch {
      return "";
    }
  });
  const [searchQueryInput, setSearchQueryInput] = useState<string>(() => {
    try {
      return sessionStorage.getItem("admin_searchQueryInput") || "";
    } catch {
      return "";
    }
  });
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusdata, setStatusdata] = useState<
    { label: string; value: string }[]
  >([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [allUsers, setAllUsers] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState(0);

  // Add new state for min and max dates
  const [minDate, setMinDate] = useState<Dayjs | null>(null);
  const [maxDate, setMaxDate] = useState<Dayjs | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id?: string;
  }>({ open: false });
  const [deleting, setDeleting] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">(() => {
    const saved = sessionStorage.getItem("admin_viewMode");
    return saved === "list" || saved === "grid" ? saved : "list";
  });
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [collegesOptions, setCollegesOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [downloadingRooms, setDownloadingRooms] = useState<Set<string>>(
    () => new Set()
  );
  const [selectedColleges, setSelectedColleges] = useState<
    { label: string; value: string }[]
  >([]);
  // Models dropdown state
  const [userModels, setUserModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const appliedFiltersRef = useRef<{
    appliedModel: string;
    appliedSelectedColleges: { label: string; value: string }[];
    appliedStartDate: Dayjs | null;
    appliedEndDate: Dayjs | null;
  }>({
    appliedModel: "",
    appliedSelectedColleges: [],
    appliedStartDate: null,
    appliedEndDate: null,
  });
  // Track expanded columns for list view
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(
    new Set()
  );
  // Track the latest in-flight request to cancel stale ones
  const currentRequestController = useRef<AbortController | null>(null);
  // sort state
  const [sortState, setSortState] = useState<{
    key: ColumnKey | null;
    dir: SortDir;
  }>({
    key: null,
    dir: null,
  });
  const lastSortRef = useRef(sortState);

  // Persist viewMode to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("admin_viewMode", viewMode);
  }, [viewMode]);

  // Restore transcription recording view when returning from other pages
  useEffect(() => {
    // If user used browser back/forward button, clear saved view and don't auto-restore
    if (navigationType === "POP") {
      try {
        sessionStorage.setItem("admin_lastLeftView", "list");
      } catch (e) {
        /* ignore */
      }
      return;
    }

    try {
      const lastLeft = sessionStorage.getItem("admin_lastLeftView");
      const savedRecordingState = sessionStorage.getItem(
        "admin_recording_state"
      );

      // If we left from transcription view and have saved state, navigate back to transcription
      if (lastLeft === "transcript" && savedRecordingState) {
        const recordingState = JSON.parse(savedRecordingState);
        // Navigate back to transcription with saved state
        navigate(
          `${routes.transcription}?conversation=${encodeURIComponent(String(recordingState.id))}`,
          {
            state: {
              transcription: recordingState,
            },
            replace: false,
          }
        );
      }
    } catch (error) {
      console.error("Error during recording state restore:", error);
    }
  }, [navigationType, navigate]);

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQueryInput.trim());
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQueryInput]);

  // Persist search query input to sessionStorage immediately when user types
  useEffect(() => {
    try {
      sessionStorage.setItem("admin_searchQueryInput", searchQueryInput);
    } catch (e) {
      /* ignore */
    }
  }, [searchQueryInput]);

  // Persist debounced search to sessionStorage so clearing and navigation keep it
  useEffect(() => {
    try {
      sessionStorage.setItem("admin_searchQuery", debouncedSearch);
    } catch (e) {
      /* ignore */
    }
  }, [debouncedSearch]);

  // Toggle column expansion
  const toggleColumnExpansion = (columnId: string) => {
    setExpandedColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.clear();
        newSet.add(columnId);
      }
      return newSet;
    });
  };

  const toggleSort = (column: ColumnKey) => {
    setSortState((prev) => {
      if (prev.key !== column) return { key: column, dir: "asc" };
      if (prev.dir === "asc") return { key: column, dir: "desc" };
      if (prev.dir === "desc") return { key: null, dir: null };
      return { key: column, dir: "asc" };
    });
  };

  // Capitalize only the first character when sending search to API
  const capitalizeFirstLetter = (value: string): string => {
    const v = String(value || "").trim();
    if (v.length === 0) return v;
    return v.charAt(0).toUpperCase() + v.slice(1);
  };

  const fetchUsers = async (
    startDateParam?: Dayjs | null,
    endDateParam?: Dayjs | null,
    searchOverride?: string
  ) => {
    // Cancel previous in-flight request if any
    if (currentRequestController.current) {
      currentRequestController.current.abort();
    }
    const controller = new AbortController();
    currentRequestController.current = controller;

    setLoading(true);
    try {
      // Always include the active date range: if explicit params are not provided,
      // fall back to the applied filters so searches respect applied filters.
      const effectiveStart =
        startDateParam ?? appliedFiltersRef.current.appliedStartDate ?? null;
      const effectiveEnd =
        endDateParam ?? appliedFiltersRef.current.appliedEndDate ?? null;

      // Normalize to LOCAL day boundaries, then convert to UTC instants
      // This ensures a single-day selection covers the visible local day
      const normalizedStart = effectiveStart
        ? dayjs(effectiveStart).startOf("day")
        : null;
      const normalizedEnd = effectiveEnd
        ? dayjs(effectiveEnd).endOf("day")
        : null;

      // Single server-side call with support for multiple colleges
      const params: any = {
        status: selectedStatus === "" ? undefined : selectedStatus,
        agentName: appliedFiltersRef.current.appliedModel
          ? appliedFiltersRef.current.appliedModel
          : undefined,
        startDate: normalizedStart
          ? normalizedStart.toDate().toISOString()
          : undefined,
        endDate: normalizedEnd
          ? normalizedEnd.toDate().toISOString()
          : undefined,
        search: (searchOverride ?? debouncedSearch)
          ? capitalizeFirstLetter(searchOverride ?? debouncedSearch)
          : undefined,
        page: currentPage,
        limit: rowsPerPage,
        lateral: true, // Ensure we only fetch lateral interviews on this page
      };

      if (appliedFiltersRef.current.appliedSelectedColleges.length > 1) {
        const ids = appliedFiltersRef.current.appliedSelectedColleges
          .map((c: { label: string; value: string }) => c.value)
          .filter(Boolean)
          .join(",");
        if (ids) params.collegeId = ids;
      } else if (
        appliedFiltersRef.current.appliedSelectedColleges.length === 1 &&
        appliedFiltersRef.current.appliedSelectedColleges[0].value
      ) {
        params.collegeId =
          appliedFiltersRef.current.appliedSelectedColleges[0].value;
      }

      // Apply backend sorting when supported
      const backendSortBy = mapSortKeyToBackend(sortState.key);
      if (backendSortBy && sortState.dir) {
        params.sortBy = backendSortBy;
        params.sortOrder = String(sortState.dir).toUpperCase();
      }
      const data = await getAllInterviews(params as any, controller.signal);
      // Ensure current page is within bounds after filters/search
      const lastPage = Math.max(1, Math.ceil((data.total || 0) / rowsPerPage));
      if (currentPage > lastPage) {
        setCurrentPage(lastPage);
        setLoading(false);
        return;
      }
      setAllUsers(data);
      setTotal(data.total);
      // if (!didInitDates.current && !startDate && !endDate) {
      //   const minDate = dayjs.utc((data as any).minStartedAt);
      //   const maxDate = dayjs.utc((data as any).maxStartedAt);
      //   setStartDate(minDate);
      //   setEndDate(maxDate);
      //   didInitDates.current = true;
      // }
    } catch (err: any) {
      console.error("Error fetching users:", err);
      // Show error message to user
      const errorMessage =
        err.message || "An error occurred while fetching data";
      // You can add a state for error message and display it in the UI
      // For now, we'll just log it
      console.error(errorMessage);
    } finally {
      setLoading(false);
      const payload: AdminHomeFilters = {
        selectedStatus,
        search: searchQueryInput,
        currentPage,
        startDate: appliedFiltersRef.current.appliedStartDate
          ? appliedFiltersRef.current.appliedStartDate.toISOString()
          : null,
        endDate: appliedFiltersRef.current.appliedEndDate
          ? appliedFiltersRef.current.appliedEndDate.toISOString()
          : null,
        selectedColleges: appliedFiltersRef.current.appliedSelectedColleges,
        selectedModel: appliedFiltersRef.current.appliedModel,
        sortKey: sortState.key ?? null,
        sortDir: sortState.dir ?? null,
      };
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          FILTER_STORAGE_KEY,
          JSON.stringify(payload)
        );
      }
    }
  };

  useEffect(() => {
    if (minDate && maxDate) {
      fetchUsers();
    }
  }, [minDate, maxDate, selectedStatus, currentPage, rowsPerPage, debouncedSearch]);


  useEffect(() => {

    if (
      lastSortRef.current.key === sortState.key &&
      lastSortRef.current.dir === sortState.dir
    ) {
      return;
    }
    lastSortRef.current = sortState;

    if (!minDate || !maxDate) return;

    // When sort is cleared, refetch immediately
    if (!sortState.key || !sortState.dir) {
      fetchUsers();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      fetchUsers();
    }, 200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [sortState, minDate, maxDate]);

  // Fetch global conversation date range once on first load
  useEffect(() => {
    const controller = new AbortController();
    const loadConversationDates = async () => {
      try {
        const res = await getConversationDates(controller.signal);
        const minRaw = res.minStartedAt;
        const maxRaw = res.maxStartedAt;
        const min = minRaw ? dayjs.utc(minRaw) : null;
        const max = maxRaw ? dayjs.utc(maxRaw) : null;
        if (min && max) {
          setMinDate(min);
          setMaxDate(max);
          const savedStart = min;
          const savedEnd = max;
          setStartDate(savedStart);
          setEndDate(savedEnd);
          appliedFiltersRef.current.appliedStartDate = savedStart;
          appliedFiltersRef.current.appliedEndDate = savedEnd;
        }
      } catch (e) {
        // silent fallback; fetchUsers will still set dates from list API if available
      }
    };
    loadConversationDates();
    return () => controller.abort();
  }, []);

  // Load colleges when opening filters the first time
  useEffect(() => {
    const loadColleges = async () => {
      try {
        const res = await getColleges(1, 1000, undefined);
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        const opts = items
          .map((c: any) => {
            const rawLabel =
              (c &&
                (c.name ??
                  c.collegeName ??
                  (typeof c.label === "string" ? c.label : undefined))) ??
              undefined;
            const label =
              typeof rawLabel === "string"
                ? rawLabel
                : String(rawLabel ?? "").trim();
            const value = (c && (c._id ?? c.id ?? c.value)) ?? undefined;
            if (!label || label.toLowerCase() === "[object object]")
              return null;
            return { label: label, value: String(value ?? label) };
          })
          .filter(Boolean) as { label: string; value: string }[];
        setCollegesOptions(opts);
      } catch { }
    };
    if (filtersOpen && collegesOptions.length === 0) {
      loadColleges();
      getUserModels()
        .then((models) => {
          if (Array.isArray(models)) {
            setUserModels(models as string[]);
          } else if (Array.isArray(models?.models)) {
            setUserModels(models.models as string[]);
          }
        })
        .catch(() => { });
    }
  }, [filtersOpen, collegesOptions.length]);

  // Restore persisted filters from sessionStorage on mount
  useEffect(() => {
    try {
      const savedModel = sessionStorage.getItem("admin_model") || "";
      if (savedModel) {
        setSelectedModel(savedModel);
        appliedFiltersRef.current.appliedModel = savedModel;
      }
      const savedStart = sessionStorage.getItem("admin_startDate");
      if (savedStart) {
        const d = dayjs(savedStart);
        setStartDate(d);
        appliedFiltersRef.current.appliedStartDate = d;
      }
      const savedEnd = sessionStorage.getItem("admin_endDate");
      if (savedEnd) {
        const d = dayjs(savedEnd);
        setEndDate(d);
        appliedFiltersRef.current.appliedEndDate = d;
      }
      const savedColleges = sessionStorage.getItem("admin_selectedColleges");
      if (savedColleges) {
        const parsed = JSON.parse(savedColleges);
        if (Array.isArray(parsed)) {
          setSelectedColleges(parsed as { label: string; value: string }[]);
          appliedFiltersRef.current.appliedSelectedColleges = parsed as {
            label: string;
            value: string;
          }[];
        }
      }
    } catch { }
  }, []);

  const formatLabel = (text: string) =>
    text
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

  useEffect(() => {
    setStatusdata([
      { label: "All", value: "" },
      ...Object.values(CallStatus).map((status) => ({
        label:
          status === CallStatus.DISQUALIFIED
            ? "Defaulted"
            : formatLabel(status),
        value: status,
      })),
    ]);
  }, []);

  const handleStatusChange = (event: any) => {
    const newStatus = event.target.value;
    setSelectedStatus(newStatus);
    setCurrentPage(1);
  };

  // Persist selectedStatus to sessionStorage when it changes
  useEffect(() => {
    sessionStorage.setItem("selectedStatus", selectedStatus);
  }, [selectedStatus]);

  const handleStartDateChange = (date: Dayjs | null) => {
    if (!date) return;
    setStartDate(date);
    setCurrentPage(1);
  };

  const handleEndDateChange = (date: Dayjs | null) => {
    if (!date) return;
    setEndDate(date);
    setCurrentPage(1);
  };

  const handleClearDates = () => {
    setStartDate(minDate);
    setEndDate(maxDate);
    appliedFiltersRef.current.appliedStartDate = null;
    appliedFiltersRef.current.appliedEndDate = null;
    setCurrentPage(1);
    fetchUsers(minDate, maxDate);
  };

  const handleApplyFilters = (searchOverride?: string) => {
    setCurrentPage(1);
    setFiltersOpen(false);
    appliedFiltersRef.current.appliedModel = selectedModel;
    appliedFiltersRef.current.appliedSelectedColleges = selectedColleges;
    appliedFiltersRef.current.appliedStartDate =
      startDate === minDate && endDate === maxDate ? null : startDate;
    appliedFiltersRef.current.appliedEndDate =
      startDate === minDate && endDate === maxDate ? null : endDate;
    console.log("Applied Filters: ", appliedFiltersRef.current)
    sessionStorage.setItem("selectedStatus", selectedStatus);
    sessionStorage.setItem("admin_model", selectedModel || "");
    sessionStorage.setItem(
      "admin_searchQuery",
      ((searchOverride ?? searchQueryInput) || "").trim()
    );
    sessionStorage.setItem(
      "admin_startDate",
      startDate ? startDate.toISOString() : ""
    );
    sessionStorage.setItem(
      "admin_endDate",
      endDate ? endDate.toISOString() : ""
    );
    sessionStorage.setItem(
      "admin_selectedColleges",
      JSON.stringify(selectedColleges || [])
    );
    fetchUsers(startDate, endDate, searchOverride);
  };

  const handleResetFilters = () => {
    setSelectedColleges([]);
    appliedFiltersRef.current.appliedSelectedColleges = [];
    setSearchQueryInput("");
    setSelectedModel("");
    appliedFiltersRef.current.appliedModel = "";
    setSelectedStatus("");
    handleClearDates();
    setFiltersOpen(false);
    // Clear persisted filters
    sessionStorage.removeItem("admin_selectedColleges");
    sessionStorage.removeItem("admin_searchQuery");
    sessionStorage.removeItem("admin_searchQueryInput");
    sessionStorage.removeItem("admin_model");
    sessionStorage.removeItem("selectedStatus");
  };
  
  const hasActiveFilters = () => {
    return (
      selectedStatus !== "" ||
      searchQueryInput !== "" ||
      selectedColleges.length > 0 ||
      selectedModel !== "" ||
      (startDate && minDate && !startDate.isSame(minDate)) ||
      (endDate && maxDate && !endDate.isSame(maxDate))
    );
  };

  const handlePageChange = (_event: any, value: number) => {
    setCurrentPage(value);
  };

  const openDeleteDialog = (conversationId: string) => {
    setDeleteDialog({ open: true, id: conversationId });
  };

  const closeDeleteDialog = () => setDeleteDialog({ open: false });

  const handleConfirmDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      setDeleting(true);
      await deleteConversationById(deleteDialog.id);

      // Optimistically remove the deleted item from the current list
      setAllUsers((prev) => {
        if (!prev) return prev;
        const filtered = (prev.data || []).filter(
          (u: any) => u.conversation_id !== deleteDialog.id
        );
        return {
          ...prev,
          data: filtered,
          total: Math.max((prev.total || 1) - 1, 0),
        } as any;
      });

      closeDeleteDialog();

      // If we just removed the last item on the page, go to previous page; otherwise refresh
      const isLastItemOnPage = (allUsers?.data?.length || 0) <= 1;
      if (isLastItemOnPage && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        fetchUsers(startDate, endDate);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleViewTranscript = (
    id: string,
    userId: string,
    roomName: string,
    candidateName: string,
    collegeName: string,
    interviewDate: string,
    endedAt: string
  ) => {
    // Store recording details in sessionStorage for restoration after navigation
    const recordingData = {
      id,
      userId,
      roomName,
      candidateName,
      collegeName,
      interviewDate,
      endedAt,
    };

    // Save recording state for persistence
    sessionStorage.setItem("admin_recording_state", JSON.stringify(recordingData));
    // Mark that we're entering transcript view (same pattern as candidateEvaluation)
    sessionStorage.setItem("admin_lastLeftView", "transcript");
    // Also keep old key for backward compatibility
    sessionStorage.setItem("admin_last_viewed_recording", JSON.stringify(recordingData));

    navigate(
      `${routes.transcription}?conversation=${encodeURIComponent(String(id))}`,
      {
        state: {
          transcription: recordingData,
        },
      }
    );
  };

  const handleDownloadVideo = async (roomName: string) => {
    try {
      setDownloadingRooms((prev) => {
        const next = new Set(prev);
        next.add(roomName);
        return next;
      });
      const { url } = await getRecordingUrl(roomName);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${roomName}.mp4`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      // Revoke after a short delay to allow the download to start
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);
    } catch (error) {
      console.error("Failed to download recording:", error);
    } finally {
      setDownloadingRooms((prev) => {
        const next = new Set(prev);
        next.delete(roomName);
        return next;
      });
    }
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    let result = "";
    if (hours > 0) result += `${hours} hr${hours > 1 ? "s" : ""} `;
    if (minutes > 0 || hours > 0)
      result += `${minutes} min${minutes !== 1 ? "s" : ""} `;
    if (seconds > 0 || (hours === 0 && minutes === 0))
      result += `${seconds} sec${seconds !== 1 ? "s" : ""}`;
    return result.trim();
  };

  const transformedUsers = React.useMemo(
    () =>
      allUsers?.data?.map((item: any) => {
        const jobTitle = item.job_title || "N/A";
        const startTs = item.conversation_startedAt
          ? new Date(item.conversation_startedAt).getTime()
          : null;
        const endTs = item.conversation_endedAt
          ? new Date(item.conversation_endedAt).getTime()
          : null;
        const durationMs =
          startTs !== null && endTs !== null ? endTs - startTs : null;
        const formattedDuration =
          durationMs !== null ? formatDuration(durationMs) : "N/A";
        const isShortDuration =
          durationMs !== null && durationMs < 5 * 60 * 1000;

        return {
          id: item.conversation_id,
          candidateName:
            `${item.profile_firstName ?? ""} ${item.profile_lastName ?? ""
              }`.trim() || "N/A",
          email:
            item.profile_email ||
            item.user_email ||
            item.email ||
            (item.profile && item.profile.email) ||
            (item.user && item.user.email) ||
            "N/A",
          job: jobTitle,
          // Prefer endedAt for display; fallback to startedAt if not available
          date:
            item.conversation_endedAt ||
            item.conversation_startedAt ||
            new Date().toISOString(),
          startedAt: item.conversation_startedAt,
          endedAt: item.conversation_endedAt,
          duration: formattedDuration,
          call_status:
            item.conversation_status === "closed"
              ? CallStatus.COMPLETED
              : CallStatus.IN_PROGRESS,
          userId: item.user_id,
          roomName: item.roomName,
          isDisqualified: item.conversation_is_disqualified,
          violationCount: item.conversation_proctoring_violation_count ?? 0,
          evaluationStatus:
            isShortDuration &&
              item.conversation_evaluation_status !== CallStatus.DISQUALIFIED
              ? "Re Interview"
              : item.conversation_evaluation_status === CallStatus.DISQUALIFIED
                ? "Defaulted"
                : item.conversation_evaluation_status || "Not Evaluated",
          raw: item,
        };
      }) || [],
    [allUsers]
  );

  // Client-side pagination when multiple colleges are selected (merged results)
  const displayedUsers = React.useMemo(
    () => transformedUsers,
    [transformedUsers]
  );

  const isDefaultDateRange = Boolean(
    minDate &&
    maxDate &&
    appliedFiltersRef.current.appliedStartDate &&
    appliedFiltersRef.current.appliedEndDate &&
    appliedFiltersRef.current.appliedStartDate.isSame(minDate) &&
    appliedFiltersRef.current.appliedEndDate.isSame(maxDate)
  );

  return (
    <>
      <Box padding={"2.5vh"} pb={"8vh"}>
        {/* Filter Bar - New Layout */}
        <Box display="flex" alignItems="center" gap="1.2vh" mb={"1.5vh"} flexWrap="wrap">
          {/* Search Bar on Left */}
          <TextField
            placeholder="Search name or email"
            size="small"
            value={searchQueryInput}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQueryInput(value);
              if (searchQueryInput.trim().length > 0 && value.trim().length === 0) {
                handleApplyFilters("");
                setDebouncedSearch("");
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleApplyFilters(searchQueryInput);
                setDebouncedSearch(searchQueryInput);
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ mr: 0 }}>
                  <IconButton
                    onClick={() => {
                      if (searchQueryInput.trim() === "") return;
                      handleApplyFilters(searchQueryInput);
                      setDebouncedSearch(searchQueryInput);
                    }}
                    size="small"
                    sx={{ p: 0.5 }}
                  >
                    <SearchOutlined sx={{ color: "#6b7280" }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={adminHomeStyles.searchBarStyles}
          />

          {/* Filters Button */}
          <Button
            startIcon={<FilterList sx={{ fontSize: "1.8vh", width: "2vh", height: "2vh", marginRight: "0.5vh" }} />}
            sx={{
              backgroundColor: showAdvancedFilters ? "#00695c" : "#0f766e",
              color: "#fff",
              textTransform: "none",
              borderRadius: "0.8vh",
              padding: "0.6vh 1.4vw",
              fontSize: "1.4vh",
              fontWeight: 600,
              height: "4vh",
              minWidth: "6.4vh",
              fontFamily: "Poppins, sans-serif",
              "&:hover": {
                backgroundColor: showAdvancedFilters ? "#004d40" : "#115e59"
              }
            }}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            Filters
          </Button>

          {/* Collapsible Advanced Filters - Horizontal Slide */}
          <Box
            sx={{
              display: "flex",
              gap: "1.5vh",
              alignItems: "center",
              overflow: "hidden",
              transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              maxWidth: showAdvancedFilters ? "500px" : "0px",
              opacity: showAdvancedFilters ? 1 : 0,
              transform: showAdvancedFilters ? "translateX(0)" : "translateX(-10px)",
              whiteSpace: "nowrap",
            }}
          >
            {/* Status Dropdown */}
            <CustomSelect
              label="Status"
              value={selectedStatus}
              onChange={handleStatusChange}
              options={statusdata}
              sx={adminHomeStyles.statusfieldwidth}
            />

            {/* Refine Candidates Button */}
            <Button
              startIcon={<TuneOutlined sx={{ fontSize: "1.8vh", width: "2vh", height: "2vh", marginRight: "0.5vh" }} />}
              variant="outlined"
              onClick={() => setFiltersOpen(true)}
              sx={{
                borderColor: "#d1d5db",
                color: "#374151",
                textTransform: "none",
                borderRadius: "0.8vh",
                fontSize: "1.3vh",
                fontWeight: 500,
                fontFamily: "Poppins, sans-serif",
                padding: "0.8vh 1.6vh",
                height: "4.2vh",
                border: "1.5px solid #d1d5db",
                backgroundColor: "#fff",
                whiteSpace: "nowrap",
                "&:hover": {
                  backgroundColor: "#f9fafb",
                  borderColor: "#9ca3af",
                }
              }}
            >
              Advanced Filters
            </Button>
            
            {hasActiveFilters() && (
              <Typography
                onClick={handleResetFilters}
                sx={adminHomeStyles.clearAllFilters}
              >
                ✕ Clear all
              </Typography>
            )}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* List/Grid buttons on right */}
          <Box sx={{ backgroundColor: "#ffffff", border: "1px solid #f0f0f0", borderRadius: "0.6vh", width: "4vw", height: "4vh", padding: "0.5vh" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: "0" }}>
              <Tooltip title="Table View" arrow>
                <Box
                  onClick={() => setViewMode("list")}
                  sx={{
                    padding: "0.4vh 0.4vh",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: viewMode === "list" ? "#ffffff" : "transparent",
                    border: viewMode === "list" ? "1px solid #d1d5db" : "none",
                    borderRadius: "0.6vh",
                    color: viewMode === "list" ? "#006b66" : "#9ca3af",
                    transition: "all 0.2s ease",
                    "&:hover": { backgroundColor: "#fafafa" },
                  }}
                >
                  <svg width="auto" height="1.6vh" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 8H2.00667" stroke={viewMode === "list" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 12H2.00667" stroke={viewMode === "list" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 4H2.00667" stroke={viewMode === "list" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5.33203 8H13.9987" stroke={viewMode === "list" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5.33203 12H13.9987" stroke={viewMode === "list" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5.33203 4H13.9987" stroke={viewMode === "list" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Box>
              </Tooltip>

              <Box sx={{ width: "0.1vh", backgroundColor: "#7d7f81", margin: "0.3vh 0.5vh" }} />

              <Tooltip title="Grid View" arrow>
                <Box
                  onClick={() => setViewMode("grid")}
                  sx={{
                    padding: "0.4vh 0.4vh",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: viewMode === "grid" ? "#ffffff" : "transparent",
                    border: viewMode === "grid" ? "1px solid #d1d5db" : "none",
                    borderRadius: "0.6vh",
                    color: viewMode === "grid" ? "#006b66" : "#9ca3af",
                    transition: "all 0.2s ease",
                    "&:hover": { backgroundColor: "#fafafa" },
                  }}
                >
                  <svg width="auto" height="1.6vh" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 2H2.66667C2.29848 2 2 2.29848 2 2.66667V6C2 6.36819 2.29848 6.66667 2.66667 6.66667H6C6.36819 6.66667 6.66667 6.36819 6.66667 6V2.66667C6.66667 2.29848 6.36819 2 6 2Z" stroke={viewMode === "grid" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13.332 2H9.9987C9.63051 2 9.33203 2.29848 9.33203 2.66667V6C9.33203 6.36819 9.63051 6.66667 9.9987 6.66667H13.332C13.7002 6.66667 13.9987 6.36819 13.9987 6V2.66667C13.9987 2.29848 13.7002 2 13.332 2Z" stroke={viewMode === "grid" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13.332 9.33301H9.9987C9.63051 9.33301 9.33203 9.63148 9.33203 9.99967V13.333C9.33203 13.7012 9.63051 13.9997 9.9987 13.9997H13.332C13.7002 13.9997 13.9987 13.7012 13.9987 13.333V9.99967C13.9987 9.63148 13.7002 9.33301 13.332 9.33301Z" stroke={viewMode === "grid" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 9.33301H2.66667C2.29848 9.33301 2 9.63148 2 9.99967V13.333C2 13.7012 2.29848 13.9997 2.66667 13.9997H6C6.36819 13.9997 6.66667 13.7012 6.66667 13.333V9.99967C6.66667 9.63148 6.36819 9.33301 6 9.33301Z" stroke={viewMode === "grid" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Box>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Table/Grid view */}
        {loading && !(allUsers && (allUsers.data?.length || 0) > 0) ? (
          <Box sx={adminHomeStyles.loadingBox}>
            <CircularProgress
              size={40}
              sx={adminHomeStyles.loadingSpinner}
            />
          </Box>
        ) : transformedUsers.length === 0 ? (
          <Box sx={adminHomeStyles.emptyStateBox}>
            <Text
              text={
                selectedStatus || startDate || endDate
                  ? "No records found"
                  : "No interviews taken yet"
              }
              styles={adminHomeStyles.emptyStateTitle}
            />
            <Text
              text={
                selectedStatus || startDate || endDate
                  ? "Try adjusting your search, status, or date filters"
                  : "Interviews will appear here once candidates complete their sessions"
              }
              styles={adminHomeStyles.emptyStateSubtitle}
            />
          </Box>
        ) : viewMode === "list" ? (
          <>
            <Paper sx={adminHomeStyles.tableWrapperPaper}>
              <Table sx={adminHomeStyles.tableStyles} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={adminHomeStyles.tableHeaderCellName}
                      onClick={() => toggleSort("name")}
                    >
                      <Box sx={adminHomeStyles.tableHeaderBoxLayout}>
                        <Box sx={adminHomeStyles.tableHeaderContentBox}>
                          <span>Name</span>
                          {sortState.key === "name" ? (
                            <ArrowDownwardIcon
                              className="sortIcon"
                              sx={{
                                ...adminHomeStyles.activeSortIcon,
                                transform: sortState.dir === "asc" ? "rotate(180deg)" : "none",
                              }}
                            />
                          ) : (
                            <SwapVertIcon
                              className="sortIcon"
                              sx={adminHomeStyles.inactiveSortIcon}
                            />
                          )}
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleColumnExpansion("name");
                          }}
                          sx={adminHomeStyles.tableHeaderExpandButton}
                        >
                          {expandedColumns.has("name") ? (
                            <ExpandLess sx={{ fontSize: "1.6vh", color: "#666" }} />
                          ) : (
                            <ExpandMore sx={{ fontSize: "1.6vh", color: "#666" }} />
                          )}
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={adminHomeStyles.tableHeaderCellEmail}
                      onClick={() => toggleSort("email")}
                    >
                      <Box sx={adminHomeStyles.tableHeaderContentBox}>
                        <span>Email</span>
                        {sortState.key === "email" ? (
                          <ArrowDownwardIcon
                            className="sortIcon"
                            sx={{
                              ...adminHomeStyles.activeSortIcon,
                              transform: sortState.dir === "asc" ? "rotate(180deg)" : "none",
                            }}
                          />
                        ) : (
                          <SwapVertIcon
                            className="sortIcon"
                            sx={adminHomeStyles.inactiveSortIcon}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={adminHomeStyles.tableHeaderCellCollege}
                      onClick={() => toggleSort("job")}
                    >
                      <Box sx={adminHomeStyles.tableHeaderBoxLayout}>
                        <Box sx={adminHomeStyles.tableHeaderContentBox}>
                          <span>Job</span>
                          {sortState.key === "job" ? (
                            <ArrowDownwardIcon
                              className="sortIcon"
                              sx={{
                                ...adminHomeStyles.activeSortIcon,
                                transform: sortState.dir === "asc" ? "rotate(180deg)" : "none",
                              }}
                            />
                          ) : (
                            <SwapVertIcon
                              className="sortIcon"
                              sx={{
                                fontSize: "1.6vh",
                                opacity: 0.5,
                                transition:
                                  "transform 0.2s ease, opacity 0.2s ease",
                                color: "#666",
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={adminHomeStyles.tableHeaderCellDate}
                      onClick={() => toggleSort("date")}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.6vh",
                          }}
                        >
                          <span>Date & Time</span>
                          {sortState.key === "date" ? (
                            <ArrowDownwardIcon
                              className="sortIcon"
                              sx={{
                                fontSize: "1.6vh",
                                fontFamily: "Poppins, sans-serif",
                                opacity: 1,
                                transition:
                                  "transform 0.2s ease, opacity 0.2s ease",
                                color: "#a00",
                                transform:
                                  sortState.dir === "asc"
                                    ? "rotate(180deg)"
                                    : "none",
                              }}
                            />
                          ) : (
                            <SwapVertIcon
                              className="sortIcon"
                              sx={{
                                fontSize: "1.6vh",
                                fontFamily: "Poppins, sans-serif",
                                opacity: 0.5,
                                transition:
                                  "transform 0.2s ease, opacity 0.2s ease",
                                color: "#666",
                              }}
                            />
                          )}
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleColumnExpansion("date");
                          }}
                          sx={{ padding: "0.2vh" }}
                        >
                          {expandedColumns.has("date") ? (
                            <ExpandLess
                              sx={{ fontSize: "1.6vh", color: "#666" }}
                            />
                          ) : (
                            <ExpandMore
                              sx={{ fontSize: "1.6vh", color: "#666" }}
                            />
                          )}
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        width: "8.5%",
                        transition: "width 0.3s ease",
                        cursor: "pointer",
                        "&:hover .sortIcon": {
                          opacity: sortState.key === "duration" ? 1 : 0.5,
                        },
                      }}
                      onClick={() => toggleSort("duration")}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6vh",
                        }}
                      >
                        <span>Duration</span>
                        {sortState.key === "duration" ? (
                          <ArrowDownwardIcon
                            className="sortIcon"
                            sx={{
                              fontSize: "1.6vh",
                              opacity: 1,
                              transition:
                                "transform 0.2s ease, opacity 0.2s ease",
                              color: "#a00",
                              transform:
                                sortState.dir === "asc"
                                  ? "rotate(180deg)"
                                  : "none",
                            }}
                          />
                        ) : (
                          <SwapVertIcon
                            className="sortIcon"
                            sx={{
                              fontSize: "1.6vh",
                              opacity: 0.5,
                              transition:
                                "transform 0.2s ease, opacity 0.2s ease",
                              color: "#666",
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        width: "8.2%",
                        transition: "width 0.3s ease",
                        cursor: "pointer",
                        "&:hover .sortIcon": {
                          opacity: sortState.key === "status" ? 1 : 0.5,
                        },
                      }}
                      onClick={() => toggleSort("status")}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6vh",
                        }}
                      >
                        <span>Call Status</span>
                        {sortState.key === "status" ? (
                          <ArrowDownwardIcon
                            className="sortIcon"
                            sx={{
                              fontSize: "1.6vh",
                              opacity: 1,
                              transition:
                                "transform 0.2s ease, opacity 0.2s ease",
                              color: "#a00",
                              transform:
                                sortState.dir === "asc"
                                  ? "rotate(180deg)"
                                  : "none",
                            }}
                          />
                        ) : (
                          <SwapVertIcon
                            className="sortIcon"
                            sx={{
                              fontSize: "1.6vh",
                              opacity: 0.5,
                              transition:
                                "transform 0.2s ease, opacity 0.2s ease",
                              color: "#666",
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        whiteSpace: "nowrap",
                        width: "10.8%",
                        cursor: "pointer",
                        transition: "width 0.3s ease",
                        "&:hover .sortIcon": {
                          opacity: sortState.key === "eval" ? 1 : 0.5,
                        },
                      }}
                      onClick={() => toggleSort("eval")}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6vh",
                        }}
                      >
                        <span>Candidate Status</span>
                        {sortState.key === "eval" ? (
                          <ArrowDownwardIcon
                            className="sortIcon"
                            sx={{
                              fontSize: "1.6vh",
                              opacity: 1,
                              transition:
                                "transform 0.2s ease, opacity 0.2s ease",
                              color: "#a00",
                              transform:
                                sortState.dir === "asc"
                                  ? "rotate(180deg)"
                                  : "none",
                            }}
                          />
                        ) : (
                          <SwapVertIcon
                            className="sortIcon"
                            sx={{
                              fontSize: "1.6vh",
                              opacity: 0.5,
                              transition:
                                "transform 0.2s ease, opacity 0.2s ease",
                              color: "#666",
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        width: "19%",
                        transition: "width 0.3s ease",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Actions</span>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>

              </Table>

              <TableContainer component="div" sx={adminHomeStyles.tableContainerBox}>
                <Table size="small" sx={adminHomeStyles.tableStyles}>
                  <colgroup>
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "9%" }} />
                    <col style={{ width: "7%" }} />
                    <col style={{ width: "7%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "16%" }} />
                  </colgroup>

                  <TableBody>
                    {loading && transformedUsers.length === 0
                      ? Array.from({ length: Math.min(rowsPerPage, 10) }).map(
                        (_, i) => (
                          <TableRow key={`skeleton-${i}`}>
                            {Array.from({ length: 8 }).map((__, j) => (
                              <TableCell key={j}>
                                <span
                                  style={adminHomeStyles.skeletonBox}
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        )
                      )
                      : displayedUsers.map((item) => (
                        <TableRow
                          key={item.id}
                          sx={adminHomeStyles.tableRowHover}
                        >
                          <TableCell
                            sx={adminHomeStyles.tableBodyCellName}
                          >
                            <Tooltip
                              title={item.candidateName}
                              placement="top"
                              arrow
                            >
                              <Box>
                                <Typography
                                  noWrap
                                  fontSize={"1.6vh"}
                                  fontWeight={700}
                                  fontFamily="Poppins, sans-serif"
                                  sx={{ textTransform: "capitalize" }}
                                >
                                  {item.candidateName.toLowerCase()}
                                </Typography>
                                {expandedColumns.has("name") && (
                                  <Tooltip title={item.id} placement="top" arrow>
                                    <span>
                                      <Typography
                                        noWrap
                                        fontSize={"1.3vh"}
                                        fontFamily="Poppins, sans-serif"
                                        color="#9CA3AF"
                                      >
                                        ID: {item.id}
                                      </Typography>
                                    </span>
                                  </Tooltip>
                                )}
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={item.email} placement="top" arrow>
                              <Typography
                                noWrap
                                fontSize={"1.5vh"}
                                fontFamily="Poppins, sans-serif"
                                color="#111827"
                              >
                                {item.email}
                              </Typography>
                            </Tooltip>
                          </TableCell>

                          <TableCell
                            sx={adminHomeStyles.tableBodyCellCollege}
                          >
                            <Tooltip title={item.job} placement="top" arrow>
                              <Typography noWrap fontSize={"1.6vh"} fontFamily="Poppins, sans-serif">
                                {item.job}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell
                            sx={adminHomeStyles.tableBodyCellDate}
                          >
                            {expandedColumns.has("date") ? (
                              <Box
                                sx={adminHomeStyles.tableBodyCellDateExpanded}
                              >
                                <Typography
                                  noWrap
                                  fontSize={"1.3vh"}
                                  fontFamily="Poppins, sans-serif"
                                  color="#111827"
                                >
                                  {`Start Date: ${item.startedAt
                                    ? `${dayjs
                                      .utc(item.startedAt)
                                      .local()
                                      .format("DD MMM")} | ${dayjs
                                        .utc(item.startedAt)
                                        .local()
                                        .format("hh:mm A")}`
                                    : "--"
                                    }`}
                                </Typography>
                                <Typography
                                  noWrap
                                  fontSize={"1.3vh"}
                                  fontFamily="Poppins, sans-serif"
                                  color="#111827"
                                >
                                  {`End Date: ${item.endedAt
                                    ? `${dayjs
                                      .utc(item.endedAt)
                                      .local()
                                      .format("DD MMM")} | ${dayjs
                                        .utc(item.endedAt)
                                        .local()
                                        .format("hh:mm A")}`
                                    : "--"
                                    }`}
                                </Typography>
                              </Box>
                            ) : (
                              `${dayjs
                                .utc(item.date)
                                .local()
                                .format("DD MMM")} | ${dayjs
                                  .utc(item.date)
                                  .local()
                                  .format("hh:mm A")}`
                            )}
                          </TableCell>
                          <TableCell
                            sx={adminHomeStyles.tableBodyCellDuration}
                          >
                            {/*{item.call_status === CallStatus.IN_PROGRESS
                                ? "N/A"
                                : item.duration}*/}
                            {item.duration}
                          </TableCell>
                          <TableCell
                            sx={adminHomeStyles.tableBodyCellStatus}
                          >
                            <span style={{ textTransform: "capitalize" }}>
                              {String(item.call_status || "")
                                .replaceAll("_", " ")
                                .toLowerCase()}
                            </span>
                          </TableCell>
                          <TableCell
                            sx={adminHomeStyles.tableBodyCellEval}
                          >
                            {item.call_status === CallStatus.COMPLETED ? (
                              <Box
                                sx={{
                                  ...adminHomeStyles.evaluationStatusBoxTable,
                                  backgroundColor: getEvaluationStatusColors(
                                    item.evaluationStatus
                                  ).background,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "1.4vh",
                                    fontFamily: "Poppins, sans-serif",
                                    fontWeight: 700,
                                    whiteSpace: "nowrap",
                                    color: getEvaluationStatusColors(
                                      item.evaluationStatus
                                    ).text,
                                  }}
                                >
                                  {(() => {
                                    const raw = String(
                                      item.evaluationStatus || "Not Evaluated"
                                    );
                                    const normalized = raw
                                      .toLowerCase()
                                      .replaceAll("_", " ");
                                    if (normalized === "rejected")
                                      return "Defaulted";
                                    return formatLabel(
                                      raw.replaceAll("_", " ")
                                    );
                                  })()}
                                </span>
                              </Box>
                            ) : (
                              <span>N/A</span>
                            )}
                          </TableCell>
                          <TableCell
                            sx={adminHomeStyles.tableBodyCellActions}
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={"0.6vh"}
                              sx={{ flexWrap: "nowrap" }}
                            >
                              <CustomButton
                                text="View Recording"
                                type="primary"
                                disabled={item.call_status === CallStatus.IN_PROGRESS}
                                onClick={() =>
                                  handleViewTranscript(
                                    item.id,
                                    item.userId,
                                    item.roomName,
                                    item.candidateName,
                                    item.job,
                                    item.date,
                                    item.endedAt
                                  )
                                }
                                additionalStyles={{
                                  ...adminHomeStyles.button,
                                  padding: "1vh 1.6vh",
                                  fontSize: "1.6vh",
                                  height: "4vh",
                                  backgroundColor:
                                    item.call_status === CallStatus.IN_PROGRESS
                                      ? "#bdbdbd"
                                      : globalStyles.colors.primary,
                                  color:
                                    item.call_status === CallStatus.IN_PROGRESS
                                      ? "#757575"
                                      : undefined,
                                  cursor:
                                    item.call_status === CallStatus.IN_PROGRESS
                                      ? "not-allowed"
                                      : "pointer",
                                }}
                              >
                                <StickyNote2OutlinedIcon sx={{ fontSize: "1.8vh" }} />
                              </CustomButton>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => openDeleteDialog(String(item.id))}
                                  sx={{ padding: "0.5vh", color: "#86161B" }}
                                >
                                  <DeleteOutlineIcon sx={{ fontSize: "2.2vh" }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download">
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={downloadingRooms.has(item.roomName)}
                                    onClick={() => handleDownloadVideo(item.roomName)}
                                    sx={{ padding: "0.5vh", color: "#86161B" }}
                                  >
                                    {downloadingRooms.has(item.roomName) ? (
                                      <CircularProgress size={14} sx={{ color: "#a00" }} />
                                    ) : (
                                      <FileDownloadOutlinedIcon sx={{ fontSize: "2.2vh" }} />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip
                                title={
                                  item.violationCount > 0
                                    ? `View Violations (${item.violationCount})`
                                    : "No violations"
                                }
                              >
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={item.violationCount === 0}
                                    onClick={() =>
                                      setViolationsDialog({
                                        open: true,
                                        conversationId: item.id,
                                        candidateName: item.candidateName,
                                      })
                                    }
                                    sx={{
                                      padding: "0.5vh",
                                      color: item.violationCount > 0 ? "#B45309" : "#D1D5DB",
                                    }}
                                  >
                                    <WarningAmberOutlined sx={{ fontSize: "2.2vh" }} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            {/* Removed separate email table; email now has its own column in the main table */}
          </>
        ) : (
          <Box
            sx={{
              ...createJobPageStyles.gridOuterContainer,
              // Match filter row / search bar: no horizontal inset (create job uses 1.5vh left for a different toolbar layout)
              padding: "0 0 1.5vh 0",
            }}
          >
            <Box sx={createJobPageStyles.gridWrapper}>
              <Grid container spacing="1.5vh" sx={adminHomeStyles.gridContainer}>
                {displayedUsers.map((item) => (
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    key={item.id}
                    sx={adminHomeStyles.grid}
                  >
                    <Card sx={adminHomeStyles.card}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Text
                          variant="heading"
                          styles={adminHomeStyles.idtext}
                          detectEllipsis
                        >
                          {item.candidateName.toLowerCase()}
                        </Text>
                        <Box sx={adminHomeStyles.box2}>
                          <Box
                            sx={{
                              ...adminHomeStyles.statusBox,
                              border: `0.35vh solid ${statusColors[item.call_status]?.borderColor
                                }`,
                              backgroundColor: statusColors[item.call_status],
                            }}
                          />
                          <Text
                            text={item?.call_status
                              ?.replaceAll("_", " ")
                              .toLowerCase()}
                            color="light"
                            variant="body"
                            styles={adminHomeStyles.surveystatustext}
                          />
                          {/* evaluation shown next to date only */}
                        </Box>
                      </Box>

                      <Text
                        variant="body"
                        mt={"0vh"}
                        color="light"
                        styles={adminHomeStyles.nameText}
                        detectEllipsis
                      >
                        ID: {item.id}
                      </Text>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap="0.5vh"
                        mt={"0.5vh"}
                      >
                        <img
                          src={logoConfig.collegeIcon}
                          alt="college logo"
                          style={adminHomeStyles.collegeIcon}
                        />
                        <Text
                          variant="body"
                          color="light"
                          styles={adminHomeStyles.collegeText}
                          detectEllipsis
                        >
                          {item.job}
                        </Text>
                      </Box>

                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box display="flex" flexDirection="column">
                          <Box
                            display="flex"
                            alignItems="center"
                            gap="0.5vh"
                            flexWrap="wrap"
                          >
                            <DateRange sx={adminHomeStyles.ScheduleIcon} />
                            <Text
                              variant="body"
                              color="light"
                              detectEllipsis
                              styles={adminHomeStyles.dateText}
                            >
                              {`${dayjs
                                .utc(item.date)
                                .local()
                                .format("DD MMM")} | ${dayjs
                                  .utc(item.date)
                                  .local()
                                  .format("hh:mm A")}`}
                            </Text>
                          </Box>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap="0.5vh"
                            flexWrap="wrap"
                          >
                            <AccessTime sx={adminHomeStyles.ScheduleIcon} />
                            <Text
                              variant="body"
                              color="light"
                              detectEllipsis
                              styles={adminHomeStyles.dateText}
                            >
                              Duration: {item.duration}
                            </Text>
                          </Box>
                        </Box>
                      </Box>

                      <Divider sx={{ mt: "0.8vh", mb: "0.6vh" }} />

                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        gap={"1vh"}
                      >
                        <CustomButton
                          text="View Recording"
                          type="primary"
                          disabled={item.call_status === CallStatus.IN_PROGRESS}
                          onClick={() =>
                            handleViewTranscript(
                              item.id,
                              item.userId,
                              item.roomName,
                              item.candidateName,
                              item.job,
                              item.date,
                              item.endedAt
                            )
                          }
                          additionalStyles={{
                            ...adminHomeStyles.button,
                            width: "34vh",
                            backgroundColor:
                              item.call_status === CallStatus.IN_PROGRESS
                                ? "#bdbdbd"
                                : globalStyles.colors.primary,
                            color:
                              item.call_status === CallStatus.IN_PROGRESS
                                ? "#757575"
                                : undefined,
                            cursor:
                              item.call_status === CallStatus.IN_PROGRESS
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          <StickyNote2OutlinedIcon
                            sx={adminHomeStyles.ScheduleIcon}
                          />
                        </CustomButton>

                        <Box display="flex" alignItems="center" gap="0.8vh">
                          <CustomButton
                            //text="Delete"
                            type="secondary"
                            onClick={() => openDeleteDialog(String(item.id))}
                            additionalStyles={{
                              ...adminHomeStyles.button,
                              borderColor: "#800000",
                              color: "#800000",
                            }}
                          >
                            <DeleteOutlineIcon
                              sx={adminHomeStyles.ScheduleIcon}
                            />
                          </CustomButton>
                          <Tooltip
                            title={
                              item.violationCount > 0
                                ? `View Violations (${item.violationCount})`
                                : "No violations"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled={item.violationCount === 0}
                                onClick={() =>
                                  setViolationsDialog({
                                    open: true,
                                    conversationId: item.id,
                                    candidateName: item.candidateName,
                                  })
                                }
                                sx={{
                                  padding: "0.5vh",
                                  color: item.violationCount > 0 ? "#B45309" : "#D1D5DB",
                                }}
                              >
                                <WarningAmberOutlined sx={{ fontSize: "2.2vh" }} />
                              </IconButton>
                            </span>
                          </Tooltip>

                          {item.call_status === CallStatus.COMPLETED && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "0.6vh 0.8vh",
                                borderRadius: "1.2vh",
                                fontWeight: 500,
                                fontSize: "1.5vh",
                                fontFamily: "Poppins, sans-serif",
                                minWidth: "12vh",
                                backgroundColor: getEvaluationStatusColors(
                                  item.evaluationStatus
                                ).background,
                                color: getEvaluationStatusColors(
                                  item.evaluationStatus
                                ).text,
                              }}
                            >
                              {(() => {
                                const raw = String(
                                  item.evaluationStatus || "Not Evaluated"
                                );
                                const normalized = raw
                                  .toLowerCase()
                                  .replaceAll("_", " ");
                                if (normalized === "rejected") return "Defaulted";
                                return formatLabel(raw.replaceAll("_", " "));
                              })()}
                            </span>
                          )}
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        )}

        {/* Pagination Footer */}
        <PaginationFooter
          count={total}
          page={Math.max(0, currentPage - 1)}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => handlePageChange(null, newPage + 1)}
          onRowsPerPageChange={(e) => {
            handleRowsPerPageChange(e);
            setCurrentPage(1);
          }}
          labelRowsPerPage="Rows per page:"
          rowsPerPageOptions={[10, 50, 100, 500]}
          showFirstButton
          showLastButton
          paginationStyles={adminHomeStyles.tablePagination}
        />
      </Box>
      {/* No dialog version */}
      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText={deleting ? null : "Cancel"}
        disableButton={deleting}
      // closeIcon
      />
      {/* Advanced Filters Dialog - Refine Candidates Modal */}
      <Dialog
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: adminHomeStyles.filterDialogPaper,
        }}
      >
        <DialogTitle
          sx={adminHomeStyles.filterDialogTitle}
        >
          
          Advanced Filters 
        </DialogTitle>
        <DialogContent
          sx={adminHomeStyles.filterDialogContent}
        >
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Box sx={adminHomeStyles.dialogLabelBox}>
              <Typography fontWeight={600} fontSize={"1.6vh"} fontFamily={"Poppins, sans-serif"}>
                Job
              </Typography>
              <Box sx={adminHomeStyles.dialogSelectAllClearBox}>
                <Button
                  size="small"
                  onClick={() => setSelectedColleges(collegesOptions)}
                  sx={adminHomeStyles.dialogSelectAllButton}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  onClick={() => setSelectedColleges([])}
                  sx={adminHomeStyles.dialogClearAllButton}
                >
                  Clear All
                </Button>
              </Box>
            </Box>
            <Autocomplete
              multiple
              disableCloseOnSelect
              forcePopupIcon={false}
              sx={{
                width: "100%",
                "& .MuiAutocomplete-endAdornment": { right: 8, marginRight: 0 },
              }}
              options={collegesOptions}
              getOptionLabel={(opt) => String((opt as any)?.label ?? "")}
              isOptionEqualToValue={(opt, val) => opt.value === val.value}
              value={selectedColleges}
              onChange={(_, val) =>
                setSelectedColleges(val as { label: string; value: string }[])
              }
              renderTags={(value, getTagProps) => (
                <Box
                  sx={adminHomeStyles.filterAutocompleteTagContainer}
                >
                  {value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={(option as any)?.value ?? index}
                      label={String((option as any)?.label ?? "")}
                      size="small"
                    />
                  ))}
                </Box>
              )}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox sx={{ mr: 1 }} checked={selected} />
                  <ListItemText primary={option.label} />
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search for Job"
                  variant="outlined"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchOutlined sx={{ color: "#6b7280" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={adminHomeStyles.filterAutocompleteInput}
                />
              )}
            />
            <Typography fontWeight={600} fontSize={"1.6vh"} fontFamily={"Poppins, sans-serif"} sx={{ mt: 0.5 }}>
              Avatar
            </Typography>
            <Select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
              }}
              displayEmpty
              renderValue={(selected: string) => {
                if (!selected) return "Select Avatar";
                return selected;
              }}
              sx={{
                ...categoryStyles.textfield,
                ...adminHomeStyles.filterSelectInDialog,
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: globalStyles.colors.primary,
                },
              }}
            >
              <MenuItem value="" disabled>
                Select Avatar
              </MenuItem>
              {userModels.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </Select>
            <Typography fontWeight={600} fontSize={"1.6vh"} fontFamily={"Poppins, sans-serif"} sx={{ mt: 0.5 }}>
              Start Date & Time
            </Typography>
            <Box sx={adminHomeStyles.dialogDateRangeBox}>
              <DateRangeSelector
                width="100%"
                height="48px"
                top="0vh"
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                hideFieldLabel
                minDate={minDate || undefined}
                maxDate={maxDate || undefined}
                onClear={handleClearDates}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={adminHomeStyles.filterDialogActions}
        >
          <Box
            sx={adminHomeStyles.filterButtonsBoxInDialog}
          >
            <Button
              onClick={() => handleApplyFilters()}
              variant="contained"
              sx={{
                ...adminHomeStyles.filterApplyButton,
                color: "#FFFFFF", backgroundColor: "#00695C", borderColor: "#00695C",
              }}
            >
              Apply Filters
            </Button>
            <Button
              onClick={handleResetFilters}
              variant="outlined"
              sx={adminHomeStyles.filterResetButton}
            >
              Reset
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <ProctoringViolationsModal
        open={violationsDialog.open}
        onClose={() => setViolationsDialog({ ...violationsDialog, open: false })}
        conversationId={violationsDialog.conversationId}
        candidateName={violationsDialog.candidateName}
      />

      {/* Snackbar for recording deletion notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AdminHome;

