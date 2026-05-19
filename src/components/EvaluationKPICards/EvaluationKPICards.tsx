import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { Dayjs } from "dayjs";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useNavigate } from "react-router-dom";
import { generateSingleEvaluationReport, getSingleEvaluationProgress } from "../../api/api";
import { styles } from "../../styles/EvaluationKPICards.styles";
import totalinterviews from "../../assets/images/totalinterviews.png";
import evaluated from "../../assets/images/evaluated.png";
import notevaluated from "../../assets/images/notevaluated.png";
import selected from "../../assets/images/selected.png";
import notselected from "../../assets/images/notselected.png";
import defaulted from "../../assets/images/defaulted.png";

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
    case "rejected":
      return { background: "#F3F4F6", text: "#374151" };
    case "re interview":
      return { background: "#DBEAFE", text: "#1D4ED8" };
    case "in progress":
      return { background: "#FEF3C7", text: "#B45309" };
    case "on hold":
      return { background: "#EDE9FE", text: "#5B21B6" };
    case "not evaluated":
      return { background: "#E0F2FE", text: "#0369A1" };
    default:
      return { background: "#E0F2FE", text: "#0369A1" };
  }
};

const formatEvaluationLabel = (text: string) => {
  const normalized = text.replaceAll("_", " ").toLowerCase();
  if (normalized === "rejected") return "Defaulted";
  return text
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
};

type KPIData = {
  totalInterviews: number;
  evaluated: number;
  notEvaluated: number;
  selectedStudents: number;
  notSelected: number;
  defaulted: number;
};

type EvaluationKPICardsProps = {
  kpiData?: KPIData;
  candidates?: any[];
  filteredCandidates?: any[];
  jobId?: string;
  page?: number;
  rowsPerPage?: number;
  searchQuery?: string;
  evaluationStatusFilter?: string | null;
  dateRange?: { start: Dayjs | null; end: Dayjs | null };
  onKpiDataChange?: Dispatch<SetStateAction<KPIData>>;
  onTotalCountChange?: Dispatch<SetStateAction<number>>;
  onDelete?: (candidate: any) => void;
  onEvaluationComplete?: () => void;
};

export const candidateEvaluationData: any[] = [];

type EvalColumnKey = "name" | "email" | "experience" | "dateTime" | "duration";
type SortDir = "asc" | "desc" | null;

