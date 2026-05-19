import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  ListSubheader,
  InputAdornment,
  IconButton,
  InputBase,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import BlockIcon from "@mui/icons-material/Block";
import WarningIcon from "@mui/icons-material/Warning";
import { useNavigate, useParams, useLocation, useNavigationType } from "react-router-dom";
import { useRowsPerPage } from "../hooks/useRowsPerPage";
import { loadSessionStorageObject } from "../utils/sessionStorage";
import {
  getEvaluation,
  getAtsJobs,
  generateEvaluationReport,
  getBatchEvaluationProgress,
  generateSingleEvaluationReport,
  getSingleEvaluationProgress,
  exportCandidatesCsv,
  deleteEvaluation,
  getConversationDates,
  getReport,
} from "../api/api";
import { categoryStyles } from "../styles/categoryManagement.styles";
import PaginationFooter from "../components/PaginationFooter";
import { styles as candidateEvaluationStyles, getStatusColor as getStatusColorFromStyles } from "../styles/candidateEvaluation.styles";
import DateRangeSelector from "../components/dateRange/dateRangeFilter";
import ProctoringViolationsModal from "../components/ProctoringViolationsModal";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import minMax from "dayjs/plugin/minMax";
// import DeleteIcon from "@mui/icons-material/Delete";

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(minMax);

const FILTER_STORAGE_KEY = "candidateEvaluationFilters";

interface CandidateEvaluationFilters {
  search?: string;
  job?: string;
  selectedJobs?: string[];
  selectedCandidateStatus?: string;
  page?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  startDate?: string | null;
  endDate?: string | null;
}

const formatLabel = (text: string) =>
  (text || "")
    .replaceAll("_", " ")
    .replace(/disqualified/gi, "defaulted")
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

export const getStatusColor = (status: string) => {
  const normalized = String(status || "")
    .toLowerCase()
    .replaceAll("_", " ");
  switch (normalized) {
    case "selected":
      return { background: "#E6FAEA", color: "#22C55E" };
    case "not selected":
      return { background: "#FEE2E2", color: "#86161B" };
    case "not evaluated":
      return { background: "#FEF3C7", color: "#F59E0B" };
    case "disqualified":
      return { background: "#DBEAFE", color: "#3B82F6" };
    default:
      return { background: "#DBEAFE", color: "#3B82F6" };
  }
};

interface EvaluationData {
  isDisqualified: boolean;
  jobName: string;
  conversationId: string;
  endedAt: string;
  startedAt: string;
  evaluationStatus: string;
  overallScore: string;
  userId: string;
  userName: string;
  email: string;
  durationMs: number;
  proctoringViolationCount: number;
}

interface EvaluationResponse {
  data: EvaluationData[];
  page: number;
  limit: number;
  total: number;
  sortBy: string;
  sortOrder: string;
  evaluationCounts: {
    selected: number;
    notSelected: number;
    notEvaluated: number;
    interviewsEvaluated: number;
    disqualified: number;
  };
}

