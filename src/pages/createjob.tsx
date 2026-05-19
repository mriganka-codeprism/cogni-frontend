import { Box, Typography, Button, TableRow, Table, Paper, TableContainer, TableHead, TableCell, TableBody, TextField, Grid, CircularProgress, InputAdornment } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { styles } from "../styles/createjob.styles";
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import noJobImg from "../assets/images/noJobCreated.png";
import noJobImg2 from "../assets/images/No_Job_Created2.png";
import { useNavigate, useLocation } from "react-router-dom";
import { routes } from "../constants/routes";
import { clearCreateJobPostSession } from "../utils/clearCreateJobPostSession";
import { generateCustomReference } from "../utils/generateCustomReference";
import { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import DateRangeSelector from "../components/dateRange/dateRangeFilter";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
//import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";

import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Tooltip } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";

import jsPDF from "jspdf";
import "../assets/fonts/Poppins-Regular";
import "../assets/fonts/Poppins-Bold";
import { Document, Packer, Paragraph, TextRun } from "docx";
import ReviewSubmit from "./ReviewSubmit";
import { Dialog } from "@mui/material";
import { FormControl, Select } from "@mui/material";
import { adminHomeStyles } from "../styles/adminHome.styles";
import { GridView, ViewList } from "@mui/icons-material";
import { getAtsJobs, deleteAtsJob } from "../api/api";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import tableview from "../assets/images/tableview.png";
import gridview from "../assets/images/gridview.png";
import PaginationFooter from "../components/PaginationFooter";
import { useRowsPerPage } from "../hooks/useRowsPerPage";
import { useMemo } from "react";
import CustomSelect from "../components/customSelect";

// Types for sorting
type JobColumnKey = "title" | "role" | "category" | "avatar" | "raisedBy" | "createdOn";
type SortDir = "asc" | "desc" | null;