const EvaluationKPICards: React.FC<EvaluationKPICardsProps> = ({
  kpiData = {
    totalInterviews: 0,
    evaluated: 0,
    notEvaluated: 0,
    selectedStudents: 0,
    notSelected: 0,
    defaulted: 0,
  },
  candidates = [],
  filteredCandidates,
  onDelete,
  onEvaluationComplete,
}) => {
  const navigate = useNavigate();

  // --- Evaluation pipeline state ---
  const [activeEvaluations, setActiveEvaluations] = useState<{
    [conversationId: string]: NodeJS.Timeout;
  }>({});
  const activeEvaluationsRef = useRef(activeEvaluations);
  activeEvaluationsRef.current = activeEvaluations;

  const fetchSingleEvaluationProgress = async (
    conversationId: string,
    intervalId: NodeJS.Timeout
  ) => {
    try {
      const response = await getSingleEvaluationProgress(conversationId);
      if (response.status === "completed" || response.status === "failed") {
        clearInterval(intervalId);
        setActiveEvaluations((prev) => {
          const updated = { ...prev };
          delete updated[conversationId];
          return updated;
        });
        onEvaluationComplete?.();
      }
    } catch (error) {
      console.error("Error polling evaluation status:", error);
    }
  };

  const handleStartEvaluation = async (conversationId: string) => {
    try {
      if (activeEvaluations[conversationId]) {
        clearInterval(activeEvaluations[conversationId]);
      }
      setActiveEvaluations((prev) => ({
        ...prev,
        [conversationId]: 1 as any,
      }));

      await generateSingleEvaluationReport(conversationId);

      const intervalId = setInterval(() => {
        fetchSingleEvaluationProgress(conversationId, intervalId);
      }, 10000);

      setActiveEvaluations((prev) => ({
        ...prev,
        [conversationId]: intervalId,
      }));
    } catch (error) {
      console.error("Failed to generate evaluation:", error);
      setActiveEvaluations((prev) => {
        const newState = { ...prev };
        delete newState[conversationId];
        return newState;
      });
    }
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(activeEvaluationsRef.current).forEach((id) => clearInterval(id));
    };
  }, []);

  const getFilteredData = () => {
    return filteredCandidates || candidates;
  };

  const displayCandidates = getFilteredData();

  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());
  const [sortState, setSortState] = useState<{
    key: EvalColumnKey | null;
    dir: SortDir;
  }>({ key: null, dir: null });

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

  const toggleSort = (column: EvalColumnKey) => {
    setSortState((prev) => {
      if (prev.key !== column) return { key: column, dir: "asc" };
      if (prev.dir === "asc") return { key: column, dir: "desc" };
      if (prev.dir === "desc") return { key: null, dir: null };
      return { key: column, dir: "asc" };
    });
  };

  const getSortedCandidates = (list: any[]) => {
    if (!sortState.key || !sortState.dir) return list;

    return [...list].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortState.key) {
        case "name":
          aValue = (a.name || a.fullData?.name || a.fileName || "").toLowerCase();
          bValue = (b.name || b.fullData?.name || b.fileName || "").toLowerCase();
          break;
        case "email":
          aValue = (a.email || a.fullData?.email || "").toLowerCase();
          bValue = (b.email || b.fullData?.email || "").toLowerCase();
          break;
        case "experience":
          aValue = (a.experience || a.fullData?.experience || "").toLowerCase();
          bValue = (b.experience || b.fullData?.experience || "").toLowerCase();
          break;
        case "dateTime":
          aValue = (a.dateTime || a.fullData?.dateTime || "").toLowerCase();
          bValue = (b.dateTime || b.fullData?.dateTime || "").toLowerCase();
          break;
        case "duration":
          aValue = (a.duration || a.fullData?.duration || "").toLowerCase();
          bValue = (b.duration || b.fullData?.duration || "").toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortState.dir === "asc" ? -1 : 1;
      if (aValue > bValue) return sortState.dir === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortedCandidates = getSortedCandidates(displayCandidates);

  const kpiCards = [
    {
      label: "TOTAL INTERVIEWS",
      value: kpiData.totalInterviews,
      icon: <img src={totalinterviews} alt="" style={{ height: "2.3vh", width: "2.3vh" }} />,
      color: "#006b66",
    },
    {
      label: "EVALUATED",
      value: kpiData.evaluated,
      icon: <img src={evaluated} alt="" style={{ height: "2.3vh", width: "2.3vh" }} />,
      color: "#006b66",
    },
    {
      label: "NOT EVALUATED",
      value: kpiData.notEvaluated,
      icon: <img src={notevaluated} alt="" style={{ height: "2.3vh", width: "2.3vh" }} />,
      color: "#f59e0b",
    },
    {
      label: "SELECTED STUDENTS",
      value: kpiData.selectedStudents,
      icon: <img src={selected} alt="" style={{ height: "2.3vh", width: "2.3vh" }} />,
      color: "#006b66",
    },
    {
      label: "NOT SELECTED",
      value: kpiData.notSelected,
      icon: <img src={notselected} alt="" style={{ height: "2.3vh", width: "2.3vh" }} />,
      color: "#991b1b",
    },
    {
      label: "DEFAULTED",
      value: kpiData.defaulted,
      icon: <img src={defaulted} alt="" style={{ height: "2.3vh", width: "2.3vh" }} />,
      color: "#991b1b",
    },
  ];


  const handleViewEvaluation = (row: any) => {
    const evaluationState = {
      conversationId: row.id,
      evaluationStatus: row.evaluationStatus,
      name: row.name,
      collegeName: row.college,
      date: row.fullData?.startedAt,
      duration: row.fullData?.durationMs,
    };
    sessionStorage.setItem(
      "candidateEvaluation_viewingState",
      JSON.stringify(evaluationState)
    );
    sessionStorage.setItem("candidateEvaluation_lastLeftView", "detail");
    navigate(`/candidate-evaluation/${row.id}`, {
      state: evaluationState,
    });
  };

  return (
    <Box sx={styles.container}>
      {/* KPI Cards Section */}
      <Box sx={styles.kpiContainer}>
        {kpiCards.map((card, index) => (
          <Box key={index} sx={styles.kpiCard}>
            <Box sx={styles.kpiIconBox}>
              <Box sx={{ ...styles.kpiIcon, color: card.color }}>
                {card.icon}
              </Box>
            </Box>
            <Box sx={styles.kpiContent}>
              <Typography sx={styles.kpiLabel}>{card.label}</Typography>
              <Typography sx={{ ...styles.kpiValue, color: card.color }}>
                {card.value.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Table Container */}
      <Box sx={{ ...styles.tableContainer, height: "auto", overflow: "hidden", pb: 0 }}>
        {/* HEADER TABLE */}
        <Table sx={{ ...styles.candidatesTable, borderBottom: "1px solid #e5e7eb" }}>
          <colgroup>
            <col style={{ width: "12%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "13.5%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "14%" }} />
          </colgroup>
          <TableHead>
            <TableRow sx={styles.tableHeaderRow}>
              <TableCell sx={styles.tableHeaderCell} onClick={() => toggleSort("name")} style={{ cursor: "pointer" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5vh" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "0.5vh" }}>
                    <span>Name</span>
                    {sortState.key === "name" ? (
                      <ArrowDownwardIcon
                        sx={{
                          fontSize: "1.6vh", color: "#900B09",
                          transform: sortState.dir === "asc" ? "rotate(180deg)" : "none",
                        }}
                      />
                    ) : (
                      <SwapVertIcon sx={{ fontSize: "2vh", color: "#ccc" }} />
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleColumnExpansion("name");
                    }}
                    sx={{ padding: 0 }}
                  >
                    {expandedColumns.has("name") ? (
                      <ExpandLess sx={{ fontSize: "1.6vh", color: "#666" }} />
                    ) : (
                      <ExpandMore sx={{ fontSize: "1.6vh", color: "#666" }} />
                    )}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell sx={styles.tableHeaderCell}>Candidate ID</TableCell>
              <TableCell sx={styles.tableHeaderCell} onClick={() => toggleSort("email")} style={{ cursor: "pointer" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "0.5vh" }}>
                  <span>Email</span>
                  {sortState.key === "email" ? (
                    <ArrowDownwardIcon
                      sx={{
                        fontSize: "1.6vh", color: "#900B09",
                        transform: sortState.dir === "asc" ? "rotate(180deg)" : "none",
                      }}
                    />
                  ) : (
                    <SwapVertIcon sx={{ fontSize: "2vh", color: "#ccc" }} />
                  )}
                </Box>
              </TableCell>
              <TableCell sx={styles.tableHeaderCell} onClick={() => toggleSort("experience")} style={{ cursor: "pointer" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "0.5vh" }}>
                  <span>Experience</span>
                  {sortState.key === "experience" ? (
                    <ArrowDownwardIcon
                      sx={{
                        fontSize: "1.6vh", color: "#900B09",
                        transform: sortState.dir === "asc" ? "rotate(180deg)" : "none",
                      }}
                    />
                  ) : (
                    <SwapVertIcon sx={{ fontSize: "2vh", color: "#ccc" }} />
                  )}
                </Box>
              </TableCell>
              <TableCell sx={styles.tableHeaderCell} onClick={() => toggleSort("dateTime")} style={{ cursor: "pointer" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "0.5vh" }}>
                  <span>Date & Time</span>
                  {sortState.key === "dateTime" ? (
                    <ArrowDownwardIcon
                      sx={{
                        fontSize: "1.6vh", color: "#900B09",
                        transform: sortState.dir === "asc" ? "rotate(180deg)" : "none",
                      }}
                    />
                  ) : (
                    <SwapVertIcon sx={{ fontSize: "2vh", color: "#ccc" }} />
                  )}
                </Box>
              </TableCell>
              <TableCell sx={styles.tableHeaderCell} onClick={() => toggleSort("duration")} style={{ cursor: "pointer" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "0.5vh" }}>
                  <span>Duration</span>
                  {sortState.key === "duration" ? (
                    <ArrowDownwardIcon
                      sx={{
                        fontSize: "1.6vh", color: "#900B09",
                        transform: sortState.dir === "asc" ? "rotate(180deg)" : "none",
                      }}
                    />
                  ) : (
                    <SwapVertIcon sx={{ fontSize: "2vh", color: "#ccc" }} />
                  )}
                </Box>
              </TableCell>
              <TableCell sx={styles.tableHeaderCell}>Call Status</TableCell>
              <TableCell sx={styles.tableHeaderCell}>Evaluation Status</TableCell>
              <TableCell sx={styles.tableHeaderCell}>Actions</TableCell>
            </TableRow>
          </TableHead>
        </Table>

        {/* BODY TABLE */}
        <TableContainer sx={{ maxHeight: "28vh", overflowY: "auto", overflowX: "hidden", scrollbarWidth: "thin" }}>
          <Table sx={styles.candidatesTable}>
            <colgroup>
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "11.5%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "14%" }} />
            </colgroup>
            <TableBody>
              {sortedCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ color: "#6b7280", fontSize: "1.3vh" }}>
                      No candidates found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedCandidates.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography sx={{ fontSize: "1.3vh", color: "#374151" }}>{row.name}</Typography>
                        {expandedColumns.has("name") && (
                          <Typography sx={{ fontSize: "1.1vh", color: "#9CA3AF", marginTop: "0.3vh" }}>
                            ID: {row.id || "N/A"}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{row.id || "N/A"}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.experience}</TableCell>
                    <TableCell>{row.dateTime}</TableCell>
                    <TableCell>{row.duration}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: "0.5vh" }}>
                        <Box
                          sx={{
                            width: "0.8vh",
                            height: "0.8vh",
                            borderRadius: "50%",
                            backgroundColor: "#10b981",
                          }}
                        />
                        {row.callStatus}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "inline-block",
                          px: 2.5,
                          py: 1,
                          borderRadius: "1vh",
                          backgroundColor: getEvaluationStatusColors(row.evaluationStatus).background,
                          color: getEvaluationStatusColors(row.evaluationStatus).text,
                          fontWeight: 600,
                          fontSize: "1.2vh",
                          textAlign: "center",
                          minWidth: "12vh",
                        }}
                      >
                        {formatEvaluationLabel(row.evaluationStatus || "Not Evaluated")}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: "0.5vh", flexWrap: "nowrap" }}>
                        {row.overallScore ? (
                          <Button
                            variant="outlined"
                            size="small"
                            disabled={row.evaluationStatus === "Disqualified"}
                            onClick={() => handleViewEvaluation(row)}
                            sx={{
                              backgroundColor: "transparent",
                              color: "#86161B",
                              borderColor: "#86161B",
                              textTransform: "none",
                              fontSize: "1.2vh",
                              fontWeight: "bold",
                              padding: "0.5vh 0.8vh",
                              borderRadius: "0.8vh",
                              whiteSpace: "nowrap",
                              minWidth: "auto",
                              "&:hover": {
                                backgroundColor: "rgba(153, 27, 27, 0.04)",
                                borderColor: "#900B09",
                              },
                            }}
                          >
                            View Evaluation
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
                            disabled={row.evaluationStatus === "Disqualified" || activeEvaluations[row.id] !== undefined}
                            onClick={() => handleStartEvaluation(row.id)}
                            sx={{
                              backgroundColor: "#86161B",
                              color: "white",
                              textTransform: "none",
                              fontSize: "1.2vh",
                              fontWeight: "bold",
                              padding: "0.5vh 0.8vh",
                              borderRadius: "0.8vh",
                              whiteSpace: "nowrap",
                              minWidth: "auto",
                              "&:hover": { backgroundColor: "#900B09" },
                            }}
                          >
                            {activeEvaluations[row.id] !== undefined ? (
                              <>
                                <CircularProgress size={12} sx={{ color: "white", mr: 0.5 }} />
                                Evaluating...
                              </>
                            ) : (
                              "Evaluate"
                            )}
                          </Button>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => onDelete?.(row)}
                            sx={{
                              color: "#86161B",
                              backgroundColor: "white",
                              border: "1px solid #86161B",
                              padding: "0.4rem",
                              borderRadius: "1vh",
                              "&:hover": { backgroundColor: "#ffd5cd" },
                            }}
                          >
                            <DeleteOutlineIcon sx={{ fontSize: "1.6vh" }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

    </Box>
  );
};

export default EvaluationKPICards;