const CandidateEvaluation = () => {
  const storedFiltersRef = useRef<CandidateEvaluationFilters | null>(
    loadSessionStorageObject(FILTER_STORAGE_KEY) as CandidateEvaluationFilters | null
  );
  const hasInitializedSearchRef = useRef(false);
  const [search, setSearch] = useState(storedFiltersRef.current?.search ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const sanitizeId = (v: any): string => {
    if (v === null || v === undefined) return "";
    const s = String(v).trim();
    if (!s || s.toLowerCase() === "undefined" || s.toLowerCase() === "null") return "";
    return s;
  };

  const [selectedJobId, setSelectedJobId] = useState(
    sanitizeId(storedFiltersRef.current?.job ?? "")
  );

  const normalizeSelectedJobs = (raw: any): string[] => {
    if (!raw) return [];
    try {
      if (Array.isArray(raw)) {
        return raw.map((v) => {
          if (v && typeof v === "object") {
            // @ts-ignore
            return String(v.id ?? v.value ?? JSON.stringify(v)).trim();
          }
          return String(v).trim();
        });
      }
      if (typeof raw === "string") {
        return raw ? raw.split(",").map((v) => v.trim()) : [];
      }
      return [String(raw)];
    } catch {
      return [];
    }
  };

  const [selectedJobIds, setSelectedJobIds] = useState<string[]>(
    normalizeSelectedJobs(storedFiltersRef.current?.selectedJobs).map(sanitizeId).filter(Boolean)
  );



  // State for job dropdown
  const [jobList, setJobList] = useState<{ id: string; name: string }[]>([]);
  const jobLookupRef = useRef<Record<string, { id: string; name: string }>>({});
  const [jobSearch, setJobSearch] = useState("");
  const [debouncedJobSearch, setDebouncedJobSearch] = useState("");

  const [isEvaluationButtonEnabled, setIsEvaluationButtonEnabled] =
    useState(false);
  const [selectedCandidateStatus, setSelectedCandidateStatus] = useState(
    storedFiltersRef.current?.selectedCandidateStatus ?? ""
  );
  const [page, setPage] = useState(
    storedFiltersRef.current?.page && storedFiltersRef.current.page > 0
      ? storedFiltersRef.current.page
      : 1
  );
  const { rowsPerPage, handleRowsPerPageChange } = useRowsPerPage({
    defaultRowsPerPage: 10,
    storageKey: "candidateEvaluation_rowsPerPage",
  });
  const [evaluationData, setEvaluationData] =
    useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(
    storedFiltersRef.current?.sortBy ?? "endedAt"
  );
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(
    storedFiltersRef.current?.sortOrder === "ASC" ? "ASC" : "DESC"
  );
  const [progressPercentage, setProgressPercentage] = useState<number | null>(
    null
  );
  const [progressMetadata, setProgressMetadata] = useState<{
    total: number;
    completed: number;
  } | null>(null);
  const [activeEvaluations, setActiveEvaluations] = useState<{
    [conversationId: string]: NodeJS.Timeout;
  }>({});
  const activeEvaluationsRef = useRef<{
    [conversationId: string]: NodeJS.Timeout;
  }>({});
  const [refreshTick, setRefreshTick] = useState(0);
  const [stats, setStats] = useState([
    { label: "TOTAL INTERVIEWS", value: 0, color: "#006b66", icon: RecordVoiceOverIcon },
    { label: "EVALUATED", value: 0, color: "#006b66", icon: CheckCircleIcon },
    { label: "NOT EVALUATED", value: 0, color: "#f59e0b", icon: AccessTimeIcon },
    { label: "SELECTED STUDENTS", value: 0, color: "#006b66", icon: PeopleIcon },
    { label: "NOT SELECTED", value: 0, color: "#991b1b", icon: BlockIcon },
    { label: "DEFAULTED", value: 0, color: "#991b1b", icon: WarningIcon },
  ]);
  const [isStartEvaluationDisabled, setIsStartEvaluationDisabled] =
    useState(false);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [minDate, setMinDate] = useState<Dayjs | null>(null);
  const [maxDate, setMaxDate] = useState<Dayjs | null>(null);

  const [downloading, setDownloading] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const excelWorkerRef = useRef<Worker | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { id: conversationIdParam } = useParams<{ id?: string }>();
  const navigationType = useNavigationType();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    userId: string;
    conversationId: string;
  } | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [violationsDialog, setViolationsDialog] = useState<{
    open: boolean;
    conversationId: string;
    candidateName: string;
  }>({ open: false, conversationId: "", candidateName: "" });
  const evaluationStatusMap: Record<string, string> = {
    SELECTED: "Selected",
    NOT_SELECTED: "Not selected",
    NOT_EVALUATED: "Not evaluated",
    DISQUALIFIED: "Disqualified",
  };

  // Persist a sanitized version of stored filters back to sessionStorage
  useEffect(() => {
    try {
      const payload: CandidateEvaluationFilters = {
        search: search || undefined,
        job: selectedJobId || undefined,
        selectedJobs: (selectedJobIds && selectedJobIds.length > 0) ? selectedJobIds : undefined,
        selectedCandidateStatus: selectedCandidateStatus || undefined,
        page: page || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
        startDate: startDate?.toISOString() || undefined,
        endDate: endDate?.toISOString() || undefined,
      };
      sessionStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      /* ignore */
    }
  }, [search, selectedJobId, selectedJobIds, selectedCandidateStatus, page, sortBy, sortOrder, startDate, endDate]);

  // Normalize any persisted selectedColleges that might be stored as objects or numbers
  useEffect(() => {
    if (!selectedJobIds || selectedJobIds.length === 0) return;
    const needsNormalization = selectedJobIds.some(
      (v) => typeof v !== "string"
    );
    if (needsNormalization) {
      const normalized = selectedJobIds.map((v) => {
        try {
          // If it's an object with id/value, pick that; else stringify
          if (v && typeof v === "object") {
            // @ts-ignore
            return String(v.id ?? v.value ?? JSON.stringify(v));
          }
          return String(v);
        } catch {
          return String(v);
        }
      });
      setSelectedJobIds(normalized);
      setSelectedJobId(normalized.join(","));
    }
  }, []);

  // On unmount of the list component, record that we left from the list
  useEffect(() => {
    return () => {
      try {
        sessionStorage.setItem("candidateEvaluation_lastLeftView", "list");
      } catch (e) {
        /* ignore */
      }
    };
  }, []);

  // Restore evaluation view state when returning from other pages.
  // Behavior:
  // - If user navigated here via browser back/forward (navigationType === 'POP'),
  //   we treat that as an intentional return to list and clear any saved detail state.
  // - If user navigated here via a link (PUSH/REPLACE) and the last left view
  //   was 'detail', we attempt to verify the evaluation exists before auto-restore.
  useEffect(() => {
    // Only operate when we're on the list view (no URL param)
    if (conversationIdParam) return;

    try {
      // If user used back/forward, clear saved view and don't auto-restore
      if (navigationType === "POP") {
        sessionStorage.setItem("candidateEvaluation_lastLeftView", "list");
        return;
      }

      const lastLeft = sessionStorage.getItem("candidateEvaluation_lastLeftView");
      const savedEvaluationState = sessionStorage.getItem(
        "candidateEvaluation_viewingState"
      );

      if (lastLeft === "detail" && savedEvaluationState) {
        const evaluationState = JSON.parse(savedEvaluationState);

        // Verify the evaluation still exists before navigating.
        (async () => {
          try {
            await getReport(evaluationState.conversationId);
            // If the call succeeds, navigate to detail with saved state
            navigate(`/candidate-evaluation/${evaluationState.conversationId}`, {
              state: evaluationState,
              replace: false,
            });
          } catch (err) {
            // Evaluation likely deleted or not reachable. Show message and clear keys.
            console.warn("Evaluation missing during restore:", err);
            try {
              sessionStorage.removeItem("candidateEvaluation_viewingState");
              sessionStorage.removeItem("candidateEvaluation_lastLeftView");
            } catch (e) {
              /* ignore */
            }

            setSnackbarMessage("Evaluation not found. It may have been deleted.");
            setSnackbarOpen(true);
          }
        })();
      }
    } catch (error) {
      console.error("Error during candidate evaluation restore:", error);
    }
  }, [conversationIdParam, navigate, navigationType]);
  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      if (hasInitializedSearchRef.current) {
        setPage(1); // reset to first page on subsequent search changes
      } else {
        hasInitializedSearchRef.current = true;
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  // Calculate button disabled state based on stats, selected selectedJobIds, and evaluation progress
  useEffect(() => {
    // Extract "NOT EVALUATED" and "DEFAULTED" counts from existing stats (already selectedJobId-filtered)
    const notEvaluatedCount = stats.find((s) => s.label === "NOT EVALUATED")?.value ?? 0;
    const defaultedCount = stats.find((s) => s.label === "DEFAULTED")?.value ?? 0;
    const shouldDisable =
      !selectedJobIds.length ||
      (notEvaluatedCount === 0 && defaultedCount === 0) ||
      progressPercentage !== null;

    setIsStartEvaluationDisabled(shouldDisable);
  }, [stats, selectedJobIds, progressPercentage]);

  const handleSort = (column: string) => {
    if (sortBy !== column) {
      setSortBy(column);
      setSortOrder("ASC");
      return;
    }

    if (sortOrder === "ASC") {
      setSortOrder("DESC");
      return;
    }

    if (sortOrder === "DESC") {
      setSortBy("endedAt");
      setSortOrder("DESC");
      return;
    }
  };

  // Handle date range changes
  const handleStartDateChange = (date: Dayjs | null) => {
    setStartDate(date);
    setPage(1);
  };
  const handleEndDateChange = (date: Dayjs | null) => {
    setEndDate(date);
    setPage(1);
  };

  const handleClearDates = () => {
    if (minDate && maxDate) {
      setStartDate(minDate);
      setEndDate(maxDate);
    } else {
      setStartDate(null);
      setEndDate(null);
    }
    setPage(1);
  };
  const openDeleteDialog = (userId: string, conversationId: string) => {
    setUserToDelete({ userId, conversationId });
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setUserToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      // Delete by conversationId (not userId) - this deletes only the single evaluated interview
      await deleteEvaluation(userToDelete.conversationId);
      // Optimistically update UI: remove the deleted evaluation from the table
      setEvaluationData((prev) => {
        if (!prev) return prev;
        const updated = { ...prev } as any;
        // Filter out the deleted conversation instead of just resetting it
        updated.data = prev.data.filter(
          (item: any) => item.conversationId !== userToDelete.conversationId
        );
        // Update total count
        updated.total = Math.max(0, (updated.total || 0) - 1);
        return updated;
      });
      // Also trigger a backend refresh to be safe
      setRefreshTick((prev) => prev + 1);
      closeDeleteDialog();
    } catch (error) {
      console.error("Failed to delete evaluation:", error);
      // keep dialog open so user can retry or cancel
    }
  };

  // Fetch evaluation data
  const fetchEvaluationData = useCallback(async () => {
    try {
      // Only show loading spinner on initial load or when no data exists
      if (!evaluationData?.data) {
        setLoading(true);
      }

      const mappedStatus = selectedCandidateStatus
        ? evaluationStatusMap[selectedCandidateStatus]
        : undefined;
      setLoading(true);
      const response = await getEvaluation(
        page.toString(),
        rowsPerPage.toString(),
        undefined, // collegeId — not applicable for laterals
        debouncedSearch || undefined,
        sortBy,
        sortOrder,
        selectedCandidateStatus || undefined,
        startDate?.toISOString(),
        endDate?.toISOString(),
        selectedJobId || undefined, // jobId
        true // lateral: true
      );

      if (response && response.data) {
        // Use jobName from API (falls back to collegeName for backward compat)
        const mappedData = response.data.map((item: any) => ({
          ...item,
          jobName: item.jobName || item.collegeName || "Unknown Job",
        }));
        setEvaluationData({ ...response, data: mappedData });
      }

      // Clamp page if current page exceeds available pages after filters/search
      const lastPage = Math.max(
        1,
        Math.ceil((response?.total || 0) / rowsPerPage)
      );
      if (page > lastPage) {
        setPage(lastPage);
        return;
      }

      // Ensure we have a valid response before setting data
      if (response && (response.data || Array.isArray(response))) {
        setEvaluationData(response);
      } else {
        // Set empty data if response is invalid
        setEvaluationData({
          data: [],
          page: 1,
          limit: rowsPerPage,
          total: 0,
          sortBy,
          sortOrder,
          evaluationCounts: {
            selected: 0,
            notSelected: 0,
            notEvaluated: 0,
            interviewsEvaluated: 0,
            disqualified: 0,
          },
        });
      }

      // Calculate stats from API response
      if (response && response.evaluationCounts) {
        const { evaluationCounts } = response;

        const computedTotal =
          (evaluationCounts.selected || 0) +
          (evaluationCounts.notSelected || 0) +
          (evaluationCounts.disqualified || 0) +
          (evaluationCounts.notEvaluated || 0);

        setStats([
          { label: "TOTAL INTERVIEWS", value: computedTotal, color: "#006b66", icon: RecordVoiceOverIcon },
          { label: "EVALUATED", value: evaluationCounts.interviewsEvaluated, color: "#006b66", icon: CheckCircleIcon },
          { label: "NOT EVALUATED", value: evaluationCounts.notEvaluated, color: "#f59e0b", icon: AccessTimeIcon },
          { label: "SELECTED STUDENTS", value: evaluationCounts.selected, color: "#006b66", icon: PeopleIcon },
          { label: "NOT SELECTED", value: evaluationCounts.notSelected, color: "#991b1b", icon: BlockIcon },
          { label: "DEFAULTED", value: evaluationCounts.disqualified, color: "#991b1b", icon: WarningIcon },
        ]);

        if (evaluationCounts.notEvaluated === 0 && evaluationCounts.disqualified === 0) {
          setIsEvaluationButtonEnabled(false);
        }
      }

      // Save filters to sessionStorage after successful API call
      if (response) {
        const dataToSave: CandidateEvaluationFilters = {
          search,
          selectedJobs: selectedJobIds.length > 0 ? selectedJobIds : undefined,
          selectedCandidateStatus,
          page,
          sortBy,
          sortOrder,
          // Persist only valid dates
          startDate: startDate && startDate.isValid() ? startDate.toISOString() : null,
          endDate: endDate && endDate.isValid() ? endDate.toISOString() : null,
        };

        sessionStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(dataToSave));
      }

    } catch (error) {
      console.error("Failed to fetch evaluation data:", error);
      // Set empty data on error to prevent UI issues
      setEvaluationData({
        data: [],
        page: 1,
        limit: rowsPerPage,
        total: 0,
        sortBy,
        sortOrder,
        evaluationCounts: {
          selected: 0,
          notSelected: 0,
          notEvaluated: 0,
          interviewsEvaluated: 0,
          disqualified: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  }, [
    page,
    rowsPerPage,
    selectedJobId,
    debouncedSearch,
    sortBy,
    sortOrder,
    selectedCandidateStatus,
    startDate,
    endDate,
    selectedJobIds,
  ]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedJobSearch(jobSearch.trim());
    }, 500);
    return () => clearTimeout(handler);
  }, [jobSearch]);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await getAtsJobs();
      const rawJobs = res?.jobs || res?.data || (Array.isArray(res) ? res : []);
      
      if (Array.isArray(rawJobs)) {
        const mappedJobs = rawJobs.map((job: any) => ({
          id: String(job.id || job._id),
          name: job.job_title || job.title || "Unknown Job",
        }));
        setJobList(mappedJobs);
        
        // Build lookup
        const lookup: Record<string, { id: string; name: string }> = {};
        mappedJobs.forEach((j) => { lookup[j.id] = j; });
        jobLookupRef.current = lookup;
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Fetch global conversation date range once on first load (similar to AdminHome)
  useEffect(() => {
    const controller = new AbortController();
    const loadConversationDates = async () => {
      try {
        const res = await getConversationDates(controller.signal);
        const minRaw = (res as any)?.minStartedAt;
        const maxRaw = (res as any)?.maxStartedAt;
        const min = minRaw ? dayjs.utc(minRaw) : null;
        const max = maxRaw ? dayjs.utc(maxRaw) : null;
        if (min && max) {
          setMinDate(min);
          setMaxDate(max);
          setStartDate(storedFiltersRef.current?.startDate
            ? dayjs(storedFiltersRef.current.startDate)
            : min);
          setEndDate(storedFiltersRef.current?.endDate
            ? dayjs(storedFiltersRef.current.endDate)
            : max);
        }
      } catch {
        // Silent fallback; evaluation API still works without global date bounds
      }
    };
    loadConversationDates();
    return () => controller.abort();
  }, []);


  useEffect(() => {
    if (!minDate || !maxDate) {
      return;
    }

    fetchEvaluationData();
  }, [
    minDate,
    maxDate,
    fetchEvaluationData,
    refreshTick,
    progressPercentage,
    activeEvaluations
  ]);

  // Recalculate "Start Evaluation" button enabled state based on stats and selected selectedJobIds
  useEffect(() => {
    const hasSelectedColleges = selectedJobIds.length > 0;
    const notEvaluatedStat = stats.find((s) => s.label === "NOT EVALUATED");
    const defaultedStat = stats.find((s) => s.label === "DEFAULTED");
    const hasEvaluationCandidates =
      (notEvaluatedStat?.value || 0) > 0 || (defaultedStat?.value || 0) > 0;
    const isNotProcessing = progressPercentage === null;

    const shouldEnable =
      hasSelectedColleges && hasEvaluationCandidates && isNotProcessing;

    setIsEvaluationButtonEnabled(shouldEnable);
  }, [stats, selectedJobIds, progressPercentage]);


  const fetchBatchEvaluationProgress = useCallback(async () => {
    abortControllerRef.current = new AbortController();

    try {
      const response = await getBatchEvaluationProgress(
        selectedJobId,
        abortControllerRef.current.signal
      );

      if (response.progress_percentage !== undefined) {
        setProgressPercentage(response.progress_percentage);
      }

      if (response.total !== undefined && response.completed !== undefined) {
        setProgressMetadata({
          total: response.total,
          completed: response.completed,
        });
      }

      if (response.status === "completed") {
        setProgressPercentage(null);
        setProgressMetadata(null);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        setRefreshTick((t) => t + 1);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Failed to fetch batch evaluation progress:", error);
      }
    }
  }, [selectedJobId]);

  const handleGenerateEvaluationReport = async () => {
    try {
      setProgressPercentage(0);

      // Call the API with selectedJobId ID only
      // The backend will handle filtering unevaluated candidates for the entire selectedJobId (not paginated subset)
      await generateEvaluationReport(selectedJobId);

      progressIntervalRef.current = setInterval(() => {
        fetchBatchEvaluationProgress();
      }, 10000);
    } catch (error) {
      console.error("Failed to generate evaluation report:", error);
    }
  };

  const handleSingleEvaluation = async (conversationId: string) => {
    try {
      if (activeEvaluations[conversationId]) {
        clearInterval(activeEvaluations[conversationId]);
      }
      setActiveEvaluations((prev) => ({
        ...prev,
        [conversationId]: 1 as any,
      }));

      const result = await generateSingleEvaluationReport(conversationId);

      const intervalId = setInterval(() => {
        fetchSingleEvaluationProgress(conversationId, intervalId);
      }, 10000);

      setActiveEvaluations((prev) => ({
        ...prev,
        [conversationId]: intervalId,
      }));
    } catch (error) {
      console.error("Failed to generate evaluation:", error);

      // Clear the active evaluation state on error
      setActiveEvaluations((prev) => {
        const newState = { ...prev };
        delete newState[conversationId];
        return newState;
      });
    }
  };

  const fetchSingleEvaluationProgress = async (
    conversationId: string,
    intervalId?: NodeJS.Timeout
  ) => {
    try {
      const response = await getSingleEvaluationProgress(conversationId);

      if (response.status === "completed" || response.status === "failed") {
        if (intervalId) {
          clearInterval(intervalId);
          setActiveEvaluations((prev) => {
            const updated = { ...prev };
            delete updated[conversationId];
            return updated;
          });
        }

        // Only refresh the table after the job reaches a terminal state
        setRefreshTick((t) => t + 1);
      }
    } catch (error) {
      console.error("Error polling job-status:", error);
    }
  };

  useEffect(() => {
    if (!selectedJobId) return;

    const handleBatchEvaluation = async () => {
      try {
        const response = await getBatchEvaluationProgress(selectedJobId);
        if (response.status === "failed") {
          setIsEvaluationButtonEnabled(true);
          setProgressPercentage(null);
        } else {
          if (response.progress_percentage !== undefined) {
            setProgressPercentage(response.progress_percentage);
          }

          if (
            response.total !== undefined &&
            response.completed !== undefined
          ) {
            setProgressMetadata({
              total: response.total,
              completed: response.completed,
            });
          }
          progressIntervalRef.current = setInterval(() => {
            fetchBatchEvaluationProgress();
          }, 10000);
        }
      } catch (error) {
        console.error("Failed to fetch batch evaluation progress:", error);
      }
    };
    handleBatchEvaluation();

    return () => {
      setProgressPercentage(null);
      setProgressMetadata(null);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedJobId, fetchBatchEvaluationProgress]);

  useEffect(() => {
    return () => {
      Object.entries(activeEvaluationsRef.current).forEach(
        ([conversationId, intervalId]) => {
          if (intervalId) {
            clearInterval(intervalId);
          }
        }
      );
    };
  }, []);

  useEffect(() => {
  }, []);

  const handleDownloadCsv = async () => {
    setDownloading(true);

    try {
      const idsToExport =
        selectedJobIds && selectedJobIds.length > 0
          ? selectedJobIds
          : (jobList || []).map((c) => c.id);

      const dateStart = startDate && startDate.isValid() ? startDate.format("YYYY-MM-DD") : undefined;
      const dateEnd = endDate && endDate.isValid() ? endDate.format("YYYY-MM-DD") : undefined;

      let mergedCsvText: string | null = null;

      for (let i = 0; i < idsToExport.length; i++) {
        const id = idsToExport[i];
        const blob = await exportCandidatesCsv(id, dateStart, dateEnd);
        const text = await (blob as Blob).text();
        if (mergedCsvText === null) {
          mergedCsvText = text;
        } else {
          const lines = text.split(/\r?\n/);
          const withoutHeader = lines.slice(1).join("\n");
          mergedCsvText +=
            (mergedCsvText.endsWith("\n") ? "" : "\n") + withoutHeader;
        }
      }
      // Derive a human-friendly filename using selected selectedJobId name(s)
      const selectedCollegeName = (() => {
        if (!selectedJobIds || selectedJobIds.length === 0) return "all";
        if (selectedJobIds.length === 1) {
          const col = jobList.find((c) => c.id === selectedJobIds[0]);
          return col?.name || "all";
        }
        return `${selectedJobIds.length}_selectedJobIds`;
      })().replace(/[^a-zA-Z0-9._-]/g, "_");

      const csvBlob = new Blob([mergedCsvText || ""], { type: "text/csv" });
      const url = window.URL.createObjectURL(csvBlob);
      const link = document.createElement("a");
      link.href = url;
      const datePart = new Date().toISOString().split("T")[0];
      link.setAttribute(
        "download",
        `candidates_${selectedCollegeName}_${datePart}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download CSV:", error);
    } finally {
      setDownloading(false);
    }
  };

  const orderedCollegeList = useMemo(() => {
    const normalizedCollegeSearch = jobSearch.trim().toLowerCase();
    const filteredCollegeList = normalizedCollegeSearch
      ? jobList.filter((col) =>
        col.name.toLowerCase().includes(normalizedCollegeSearch)
      )
      : jobList;
    const selectedCollegeEntries = selectedJobIds
      .map(
        (id) =>
          jobLookupRef.current[id] ||
          filteredCollegeList.find((c) => String((c as any).id) === String(id))
      )
      .filter((col): col is { id: string; name: string } => Boolean(col));
    const selectedIds = new Set(selectedCollegeEntries.map((col) => col.id));
    return [
      ...selectedCollegeEntries,
      ...filteredCollegeList.filter((col) => !selectedIds.has(col.id)),
    ];
  }, [jobSearch, jobList, selectedJobIds]);

  return (
    <Box sx={candidateEvaluationStyles.mainBox}>
      {/* Title and Search */}
      <Box sx={candidateEvaluationStyles.titleBox}>
        <Typography sx={candidateEvaluationStyles.title}>
          Candidate Evaluation
        </Typography>
      </Box>

      {/* Dropdowns and Buttons */}
      <Box sx={candidateEvaluationStyles.dropdownsContainer}>
        <Box sx={candidateEvaluationStyles.dropdownsLeftBox}>
          <Box>
            <Typography sx={candidateEvaluationStyles.dropdownLabel}>
              Job
            </Typography>
            <Select
              multiple
              value={selectedJobIds}
              onChange={(e) => {
                // Normalize selected values to string[] to avoid type mismatches
                const raw = e.target.value as unknown;
                let valuesArray: string[] = [];
                if (typeof raw === "string") {
                  valuesArray = raw ? raw.split(",").map((v) => String(v).trim()) : [];
                } else if (Array.isArray(raw)) {
                  valuesArray = raw.map((v) => String(v).trim());
                } else if (raw != null) {
                  valuesArray = [String(raw).trim()];
                }
                 // Remove any 'undefined'/'null' string artifacts
                 const cleaned = valuesArray.map(sanitizeId).filter(Boolean);
                 setSelectedJobIds(cleaned);
                 const selectedJobIdVal = cleaned.length === 1 ? cleaned[0] : "";
                 setSelectedJobId(selectedJobIdVal);
                setProgressPercentage(null);
                setPage(1);
                setRefreshTick((prev) => prev + 1);
              }}
              displayEmpty
              size="small"
              sx={candidateEvaluationStyles.collegeSelect}
              MenuProps={candidateEvaluationStyles.collegeSelectMenu as any}
              renderValue={(selected) => {
                const ids = (selected as unknown) as string[];
                if (!ids || ids.length === 0) return "All Jobs";
                if (ids.length === 1) {
                  const id = ids[0];
                  let col: { id: string; name: string } | undefined =
                    jobLookupRef.current[id];
                  if (!col) {
                    col =
                      jobList.find((c) => String(c.id) === String(id)) ||
                      jobList.find((c) => String(c.id) === String(Number(id))) ||
                      undefined;
                  }
                  return col?.name || "Unknown Job";
                }
                return `${ids.length} jobs selected`;
              }}
            >
              <ListSubheader
                component="div"
                sx={candidateEvaluationStyles.listSubheader}
              >
                <InputBase
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Search jobs"
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon sx={candidateEvaluationStyles.searchIcon} />
                    </InputAdornment>
                  }
                  sx={candidateEvaluationStyles.inputBase}
                />
              </ListSubheader>

              <ListSubheader
                component="div"
                sx={candidateEvaluationStyles.listSubheaderSearch}
              >
                <Typography sx={{ fontSize: "1.4vh", fontWeight: 600 }}>
                  All Jobs
                </Typography>
                <Box sx={{ display: "flex", gap: "0.5vh" }}>
                  <Button
                    size="small"
                    onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    const allJobIds = jobList.map((j) => j.id);
                    setSelectedJobIds(allJobIds);
                    setSelectedJobId(allJobIds.join(","));
                    setIsEvaluationButtonEnabled(false);
                    setProgressPercentage(null);
                  }}
                    sx={{
                      ...candidateEvaluationStyles.selectAllClearButton,
                      color: "#3B82F6",
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    size="small"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedJobIds([]);
                      setSelectedJobId("");
                      setJobSearch(""); // Clear search input as well
                      setIsEvaluationButtonEnabled(false);
                      setProgressPercentage(null);
                    }}
                    sx={{
                      ...candidateEvaluationStyles.selectAllClearButton,
                      color: "#a00",
                    }}
                  >
                    Clear
                  </Button>
                </Box>
              </ListSubheader>
                <Box
                  onScroll={(e) => e.stopPropagation()}
                  sx={candidateEvaluationStyles.collegeDropdownContainer}
                >
                  {jobList
                    .filter((job) =>
                      !debouncedJobSearch ||
                      job.name.toLowerCase().includes(debouncedJobSearch)
                    )
                    .map((job) => {
                      const isSelected = selectedJobIds.indexOf(job.id) > -1;
                      return (
                        <MenuItem
                          key={job.id}
                          value={job.id}
                          sx={candidateEvaluationStyles.collegeMenuItemStyle}
                          onClick={(e) => {
                            e.stopPropagation();
                            let updatedJobIds: string[];
                            if (isSelected) {
                              updatedJobIds = selectedJobIds.filter(id => id !== job.id);
                            } else {
                              updatedJobIds = [...selectedJobIds, job.id];
                            }
                            setSelectedJobIds(updatedJobIds);
                            setSelectedJobId(updatedJobIds.join(","));
                            setIsEvaluationButtonEnabled(false);
                            setProgressPercentage(null);
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            size="small"
                            sx={candidateEvaluationStyles.checkboxSmall}
                          />
                          <ListItemText
                            primary={job.name}
                            primaryTypographyProps={{
                              sx: { fontSize: "1.2vh" },
                            }}
                          />
                        </MenuItem>
                      );
                    })}
                </Box>
            </Select>
          </Box>
          <Box>
            <Typography sx={candidateEvaluationStyles.dropdownLabel}>
              Evaluation Status
            </Typography>
            <Select
              value={selectedCandidateStatus}
              onChange={(e) => setSelectedCandidateStatus(e.target.value)}
              displayEmpty
              size="small"
              sx={candidateEvaluationStyles.candidateStatusSelect}
            >
              <MenuItem value="" sx={candidateEvaluationStyles.statusMenuItemStyle}>
                All Status
              </MenuItem>
              <MenuItem value="SELECTED" sx={candidateEvaluationStyles.statusMenuItemStyle}>
                Selected
              </MenuItem>
              <MenuItem value="NOT_SELECTED" sx={candidateEvaluationStyles.statusMenuItemStyle}>
                Not Selected
              </MenuItem>
              <MenuItem value="NOT_EVALUATED" sx={candidateEvaluationStyles.statusMenuItemStyle}>
                Not Evaluated
              </MenuItem>
              <MenuItem value="DISQUALIFIED" sx={candidateEvaluationStyles.statusMenuItemStyle}>
                Disqualified
              </MenuItem>
            </Select>
          </Box>
          <Box>
            <Typography sx={candidateEvaluationStyles.dropdownLabel}>
              Date Range
            </Typography>
            <DateRangeSelector
              width="20vw"
              height="3.6vh"
              top="0vh"
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
              minDate={minDate || undefined}
              maxDate={maxDate || undefined}
              hideFieldLabel
              onClear={handleClearDates}
              sx={{ ...categoryStyles.textfield }}
            />
          </Box>
        </Box>
        <Box sx={candidateEvaluationStyles.buttonsRightBox}>
          <Button
            variant="outlined"
            startIcon={<CloudDownloadIcon />}
            sx={candidateEvaluationStyles.downloadButton}
            onClick={handleDownloadCsv}
            disabled={downloading}
          >
            {downloading ? "Downloading..." : "Download"}
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={1} sx={candidateEvaluationStyles.statsGrid}>
        {stats.map((stat: any) => {
          const IconComponent = stat.icon;
          return (
            <Grid size={12 / 6} key={stat.label}>
              <Card sx={{ ...candidateEvaluationStyles.statCard, borderTopColor: stat.color }}>
                <IconComponent sx={{ fontSize: "2.2vh", color: stat.color, flexShrink: 0 }} />
                <CardContent sx={candidateEvaluationStyles.statCardContent}>
                  <Typography sx={candidateEvaluationStyles.statValue}>
                    {stat.value.toLocaleString()}
                  </Typography>
                  <Typography sx={candidateEvaluationStyles.statLabel}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={candidateEvaluationStyles.candidateDetailsBox}>
        <Box sx={candidateEvaluationStyles.candidateDetailsLeftBox}>
          <Typography sx={candidateEvaluationStyles.candidateDetailsTitle}>
            Candidate Details
          </Typography>
          {loading &&
            evaluationData?.data &&
            evaluationData.data.length > 0 && (
              <CircularProgress size={16} sx={candidateEvaluationStyles.circularProgress} />
            )}
        </Box>
        <Box sx={candidateEvaluationStyles.candidateDetailsRightBox}>
          <Tooltip
            placement="top"
            title={
              !selectedJobIds.length
                ? "Please select a job to start evaluation"
                : (() => {
                  const notEvalCount = stats.find((s) => s.label === "NOT EVALUATED")?.value ?? 0;
                  const defaultCount = stats.find((s) => s.label === "DEFAULTED")?.value ?? 0;
                  return notEvalCount === 0 && defaultCount === 0
                    ? "All candidates in the selected job(s) are already evaluated or defaulted"
                    : "";
                })()
            }
            sx={candidateEvaluationStyles.downloadIconButton}
          >
            <span>
              <Button
                variant="contained"
                disabled={isStartEvaluationDisabled}
                onClick={() => {
                  handleGenerateEvaluationReport();
                }}
                sx={{
                  borderRadius: "1vh",
                  background:
                    progressPercentage !== null
                      ? `linear-gradient(90deg, #a00 ${progressPercentage}%, rgba(160, 0, 0, 0.3) ${progressPercentage}%)`
                      : "#a00",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "1.5vh",
                  padding: "0.8vh 1.5vh",
                  minWidth: "20vh",
                  mr: "1.6vh",
                  position: "relative",
                  overflow: "hidden",
                  height: "3.5vh",
                  "&:hover": {
                    background:
                      progressPercentage !== null
                        ? `linear-gradient(90deg, #c00 ${progressPercentage}%, rgba(192, 0, 0, 0.3) ${progressPercentage}%)`
                        : "#c00",
                  },
                  "&:disabled": {
                    color: progressPercentage !== null ? "#000" : undefined,
                  },
                }}
              >
                {progressPercentage !== null
                  ? `${progressMetadata?.completed ?? 0}/${progressMetadata?.total ?? 0
                  }`
                  : "Start Evaluation"}
              </Button>
            </span>
          </Tooltip>
          <InputBase
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Candidate"
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon sx={candidateEvaluationStyles.searchIcon} />
              </InputAdornment>
            }
            sx={candidateEvaluationStyles.searchCandidateInput}
          />
        </Box>
      </Box>

      {/* Table */}
      <Paper
        sx={candidateEvaluationStyles.paperTableContainer}
      >
        {/* Header-only table (non-scrollable) */}
        <Table size="small" sx={candidateEvaluationStyles.headerTableOnlyTable}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  ...candidateEvaluationStyles.headerTableCell,
                  width: "16.5%",
                  "&:hover .sortIcon": {
                    opacity: sortBy === "userName" ? 1 : 0.5,
                  },
                }}
              >
                <Box
                  sx={candidateEvaluationStyles.sortIconButtonBox}
                >
                  Candidate Name
                  <IconButton
                    size="small"
                    onClick={() => handleSort("userName")}
                    sx={candidateEvaluationStyles.sortIconButton}
                  >
                    {sortBy === "userName" ? (
                      <ArrowDownwardIcon
                        className="sortIcon"
                        sx={{
                          ...candidateEvaluationStyles.sortIconArrow,
                          transform:
                            sortOrder === "ASC"
                              ? "rotate(180deg)"
                              : "none",
                        }}
                      />
                    ) : (
                      <SwapVertIcon className="sortIcon" sx={candidateEvaluationStyles.sortIconSwapVert} />
                    )}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  ...candidateEvaluationStyles.headerTableCell,
                  width: "17.7%",
                  "&:hover .sortIcon": {
                    opacity: sortBy === "userEmail" ? 1 : 0.5,
                  },
                }}
              >
                <Box
                  sx={candidateEvaluationStyles.sortIconButtonBox}
                >
                  Email ID
                  <IconButton
                    size="small"
                    onClick={() => handleSort("userEmail")}
                    sx={candidateEvaluationStyles.sortIconButton}
                  >
                    {sortBy === "userEmail" ? (
                      <ArrowDownwardIcon
                        className="sortIcon"
                        sx={{
                          ...candidateEvaluationStyles.sortIconArrow,
                          transform:
                            sortOrder === "ASC"
                              ? "rotate(180deg)"
                              : "none",
                        }}
                      />
                    ) : (
                      <SwapVertIcon className="sortIcon" sx={candidateEvaluationStyles.sortIconSwapVert} />
                    )}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  ...candidateEvaluationStyles.headerTableCell,
                  width: "10%",
                  "&:hover .sortIcon": {
                    opacity: sortBy === "selectedJobIdName" ? 1 : 0.5,
                  },
                }}
              >
                <Box
                  sx={candidateEvaluationStyles.collegeNameHeaderBox}
                >
                  Job
                  <IconButton
                    size="small"
                    onClick={() => handleSort("jobName")}
                    sx={candidateEvaluationStyles.sortIconButtonSmall}
                  >
                    {sortBy === "jobName" ? (
                      <ArrowDownwardIcon
                        className="sortIcon"
                        sx={{
                          fontSize: "1.6vh",
                          opacity: 1,
                          transition: "transform 0.2s ease, opacity 0.2s ease",
                          color: "#a00",
                          transform:
                            sortOrder === "ASC"
                              ? "rotate(180deg)"
                              : "none",
                        }}
                      />
                    ) : (
                      <SwapVertIcon className="sortIcon" sx={candidateEvaluationStyles.sortIconSwapVert} />
                    )}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  ...candidateEvaluationStyles.headerTableCell,
                  width: "15%",
                  "&:hover .sortIcon": {
                    opacity: sortBy === "startedAt" ? 1 : 0.5,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3vh",
                    whiteSpace: "nowrap",
                    fontSize: "1.6vh",
                  }}
                >
                  Interview Date
                  <IconButton
                    size="small"
                    onClick={() => handleSort("startedAt")}
                    sx={candidateEvaluationStyles.sortIconButtonSmall}
                  >
                    {sortBy === "startedAt" ? (
                      <ArrowDownwardIcon
                        className="sortIcon"
                        sx={{
                          fontSize: "1.6vh",
                          opacity: 1,
                          transition: "transform 0.2s ease, opacity 0.2s ease",
                          color: "#a00",
                          transform:
                            sortOrder === "ASC"
                              ? "rotate(180deg)"
                              : "none",
                        }}
                      />
                    ) : (
                      <SwapVertIcon className="sortIcon" sx={candidateEvaluationStyles.sortIconSwapVert} />
                    )}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  ...candidateEvaluationStyles.headerTableCell,
                  width: "10%",
                  textAlign: "center",
                  "&:hover .sortIcon": {
                    opacity: sortBy === "overallScore" ? 1 : 0.5,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3vh",
                    whiteSpace: "nowrap",
                  }}
                >
                  Overall Score
                  <IconButton
                    size="small"
                    onClick={() => handleSort("overallScore")}
                    sx={candidateEvaluationStyles.sortIconButtonSmall}
                  >
                    {sortBy === "overallScore" ? (
                      <ArrowDownwardIcon
                        className="sortIcon"
                        sx={{
                          fontSize: "1.6vh",
                          opacity: 1,
                          transition: "transform 0.2s ease, opacity 0.2s ease",
                          color: "#a00",
                          transform:
                            sortOrder === "ASC"
                              ? "rotate(180deg)"
                              : "none",
                        }}
                      />
                    ) : (
                      <SwapVertIcon className="sortIcon" sx={candidateEvaluationStyles.sortIconSwapVert} />
                    )}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  ...candidateEvaluationStyles.headerTableCell,
                  width: "12%",
                  "&:hover .sortIcon": {
                    opacity: sortBy === "evaluationStatus" ? 1 : 0.5,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3vh",
                    whiteSpace: "nowrap",
                  }}
                >
                  Evaluation Status
                  <IconButton
                    size="small"
                    onClick={() => handleSort("evaluationStatus")}
                    sx={candidateEvaluationStyles.sortIconButtonSmall}
                  >
                    {sortBy === "evaluationStatus" ? (
                      <ArrowDownwardIcon
                        className="sortIcon"
                        sx={{
                          fontSize: "1.6vh",
                          opacity: 1,
                          transition: "transform 0.2s ease, opacity 0.2s ease",
                          color: "#a00",
                          transform:
                            sortOrder === "ASC"
                              ? "rotate(180deg)"
                              : "none",
                        }}
                      />
                    ) : (
                      <SwapVertIcon className="sortIcon" sx={candidateEvaluationStyles.sortIconSwapVert} />
                    )}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell
                sx={{ ...candidateEvaluationStyles.headerTableCell, width: "16%" }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
        </Table>

        {/* Body Table (scrollable) */}
        <TableContainer sx={candidateEvaluationStyles.bodyTableContainer}>
          <Table
            size="small"
            sx={candidateEvaluationStyles.bodyTable}
          >
            <TableBody>
              {loading ? (
                <TableRow sx={candidateEvaluationStyles.emptyTableRow}>
                  <TableCell colSpan={7}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : evaluationData?.data && evaluationData.data.length > 0 ? (
                evaluationData.data.map((row, idx) => (
                  <TableRow
                    key={idx}
                    sx={{}}
                  >
                    <TableCell sx={candidateEvaluationStyles.tableDataCellName}>
                      <Tooltip title={row.userName} arrow placement="top">
                        <span>
                          {row.userName}
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={candidateEvaluationStyles.tableDataCellEmail}>
                      <Tooltip title={row.email} arrow placement="top">
                        <span>
                          {row.email}
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={candidateEvaluationStyles.tableDataCell}>
                      <Tooltip title={row.jobName} arrow placement="top">
                        <span>{row.jobName}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={candidateEvaluationStyles.dataTableCellDate}>
                      {dayjs(row.startedAt).format("DD-MM-YYYY hh:mm a")}
                    </TableCell>
                    <TableCell sx={candidateEvaluationStyles.dataTableCellScore}>
                      {row.overallScore ?? "N/A"}
                    </TableCell>
                    <TableCell sx={candidateEvaluationStyles.dataTableCellStatus}>
                      <Box
                        sx={{
                          ...candidateEvaluationStyles.statusBadgeInline,
                          background:
                            getStatusColor(row.evaluationStatus).background ||
                            "#eee",
                          color:
                            getStatusColor(row.evaluationStatus).color ||
                            "#333",
                        }}
                      >
                        {formatLabel(row.evaluationStatus)}
                      </Box>
                    </TableCell>
                    <TableCell sx={candidateEvaluationStyles.dataTableCellActions}>
                      {!row.overallScore ? (
                        <Box sx={candidateEvaluationStyles.actionButtonsBoxInline}>
                          <Button
                            variant="contained"
                            disabled={
                              activeEvaluations[row.conversationId] !==
                              undefined
                            }
                            sx={candidateEvaluationStyles.evaluateButtonContained}
                            size="small"
                            onClick={() =>
                              handleSingleEvaluation(row.conversationId)
                            }
                          >
                            {activeEvaluations[row.conversationId] !== undefined
                              ? "Evaluating..."
                              : "Evaluate"}
                          </Button>
                          <Tooltip title="Delete evaluation">
                            <span>
                              <IconButton
                                size="small"
                                disabled={true}
                                onClick={() =>
                                  openDeleteDialog(row.userId, row.conversationId)
                                }
                                sx={{
                                  ...candidateEvaluationStyles.deleteIconButtonInline,
                                  color: "#9ca3af",
                                  borderColor: "#e5e7eb"
                                }}
                              >
                                <DeleteOutlineIcon sx={{ ...candidateEvaluationStyles.deleteIconButton22vh, color: "#9ca3af" }} />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip
                            title={
                              row.proctoringViolationCount > 0
                                ? `View Violations (${row.proctoringViolationCount})`
                                : "No violations"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled={row.proctoringViolationCount === 0}
                                onClick={() =>
                                  setViolationsDialog({
                                    open: true,
                                    conversationId: row.conversationId,
                                    candidateName: row.userName,
                                  })
                                }
                                sx={{
                                  border: "1px solid",
                                  borderRadius: "0.6vh",
                                  padding: "0.4vh",
                                  borderColor: row.proctoringViolationCount > 0 ? "#B45309" : "#D1D5DB",
                                  color: row.proctoringViolationCount > 0 ? "#B45309" : "#D1D5DB",
                                }}
                              >
                                <WarningAmberOutlined sx={{ fontSize: "2vh" }} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Box sx={candidateEvaluationStyles.actionButtonsBoxInline}>
                          <Button
                            variant="outlined"
                            sx={candidateEvaluationStyles.evaluateButtonOutlined}
                            size="small"
                            disabled={row.evaluationStatus === "Disqualified"}
                            onClick={() => {
                              const evaluationState = {
                                conversationId: row.conversationId,
                                evaluationStatus: row.evaluationStatus,
                                name: row.userName,
                                jobName: row.jobName,
                                date: row.startedAt,
                                duration: row.durationMs,
                              };
                              // Save to sessionStorage for persistence
                              sessionStorage.setItem(
                                "candidateEvaluation_viewingState",
                                JSON.stringify(evaluationState)
                              );
                              // Mark that we're entering detail view
                              sessionStorage.setItem(
                                "candidateEvaluation_lastLeftView",
                                "detail"
                              );
                              navigate(
                                `/candidate-evaluation/${row.conversationId}`,
                                {
                                  state: evaluationState,
                                }
                              );
                            }}
                          >
                            View Evaluation
                          </Button>
                          <Tooltip title="Delete evaluation">
                            <IconButton
                              size="small"
                              onClick={() =>
                                openDeleteDialog(row.userId, row.conversationId)
                              }
                              sx={candidateEvaluationStyles.deleteIconButtonInline}
                            >
                              <DeleteOutlineIcon sx={candidateEvaluationStyles.deleteIconButton22vh} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            title={
                              row.proctoringViolationCount > 0
                                ? `View Violations (${row.proctoringViolationCount})`
                                : "No violations"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled={row.proctoringViolationCount === 0}
                                onClick={() =>
                                  setViolationsDialog({
                                    open: true,
                                    conversationId: row.conversationId,
                                    candidateName: row.userName,
                                  })
                                }
                                sx={{
                                  border: "1px solid",
                                  borderRadius: "0.6vh",
                                  padding: "0.4vh",
                                  borderColor: row.proctoringViolationCount > 0 ? "#B45309" : "#D1D5DB",
                                  color: row.proctoringViolationCount > 0 ? "#B45309" : "#D1D5DB",
                                }}
                              >
                                <WarningAmberOutlined sx={{ fontSize: "2vh" }} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    sx={candidateEvaluationStyles.loadingCellInline}
                  >
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination Footer */}
      <PaginationFooter
        count={evaluationData?.total || 0}
        page={(evaluationData?.page || 1) - 1}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage + 1)}
        onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          handleRowsPerPageChange(event);
          setPage(1);
        }}
        labelRowsPerPage="Rows per page:"
        rowsPerPageOptions={[10, 50, 100, 500]}
        showFirstButton
        showLastButton
        paginationStyles={categoryStyles.pagination}
      />

      {/* Delete Confirmation Dialog */}
      {/* Snackbar for errors (e.g. evaluation deleted by another user) */}
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

      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Box
          sx={{
            background: "linear-gradient(108deg, #004d40 0%, #00605a 45%, #004d40 100%)",
            color: "#fff",
          }}
        >
          <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        </Box>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this evaluation record? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} sx={{
            backgroundColor: "#00695C",
            color: "#FFFFFF",
          }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} sx={{
            backgroundColor: "#00695C",
            color: "#FFFFFF",
          }} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <ProctoringViolationsModal
        open={violationsDialog.open}
        onClose={() => setViolationsDialog({ ...violationsDialog, open: false })}
        conversationId={violationsDialog.conversationId}
        candidateName={violationsDialog.candidateName}
      />

    </Box>
  );
};

export default CandidateEvaluation;
