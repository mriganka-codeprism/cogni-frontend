import { styles } from "../styles/JobDetails.styles";
import React, { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  Checkbox,
  TextField,
  Paper,
  Tabs,
  Tab,
  TableContainer,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import tableview from "../assets/images/tableview.png";
import gridview from "../assets/images/gridview.png";
import upload from "../assets/images/upload.png";
import downgreen from "../assets/images/downgreen.png";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import DownloadIcon from "@mui/icons-material/Download";
import LinkIcon from "@mui/icons-material/Link";
import DeleteIcon from "@mui/icons-material/Delete";
import { CheckCircleOutline, LinkOutlined } from "@mui/icons-material";
import Trash2 from "../assets/images/Trash2.png";
import copy from "copy-to-clipboard";
import PaginationFooter from "../components/PaginationFooter";
import { useRowsPerPage } from "../hooks/useRowsPerPage";

//import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { Menu, MenuItem } from "@mui/material";

import JobDetailsUploadResume, {
  ResumeUploadHandle,
} from "./jobdetails_uploadresume";


import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";


//import ATSProcessing from "./ATSProcessing";

import { getAtsJobById, getAllInterviews, getEvaluation } from "../api/api";
import { generateCustomReference } from "../utils/generateCustomReference";

import { routes } from "../constants/routes";
import { getResumeResponses, SavedResumeResponse } from "../utils/resumeStorage";
import CandidateAnalysisModal from "../components/CandidateAnalysisModal/CandidateAnalysisModal";
import DateRangeSelector from "../components/dateRange/dateRangeFilter";
import { getAtsEvaluations, downloadResume, deleteAtsEvaluation, getRecordingUrl, deleteConversationById, deleteEvaluation, regenerateInviteToken, sendInviteEmail } from "../api/api";
import InterviewRecordings from "../components/InterviewRecordings/InterviewRecordings";
import EvaluationKPICards from "../components/EvaluationKPICards/EvaluationKPICards";
import EmailPreviewModal from "../components/EmailPreviewModal/EmailPreviewModal";
import ConfirmationDialog from "../components/confirmationDialog";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [expanded, setExpanded] = useState(true);
  const [fileNameExpanded, setFileNameExpanded] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedResponses, setSavedResponses] = useState<SavedResumeResponse[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // New states for candidates section
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [decisionFilter, setDecisionFilter] = useState<string | null>(null);
  const [evaluationStatusFilter, setEvaluationStatusFilter] = useState<string | null>(null);
  const [callStatusFilter, setCallStatusFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Dayjs | null; end: Dayjs | null }>({ start: null, end: null });
  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(null);
  const [decisionAnchorEl, setDecisionAnchorEl] = useState<null | HTMLElement>(null);
  const [evaluationStatusAnchorEl, setEvaluationStatusAnchorEl] = useState<null | HTMLElement>(null);
  const [callStatusAnchorEl, setCallStatusAnchorEl] = useState<null | HTMLElement>(null);
  const [atsEvaluations, setAtsEvaluations] = useState<any[]>([]);
  const [evaluationsLoading, setEvaluationsLoading] = useState(false);
  const [interviewRecordings, setInterviewRecordings] = useState<any[]>([]);
  const [recordingsLoading, setRecordingsLoading] = useState(false);
  const [totalRecordingsCount, setTotalRecordingsCount] = useState(0);
  const [evaluationData, setEvaluationData] = useState<any[]>([]);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [totalEvaluationCount, setTotalEvaluationCount] = useState(0);
  const [evaluationKpi, setEvaluationKpi] = useState({
    totalInterviews: 0,
    evaluated: 0,
    notEvaluated: 0,
    selectedStudents: 0,
    notSelected: 0,
    defaulted: 0,
  });
  const [interviewRecordingsViewMode, setInterviewRecordingsViewMode] = useState<"table" | "grid">("table");
  const [selectedCandidates, setSelectedCandidates] = useState<Set<number>>(new Set());
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [inviteLinksModalOpen, setInviteLinksModalOpen] = useState(false);
  const [selectedCandidateForLink, setSelectedCandidateForLink] = useState<any>(null);
  const [candidateInviteLink, setCandidateInviteLink] = useState("");
  const [copiedCandidateId, setCopiedCandidateId] = useState<string | null>(null);
  const [linkGenerating, setLinkGenerating] = useState(false);
  const [linkExpiresAt, setLinkExpiresAt] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [emailPreviewRecipientCount, setEmailPreviewRecipientCount] = useState(0);
  const [pendingEmailSend, setPendingEmailSend] = useState<((subject: string, htmlBody: string) => Promise<void>) | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetCandidate, setDeleteTargetCandidate] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [evaluationRefreshTick, setEvaluationRefreshTick] = useState(0);

  // Pagination states
  const [page, setPage] = useState(0);
  const { rowsPerPage, handleRowsPerPageChange } = useRowsPerPage({
    defaultRowsPerPage: 10,
    storageKey: "jobDetailsRowsPerPage",
  });

  // ✅ Get logged-in user's name from sessionStorage
  const getLoggedInUserName = (): string => {
    try {
      const userStr = sessionStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user?.name || "Kaushal";
      }
    } catch (error) {
      console.error("Error retrieving user info:", error);
    }
    return "Kaushal";
  };

  // Try to get job from passed state first, then localStorage
  useEffect(() => {
    const passedJob = (location.state as any)?.job;
    const passedTab = (location.state as any)?.tab;

    if (typeof passedTab === 'number') {
      setTabValue(passedTab);
    }

    if (passedJob) {
      setJob(passedJob);

      // ⭐ save job for later reuse
      sessionStorage.setItem("jobData", JSON.stringify(passedJob));

      setLoading(false);
      return;
    }

    // ⭐ load saved job when returning from email
    const storedJob = sessionStorage.getItem("jobData");
    if (storedJob) {
      setJob(JSON.parse(storedJob));
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [location.state]);

  // ✅ Load saved resume responses from localStorage
  useEffect(() => {
    if (id) {
      const responses = getResumeResponses(id);
      setSavedResponses(responses);
      console.log(`📋 Loaded ${responses.length} saved resume responses for job ${id}`);
    }
  }, [id]);

  // ✅ Close accordion when any tab is clicked
  useEffect(() => {
    setExpanded(false);
  }, [tabValue]);

  const [downloadAnchor, setDownloadAnchor] = useState<null | HTMLElement>(null);

  const openDownloadMenu = Boolean(downloadAnchor);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const uploadRef = React.useRef<ResumeUploadHandle>(null);
  // const [showProcessing, setShowProcessing] = useState(false);


  const handleDownload = (file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };




  const handleDownloadClick = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadAnchor(event.currentTarget);
  };

  const handleCloseDownload = () => {
    setDownloadAnchor(null);
  };

  // ✅ Filter candidates based on search and filters
  const getFilteredCandidates = () => {
    let filtered = savedResponses;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((response) =>
        response.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((response) => response.status === statusFilter);
    }

    // Decision filter
    if (decisionFilter) {
      const decisionMap: Record<string, string[]> = {
        APPROVED: ["SHORTLIST"],
        REJECTED: ["REJECT"],
      };
      filtered = filtered.filter((response) =>
        decisionMap[decisionFilter]?.includes(response.decision)
      );
    }

    // Evaluation Status filter
    if (evaluationStatusFilter) {
      filtered = filtered.filter((response) =>
        (response.fullData?.evaluationStatus || response.fullData?.evaluation_status || response.fullData?.candidate_status) === evaluationStatusFilter
      );
    }

    // Call Status filter
    if (callStatusFilter) {
      filtered = filtered.filter((response) =>
        (response.fullData?.callStatus || response.fullData?.call_status) === callStatusFilter
      );
    }

    return filtered;
  };

  // ✅ Filter evaluations (Candidate Scores) based on search and filters
  const getFilteredEvaluations = () => {
    let filtered = atsEvaluations;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((evaluation) =>
        evaluation.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((evaluation) => evaluation.status === statusFilter);
    }

    // Decision filter
    if (decisionFilter) {
      const decisionMap: Record<string, string[]> = {
        APPROVED: ["SHORTLIST"],
        REJECTED: ["REJECT"],
      };
      filtered = filtered.filter((evaluation) =>
        decisionMap[decisionFilter]?.includes(evaluation.decision)
      );
    }

    // Evaluation Status filter
    if (evaluationStatusFilter) {
      filtered = filtered.filter((evaluation) =>
        (evaluation.fullData?.evaluationStatus || evaluation.fullData?.evaluation_status || evaluation.fullData?.candidate_status) === evaluationStatusFilter
      );
    }

    // Call Status filter
    if (callStatusFilter) {
      filtered = filtered.filter((evaluation) =>
        (evaluation.fullData?.callStatus || evaluation.fullData?.call_status) === callStatusFilter
      );
    }

    return filtered;
  };
  // Fetch lateral interview recordings when Interview Recordings tab is active
  useEffect(() => {
    const controller = new AbortController();

    const fetchRecordings = async () => {
      if (tabValue !== 0 || !id) return;

      try {
        setRecordingsLoading(true);
        const response = await getAllInterviews(
          {
            jobId: id,
            page: page + 1, // API is 1-indexed
            limit: rowsPerPage,
            sortBy: "startedAt",
            sortOrder: "DESC",
            ...(searchQuery.trim() && { search: searchQuery.trim() }),
            ...(evaluationStatusFilter && { status: evaluationStatusFilter }),
            ...(dateRange.start && { startDate: dateRange.start.toISOString() }),
            ...(dateRange.end && { endDate: dateRange.end.toISOString() }),
          },
          controller.signal
        );

        if (!response) {
          setInterviewRecordings([]);
          setTotalRecordingsCount(0);
          return;
        }

        const mapped = (response.data || []).map((item: any) => {
          const firstName = item.profile_firstName || "";
          const lastName = item.profile_lastName || "";
          const name = `${firstName} ${lastName}`.trim() || item.user_email || "Unknown";

          const startedAt = item.conversation_startedAt ? new Date(item.conversation_startedAt) : null;
          const endedAt = item.conversation_endedAt ? new Date(item.conversation_endedAt) : null;
          let duration = "—";
          if (startedAt && endedAt) {
            const diffMs = endedAt.getTime() - startedAt.getTime();
            const mins = Math.floor(diffMs / 60000);
            const secs = Math.floor((diffMs % 60000) / 1000);
            duration = `${mins}m ${secs}s`;
          }

          const dateTime = startedAt
            ? startedAt.toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
            : "—";

          const statusMap: Record<string, string> = {
            active: "In Progress",
            closed: "Completed",
            aborted: "Missed",
          };

          return {
            id: item.conversation_id,
            name,
            email: item.user_email || "—",
            college: item.college_name || "—",
            dateTime,
            duration,
            callStatus: statusMap[item.conversation_status] || item.conversation_status,
            evaluationStatus: item.conversation_evaluation_status || "Not Evaluated",
            userId: item.user_id,
            roomName: item.roomName,
            startedAt: item.conversation_startedAt,
            endedAt: item.conversation_endedAt,
            jobId: item.conversation_jobId || item.job_id,
            jobTitle: item.job_title,
          };
        });

        setInterviewRecordings(mapped);
        setTotalRecordingsCount(response.total || mapped.length);
      } catch (error: any) {
        if (error?.name !== "CanceledError") {
          console.error("Failed to fetch interview recordings:", error);
          setInterviewRecordings([]);
          setTotalRecordingsCount(0);
        }
      } finally {
        setRecordingsLoading(false);
      }
    };

    fetchRecordings();

    return () => controller.abort();
  }, [tabValue, id, page, rowsPerPage, searchQuery, evaluationStatusFilter, dateRange]);

  // Fetch candidate evaluation data when Candidate Evaluation tab is active
  useEffect(() => {
    const fetchEvaluationPage = async () => {
      if (tabValue !== 1 || !id) return;

      try {
        setEvaluationLoading(true);
        const response = await getEvaluation(
          String(page + 1),
          String(rowsPerPage),
          undefined, // collegeId
          searchQuery.trim() || undefined,
          "endedAt",
          "DESC",
          evaluationStatusFilter || undefined,
          dateRange.start?.toISOString() || undefined,
          dateRange.end?.toISOString() || undefined,
          id
        );

        if (!response) {
          setEvaluationData([]);
          setTotalEvaluationCount(0);
          return;
        }

        const mapped = (response.data || []).map((item: any) => {
          const startedAt = item.startedAt ? new Date(item.startedAt) : null;
          const endedAt = item.endedAt ? new Date(item.endedAt) : null;
          let duration = "—";
          if (item.durationMs) {
            const mins = Math.floor(item.durationMs / 60000);
            const secs = Math.floor((item.durationMs % 60000) / 1000);
            duration = `${mins}m ${secs}s`;
          }

          const dateTime = endedAt
            ? endedAt.toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
            : "—";

          const statusMap: Record<string, string> = {
            active: "In Progress",
            closed: "Completed",
            aborted: "Missed",
          };

          return {
            id: item.conversationId,
            name: item.userName || "Unknown",
            email: item.email || "—",
            college: item.collegeName || "—",
            experience: "—",
            dateTime,
            duration,
            callStatus: endedAt ? "Completed" : "In Progress",
            evaluationStatus: item.evaluationStatus || "Not Evaluated",
            overallScore: item.overallScore,
            isDisqualified: item.isDisqualified,
            fullData: item,
          };
        });

        setEvaluationData(mapped);
        setTotalEvaluationCount(response.total || mapped.length);

        // Set KPI data from evaluationCounts
        const counts = response.evaluationCounts || {};
        setEvaluationKpi({
          totalInterviews: response.total || 0,
          evaluated: counts.interviewsEvaluated || 0,
          notEvaluated: counts.notEvaluated || 0,
          selectedStudents: counts.selected || 0,
          notSelected: counts.notSelected || 0,
          defaulted: counts.disqualified || 0,
        });
      } catch (error) {
        console.error("Failed to fetch evaluation data:", error);
        setEvaluationData([]);
        setTotalEvaluationCount(0);
      } finally {
        setEvaluationLoading(false);
      }
    };

    fetchEvaluationPage();
  }, [tabValue, id, page, rowsPerPage, searchQuery, evaluationStatusFilter, dateRange, evaluationRefreshTick]);

  useEffect(() => {
    const fetchEvaluations = async () => {
      if (tabValue !== 2 || !id) return;

      try {
        setEvaluationsLoading(true);

        const response = await getAtsEvaluations(id);

        // Extract summary array from response
        const evaluationsArray = response?.summary || response || [];

        const mapped = evaluationsArray.map((item: any, index: number) => {
          const fileName = item.file_name
            ? item.file_name.split("/").pop()?.split("\\").pop()
            : "Uploaded Resume";

          // Log the item to see all available fields
          console.log("Item data:", item);

          // Try to extract score with decimals from the reasoning if Resume Score is integer
          let score = item["Resume Score"];
          if (score && !score.toString().includes(".")) {
            // If score doesn't have decimal, try to extract from reasoning
            const reason = item.Reason || item["View Summary"] || "";
            const scoreMatch = reason.match(/Score\s+([\d.]+)/);
            if (scoreMatch && scoreMatch[1]) {
              score = scoreMatch[1];
            }
          }

          return {
            id: item.id || "",
            userId: item.user_id || "",
            fileName,
            rank: item.rank || index + 1,
            email: item.email || "—",
            status: item.status === "Success" ? "SUCCESS" : item.status === "Failed" ? "FAILED" : item.status,
            score: score !== undefined && score !== null ? parseFloat(score).toString() : "0",
            scoreNumeric: score !== undefined && score !== null ? parseFloat(score) : 0,
            decision:
              item.Decision === "SHORTLISTED"
                ? "SHORTLIST"
                : item.Decision === "REJECTED"
                  ? "REJECT"
                  : item.Decision || "PENDING",
            reasoning: item.Reason || item["View Summary"] || "",
            strengths: item.strengths || [],
            gaps: item.gaps || [],
            scoreBreakdown: item.scoreBreakdown || [],
            resumeUrl: item.resume_url || "",
            mailTriggered: item.mail_triggered ?? false,
            fullData: item, // Store full data for modal
          };
        });

        console.log("📋 Mapped Evaluations:", mapped);
        setAtsEvaluations(mapped);
      } catch (error) {
        console.error("Failed to fetch evaluations", error);
        setAtsEvaluations([]);
      } finally {
        setEvaluationsLoading(false);
      }
    };

    fetchEvaluations();
  }, [tabValue, id]);

  // --- Interview Recordings action handlers ---
  const handleViewRecording = (candidate: any) => {
    const recordingData = {
      id: candidate.id,
      userId: candidate.userId,
      roomName: candidate.roomName,
      candidateName: candidate.name,
      collegeName: candidate.college,
      interviewDate: candidate.startedAt,
      endedAt: candidate.endedAt,
      jobId: candidate.jobId,
      jobTitle: candidate.jobTitle,
    };
    sessionStorage.setItem("admin_recording_state", JSON.stringify(recordingData));
    sessionStorage.setItem("admin_lastLeftView", "transcript");
    sessionStorage.setItem("admin_last_viewed_recording", JSON.stringify(recordingData));
    navigate(
      `${routes.transcription}?conversation=${encodeURIComponent(String(candidate.id))}`,
      { state: { transcription: recordingData } }
    );
  };

  const [downloadingRooms, setDownloadingRooms] = useState<Set<string>>(new Set());

  const handleDeleteRecording = async (conversationId: string) => {
    try {
      await deleteConversationById(conversationId);
      setInterviewRecordings((prev) => prev.filter((r: any) => r.id !== conversationId));
      setTotalRecordingsCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Failed to delete recording:", err);
    }
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

  const handleDeleteCandidateEvaluation = async (candidate: any) => {
    try {
      await deleteEvaluation(candidate.id);
      // Re-fetch so the row stays but with score/status reset
      setEvaluationRefreshTick((t) => t + 1);
    } catch (err) {
      console.error("Failed to delete evaluation:", err);
    }
  };

  const filteredCandidates =
    tabValue === 2 ? getFilteredEvaluations() : getFilteredCandidates();

  // Handle individual checkbox toggle
  const handleCheckboxChange = (index: number) => {
    const newSelected = new Set(selectedCandidates);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedCandidates(newSelected);
  };

  // Handle select all checkbox
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIndices = new Set(filteredCandidates.map((_, index) => index));
      setSelectedCandidates(allIndices);
    } else {
      setSelectedCandidates(new Set());
    }
  };

  // Check if all candidates are selected
  const areAllSelected = filteredCandidates.length > 0 && selectedCandidates.size === filteredCandidates.length;

  useEffect(() => {
    setPage(0);
    setSelectedCandidates(new Set());
  }, [tabValue, searchQuery, statusFilter, decisionFilter, evaluationStatusFilter, callStatusFilter, dateRange]);

  const totalRecordings = totalRecordingsCount;
  const paginatedRecordings = interviewRecordings;

  const totalEvaluation = totalEvaluationCount;
  const paginatedEvaluation = evaluationData;

  const totalScores = filteredCandidates.length;
  const paginatedScores = filteredCandidates.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  if (loading) {
    return (
      <Box sx={styles.loadingContainer}>
        <Box sx={styles.loadingContentBox}>
          <Typography>Loading job details...</Typography>
        </Box>
      </Box>
    );
  }

  if (error || !job) {
    return (
      <Box sx={styles.errorContainer}>
        <Box sx={styles.errorContentBox}>
          <Typography sx={styles.errorText}>{error || "Job not found"}</Typography>
          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            sx={styles.goBackButton}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    );
  }
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(16);
    doc.text("Job Details", 20, y);
    y += 12;

    doc.setFontSize(12);

    const addLine = (label: string, value: string | undefined) => {
      const text = `${label}: ${value || "-"}`;

      const splitText = doc.splitTextToSize(text, 170);
      doc.text(splitText, 20, y);

      y += splitText.length * 8 + 2;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    };

    // -------- JOB DETAILS --------
    addLine("Job Title", job.title);
    addLine("Job Description", job.description);
    addLine("Criteria Title", job.criteriaTitle);
    addLine("Criteria Description", job.criteriaDescription);
    addLine("Job ID", String(job.id));
    addLine("Role Type", job.roleType);
    addLine("Role Category", job.roleCategory);
    addLine("Raised By", job.raisedBy || getLoggedInUserName());
    addLine("Created On", job.createdOn);

    doc.save(`JOB-${job.id}.pdf`);
    handleCloseDownload();
  };



  const handleDownloadDOC = async () => {
    const paragraphs: Paragraph[] = [
      new Paragraph({
        children: [
          new TextRun({
            text: "Job Details & Candidates Analysis",
            bold: true,
            size: 32,
          }),
        ],
      }),
      new Paragraph(""),
      new Paragraph({
        children: [
          new TextRun({
            text: "Job Information",
            bold: true,
            size: 24,
          }),
        ],
      }),
      new Paragraph(`Job ID: ${job.id}`),
      new Paragraph(`Title: ${job.title}`),
      new Paragraph(`Role Type: ${job.roleType}`),
      new Paragraph(`Role Category: ${job.roleCategory}`),
      new Paragraph(`Raised By: ${job.raisedBy || getLoggedInUserName()}`),
      new Paragraph(`Created On: ${job.createdOn}`),
    ];

    const doc = new Document({
      sections: [
        {
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `JOB-${job.id}.docx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleCloseDownload();
  };

  const handleDeleteEvaluation = async () => {
    if (!deleteTargetCandidate?.id) return;
    setDeleting(true);
    try {
      await deleteAtsEvaluation(deleteTargetCandidate.id);
      setAtsEvaluations((prev) => prev.filter((c) => c.id !== deleteTargetCandidate.id));
      setSnackbarMessage("Evaluation deleted successfully");
      setSnackbarOpen(true);
    } catch {
      setSnackbarMessage("Failed to delete evaluation");
      setSnackbarOpen(true);
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
      setDeleteTargetCandidate(null);
    }
  };

  // ✅ Generate candidate interview link and show modal
  const handleGenerateCandidateLink = async (candidate: any) => {
    if (!id) return;

    if (!candidate?.user_id) {
      setSnackbarMessage("Cannot generate link: this candidate has not been linked to a user yet. Ensure the candidate is approved first.");
      setSnackbarOpen(true);
      return;
    }
    setSelectedCandidateForLink(candidate);
    setCandidateInviteLink("");
    setLinkExpiresAt("");
    setCopiedCandidateId(null);
    setInviteLinksModalOpen(true);
    setLinkGenerating(true);
    try {
      const result = await regenerateInviteToken(candidate.user_id, id);
      if (result?.link) {
        setCandidateInviteLink(result.link);
        setLinkExpiresAt(result.expiresAt || "");
      }
    } catch {
      setSnackbarMessage("Failed to generate invite link");
      setSnackbarOpen(true);
    } finally {
      setLinkGenerating(false);
    }
  };

  const handleCopyFromModal = () => {
    if (!candidateInviteLink) return;
    try {
      const copied = copy(candidateInviteLink);
      if (copied) {
        setCopiedCandidateId(selectedCandidateForLink?.id || "candidate");
        setSnackbarMessage("Link copied to clipboard! Valid for 24 hours");
        setSnackbarOpen(true);
      } else {
        navigator.clipboard.writeText(candidateInviteLink).then(() => {
          setCopiedCandidateId(selectedCandidateForLink?.id || "candidate");
          setSnackbarMessage("Link copied to clipboard! Valid for 24 hours");
          setSnackbarOpen(true);
        }).catch(() => {
          setSnackbarMessage("Failed to copy link to clipboard");
          setSnackbarOpen(true);
        });
      }
    } catch {
      setSnackbarMessage("Failed to copy link to clipboard");
      setSnackbarOpen(true);
    }
  };

  const truncateWords = (text: string | undefined, limit: number): string => {
    if (!text) return "";

    const words = text.split(" ");

    if (words.length <= limit) return text;

    return words.slice(0, limit).join(" ") + " ...";
  };




  return (
    <>
      <Box sx={styles.mainContainer}>
        <Box sx={styles.contentWrapper}>
          <Box sx={styles.root}>

            <Box sx={styles.contentFlexContainer}>

              {/* TOP WHITE CARD */}
              <Box sx={styles.topContainer}>

                {/* HEADER ROW */}
                <Box sx={styles.topRow}>
                  <Typography sx={styles.breadcrumb}>
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(routes.createJob)}
                    >
                      Home
                    </span>
                    {" > "} Job Details
                  </Typography>

                  <Box sx={styles.buttonRow}>
                    <Button
                      startIcon={<img src={upload} alt="" style={{ height: "2vh", width: "auto" }} />}
                      sx={styles.uploadButton}
                      onClick={() => uploadRef.current?.openFileDialog()}
                    >
                      Upload Resume
                    </Button>
                  </Box>

                  {/* <Menu
                    anchorEl={downloadAnchor}
                    open={openDownloadMenu}
                    onClose={handleCloseDownload}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                    PaperProps={{
                      sx: styles.downloadMenuPaper,
                    }}
                  >
                    <MenuItem
                      onClick={handleDownloadPDF}
                      sx={styles.pdfDownloadMenuItem}
                    >
                      Download as PDF
                    </MenuItem>

                    <MenuItem
                      onClick={handleDownloadDOC}
                      sx={styles.docDownloadMenuItem}
                    >
                      Download as DOC
                    </MenuItem>
                  </Menu> */}



                </Box>
              </Box>

              {/* CONTAINER 1 - JOB DETAILS CARD */}
              <Box sx={styles.jobDetailsContainer}>

                {/* JOB TITLE SECTION */}
                <Box sx={styles.jobHeader}>
                  <Box sx={styles.titleRow}>

                    {/* LEFT SIDE - title + status */}
                    <Box sx={styles.buttonRow}>
                      <Typography sx={styles.title}>{job.title}</Typography>
                      <Box sx={styles.statusBadge}>
                        <Box sx={styles.statusDot} />
                        Active
                      </Box>
                      {/* <Tooltip title="Download Job Details" arrow placement="top">
                        <IconButton onClick={handleDownloadClick}
                          sx={styles.downloadIconButton}
                        >
                          <DownloadOutlinedIcon />
                        </IconButton>
                      </Tooltip> */}
                    </Box>

                    {/* RIGHT SIDE - expand icon */}
                    <Button
                      onClick={() => setExpanded(!expanded)}
                      sx={styles.expandButton}
                    >
                      <ExpandMoreIcon
                        sx={{
                          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "0.3s",
                        }}
                      />
                    </Button>

                  </Box>

                  <Typography sx={styles.jobId}>
                    {job.id}
                  </Typography>
                </Box>
                {/* <Box sx={{height:"13vh"}}> */}
                {/* ACCORDION SECTION */}
                <Accordion
                  expanded={expanded}
                  onChange={() => setExpanded(!expanded)}
                  sx={styles.accordion}
                >
                  <AccordionSummary sx={styles.accordionHeader} />

                  <AccordionDetails sx={styles.accordionDetails}>
                    <Box sx={styles.scrollableDescription}>
                      <Typography
                        sx={styles.descriptionText}
                      >
                        {job.description || "-"}
                      </Typography>
                    </Box>



                    <Box sx={styles.infoRow}>

                      {/* <Box sx={styles.infoItem}>
                        <Box sx={styles.iconBox}>
                          <PersonOutlineIcon sx={styles.icon} />
                        </Box>
                        Raised By – <span style={styles.bold}>{job.raisedBy || getLoggedInUserName()}</span>
                      </Box> */}

                      <Box sx={styles.infoItem}>
                        <Box sx={styles.iconBox}>
                          <WorkOutlineIcon sx={styles.icon} />
                        </Box>
                        Role – <span style={styles.bold}>{job.interview_setting?.role || job.roleType || "N/A"}</span>
                      </Box>

                      <Box sx={styles.infoItem}>
                        <Box sx={styles.iconBox}>
                          <CalendarTodayOutlinedIcon sx={styles.icon} />
                        </Box>
                        Created On – <span style={styles.bold}>{job.createdOn}</span>
                      </Box>

                      {job.interview_setting?.category && (
                        <Box sx={styles.infoItem}>
                          <Box sx={styles.iconBox}>
                            <WorkOutlineIcon sx={styles.icon} />
                          </Box>
                          Category – <span style={styles.bold}>{job.interview_setting.category}</span>
                        </Box>
                      )}

                      <Box sx={styles.infoItem}>
                        <Box sx={styles.iconBoxRed}>
                          <FlagOutlinedIcon sx={styles.iconRed} />
                        </Box>
                        Avatar –{" "}
                        <span style={styles.bold}>
                          {Array.isArray(job.interview_setting?.avatarOptions)
                            ? job.interview_setting.avatarOptions.join(", ")
                            : job.interview_setting?.avatar || job.avatar || "N/A"}
                        </span>
                      </Box>
                    </Box>


                  </AccordionDetails>
                </Accordion>
              </Box>

            </Box>

            {/* CONTAINER 2 - CANDIDATES SECTION */}

            <JobDetailsUploadResume
              ref={uploadRef}
              onFilesChange={async (file) => {
                if (!file || !job) return;

                console.log(" Resume upload initiated");
                console.log(" File:", { name: file.name, size: file.size, type: file.type });
                console.log(" Job data:", job);

                setUploadedFiles((prev) => [...prev, file]);

                // ✅ Build weights with proper structure
                const weights = {
                  skills_required: job.weights?.requiredSkill ?? 10,
                  skills_preferred: job.weights?.preferredSkill ?? 15,
                  education_alignment: job.weights?.educationAlignment ?? 30,
                  experience_alignment: job.weights?.experienceAlignment ?? 15,
                  responsibility_overlap: job.weights?.responsibilityOverlap ?? 30,
                };

                const threshold = job.threshold || 70;

                console.log("⚖️ Weights being sent:", weights);
                console.log("📊 Threshold being sent:", threshold);
                console.log("🎯 Job ID being sent:", job.id);

                // ✅ Pass file and job info to ATSProcessing page
                // ATSProcessing will handle the API call and show loader
                navigate(routes.atsProcessing, {
                  state: {
                    file,
                    jobId: job.id,
                    job,
                    threshold: threshold,
                    weights: weights

                  }
                });
              }}
            />

            {/* CONTAINER 3 - CANDIDATES INFORMATION SECTION */}
            <Paper sx={styles.candidatesInfoPaper}>
              {/* Header and Tabs */}
              <Box sx={styles.candidatesHeaderBox}>
                <Typography sx={styles.candidatesTitle}>
                  Candidates Information
                </Typography>
                <Typography sx={styles.candidatesSubtitle}>
                  Candidates who all uploaded for this position
                </Typography>

                {/* Tabs */}
                <Box sx={styles.tabBorderBox}>
                  <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    sx={styles.candidateTabs}
                  >
                    <Tab label="Interview Recordings" />
                    <Tab label="Candidate Evaluation" />
                    <Tab label="Candidate Scores" />
                  </Tabs>
                </Box>
              </Box>

              {/* Search and Filters */}
              {(tabValue === 0 || tabValue === 1 || tabValue === 2) && (
                <Box sx={styles.filterSearchContainer}>
                  {/* Search Box */}
                  <TextField
                    placeholder="Search for candidates"
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchOutlinedIcon sx={styles.searchIcon} />,
                    }}
                    sx={styles.candidateSearchField}
                  />

                  {/* Filters Button */}
                  <Button
                    startIcon={<FilterAltOutlinedIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{
                      ...styles.filterButton,
                      backgroundColor: showFilters ? "#006B66" : "#0f766e",
                      "&:hover": { backgroundColor: showFilters ? "#005752" : "#006B66" }
                    }}
                  >
                    Filters
                  </Button>

                  {/* Date Range Picker */}
                  <Box sx={{
                    maxWidth: showFilters ? "1000px" : "0px",
                    opacity: showFilters ? 1 : 0,
                    transform: showFilters ? "translateX(0)" : "translateX(-10px)",
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5vh",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}>
                    <Box sx={{
                      '& .MuiOutlinedInput-root': {
                        paddingLeft: '0vh',
                        width: '23vh !important',
                        height: "3.1vh !important",
                        borderRadius: "0.8vh !important",
                      },
                      '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db !important' },
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db !important' },
                      '& .MuiOutlinedInput-input': { fontSize: '1.2vh !important', padding: "0.5vh 1vh !important" },
                      '& .MuiIconButton-root svg': { fontSize: '1.8vh !important', marginRight: "0.5vh" },
                    }}>
                      <DateRangeSelector
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        onStartDateChange={(date) => setDateRange({ ...dateRange, start: date })}
                        onEndDateChange={(date) => setDateRange({ ...dateRange, end: date })}
                        emptyLabel="MM/DD/YYYY – MM/DD/YYYY"

                        hideFieldLabel={true}
                        onClear={() => setDateRange({ start: null, end: null })}
                      />
                    </Box>

                    {/* Evaluation Status Dropdown */}
                    <Button
                      onClick={(e) => setEvaluationStatusAnchorEl(e.currentTarget)}
                      endIcon={<ExpandMoreIcon />}
                      sx={styles.statusDropdownButton}
                    >
                      {evaluationStatusFilter || "Evaluation Status"}
                    </Button>

                    <Menu
                      anchorEl={evaluationStatusAnchorEl}
                      open={Boolean(evaluationStatusAnchorEl)}
                      onClose={() => setEvaluationStatusAnchorEl(null)}
                    >
                      <MenuItem onClick={() => { setEvaluationStatusFilter(null); setEvaluationStatusAnchorEl(null); }}>
                        All
                      </MenuItem>
                      <MenuItem onClick={() => { setEvaluationStatusFilter("Completed"); setEvaluationStatusAnchorEl(null); }}>
                        Completed
                      </MenuItem>
                      <MenuItem onClick={() => { setEvaluationStatusFilter("Pending"); setEvaluationStatusAnchorEl(null); }}>
                        Pending
                      </MenuItem>
                      <MenuItem onClick={() => { setEvaluationStatusFilter("In Progress"); setEvaluationStatusAnchorEl(null); }}>
                        In Progress
                      </MenuItem>
                    </Menu>

                    {/* Call Status Dropdown */}
                    {(tabValue === 0 || tabValue === 1) && (
                      <>
                        <Button
                          onClick={(e) => setCallStatusAnchorEl(e.currentTarget)}
                          endIcon={<ExpandMoreIcon />}
                          sx={styles.statusDropdownButton}
                        >
                          {callStatusFilter || "Call Status"}
                        </Button>

                        <Menu
                          anchorEl={callStatusAnchorEl}
                          open={Boolean(callStatusAnchorEl)}
                          onClose={() => setCallStatusAnchorEl(null)}
                        >
                          <MenuItem onClick={() => { setCallStatusFilter(null); setCallStatusAnchorEl(null); }}>
                            All
                          </MenuItem>
                          <MenuItem onClick={() => { setCallStatusFilter("Completed"); setCallStatusAnchorEl(null); }}>
                            Completed
                          </MenuItem>
                          <MenuItem onClick={() => { setCallStatusFilter("Missed"); setCallStatusAnchorEl(null); }}>
                            Missed
                          </MenuItem>
                          <MenuItem onClick={() => { setCallStatusFilter("Scheduled"); setCallStatusAnchorEl(null); }}>
                            Scheduled
                          </MenuItem>
                        </Menu>
                      </>
                    )}

                    {/* Decision Dropdown - Only for Tab 2 */}
                    {tabValue === 2 && (
                      <>
                        <Button
                          onClick={(e) => setDecisionAnchorEl(e.currentTarget)}
                          endIcon={<ExpandMoreIcon />}
                          sx={styles.decisionDropdownButton}
                        >
                          {decisionFilter || "Decision"}
                        </Button>

                        <Menu
                          anchorEl={decisionAnchorEl}
                          open={Boolean(decisionAnchorEl)}
                          onClose={() => setDecisionAnchorEl(null)}
                        >
                          <MenuItem onClick={() => { setDecisionFilter(null); setDecisionAnchorEl(null); }}>
                            All
                          </MenuItem>
                          <MenuItem onClick={() => { setDecisionFilter("APPROVED"); setDecisionAnchorEl(null); }}>
                            APPROVED
                          </MenuItem>
                          <MenuItem onClick={() => { setDecisionFilter("REJECTED"); setDecisionAnchorEl(null); }}>
                            REJECTED
                          </MenuItem>
                        </Menu>
                      </>
                    )}

                    {/* Clear all button: only show if any filter/search/date is active */}
                    {(
                      !!searchQuery.trim() ||
                      !!statusFilter ||
                      !!decisionFilter ||
                      !!evaluationStatusFilter ||
                      !!callStatusFilter ||
                      (dateRange.start !== null || dateRange.end !== null)
                    ) && (
                        <Typography
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter(null);
                            setDecisionFilter(null);
                            setEvaluationStatusFilter(null);
                            setCallStatusFilter(null);
                            setDateRange({ start: null, end: null });
                          }}
                          sx={styles.clearAllFilters}
                        >
                          ✕ Clear all
                        </Typography>
                      )}
                  </Box>

                  {/* View Mode Toggle Box - Only for Interview Recordings */}
                  {tabValue === 0 && (
                    <Box sx={{ backgroundColor: "#ffffff", border: "1px solid #f0f0f0", borderRadius: "0.6vh", width: "4vw", marginLeft: "auto", marginRight: "0.5vh", padding: "0.3vh" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: "0" }}>
                        {/* List View Box */}
                        <Tooltip title="Table View" arrow>
                          <Box
                            onClick={() => setInterviewRecordingsViewMode("table")}
                            sx={{
                              padding: "0.4vh 0.4vh",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: interviewRecordingsViewMode === "table" ? "#ffffff" : "transparent",
                              border: interviewRecordingsViewMode === "table" ? "1px solid #d1d5db" : "none",
                              borderRadius: "0.6vh",
                              color: interviewRecordingsViewMode === "table" ? "#006b66" : "#9ca3af",
                              transition: "all 0.2s ease",
                              "&:hover": { backgroundColor: "#fafafa" },
                            }}
                          >
                            <svg width="auto" height="1.6vh" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M2 8H2.00667" stroke={interviewRecordingsViewMode === "table" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M2 12H2.00667" stroke={interviewRecordingsViewMode === "table" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M2 4H2.00667" stroke={interviewRecordingsViewMode === "table" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M5.33203 8H13.9987" stroke={interviewRecordingsViewMode === "table" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M5.33203 12H13.9987" stroke={interviewRecordingsViewMode === "table" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M5.33203 4H13.9987" stroke={interviewRecordingsViewMode === "table" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </Box>
                        </Tooltip>

                        {/* Vertical Divider */}
                        <Box sx={{ width: "0.1vh", gap: "0.4vh", backgroundColor: "#7d7f81", margin: "0.3vh 0.5" }} />

                        {/* Grid View Box */}
                        <Tooltip title="Grid View" arrow>
                          <Box
                            onClick={() => setInterviewRecordingsViewMode("grid")}
                            sx={{
                              padding: "0.4vh 0.4vh",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: interviewRecordingsViewMode === "grid" ? "#ffffff" : "transparent",
                              border: interviewRecordingsViewMode === "grid" ? "1px solid #d1d5db" : "none",
                              borderRadius: "0.6vh",
                              color: interviewRecordingsViewMode === "grid" ? "#006b66" : "#9ca3af",
                              transition: "all 0.2s ease",
                              "&:hover": { backgroundColor: "#fafafa" },
                            }}
                          >
                            <svg width="auto" height="1.6vh" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 2H2.66667C2.29848 2 2 2.29848 2 2.66667V6C2 6.36819 2.29848 6.66667 2.66667 6.66667H6C6.36819 6.66667 6.66667 6.36819 6.66667 6V2.66667C6.66667 2.29848 6.36819 2 6 2Z" stroke={interviewRecordingsViewMode === "grid" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M13.332 2H9.9987C9.63051 2 9.33203 2.29848 9.33203 2.66667V6C9.33203 6.36819 9.63051 6.66667 9.9987 6.66667H13.332C13.7002 6.66667 13.9987 6.36819 13.9987 6V2.66667C13.9987 2.29848 13.7002 2 13.332 2Z" stroke={interviewRecordingsViewMode === "grid" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M13.332 9.33301H9.9987C9.63051 9.33301 9.33203 9.63148 9.33203 9.99967V13.333C9.33203 13.7012 9.63051 13.9997 9.9987 13.9997H13.332C13.7002 13.9997 13.9987 13.7012 13.9987 13.333V9.99967C13.9987 9.63148 13.7002 9.33301 13.332 9.33301Z" stroke={interviewRecordingsViewMode === "grid" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M6 9.33301H2.66667C2.29848 9.33301 2 9.63148 2 9.99967V13.333C2 13.7012 2.29848 13.9997 2.66667 13.9997H6C6.36819 13.9997 6.66667 13.7012 6.66667 13.333V9.99967C6.66667 9.63148 6.36819 9.33301 6 9.33301Z" stroke={interviewRecordingsViewMode === "grid" ? "#006b66" : "#9ca3af"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </Box>
                        </Tooltip>
                      </Box>
                    </Box>
                  )}

                  {/* Send Email Button - Only for Candidate Scores Tab */}
                  {tabValue === 2 && (
                    <Button
                      variant="contained"
                      disabled={selectedCandidates.size === 0}
                      onClick={() => {
                        if (!id || selectedCandidates.size === 0) return;
                        const selected = Array.from(selectedCandidates)
                          .map((idx) => filteredCandidates[idx])
                          .filter((c) => c?.userId);
                        if (selected.length === 0) {
                          setSnackbarMessage("Selected candidates are not linked to users yet");
                          setSnackbarOpen(true);
                          return;
                        }
                        setEmailPreviewRecipientCount(selected.length);
                        setPendingEmailSend(() => async (subject: string, htmlBody: string) => {
                          setEmailSending(true);
                          let sent = 0;
                          let failed = 0;
                          for (const candidate of selected) {
                            try {
                              const result = await regenerateInviteToken(candidate.userId, id);
                              if (result?.link) {
                                await sendInviteEmail(candidate.userId, result.link, id, subject, htmlBody);
                                sent++;
                              } else {
                                failed++;
                              }
                            } catch {
                              failed++;
                            }
                          }
                          setEmailSending(false);
                          if (sent > 0) {
                            const sentUserIds = new Set(
                              selected.filter((_, i) => i < sent).map((c) => c.userId)
                            );
                            setAtsEvaluations((prev) =>
                              prev.map((c) =>
                                sentUserIds.has(c.userId) ? { ...c, mailTriggered: true } : c
                              )
                            );
                          }
                          setSelectedCandidates(new Set());
                          setSnackbarMessage(
                            failed === 0
                              ? `Invite email${sent > 1 ? "s" : ""} sent to ${sent} candidate${sent > 1 ? "s" : ""}`
                              : `Sent ${sent}, failed ${failed}`
                          );
                          setSnackbarOpen(true);
                        });
                        setEmailPreviewOpen(true);
                      }}
                      sx={{
                        marginLeft: "auto",
                        backgroundColor: "#00695C",
                        color: "#ffffff",
                        textTransform: "none",
                        fontWeight: 500,
                        padding: "0.6vh 1.2vh",
                        fontSize: "1.3vh",
                        fontFamily: "Poppins, sans-serif",
                        borderRadius: "0.6vh",
                        "&:hover": { backgroundColor: "#004d40" },
                        "&.Mui-disabled": { backgroundColor: "#e5e7eb", color: "#9ca3af" },
                      }}
                    >
                      {emailSending ? "Sending..." : `Send Email${selectedCandidates.size > 1 ? "s" : ""}`}
                    </Button>
                  )}

                </Box>
              )}

              {/* Table Container */}
              {tabValue === 0 && (
                <InterviewRecordings
                  candidates={paginatedRecordings}
                  viewMode={interviewRecordingsViewMode}
                  onViewModeChange={setInterviewRecordingsViewMode}
                  onViewRecording={handleViewRecording}
                  onDelete={(candidate) => handleDeleteRecording(candidate.id)}
                  onDownload={(candidate) => handleDownloadVideo(candidate.roomName)}
                  downloadingRooms={downloadingRooms}
                />
              )}

              {/* Candidate Evaluation Tab */}
              {tabValue === 1 && (
                <EvaluationKPICards
                  candidates={paginatedEvaluation}
                  kpiData={evaluationKpi}
                  onDelete={handleDeleteCandidateEvaluation}
                  onEvaluationComplete={() => setEvaluationRefreshTick((t) => t + 1)}
                />
              )}

              {/* Table Container */}
              {tabValue === 2 && (
                <Box sx={styles.tableContainer}>
                  <Table sx={{ tableLayout: "fixed" }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                        <TableCell sx={{ ...styles.tableHeaderCell, width: "4%" }}>
                          <Checkbox
                            checked={areAllSelected}
                            onChange={handleSelectAll}
                            sx={{ padding: "0.4vh" }}
                          />
                        </TableCell>
                        <TableCell sx={{ ...styles.tableHeaderCell, width: "16%" }}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span>File Name</span>
                            <IconButton
                              size="small"
                              onClick={() => setFileNameExpanded((prev) => !prev)}
                              sx={{ padding: 0, ml: 0.5 }}
                            >
                              {fileNameExpanded
                                ? <ExpandLessIcon sx={{ fontSize: "1.6vh", color: "#666" }} />
                                : <ExpandMoreIcon sx={{ fontSize: "1.6vh", color: "#666" }} />}
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ ...styles.tableHeaderCell, width: "10%" }}>Status</TableCell>
                        <TableCell sx={{ ...styles.tableHeaderCell, width: "14%" }}>Resume Score</TableCell>
                        <TableCell sx={{ ...styles.tableHeaderCell, width: "10%" }}>Decision</TableCell>
                        <TableCell sx={{ ...styles.tableHeaderCell, width: "11%" }}>View Summary</TableCell>
                        <TableCell sx={{ ...styles.tableHeaderCell, width: "15%" }}>Reason</TableCell>
                        <TableCell sx={{ ...styles.tableHeaderCell, width: "12%" }}>Email Triggered</TableCell>
                        <TableCell sx={{ ...styles.tableHeaderCell, width: "8%" }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                  </Table>

                  <Box sx={{
                    overflowY: "auto", height: "34.5vh",
                    "&::-webkit-scrollbar": {
                      width: "0.8vh",
                      height: "5vh",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "#f1f5f9",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#9ca3af",
                      borderRadius: "1vh",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      background: "#6b7280",
                    },
                    scrollbarWidth: "thin",
                    scrollbarColor: "#9ca3af transparent",
                  }}>
                    <Table sx={{ tableLayout: "fixed" }}>
                      <TableBody>
                        {evaluationsLoading ? (
                          <TableRow>
                            <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                              Loading scores...
                            </TableCell>
                          </TableRow>
                        ) : filteredCandidates.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                              No candidates found
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedScores.map((candidate, index) => {
                            const absoluteIndex = page * rowsPerPage + index;
                            return (
                              <TableRow key={absoluteIndex} sx={{ borderBottom: "1px solid #e5e7eb", '&:hover': { backgroundColor: '#f9fafb' } }}>
                                {/* Checkbox */}
                                <TableCell sx={{ width: "4%", py: 2 }}>
                                  <Checkbox
                                    checked={selectedCandidates.has(absoluteIndex)}
                                    onChange={() => handleCheckboxChange(absoluteIndex)}
                                    sx={{ padding: "0.4vh" }}
                                  />
                                </TableCell>

                                {/* File Name */}
                                <TableCell sx={{ width: "16%", py: 2 }}>
                                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                                    <Tooltip title={candidate.fileName} arrow placement="top">
                                      <Typography sx={{ fontWeight: 700, fontSize: '1.4vh', fontFamily: "Poppins, sans-serif", color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {candidate.fileName}
                                      </Typography>
                                    </Tooltip>
                                    {fileNameExpanded && (
                                      <Typography sx={{ fontSize: '1.1vh', fontFamily: "Poppins, sans-serif", color: '#9CA3AF', marginTop: '0.3vh' }}>
                                        ID: {candidate.id || 'N/A'}
                                      </Typography>
                                    )}
                                  </Box>
                                </TableCell>

                                {/* Status */}
                                <TableCell sx={{ width: "10%", py: 2 }}>
                                  <Typography sx={candidate.status === 'SUCCESS' ? styles.statusSuccess : styles.statusFailed}>
                                    {candidate.status}
                                  </Typography>
                                </TableCell>

                                {/* Resume Score with Progress Bar */}
                                <TableCell sx={{ width: "14%", py: 2 }}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: "1.5vh", width: "100%" }}>
                                    <Box sx={styles.progressBarIndicator}>
                                      <Box sx={{
                                        ...styles.progressFill,
                                        width: candidate.status === 'FAILED' ? '0%' : `${candidate.scoreNumeric}%`,
                                        backgroundColor: candidate.scoreNumeric < 80 ? '#FBBF24' : '#007664',
                                      }} />
                                    </Box>
                                    <Typography sx={{
                                      ...styles.scorePercent,
                                      color: candidate.status === 'FAILED' ? '#A62021' : (candidate.scoreNumeric < 80 ? '#FBBF24' : '#007664')
                                    }}>
                                      {candidate.status === 'FAILED' ? '—' : `${candidate.score}%`}
                                    </Typography>
                                  </Box>
                                </TableCell>

                                {/* Decision Badge */}
                                <TableCell sx={{ width: "10%", py: 2 }}>
                                  <Box sx={
                                    candidate.status === 'FAILED' ? styles.decisionPillPending :
                                      (candidate.decision === 'SHORTLIST' || candidate.decision === 'APPROVED') ? styles.decisionPill :
                                        styles.decisionPillRejected
                                  }>
                                    {candidate.status === 'FAILED' ? '—' : (candidate.decision === 'SHORTLIST' ? 'APPROVED' : candidate.decision === 'REJECT' ? 'REJECTED' : candidate.decision)}
                                  </Box>
                                </TableCell>

                                {/* View Summary Link */}
                                <TableCell sx={{ width: "11%", py: 2 }}>
                                  {candidate.status !== 'FAILED' ? (
                                    <Box
                                      sx={styles.viewAnalysisLink}
                                      onClick={() => {
                                        setSelectedCandidate(candidate);
                                        setOpenModal(true);
                                      }}
                                    >
                                      <DescriptionOutlinedIcon sx={styles.documentIcon} />
                                      View Analysis
                                    </Box>
                                  ) : (
                                    <Typography sx={{ color: '#A62021', fontWeight: 700, fontSize: '1.4vh', fontFamily: "Poppins, sans-serif", textAlign: 'center', width: '100%' }}>—</Typography>
                                  )}
                                </TableCell>

                                {/* Reason */}
                                <TableCell sx={{ width: "15%", py: 2 }}>
                                  <Tooltip title={candidate.reasoning} arrow placement="top">
                                    <Typography sx={{ ...styles.reasonText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {candidate.reasoning}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>

                                {/* Email Triggered */}
                                <TableCell sx={{ width: "12%", py: 2 }}>
                                  <Typography sx={{ fontSize: '1.4vh', fontFamily: "Poppins, sans-serif", color: candidate.mailTriggered ? '#16a34a' : '#6b7280', fontWeight: 700 }}>
                                    {candidate.mailTriggered ? "Yes" : "No"}
                                  </Typography>
                                </TableCell>

                                {/* Actions */}
                                <TableCell sx={{ width: "8%", py: 2 }}>
                                  <Box sx={{ display: 'flex', gap: '0.8vh', justifyContent: 'center', alignItems: 'center' }}>
                                    <Tooltip title={candidate.userId ? "Generate Invite Link" : "Candidate not linked to user"} arrow>
                                      <span>
                                        <IconButton
                                          size="small"
                                          disabled={!candidate.userId}
                                          sx={{ color: candidate.userId ? '#00695c' : '#d1d5db', '&:hover': { backgroundColor: '#f3f4f6' } }}
                                          onClick={() => handleGenerateCandidateLink({ user_id: candidate.userId, file_name: candidate.fileName })}
                                        >
                                          <LinkIcon sx={{ fontSize: '1.6vh' }} />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                    <Tooltip title={candidate.resumeUrl ? "Download Resume" : "Resume not available"} arrow>
                                      <span>
                                        <IconButton
                                          size="small"
                                          disabled={!candidate.resumeUrl}
                                          sx={{ color: candidate.resumeUrl ? '#6b7280' : '#d1d5db', '&:hover': { backgroundColor: '#f3f4f6' } }}
                                          onClick={async () => {
                                            if (candidate.resumeUrl) {
                                              try {
                                                const blobName = candidate.resumeUrl.includes('/')
                                                  ? candidate.resumeUrl.split('/').pop() || candidate.resumeUrl
                                                  : candidate.resumeUrl;
                                                await downloadResume(blobName, candidate.fileName);
                                              } catch {
                                                setSnackbarMessage("Failed to download resume");
                                                setSnackbarOpen(true);
                                              }
                                            }
                                          }}
                                        >
                                          <DownloadIcon sx={{ fontSize: '1.6vh' }} />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                    <Tooltip title="Delete Evaluation" arrow>
                                      <span>
                                        <IconButton
                                          size="small"
                                          sx={{ color: '#ef4444', '&:hover': { backgroundColor: '#f3f4f6' } }}
                                          onClick={() => {
                                            setDeleteTargetCandidate(candidate);
                                            setDeleteConfirmOpen(true);
                                          }}
                                        >
                                          <img src={Trash2} alt="delete" style={{ height: '1.6vh', width: 'auto' }} />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                </Box>
              )}

              {/* Pagination Footer */}
              <PaginationFooter
                count={tabValue === 0 ? totalRecordings : tabValue === 1 ? totalEvaluation : totalScores}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={handleRowsPerPageChange}
              />
            </Paper>
          </Box>

        </Box>

      </Box>

      {/* Analysis Modal */}
      <CandidateAnalysisModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        candidate={selectedCandidate}
      />

      {/* Invite Links Modal */}
      <Dialog
        open={inviteLinksModalOpen}
        onClose={() => setInviteLinksModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
            backgroundColor: "#f9fafb",
          }
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(108deg, #004d40 0%, #00605a 45%, #004d40 100%)",
            color: "white",
            fontWeight: 700,
            fontSize: "1.8vh",
            fontFamily: "Poppins, sans-serif",
            padding: "2vh",
          }}
        >
          Invite Links
        </DialogTitle>
        <DialogContent sx={{ padding: "2.5vh 2.5vh 0vh 2.5vh", backgroundColor: "#f9fafb" }}>
          {job && (
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1.6vh",
                  fontFamily: "Poppins, sans-serif",
                  marginBottom: "1.5vh",
                  color: "#111827",
                }}
              >
                {job.jobTitle}
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.4vh",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  color: "#6b7280",
                  marginBottom: "2vh",
                }}
              >
                {selectedCandidateForLink
                  ? `Invite link for ${selectedCandidateForLink.first_name || ''} ${selectedCandidateForLink.last_name || ''}`
                  : 'Generate invite link'}
              </Typography>

              {/* Stream/Program Selection */}
              <Box sx={{ marginBottom: "2vh" }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.3vh",
                    fontFamily: "Poppins, sans-serif",
                    marginBottom: "1vh",
                    color: "#513739ff",
                  }}
                >
                  {job.jobTitle}
                </Typography>
                {linkExpiresAt && (
                  <Typography sx={{ fontSize: "1.2vh", fontFamily: "Poppins, sans-serif", color: "#9ca3af", mb: "1vh" }}>
                    Expires: {new Date(linkExpiresAt).toLocaleString()}
                  </Typography>
                )}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1vh",
                    backgroundColor: "white",
                    padding: "1.2vh 1.5vh",
                    borderRadius: "4px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    value={linkGenerating ? "Generating link..." : candidateInviteLink}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      "& .MuiOutlinedInput-root": {
                        fontSize: "1.3vh",
                        fontFamily: "Poppins, sans-serif",
                      },
                      "& .MuiInputBase-input": {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    }}
                  />
                  <Tooltip title="Copy to clipboard">
                    <IconButton
                      size="small"
                      onClick={handleCopyFromModal}
                      sx={{
                        color: "#6b7280",
                        "&:hover": { color: "#111827", backgroundColor: "#f3f4f6" },
                      }}
                    >
                      {copiedCandidateId === (selectedCandidateForLink?.id || "candidate") ? (
                        <CheckCircleOutline color="success" sx={{ fontSize: "1.8vh", fontFamily: "Poppins, sans-serif" }} />
                      ) : (
                        <Box
                          component="svg"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          sx={{ width: "1.6vh", height: "1.6vh" }}
                        >
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                        </Box>
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: "1.5vh 2.5vh", backgroundColor: "#f9fafb", justifyContent: "space-between" }}>
          <Button
            disabled={!candidateInviteLink || !selectedCandidateForLink?.user_id || emailSending}
            onClick={() => {
              if (!candidateInviteLink || !selectedCandidateForLink?.user_id) return;
              setInviteLinksModalOpen(false);
              setEmailPreviewRecipientCount(1);
              setPendingEmailSend(() => async (subject: string, htmlBody: string) => {
                setEmailSending(true);
                try {
                  await sendInviteEmail(
                    selectedCandidateForLink.user_id,
                    candidateInviteLink,
                    id,
                    subject,
                    htmlBody
                  );
                  setAtsEvaluations((prev) =>
                    prev.map((c) =>
                      c.userId === selectedCandidateForLink.user_id
                        ? { ...c, mailTriggered: true }
                        : c
                    )
                  );
                  setSnackbarMessage("Invite email sent successfully");
                  setSnackbarOpen(true);
                } catch {
                  setSnackbarMessage("Failed to send invite email");
                  setSnackbarOpen(true);
                } finally {
                  setEmailSending(false);
                }
              });
              setEmailPreviewOpen(true);
            }}
            sx={{
              fontSize: "1.3vh",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              textTransform: "none",
              padding: "0.6vh 1.5vh",
              borderRadius: "4px",
              color: "#FFFFFF",
              backgroundColor: "#00695C",
              "&:hover": { backgroundColor: "#004d40" },
              "&.Mui-disabled": { backgroundColor: "#e5e7eb", color: "#9ca3af" },
            }}
          >
            {emailSending ? "Sending..." : "Review & Send Email"}
          </Button>
          <Button
            onClick={() => setInviteLinksModalOpen(false)}
            sx={{
              fontSize: "1.3vh",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              textTransform: "none",
              padding: "0.6vh 1.5vh",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              color: "#FFFFFF",
              backgroundColor: "#00695C",
              "&:hover": { backgroundColor: "#004d40" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => { if (!deleting) { setDeleteConfirmOpen(false); setDeleteTargetCandidate(null); } }}
        onConfirm={handleDeleteEvaluation}
        title="Delete Evaluation"
        message={`Are you sure you want to delete the evaluation for "${deleteTargetCandidate?.fileName}"? This action cannot be undone.`}
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText={deleting ? null : "Cancel"}
        disableButton={deleting}
      />

      {/* Email preview modal */}
      <EmailPreviewModal
        open={emailPreviewOpen}
        recipientCount={emailPreviewRecipientCount}
        onConfirm={(subject, htmlBody) => {
          setEmailPreviewOpen(false);
          if (pendingEmailSend) {
            pendingEmailSend(subject, htmlBody);
          }
        }}
        onCancel={() => {
          setEmailPreviewOpen(false);
          setPendingEmailSend(null);
        }}
      />

      {/* Snackbar for link copy notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarMessage.includes("Failed") ? "error" : "success"}
          sx={{ width: "100%", fontSize: "1.4vh", fontFamily: "Poppins, sans-serif" }}
          icon={
            snackbarMessage.includes("Failed") ? undefined : (
              <Box sx={{ fontSize: "1.8vh", fontFamily: "Poppins, sans-serif" }}>✓</Box>
            )
          }
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
export default JobDetails;