const CreateJob = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleType, setRoleType] = useState("");
  const [roleCategory, setRoleCategory] = useState("");
  const [status, setStatus] = useState("");
  const [avatar, setAvatar] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: null as Dayjs | null, end: null as Dayjs | null });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const [openReview, setOpenReview] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<any>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isDownloading, setIsDownloading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<any>(null);

  // Sort state for table columns
  const [sortState, setSortState] = useState<{
    key: JobColumnKey | null;
    dir: SortDir;
  }>({ key: null, dir: null });

  // Expanded columns state for showing additional details
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());

  // Pagination states
  const [page, setPage] = useState(0);
  const { rowsPerPage, handleRowsPerPageChange } = useRowsPerPage({
    defaultRowsPerPage: 10,
    storageKey: "createjobRowsPerPage",
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

  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, job: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedJob(job);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedJob(null);
  };

  const handleOpenDeleteDialog = (job: any) => {
    setJobToDelete(job);
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setJobToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;

    try {
      // ✅ call backend delete API
      await deleteAtsJob(jobToDelete.id);

      // ✅ update UI instantly after delete
      setJobs((prevJobs) =>
        prevJobs.filter((j) => j.id !== jobToDelete.id)
      );

      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Failed to delete job:", error);
      handleCloseDeleteDialog();
    }
  };

  const handleDeleteJob = async (jobToDelete?: any) => {
    const job = jobToDelete || selectedJob;
    console.log("Attempting to delete job:", job);
    if (!job) return;

    handleOpenDeleteDialog(job);
  };

  const handleDownloadJobDetails = (jobToDownload?: any) => {
    const job = jobToDownload || selectedJob;
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      if (!job) {
        setIsDownloading(false);
        return;
      }

      // Debug: Log the job object structure
      console.log('📥 Job object for download:', job);
      console.log('📥 Interview settings:', job.interview_setting);

      const doc = new jsPDF();
      let yPosition = 20;
      const lineHeight = 7;
      const pageHeight = 297; // A4 page height in mm
      const pageWidth = 210; // A4 page width in mm
      const margin = 15;
      const maxWidth = pageWidth - 2 * margin;

      // Helper function to wrap text
      const wrapText = (text: string, maxW: number) => {
        return doc.splitTextToSize(text, maxW);
      };

      // Helper function to add a section
      const addSection = (title: string, content: string | any) => {
        // Add title
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0); // Black color
        doc.setFont('Poppins-Bold', 'normal');
        doc.text(title, margin, yPosition);
        yPosition += lineHeight + 3;

        // Add content
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Poppins-Regular', 'normal');

        if (typeof content === 'string') {
          const wrappedText = wrapText(content, maxWidth);
          wrappedText.forEach((line: string) => {
            if (yPosition > pageHeight - 20) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, margin, yPosition);
            yPosition += lineHeight;
          });
        } else if (Array.isArray(content)) {
          content.forEach((item: any) => {
            if (yPosition > pageHeight - 20) {
              doc.addPage();
              yPosition = 20;
            }
            const text = typeof item === 'string' ? item : (item.text || JSON.stringify(item));
            const wrappedLines = wrapText(`• ${text}`, maxWidth - 5);
            wrappedLines.forEach((line: string, idx: number) => {
              if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
              }
              doc.text(line, margin + (idx === 0 ? 0 : 2), yPosition);
              yPosition += lineHeight;
            });
          });
        }
        yPosition += 5;
      };

      // Add header
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.setFont('Poppins-Bold', 'normal');
      doc.text('Job Details', margin, yPosition);
      yPosition += lineHeight + 8;

      // Add job title
      addSection('Job Title', job.title || 'N/A');

      // Add job description
      addSection('Job Description', job.description || 'N/A');

      // Add role
      addSection('Role', job.interview_setting?.role || 'N/A');

      // Add category
      addSection('Category', job.interview_setting?.category || 'N/A');

      // Add avatar
      const avatars = Array.isArray(job.interview_setting?.avatarOptions)
        ? job.interview_setting.avatarOptions
        : [job.interview_setting?.avatar];
      addSection('Avatars', avatars.filter(Boolean));

      // Add interview mode
      addSection('Interview Mode', job.interview_setting?.interviewMode || 'N/A');

      // Add duration
      const interviewSettings = job.interview_setting || job.interviewSetting || {};
      const duration = interviewSettings.duration || job.duration || 'N/A';
      addSection('Interview Duration', duration ? `${duration} Minutes` : 'N/A');

      // Add Threshold/ATS Score
      const threshold = job.threshold || job.atsDetails?.threshold || 'N/A';
      addSection('Threshold Score', String(threshold));

      // Add cutoff - try multiple field name variations
      const cutoffScore = interviewSettings.cutOff ||
        interviewSettings.cutoff ||
        job.cutOff ||
        job.cutoff ||
        'N/A';
      addSection('Cutoff Score', String(cutoffScore));

      // Add question level
      const questionLevel = interviewSettings.questionPersonalizer ||
        interviewSettings.questionLevel ||
        'N/A';
      addSection('Question Level', String(questionLevel));

      // Add coding round settings
      addSection('Coding Round', String(interviewSettings.codingRound || 'N/A'));

      // Add number of questions
      const numQuestions = interviewSettings.numberOfQuestions ||
        interviewSettings.number_of_questions ||
        job.numberOfQuestions ||
        job.number_of_questions ||
        'N/A';
      addSection('Number of Questions', String(numQuestions));

      // Add coding time limit
      const codingTimeLimit = interviewSettings.codingTimeLimit ||
        interviewSettings.coding_time_limit ||
        'N/A';
      addSection('Coding Time Limit', codingTimeLimit ? `${codingTimeLimit} Minutes` : 'N/A');

      // Add parameter weights if available
      const weights = job.parameterWeights || job.interview_setting?.parameterWeights || job.atsDetails?.weights;
      if (weights && Object.keys(weights).length > 0) {
        const weightsList = Object.entries(weights).map(([key, value]) =>
          `${key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}: ${value}%`
        );
        addSection('Parameter Weights', weightsList);
      }

      // Add criteria if available
      const criteria = job.criteria || job.interview_setting?.criteria || [];
      if (Array.isArray(criteria) && criteria.length > 0) {
        yPosition += 3;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Poppins-Bold', 'normal');
        doc.text('Evaluation Criteria', margin, yPosition);
        yPosition += lineHeight + 3;

        criteria.forEach((c: any, idx: number) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          doc.setFont('Poppins-Bold', 'normal');
          const titleText = `${idx + 1}. ${c.criteriaTitle || c.title || 'N/A'}`;
          const wrappedTitle = wrapText(titleText, maxWidth);
          wrappedTitle.forEach((line: string) => {
            if (yPosition > pageHeight - 40) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, margin, yPosition);
            yPosition += lineHeight;
          });

          // Extract description similar to transformJobForReview
          let description = "";
          const desc = c.criteriaDescription || c.description || {};
          if (typeof desc === 'object' && !Array.isArray(desc)) {
            const levels = Object.keys(desc)
              .filter(key => key.toLowerCase().startsWith('level'))
              .sort()
              .map(key => `${key.replace(/^level/i, 'Level ')}: ${desc[key]}`)
              .filter(val => val);
            description = levels.length > 0 ? levels.join("\n") : JSON.stringify(desc);
          } else {
            description = String(desc || "");
          }

          if (description && description !== '{}') {
            yPosition += 1;
            doc.setFont('Poppins-Regular', 'normal');
            doc.setTextColor(55, 65, 81); // Slate gray
            const wrappedDesc = wrapText(description, maxWidth - 5);
            wrappedDesc.forEach((line: string) => {
              if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 20;
              }
              doc.text(line, margin + 5, yPosition);
              yPosition += lineHeight;
            });
          }
          yPosition += 4;
        });
      }

      // Add Questionnaire if available
      let questionnaire: any[] = [];
      if (job.predefinedQuestions && Array.isArray(job.predefinedQuestions)) {
        questionnaire = job.predefinedQuestions.map((q: any) => ({
          text: q.question || "",
          answer: q.answer || ""
        }));
      } else if (job.questionnaire && Array.isArray(job.questionnaire)) {
        questionnaire = job.questionnaire.map((q: any) =>
          typeof q === 'string'
            ? { text: q, answer: '' }
            : { text: q.text || q.question || "", answer: q.answer || "" }
        );
      } else if (job.questions && Array.isArray(job.questions)) {
        questionnaire = job.questions.map((q: any) =>
          typeof q === 'string'
            ? { text: q, answer: '' }
            : { text: q.text || q.question || "", answer: q.answer || "" }
        );
      }

      if (questionnaire.length > 0) {
        yPosition += 3;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Poppins-Bold', 'normal');
        doc.text('Questionnaire', margin, yPosition);
        yPosition += lineHeight + 3;

        questionnaire.forEach((q: any, idx: number) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          doc.setFont('Poppins-Bold', 'normal');
          const questionText = `Q${idx + 1}: ${q.text || 'N/A'}`;
          const wrappedQuestion = wrapText(questionText, maxWidth);
          wrappedQuestion.forEach((line: string) => {
            if (yPosition > pageHeight - 40) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, margin, yPosition);
            yPosition += lineHeight;
          });

          if (q.answer) {
            yPosition += 2;
            doc.setFont('Poppins-Regular', 'normal');
            doc.setTextColor(107, 114, 128); // Gray
            const answerText = `Answer: ${q.answer}`;
            const wrappedAnswer = wrapText(answerText, maxWidth);
            wrappedAnswer.forEach((line: string) => {
              if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 20;
              }
              doc.text(line, margin, yPosition);
              yPosition += lineHeight;
            });
          }
          yPosition += 5;
        });
      }

      // Add created on
      yPosition += 3;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('Poppins-Regular', 'normal');
      doc.text(`Created On: ${job.createdOn || 'N/A'}`, margin, yPosition);
      yPosition += lineHeight;

      // Save PDF
      const fileName = `Job_Details_${job.title?.replace(/\s+/g, '_') || 'Export'}.pdf`;
      doc.save(fileName);
      setIsDownloading(false);
      handleMenuClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download job details');
      setIsDownloading(false);
      handleMenuClose();
    }
  };

  const handleClearAll = () => {
    setSearch("");
    setRoleType("");
    setRoleCategory("");
    setStatus("");
    setAvatar("");
    setDateRange({ start: null, end: null });
  };

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

  const toggleSort = (column: JobColumnKey) => {
    setSortState((prev) => {
      if (prev.key !== column) return { key: column, dir: "asc" };
      if (prev.dir === "asc") return { key: column, dir: "desc" };
      if (prev.dir === "desc") return { key: null, dir: null };
      return { key: column, dir: "asc" };
    });
  };

  // Sort jobs based on sortState
  const getSortedJobs = (jobsList: any[]) => {
    if (!sortState.key || !sortState.dir) return jobsList;

    const sorted = [...jobsList].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortState.key) {
        case "title":
          aValue = (a.title || "").toLowerCase();
          bValue = (b.title || "").toLowerCase();
          break;
        case "role":
          aValue = (a.interview_setting?.role || "").toLowerCase();
          bValue = (b.interview_setting?.role || "").toLowerCase();
          break;
        case "category":
          aValue = (a.interview_setting?.category || "").toLowerCase();
          bValue = (b.interview_setting?.category || "").toLowerCase();
          break;
        case "avatar":
          aValue = Array.isArray(a.interview_setting?.avatarOptions)
            ? a.interview_setting.avatarOptions.join(", ").toLowerCase()
            : (a.interview_setting?.avatar || "").toLowerCase();
          bValue = Array.isArray(b.interview_setting?.avatarOptions)
            ? b.interview_setting.avatarOptions.join(", ").toLowerCase()
            : (b.interview_setting?.avatar || "").toLowerCase();
          break;
        case "raisedBy":
          aValue = (a.raisedBy || "").toLowerCase();
          bValue = (b.raisedBy || "").toLowerCase();
          break;
        case "createdOn":
          aValue = new Date(a.createdOn || 0).getTime();
          bValue = new Date(b.createdOn || 0).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortState.dir === "asc" ? -1 : 1;
      if (aValue > bValue) return sortState.dir === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  // Derived state for sorting and filtering
  const filteredJobs = useMemo(() => {
    return getSortedJobs(jobs).filter((job) => {
      const titleMatch = job.title?.toLowerCase().includes(search.toLowerCase());
      const roleTypeMatch =
        roleType === ""
          ? true
          : (job.interview_setting?.role || "").toLowerCase() === roleType.toLowerCase();
      const roleCategoryMatch =
        roleCategory === ""
          ? true
          : (job.interview_setting?.category || "").toLowerCase() === roleCategory.toLowerCase();
      const avatarMatch =
        avatar === ""
          ? true
          : Array.isArray(job.interview_setting?.avatarOptions)
            ? job.interview_setting.avatarOptions.some((a: string) =>
              a.toLowerCase().includes(avatar.toLowerCase())
            )
            : false;
      const statusMatch = status === "" ? true : (job.status || "").toLowerCase() === status.toLowerCase();

      let dateMatch = true;
      if (dateRange.start && dateRange.end) {
        const jobDate = dayjs(job.createdOn, "MM/DD/YYYY");
        if (jobDate.isValid()) {
          dateMatch = jobDate.isAfter(dateRange.start.subtract(1, "day")) && jobDate.isBefore(dateRange.end.add(1, "day"));
        }
      }

      return titleMatch && roleTypeMatch && roleCategoryMatch && avatarMatch && statusMatch && dateMatch;
    });
  }, [jobs, search, roleType, roleCategory, avatar, status, dateRange, sortState]);

  const totalJobs = filteredJobs.length;
  const lastPage = Math.max(0, Math.ceil(totalJobs / rowsPerPage) - 1);
  useEffect(() => {
    if (page > lastPage) {
      setPage(lastPage);
    }
  }, [totalJobs, rowsPerPage, page, lastPage]);

  const displayedJobs = filteredJobs.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getAtsJobs();   // no limit unless supported
        console.log(" Raw API response:", response);

        // ✅ support multiple backend formats safely
        const jobsList =
          response?.jobs ||
          response?.data ||
          (Array.isArray(response) ? response : []);

        // ✅ Log first job to see structure
        if (jobsList.length > 0) {
          console.log(" First job object:", jobsList[0]);
        }

        // ✅ Helper function to format date
        const formatDate = (dateValue: any): string => {
          if (!dateValue) return new Date().toLocaleDateString();

          // If it's already a string in the right format, return it
          if (typeof dateValue === 'string') {
            // Check if it's a timestamp (number as string or ISO date)
            if (!isNaN(Date.parse(dateValue))) {
              return dayjs(dateValue).format('MM/DD/YYYY');
            }
            return dateValue;
          }

          // If it's a number (Unix timestamp)
          if (typeof dateValue === 'number') {
            return dayjs(dateValue).format('MM/DD/YYYY');
          }

          return new Date().toLocaleDateString();
        };

        // ✅ Ensure createdOn is properly mapped (handle different field names)
        const mappedJobs = jobsList.map((job: any) => {
          // Extract interview settings from various possible field names
          const interviewSetting = job.interview_setting || job.interviewSetting || {};

          return {
            ...job,
            createdOn: formatDate(
              job.createdOn ||
              job.created_on ||
              job.createdDate ||
              job.created_date ||
              job.created_at ||
              job.createdAt ||
              job.postedDate ||
              job.posted_date ||
              job.date ||
              job.timestamp ||
              job.created ||
              job.posted_on
            ),
            // ✅ Map category field to roleCategory for filtering
            roleCategory: job.roleCategory || job.category || job.tds || "",
            // ✅ Use raisedBy from API if exists, otherwise use logged-in user's name
            raisedBy: job.raisedBy || getLoggedInUserName(),
            // ✅ Ensure interview_setting is properly set with role, category, and avatar info
            interview_setting: {
              role: interviewSetting.role || job.role || "Lateral",
              category: interviewSetting.category || job.roleCategory || job.category || "N/A",
              avatar: interviewSetting.avatar || "N/A",
              avatarOptions: interviewSetting.avatarOptions || (interviewSetting.avatar ? [interviewSetting.avatar] : []),
              ...interviewSetting,
            },
          };
        });

        console.log(" Parsed jobs list with createdOn:", mappedJobs);

        // ✅ Filter out draft jobs - only show published/active jobs
        const publishedJobs = mappedJobs.filter((job: any) => {
          const isNotDraft = (job.status || "").toLowerCase() !== "draft";
          console.log(`  📌 Job: ${job.title}, Status: "${job.status}" - Include: ${isNotDraft}`);
          return isNotDraft;
        });

        console.log(` Total jobs: ${mappedJobs.length}, Published: ${publishedJobs.length}, Drafts filtered: ${mappedJobs.length - publishedJobs.length}`);

        setJobs(publishedJobs);
      } catch (error) {
        console.error(" Error fetching jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [location]);
  useEffect(() => {
    const handleReload = () => {
      clearCreateJobPostSession();
    };

    window.addEventListener("beforeunload", handleReload);

    return () => {
      window.removeEventListener("beforeunload", handleReload);
    };
  }, []);
  const truncateTitle = (text: string | undefined, limit: number): string => {
    if (!text) return "";
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  const transformJobForReview = (job: any) => {
    if (!job) return null;

    // Handle potential nested "job" property
    const jobData = job.job || job;
    const interview = jobData.interview_setting || jobData.interviewSetting || {};

    // Support nested ATS settings if backend uses them
    const atsSettings = jobData.ats_settings || jobData.atsSettings || jobData.ats_details || jobData.atsDetails || jobData;

    // Support both snake_case, camelCase, and kebab-case for weights
    let rawWeights = atsSettings.parameter_weights || atsSettings.parameterWeights || atsSettings.weights || {};
    if (rawWeights.parameter_weights) rawWeights = rawWeights.parameter_weights;
    if (rawWeights.parameterWeights) rawWeights = rawWeights.parameterWeights;

    // Support different threshold keys
    const threshold = atsSettings.threshold !== undefined
      ? atsSettings.threshold
      : (atsSettings.atsThreshold || atsSettings.ats_threshold || atsSettings.scoreThreshold || atsSettings.score_threshold);

    // ✅ Extract criteria from various possible formats
    let criteriaList: string[] = [];
    let generatedList: string[] = [];

    // Try different criteria formats
    if (jobData.criteria && Array.isArray(jobData.criteria)) {
      // Format: criteria array with criteriaTitle and criteriaDescription
      criteriaList = jobData.criteria.map((c: any) => c.criteriaTitle || c.title || "");
      generatedList = jobData.criteria.map((c: any) => {
        const desc = c.criteriaDescription || c.description || {};
        // Handle nested description object with level1-level5
        if (typeof desc === 'object' && !Array.isArray(desc)) {
          // Join all level values with newlines if they exist
          const levels = Object.keys(desc)
            .filter(key => key.startsWith('level'))
            .sort()
            .map(key => desc[key])
            .filter((val: any) => val);
          return levels.length > 0 ? levels.join("\n") : JSON.stringify(desc);
        }
        return String(desc);
      });
    } else if (jobData.criteriaList && jobData.criteriaDescription) {
      // Format: separate criteriaList and criteriaDescription arrays
      criteriaList = Array.isArray(jobData.criteriaList) ? jobData.criteriaList : [];
      generatedList = Array.isArray(jobData.criteriaDescription)
        ? jobData.criteriaDescription
        : jobData.criteriaDescription ? [jobData.criteriaDescription] : [];
    } else if (jobData.criteriaTitle) {
      criteriaList = [jobData.criteriaTitle];
      generatedList = jobData.criteriaDescription ? [jobData.criteriaDescription] : [];
    }

    // ✅ Extract questionnaire/questions from various formats
    let questionnaire: any[] = [];
    // ✅ Handle predefinedQuestions (from question-based jobs)
    if (jobData.predefinedQuestions && Array.isArray(jobData.predefinedQuestions)) {
      questionnaire = jobData.predefinedQuestions.map((q: any) => ({
        text: q.question || "",
        answer: q.answer || ""
      }));
    } else if (jobData.questionnaire && Array.isArray(jobData.questionnaire)) {
      questionnaire = jobData.questionnaire.map((q: any) =>
        typeof q === 'string'
          ? { text: q, answer: '' }
          : { text: q.text || q.question || "", answer: q.answer || "" }
      );
    } else if (jobData.questions && Array.isArray(jobData.questions)) {
      questionnaire = jobData.questions.map((q: any) =>
        typeof q === 'string'
          ? { text: q, answer: '' }
          : { text: q.text || q.question || "", answer: q.answer || "" }
      );
    }

    return {
      basicDetails: {
        jobTitle: jobData.title || jobData.jobTitle || "",
        jobDescription: jobData.description || jobData.jobDescription || "",
      },
      evaluationCriteria: {
        criteriaList,
        generatedList,
      },
      otherDetails: {
        role: "lateral" as const,
        roleCategory: interview.category || jobData.roleCategory || jobData.category || "",
        avatar: Array.isArray(interview.avatarOptions) ? interview.avatarOptions : [],
        questionLevel: interview.questionPersonalizer || "",
        duration: String(interview.duration || "30"),
        cutoff: String(interview.cutOff || interview.cutoff || "3"),
        interviewMode:
          interview.interviewMode === "Avatar Based Interview" || interview.interviewMode === "Avatar"
            ? "Avatar"
            : "Audio",
        codingRound: interview.codingRound ? "Yes" : "No",
        numberOfQuestions: String(interview.numberOfQuestions || "1"),
        codingTimeLimit: String(interview.codingTimeLimit || "15"),
      },
      atsDetails: {
        threshold: threshold !== undefined ? Number(threshold) : 0,
        allowThresholdEdit: threshold !== undefined,
        weights: {
          skills_required: Number(rawWeights.skills_required || rawWeights["skills-required"] || rawWeights.requiredSkill || 0),
          skills_preferred: Number(rawWeights.skills_preferred || rawWeights["skills-preferred"] || rawWeights.preferredSkill || 0),
          education_alignment: Number(rawWeights.education_alignment || rawWeights["education-alignment"] || rawWeights.educationAlignment || 0),
          experience_alignment: Number(rawWeights.experience_alignment || rawWeights["experience-alignment"] || rawWeights.experienceAlignment || 0),
          responsibility_overlap: Number(rawWeights.responsibility_overlap || rawWeights["responsibility-overlap"] || rawWeights.responsibilityOverlap || 0),
        },
      },
      jobId: jobData.id || job.id || null,
      criteriaMode: (jobData.jobType === "question" ? "upload" : "manual") as "upload" | "manual",
      questionnaire,
    };
  };

  const reviewProps = transformJobForReview(jobToEdit);

  const categoryOptions = [
    { label: "Category", value: "" },
    { label: "TDS 1", value: "TDS 1" },
    { label: "TDS 2", value: "TDS 2" },
    { label: "TDS 3", value: "TDS 3" },
    { label: "TDS 4", value: "TDS 4" },
    { label: "AL", value: "AL" },
    { label: "Design", value: "Design" },
    { label: "HR", value: "HR" },
  ];

  const statusOptions = [
    { label: "Status", value: "" },
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
    // { label: "Draft", value: "Draft" },
  ];

  return (
    <>
      <Box sx={{ display: "flex", height: "85vh", background: "#f8f8f8" }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={styles.root}>
            {/* Header */}
            <Box sx={{
              background: "#fff",
              borderRadius: 0,
              padding: "1.5vh 0vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: "2vh",
              borderBottom: "1px solid #e5e7eb",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "1.5vh", marginLeft: "1.4vh" }}>
                <IconButton onClick={() => navigate(routes.lateralAdmin)} sx={styles.backButton}>
                  <ArrowBackIosNewIcon sx={styles.backIcon} />
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
                  <BusinessCenterIcon sx={{ fontSize: "3vh", color: "#fff" }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "2.2vh", fontWeight: 700, color: "#1a1a1a", fontFamily: "Poppins, sans-serif", marginLeft: "0vh", marginTop: "0vh" }}>
                    Admin Management
                  </Typography>
                  <Typography sx={{ fontSize: "1.5vh", fontWeight: 400, color: "#99A1AF", fontFamily: "Poppins, sans-serif", marginLeft: "0vh", marginBottom: "0vh" }}>
                    Lateral category — job & interview configuration
                  </Typography>
                </Box>
              </Box>

              {/* Create New button */}
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1vh" }}>
                {jobs.length === 0 && (
                  <Button
                    startIcon={<AddIcon />}
                    sx={{ ...styles.createButton, marginRight: "1.5vh" }}
                    onClick={() => {
                      clearCreateJobPostSession();
                      navigate(routes.createJobPost);
                    }}
                  >
                    Create New
                  </Button>
                )}
              </Box>
            </Box>

            {/* FILTER BAR - Only show when jobs exist */}
            {jobs.length > 0 && (
              <Box sx={styles.compactFilterWrapper}>
                <TextField
                  variant="outlined"
                  placeholder="Search for Job"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: "1.6vh", color: "#9ca3af" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    width: "40vh",
                    "& .MuiInputBase-root": {
                      height: "4.5vh",
                      borderRadius: "1vh",
                      fontSize: "1.5vh",
                      fontFamily: "Poppins, sans-serif",
                      backgroundColor: "#fff",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#E5E7EB",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#E5E7EB",
                    },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#E5E7EB",
                      borderWidth: "1px",
                    },
                    "& .MuiOutlinedInput-input": {
                      padding: "1vh 1vh 1vh 0",
                    }
                  }}
                />

                {/* Filters button */}
                <Button
                  startIcon={<FilterAltOutlinedIcon />}
                  sx={{
                    ...styles.filtersBtn,
                    backgroundColor: showFilters ? "#004d40" : "#0f766e",
                    "&:hover": { backgroundColor: showFilters ? "#003d33" : "#115e59" }
                  }}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters
                </Button>

                {/* Collapsible Filter Container */}
                <Box sx={{
                  ...styles.collapsibleFilters,
                  maxWidth: showFilters ? "1000px" : "0px",
                  opacity: showFilters ? 1 : 0,
                  transform: showFilters ? "translateX(0)" : "translateX(-10px)",
                }}>
                  {/* Date Range Picker */}
                  <Box
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        paddingLeft: "0vh",
                        width: "23vh !important",
                        height: "3.7vh !important",
                        borderRadius: "0.5vh !important",
                      },
                      "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#d1d5db !important",
                      },
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#d1d5db !important",
                      },
                      "& .MuiOutlinedInput-input": { fontSize: "1.2vh !important", padding: "0.5vh 1vh !important" },
                      "& .MuiIconButton-root svg": { fontSize: "1.8vh !important", marginRight: "0.5vh" },
                    }}
                  >
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

                  {/* Category */}
                  <CustomSelect
                    label="Category"
                    value={roleCategory}
                    onChange={(e) => setRoleCategory(e.target.value)}
                    options={categoryOptions}
                    sx={styles.chip}
                  />

                  {/* Status */}
                  <CustomSelect
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={statusOptions}
                    sx={styles.chip}
                  />

                  {/* Clear: only show if any filter/search/date is active */}
                  {(
                    !!search.trim() ||
                    !!roleType ||
                    !!roleCategory ||
                    !!status ||
                    !!avatar ||
                    (dateRange.start !== null || dateRange.end !== null)
                  ) && (
                      <Button onClick={handleClearAll} sx={styles.clearText}>
                        ✕ Clear all
                      </Button>
                    )}
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                <Box sx={{ display: "flex", alignItems: "center", gap: "1.5vh" }}>
                  <Button
                    startIcon={<AddIcon />}
                    sx={styles.createButton}
                    onClick={() => {
                      clearCreateJobPostSession();
                      navigate(routes.createJobPost);
                    }}
                  >
                    Create New
                  </Button>

                  {/* View toggle */}
                  <Box
                    sx={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #f0f0f0",
                      borderRadius: "0.6vh",
                      width: "4vw",
                      padding: "0.4vh",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: "0" }}>
                      {/* List View Box */}
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
                            <path d="M2 8H2.00667" stroke={viewMode === "list" ? "#007664" : "#979797"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12H2.00667" stroke={viewMode === "list" ? "#007664" : "#979797"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 4H2.00667" stroke={viewMode === "list" ? "#007664" : "#979797"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5.33203 8H13.9987" stroke={viewMode === "list" ? "#007664" : "#979797"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5.33203 12H13.9987" stroke={viewMode === "list" ? "#007664" : "#979797"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5.33203 4H13.9987" stroke={viewMode === "list" ? "#007664" : "#979797"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Box>
                      </Tooltip>

                      {/* Vertical Divider */}
                      <Box sx={{ width: "0.1vh", backgroundColor: "#7d7f81", margin: "0.3vh 0.5vh" }} />

                      {/* Grid View Box */}
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
                            border: viewMode === "grid" ? "1px solid #dbd9d1" : "none",
                            borderRadius: "0.6vh",
                            color: viewMode === "grid" ? "#006b66" : "#9ca3af",
                            transition: "all 0.2s ease",
                            "&:hover": { backgroundColor: "#fafafa" },
                          }}
                        >
                          <svg width="auto" height="1.6vh" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 2H2.66667C2.29848 2 2 2.29848 2 2.66667V6C2 6.36819 2.29848 6.66667 2.66667 6.66667H6C6.36819 6.66667 6.66667 6.36819 6.66667 6V2.66667C6.66667 2.29848 6.36819 2 6 2Z" stroke={viewMode === "grid" ? "#007664" : "#979797"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M13.332 2H9.9987C9.63051 2 9.33203 2.29848 9.33203 2.66667V6C9.33203 6.36819 9.63051 6.66667 9.9987 6.66667H13.332C13.7002 6.66667 13.9987 6.36819 13.9987 6V2.66667C13.9987 2.29848 13.7002 2 13.332 2Z" stroke={viewMode === "grid" ? "#007664" : "#979797"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M13.332 9.33301H9.9987C9.63051 9.33301 9.33203 9.63148 9.33203 9.99967V13.333C9.33203 13.7012 9.63051 13.9997 9.9987 13.9997H13.332C13.7002 13.9997 13.9987 13.7012 13.9987 13.333V9.99967C13.9987 9.63148 13.7002 9.33301 13.332 9.33301Z" stroke={viewMode === "grid" ? "#007664" : "#979797"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 9.33301H2.66667C2.29848 9.33301 2 9.63148 2 9.99967V13.333C2 13.7012 2.29848 13.9997 2.66667 13.9997H6C6.36819 13.9997 6.66667 13.7012 6.66667 13.333V9.99967C6.66667 9.63148 6.36819 9.33301 6 9.33301Z" stroke={viewMode === "grid" ? "#007664" : "#979797"} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Box>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            <Box sx={styles.body}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "40vh", width: "100%" }}>
                  <CircularProgress sx={{ color: "#006b66" }} />
                </Box>
              ) : jobs.length === 0 ? (
                <Box sx={styles.emptyState}>
                  <img src={noJobImg2} alt="No Job Created" style={{ height: "35vh", width: "auto" }} />
                  {/* <Typography sx={styles.noJobText}>No Job Created</Typography> */}
                </Box>
              ) : viewMode === "grid" ? (
                <>
                  <Box sx={styles.gridOuterContainer}>
                    <Box sx={styles.gridWrapper}>
                      <Grid container spacing={2} sx={styles.gridContainer}>
                        {displayedJobs
                          .map((job) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={job.id}>
                              <Box
                                sx={styles.jobCard}
                                onClick={() => {
                                  console.log("🔗 Navigating to job details:", job.id, job);
                                  navigate(`/job-details/${job.id}`, { state: { job } });
                                }}
                              >
                                <Box sx={styles.cardTopRow}>
                                  <Tooltip title={job.title || ""} arrow placement="bottom">
                                    <Typography sx={styles.cardTitle}>{truncateTitle(job.title, 20)}</Typography>
                                  </Tooltip>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: "0.5vh" }}>
                                    <Box sx={styles.statusWrapper}>
                                      <Box sx={styles.statusDot} />
                                      <Typography sx={styles.statusText}>Active</Typography>
                                    </Box>
                                    <IconButton
                                      size="small"
                                      sx={styles.menuButton}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMenuOpen(e, job);
                                      }}
                                    >
                                      <MoreVertIcon />
                                    </IconButton>
                                  </Box>
                                </Box>
                                <Typography sx={styles.cardSub}>{job.id}</Typography>
                                <Box sx={styles.metaWrapper}>
                                  <Box sx={styles.metaRow}>
                                    <Typography sx={styles.metaText}>
                                      Role : <span style={{ fontWeight: 200 }}>{job.interview_setting?.role || "N/A"}</span>
                                    </Typography>
                                    <Typography sx={styles.metaText}>
                                      Category :{" "}
                                      <span style={{ fontWeight: 200 }}>{job.interview_setting?.category || "N/A"}</span>
                                    </Typography>
                                  </Box>
                                  <Box sx={styles.metaRow}>
                                    <Typography sx={styles.metaText}>
                                      Avatar :{" "}
                                      <span style={{ fontSize: "1.5vh", fontWeight: 200 }}>
                                        {Array.isArray(job.interview_setting?.avatarOptions)
                                          ? job.interview_setting.avatarOptions.join(", ")
                                          : job.interview_setting?.avatar || "N/A"}
                                      </span>
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box sx={styles.cardFooter}>
                                  <Typography sx={styles.footerText}>
                                    <b>Created On</b> : {job.createdOn}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                          ))}
                      </Grid>
                    </Box>
                  </Box>

                  {/* Menu */}
                  <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                    PaperProps={{ sx: styles.smallMenuPaper }}
                  >
                    <MenuItem
                      onClick={() => {
                        if (!selectedJob) return;
                        setIsViewOnly(true);
                        setJobToEdit(selectedJob);
                        setOpenReview(true);
                        handleMenuClose();
                      }}
                      sx={{ color: "#6b7280" }}
                    >
                      <ListItemIcon sx={{ color: "#6b7280" }}>
                        <VisibilityIcon />
                      </ListItemIcon>
                      <ListItemText>View</ListItemText>
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        if (!selectedJob) return;
                        setIsViewOnly(false);
                        setJobToEdit(selectedJob);
                        setOpenReview(true);
                        handleMenuClose();
                      }}
                      sx={{ color: "#6b7280" }}
                    >
                      <ListItemIcon sx={{ color: "#6b7280" }}>
                        <EditIcon />
                      </ListItemIcon>
                      <ListItemText>Edit</ListItemText>
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        if (!selectedJob) return;
                        handleDownloadJobDetails(selectedJob);
                      }}
                      sx={{ color: "#6b7280" }}
                    >
                      <ListItemIcon sx={{ color: "#6b7280" }}>
                        <DownloadIcon />
                      </ListItemIcon>
                      <ListItemText>Download</ListItemText>
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        if (!selectedJob) return;
                        handleDeleteJob(selectedJob);
                      }}
                      sx={{ color: "#86161B" }}
                    >
                      <ListItemIcon sx={{ color: "#86161B" }}>
                        <DeleteIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Delete</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Paper sx={styles.tableWrapperPaper}>
                    {/* HEADER TABLE */}
                    <Table size="small" sx={styles.tableStyles}>
                      <colgroup>
                        <col style={{ width: "17.5%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "14%" }} />
                        {/* <col style={{ width: "10%" }} /> */}
                        <col style={{ width: "12%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "16%" }} />
                      </colgroup>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={styles.th} onClick={() => toggleSort("title")}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5vh", cursor: "pointer" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: "0.5vh" }}>
                                <span>Job</span>
                                {sortState.key === "title" ? (
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
                                  toggleColumnExpansion("title");
                                }}
                                sx={adminHomeStyles.tableHeaderExpandButton}
                              >
                                {expandedColumns.has("title") ? (
                                  <ExpandLess sx={{ fontSize: "1.6vh", color: "#666" }} />
                                ) : (
                                  <ExpandMore sx={{ fontSize: "1.6vh", color: "#666" }} />
                                )}
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell sx={styles.th} onClick={() => toggleSort("role")}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: "0.5vh", cursor: "pointer" }}>
                              <span>Role</span>
                              {sortState.key === "role" ? (
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
                          <TableCell sx={styles.th} onClick={() => toggleSort("category")}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: "0.5vh", cursor: "pointer" }}>
                              <span>Category</span>
                              {sortState.key === "category" ? (
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
                          <TableCell sx={styles.th} onClick={() => toggleSort("avatar")}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: "0.5vh", cursor: "pointer" }}>
                              <span>Avatar</span>
                              {sortState.key === "avatar" ? (
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

                          <TableCell sx={styles.th} onClick={() => toggleSort("createdOn")}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5vh", cursor: "pointer" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: "0.5vh" }}>
                                <span>Created On</span>
                                {sortState.key === "createdOn" ? (
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
                            </Box>
                          </TableCell>
                          <TableCell sx={styles.th}>Status</TableCell>
                          <TableCell sx={styles.th}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                    </Table>
                    {/* BODY TABLE */}
                    <TableContainer component="div" sx={styles.tableContainerBox}>
                      <Table size="small" sx={styles.tableStyles}>
                        <colgroup>
                          <col style={{ width: "18%" }} />
                          <col style={{ width: "10%" }} />
                          <col style={{ width: "10%" }} />
                          <col style={{ width: "14%" }} />
                          <col style={{ width: "12%" }} />
                          <col style={{ width: "10%" }} />
                          <col style={{ width: "15%" }} />
                        </colgroup>
                        <TableBody>
                          {displayedJobs
                            .map((job) => (
                              <TableRow
                                key={job.id}
                                hover
                                sx={styles.tr}
                                onClick={() => navigate(`/job-details/${job.id}`, { state: { job } })}
                              >
                                {/* Job Title */}
                                <TableCell sx={styles.td} >
                                  <Box sx={{ display: "flex", flexDirection: "column", }}>
                                    <Tooltip title={job.title || ""} placement="top" arrow>
                                      <Typography sx={styles.tdBold}>{truncateTitle(job.title, 27)}</Typography>
                                    </Tooltip>
                                    {expandedColumns.has("title") && (
                                      <Tooltip title={job.id} placement="top" arrow>
                                        <span>
                                          <Typography sx={{ fontSize: "1.3vh", color: "#9CA3AF", marginTop: "0.3vh" }}>
                                            ID: {job.id}
                                          </Typography>
                                        </span>
                                      </Tooltip>
                                    )}
                                  </Box>
                                </TableCell>

                                {/* Role */}
                                <TableCell sx={styles.td}>{job.interview_setting?.role || "N/A"}</TableCell>

                                {/* Category */}
                                <TableCell sx={styles.td}>{job.interview_setting?.category || "N/A"}</TableCell>

                                {/* Avatar */}
                                <TableCell sx={styles.td}>
                                  <Tooltip
                                    title={
                                      Array.isArray(job.interview_setting?.avatarOptions)
                                        ? job.interview_setting.avatarOptions.join(", ")
                                        : job.interview_setting?.avatar || "N/A"
                                    }
                                    placement="top"
                                    arrow
                                  >
                                    <span style={{ display: "inline-block", width: "100%", cursor: "pointer" }}>
                                      {truncateTitle(
                                        Array.isArray(job.interview_setting?.avatarOptions)
                                          ? job.interview_setting.avatarOptions.join(", ")
                                          : job.interview_setting?.avatar || "N/A", 22)}
                                    </span>
                                  </Tooltip>
                                </TableCell>



                                {/* Created */}
                                <TableCell sx={styles.td}>{job.createdOn}</TableCell>

                                {/* Status */}
                                <TableCell sx={styles.td}>
                                  <Box sx={styles.statusBadge(job.status)}>
                                    {job.status || "Active"}
                                  </Box>
                                </TableCell>

                                {/* Actions */}
                                <TableCell sx={styles.td}>
                                  <Box sx={{ display: "flex", gap: "0.6vh" }}>
                                    <Tooltip title="View">
                                      <IconButton
                                        size="small"
                                        sx={{ color: "#6b7280" }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsViewOnly(true);
                                          setJobToEdit(job);
                                          setOpenReview(true);
                                        }}
                                      >
                                        <VisibilityIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Edit">
                                      <IconButton
                                        size="small"
                                        sx={{ color: "#6b7280" }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsViewOnly(false);
                                          setJobToEdit(job);
                                          setOpenReview(true);
                                        }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Download">
                                      <IconButton
                                        size="small"
                                        sx={{ color: "#6b7280" }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDownloadJobDetails(job);
                                        }}
                                      >
                                        <DownloadIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Delete">
                                      <IconButton
                                        size="small"
                                        sx={{ color: "#86161B" }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteJob(job);
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </>
              )}
            </Box>
          </Box>
        </Box>
        {/* Pagination Footer */}
        {jobs.length > 0 && (
          <PaginationFooter
            count={totalJobs}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              handleRowsPerPageChange(e);
              setPage(0);
            }}
            labelRowsPerPage="Rows per page:"
            rowsPerPageOptions={[10, 50, 100, 500]}
            showFirstButton
            showLastButton
            paginationStyles={{ ...adminHomeStyles.tablePagination, paddingRight: "3vh" }}
          />
        )}
      </Box>

      {/* Review & Submit Popup */}
      <Dialog
        open={openReview}
        onClose={() => {
          setOpenReview(false);
          setIsViewOnly(false);
        }}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: "49vw",
            height: "79vh",
            borderRadius: "1vh",
            overflow: "hidden",
          },
        }}
      >
        {reviewProps && (
          <ReviewSubmit
            key={jobToEdit?.id || "review"}
            {...reviewProps}
            viewOnly={isViewOnly}
            onClose={() => {
              setOpenReview(false);
              setIsViewOnly(false);
            }}
          />
        )}
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: "1vh",
            overflow: "hidden",
            maxWidth: "35vw",
          },
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(108deg, #004d40 0%, #00605a 45%, #004d40 100%)",
            color: "#fff",
            padding: "2vh 3vh",
            fontSize: "1.8vh",
            fontWeight: 600,
          }}
        >
          Delete Conversation
        </Box>
        <Box sx={{ padding: "3vh" }}>
          <Typography sx={{ color: "#333", fontSize: "1.5vh", marginBottom: "3vh" }}>
            Are you sure you want to delete this job? This action cannot be undone.
          </Typography>
          <Box sx={{ display: "flex", gap: "1.5vh", justifyContent: "flex-end" }}>
            <Button
              onClick={handleCloseDeleteDialog}
              sx={{
                color: "#00695c",
                border: "0.15vh solid #00695c",
                padding: "0.8vh 2vh",
                fontSize: "1.5vh",
                fontWeight: 500,
                textTransform: "none",
                borderRadius: "0.5vh",
                "&:hover": {
                  backgroundColor: "rgba(0, 105, 92, 0.08)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              sx={{
                backgroundColor: "#006b66",
                color: "#fff",
                padding: "0.8vh 2vh",
                fontSize: "1.5vh",
                fontWeight: 500,
                textTransform: "none",
                borderRadius: "0.5vh",
                "&:hover": {
                  backgroundColor: "#006b66",
                },
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default CreateJob;