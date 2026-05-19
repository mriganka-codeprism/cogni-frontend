import React, { useState, Dispatch, SetStateAction } from "react";
import { Dayjs } from "dayjs";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TableContainer,
  CircularProgress,
} from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { GridView, ViewList } from "@mui/icons-material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import Trash2 from "../../assets/images/Trash2.png";
import down from "../../assets/images/down.png";
import play from "../../assets/images/play.png";
interface Candidate {
  id?: string;
  name: string;
  email: string;
  college?: string;
  experience?: string;
  dateTime: string;
  duration: string;
  callStatus: string;
  evaluationStatus: string;
}

interface InterviewRecordingsProps {
  candidates?: Candidate[];
  viewMode?: "table" | "grid";
  onViewModeChange?: (mode: "table" | "grid") => void;
  gridColumns?: number;
  cardVariant?: "default" | "compact" | "candidate-info";
  containerHeight?: string;
  filteredCandidates?: any[];
  evaluationStatusFilter?: string | null;
  callStatusFilter?: string | null;
  collegeFilter?: string | null;
  jobId?: string;
  page?: number;
  rowsPerPage?: number;
  searchQuery?: string;
  dateRange?: { start: Dayjs | null; end: Dayjs | null };
  onTotalCountChange?: Dispatch<SetStateAction<number>>;
  onViewRecording?: (candidate: any) => void;
  onDelete?: (candidate: any) => void;
  onDownload?: (candidate: any) => void;
  downloadingRooms?: Set<string>;
}


export const interviewRecordingsData: Candidate[] = [];

const getEvaluationStatusColor = (status: string) => {
  switch (status) {
    case "Re Interview":
      return "#EBF2FF";
    case "Not Evaluated":
      return "#EBF8FF";
    case "Defaulted":
      return "#fee2e2";
    default:
      return "#dbeafe";
  }
};

const getEvaluationStatusTextColor = (status: string) => {
  switch (status) {
    case "Re Interview":
      return "#4C88FF";
    case "Not Evaluated":
      return "#4CB5FF";
    case "Defaulted":
      return "#dc2626";
    default:
      return "#0ea5e9";
  }
};

type RECColumnKey = "name" | "email" | "dateTime" | "duration";
type SortDir = "asc" | "desc" | null;

const InterviewRecordings: React.FC<InterviewRecordingsProps> = ({
  candidates = [],
  viewMode = "table",
  onViewModeChange,
  gridColumns = 4,
  cardVariant = "default",
  containerHeight = "41vh",
  filteredCandidates,
  evaluationStatusFilter,
  callStatusFilter,
  collegeFilter,
  onViewRecording,
  onDelete,
  onDownload,
  downloadingRooms,
}) => {
  // Use filteredCandidates if provided (from parent with filtering applied),
  // Otherwise use the raw candidates with filter logic
  const getFilteredData = () => {
    let data = filteredCandidates || candidates;

    // Apply evaluation status filter if not already filtered by parent
    if (!filteredCandidates && evaluationStatusFilter) {
      data = data.filter(
        (candidate: any) => (candidate.evaluationStatus || candidate.evaluation_status || candidate.candidate_status || candidate.fullData?.evaluationStatus || candidate.fullData?.evaluation_status || candidate.fullData?.candidate_status) === evaluationStatusFilter
      );
    }

    // Apply call status filter if not already filtered by parent
    if (!filteredCandidates && callStatusFilter) {
      data = data.filter(
        (candidate: any) => (candidate.callStatus || candidate.call_status || candidate.fullData?.callStatus || candidate.fullData?.call_status) === callStatusFilter
      );
    }

    // Apply college filter if not already filtered by parent
    if (!filteredCandidates && collegeFilter) {
      data = data.filter(
        (candidate: any) => (candidate.college || candidate.College || candidate.college_name || candidate.fullData?.college || candidate.fullData?.College || candidate.fullData?.college_name) === collegeFilter
      );
    }

    return data;
  };

  const displayCandidates = getFilteredData();

  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());
  const [sortState, setSortState] = useState<{
    key: RECColumnKey | null;
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

  const toggleSort = (column: RECColumnKey) => {
    setSortState((prev) => {
      if (prev.key !== column) return { key: column, dir: "asc" };
      if (prev.dir === "asc") return { key: column, dir: "desc" };
      if (prev.dir === "desc") return { key: null, dir: null };
      return { key: column, dir: "asc" };
    });
  };

  const getSortedCandidates = (list: Candidate[]) => {
    if (!sortState.key || !sortState.dir) return list;

    return [...list].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortState.key) {
        case "name":
          aValue = (a.name || "").toLowerCase();
          bValue = (b.name || "").toLowerCase();
          break;
        case "email":
          aValue = (a.email || "").toLowerCase();
          bValue = (b.email || "").toLowerCase();
          break;
        case "dateTime":
          aValue = (a.dateTime || "").toLowerCase();
          bValue = (b.dateTime || "").toLowerCase();
          break;
        case "duration":
          aValue = (a.duration || "").toLowerCase();
          bValue = (b.duration || "").toLowerCase();
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

  const handleViewModeChange = (mode: "table" | "grid") => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  return (
    <Box sx={{ width: "97.5%", marginLeft: "2vh" }}>
      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <Box sx={{
          borderRadius: "1vh", border: "1px solid #e5e7eb", backgroundColor: "#fff", overflow: "hidden"
        }}>
          <Table sx={{ borderBottom: "1px solid #e5e7eb" }}>
            <colgroup>
              <col style={{ width: "14%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "17.5%" }} />
            </colgroup>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                <TableCell
                  onClick={() => toggleSort("name")}
                  sx={{ fontWeight: 700, fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#374151", padding: "1.2vh 1.5vh", backgroundColor: "#f9fafb", cursor: "pointer" }}
                >
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
                <TableCell
                  sx={{ fontWeight: 700, fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#374151", padding: "1.2vh 1.5vh", backgroundColor: "#f9fafb" }}
                >
                  Candidate ID
                </TableCell>
                <TableCell
                  onClick={() => toggleSort("email")}
                  sx={{ fontWeight: 700, fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#374151", padding: "1.2vh 1.5vh", backgroundColor: "#f9fafb", cursor: "pointer" }}
                >
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
                <TableCell
                  onClick={() => toggleSort("dateTime")}
                  sx={{ fontWeight: 700, fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#374151", padding: "1.2vh 1.5vh", backgroundColor: "#f9fafb", cursor: "pointer" }}
                >
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
                <TableCell
                  onClick={() => toggleSort("duration")}
                  sx={{ fontWeight: 700, fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#374151", padding: "1.2vh 1.5vh", backgroundColor: "#f9fafb", cursor: "pointer" }}
                >
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
                <TableCell sx={{ fontWeight: 700, fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#374151", padding: "1.2vh 1.5vh", backgroundColor: "#f9fafb" }}>
                  Call Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#374151", padding: "1.2vh 1.5vh", backgroundColor: "#f9fafb" }}>
                  Candidate Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#374151", padding: "1.2vh 1.5vh", backgroundColor: "#f9fafb" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
          </Table>
          <TableContainer sx={{
            maxHeight: containerHeight,
            overflowY: "auto",
            overflowX: "hidden", scrollbarWidth: "thin"
          }}>
            <Table>
              <colgroup>
                <col style={{ width: "14%" }} />
                <col style={{ width: "14.2%" }} />
                <col style={{ width: "15.2%" }} />
                <col style={{ width: "11.3%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "17.5%" }} />
              </colgroup>
              <TableBody>
                {sortedCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography sx={{ color: "#6b7280", fontSize: "1.3vh", fontFamily: "Poppins, sans-serif" }}>
                        No candidates found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedCandidates.map((candidate, index) => (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "#f9fafb" } }}>
                      <TableCell sx={{ fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#374151", padding: "1.2vh 1.5vh" }}>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Typography sx={{ fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#374151" }}>{candidate.name}</Typography>
                          {expandedColumns.has("name") && (
                            <Typography sx={{ fontSize: "1.1vh", fontFamily: "Poppins, sans-serif", color: "#9CA3AF", marginTop: "0.3vh" }}>
                              ID: {candidate.id || "N/A"}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#374151", padding: "1.2vh 1.5vh" }}>
                        {candidate.id || "N/A"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#374151", padding: "1.2vh 1.5vh" }}>
                        {candidate.email}
                      </TableCell>
                      <TableCell sx={{ fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#374151", padding: "1.2vh 1.5vh" }}>
                        {candidate.dateTime}
                      </TableCell>
                      <TableCell sx={{ fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#374151", padding: "1.2vh 1.5vh" }}>
                        {candidate.duration}
                      </TableCell>
                      <TableCell sx={{ fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#374151", padding: "1.2vh 1.5vh" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "0.5vh" }}>
                          <Box
                            sx={{
                              width: "0.8vh",
                              height: "0.8vh",
                              borderRadius: "50%",
                              backgroundColor: "#10b981",
                            }}
                          />
                          {candidate.callStatus}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#374151", padding: "1.2vh 1.5vh", }}>
                        <Box
                          sx={{
                            display: "inline-block",
                            px: 2.5,
                            py: 1,
                            borderRadius: "1.5vh",
                            backgroundColor: getEvaluationStatusColor(candidate.evaluationStatus),
                            color: getEvaluationStatusTextColor(candidate.evaluationStatus),
                            fontWeight: 600,
                            fontSize: "1.2vh",
                            fontFamily: "Poppins, sans-serif",
                            textAlign: "center",
                            minWidth: "12vh",
                          }}
                        >
                          {candidate.evaluationStatus}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: "1.3vh", fontFamily: "Poppins, sans-serif", color: "#374151", padding: "1.2vh 1.5vh" }}>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={candidate.callStatus === "In Progress"}
                          onClick={() => onViewRecording?.(candidate)}
                          startIcon={<img src={play} alt="" style={{ height: "1.2vh", width: "auto" }} />}
                          sx={{
                            backgroundColor: candidate.callStatus === "In Progress" ? "#bdbdbd" : "#800000",
                            color: "white",
                            textTransform: "none",
                            fontSize: "1.2vh",
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: "bold",
                            padding: "0.5vh 0.8vh",
                            marginRight: "0.5vh",
                            borderRadius: "1vh",
                            width: "14vh",
                            "&:hover": { backgroundColor: candidate.callStatus === "In Progress" ? "#bdbdbd" : "#800000" },
                          }}
                        >
                          View Recording
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => onDelete?.(candidate)}
                          sx={{
                            color: "#900B09",
                            backgroundColor: "white",
                            border: "1px solid #A6202133",
                            padding: "0.4rem",
                            marginRight: "0.8vh",
                            marginLeft: "0.5vh",
                            borderRadius: "1vh",
                            "&:hover": { backgroundColor: "#ffd5cd" },
                          }}
                        >
                          <img src={Trash2} alt="" style={{ height: "1.6vh", width: "auto" }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          disabled={downloadingRooms?.has((candidate as any).roomName)}
                          onClick={() => onDownload?.(candidate)}
                          sx={{
                            color: "#900B09",
                            backgroundColor: "white",
                            border: "1px solid #A6202133",
                            padding: "0.4rem",
                            borderRadius: "1vh",
                            "&:hover": { backgroundColor: "#ffd5cd" },
                          }}
                        >
                          {downloadingRooms?.has((candidate as any).roomName) ? (
                            <CircularProgress size={12} sx={{ color: "#900B09" }} />
                          ) : (
                            <img src={down} alt="" style={{ height: "1.6vh", width: "auto" }} />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
            gap: "1vh",
            padding: "1.5vh 0.2vh",
            maxHeight: containerHeight,
            overflowY: "auto",
            overflowX: "hidden",
            "&::-webkit-scrollbar": {
              width: "0.6vh",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#d1d5db",
              borderRadius: "0.3vh",
              "&:hover": {
                backgroundColor: "#9ca3af",
              },
            },
            "@media (max-width: 1400px)": {
              gridTemplateColumns: "repeat(4, 1fr)",
            },
            "@media (max-width: 1000px)": {
              gridTemplateColumns: "repeat(3, 1fr)",
            },
            "@media (max-width: 768px)": {
              gridTemplateColumns: "repeat(2, 1fr)",
            },
            "@media (max-width: 480px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          {displayCandidates.length === 0 ? (
            <Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 6 }}>
              <Typography sx={{ color: "#6b7280", fontSize: "1.3vh", fontFamily: "Poppins, sans-serif" }}>No candidates found</Typography>
            </Box>
          ) : (
            displayCandidates.map((candidate, index) => {
              if (cardVariant === "candidate-info") {
                return (
                  <Box
                    key={index}
                    sx={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      //borderLeft: "4px solid #006b66",
                      borderRadius: "0.8vh",
                      padding: "1.2vh",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.8vh",
                      position: "relative",
                      transition: "all 0.3s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      "&:hover": {
                        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                        borderColor: "#d1d5db",
                      },
                    }}
                  >
                    {/* Status Badge in Top Right */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: "1.2vh",
                        right: "1.2vh",
                        px: 1.5,
                        py: 0.4,
                        borderRadius: "0.6vh",
                        backgroundColor: getEvaluationStatusColor(candidate.evaluationStatus),
                        color: getEvaluationStatusTextColor(candidate.evaluationStatus),
                        fontWeight: 600,
                        fontSize: "0.9vh",
                        fontFamily: "Poppins, sans-serif",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {candidate.evaluationStatus}
                    </Box>

                    {/* Name and ID */}
                    <Box sx={{ pr: "8vh" }}>
                      <Typography sx={{ fontWeight: 700, fontSize: "1.4vh", fontFamily: "Poppins, sans-serif", color: "#111827" }}>
                        {candidate.name}
                      </Typography>
                      <Typography sx={{ fontSize: "1.1vh", fontFamily: "Poppins, sans-serif", color: "#6b7280", marginTop: "0.1vh" }}>
                        ID: {candidate.id || "N/A"}
                      </Typography>
                    </Box>

                    {/* Details with Icons */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "0.6vh", marginTop: "0.2vh" }}>
                      {/* College */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: "0.8vh", color: "#6b7280" }}>
                        <SchoolOutlinedIcon sx={{ fontSize: "1.3vh" }} />
                        <Typography sx={{ fontSize: "1.1vh", fontFamily: "Poppins, sans-serif" }}>{candidate.college || "N/A"}</Typography>
                      </Box>

                      {/* Duration */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: "0.8vh", color: "#6b7280" }}>
                        <AccessTimeIcon sx={{ fontSize: "1.3vh" }} />
                        <Typography sx={{ fontSize: "1.1vh", fontFamily: "Poppins, sans-serif" }}>{candidate.duration}</Typography>
                      </Box>

                      {/* Date Time */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: "0.8vh", color: "#6b7280" }}>
                        <CalendarTodayOutlinedIcon sx={{ fontSize: "1.3vh" }} />
                        <Typography sx={{ fontSize: "1.1vh", fontFamily: "Poppins, sans-serif" }}>{candidate.dateTime}</Typography>
                      </Box>

                      {/* Email */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: "0.8vh", color: "#6b7280" }}>
                        <MailOutlinedIcon sx={{ fontSize: "1.3vh" }} />
                        <Typography sx={{ fontSize: "1.1vh", fontFamily: "Poppins, sans-serif", wordBreak: "break-all" }}>{candidate.email}</Typography>
                      </Box>
                    </Box>

                    {/* Action Buttons Row */}
                    <Box sx={{ display: "flex", gap: "0.8vh", alignItems: "center", marginTop: "0.6vh" }}>
                      <Button
                        variant="contained"
                        disabled={candidate.callStatus === "In Progress"}
                        onClick={() => onViewRecording?.(candidate)}
                        startIcon={<img src={play} alt="" style={{ height: "1.2vh", width: "auto" }} />}
                        sx={{
                          backgroundColor: candidate.callStatus === "In Progress" ? "#bdbdbd" : "#800000",
                          color: "white",
                          textTransform: "none",
                          fontSize: "1.1vh",
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: "bold",
                          padding: "0.7vh 1.2vh",
                          borderRadius: "0.6vh",
                          flex: 1,
                          height: "3.5vh",
                          "&:hover": { backgroundColor: candidate.callStatus === "In Progress" ? "#bdbdbd" : "#800000" },
                        }}
                      >
                        View Recording
                      </Button>
                      <Box sx={{ display: "flex", gap: "0.6vh" }}>
                        <IconButton
                          size="small"
                          disabled={downloadingRooms?.has((candidate as any).roomName)}
                          onClick={() => onDownload?.(candidate)}
                          sx={{
                            color: "#900B09",
                            backgroundColor: "white",
                            border: "1px solid #A6202133",
                            padding: "0.5rem",
                            borderRadius: "0.6vh",
                            width: "3.5vh",
                            height: "3.5vh",
                            "&:hover": { backgroundColor: "#ffd5cd" },
                          }}
                        >
                          {downloadingRooms?.has((candidate as any).roomName) ? (
                            <CircularProgress size={12} sx={{ color: "#900B09" }} />
                          ) : (
                            <DownloadOutlinedIcon sx={{ fontSize: "1.2rem" }} />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => onDelete?.(candidate)}
                          sx={{
                            color: "#900B09",
                            backgroundColor: "white",
                            border: "1px solid #A6202133",
                            padding: "0.5rem",
                            borderRadius: "0.6vh",
                            width: "3.5vh",
                            height: "3.5vh",
                            "&:hover": { backgroundColor: "#ffd5cd" },
                          }}
                        >
                          <DeleteOutlinedIcon sx={{ fontSize: "1.2rem" }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                );
              }

              return (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: cardVariant === "compact" ? "0.8vh" : "1vh",
                    padding: cardVariant === "compact" ? "1.2vh" : "1.5vh",
                    display: "flex",
                    flexDirection: "column",
                    gap: cardVariant === "compact" ? "0.8vh" : "1.2vh",
                    transition: "all 0.3s ease",
                    boxShadow: cardVariant === "compact" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    "&:hover": {
                      boxShadow: cardVariant === "compact" ? "0 2px 8px rgba(0,0,0,0.12)" : "0 4px 12px rgba(0,0,0,0.1)",
                      borderColor: "#d1d5db",
                    },
                  }}
                >
                  {/* Candidate Name and Status Badge Row */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.4vh", fontFamily: "Poppins, sans-serif", color: "#111827", flex: 1 }}>
                      {candidate.name}
                    </Typography>
                    <Box
                      sx={{
                        display: "inline-flex",
                        px: 1.5,
                        py: 0.4,
                        borderRadius: "0.6vh",
                        backgroundColor: getEvaluationStatusColor(candidate.evaluationStatus),
                        color: getEvaluationStatusTextColor(candidate.evaluationStatus),
                        fontWeight: 600,
                        fontSize: "0.9vh",
                        fontFamily: "Poppins, sans-serif",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {candidate.evaluationStatus}
                    </Box>
                  </Box>

                  {/* Duration with Icon */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: "0.6vh", color: "#6b7280", fontSize: "1.1vh", fontFamily: "Poppins, sans-serif" }}>
                    <AccessTimeIcon sx={{ fontSize: "1.3vh" }} />
                    <Typography sx={{ fontSize: "1.1vh", fontFamily: "Poppins, sans-serif" }}>{candidate.duration}</Typography>
                  </Box>

                  {/* Experience with Icon */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: "0.6vh", color: "#6b7280", fontSize: "1.1vh" }}>
                    <BusinessCenterIcon sx={{ fontSize: "1.3vh" }} />
                    <Typography sx={{ fontSize: "1.1vh", fontFamily: "Poppins, sans-serif" }}>{candidate.experience || "—"}</Typography>
                  </Box>

                  {/* Email */}
                  <Box sx={{ color: "#6b7280", fontSize: "0.95vh", fontFamily: "Poppins, sans-serif", wordBreak: "break-word", minHeight: "2.5vh" }}>
                    <Typography sx={{ fontSize: "0.95vh", fontFamily: "Poppins, sans-serif" }}>{candidate.email}</Typography>
                  </Box>

                  {/* View Recording Button and Action Icons - Single Line */}
                  <Box sx={{ display: "flex", gap: "0.8vh", alignItems: "center", justifyContent: "space-between", marginTop: "0.6vh" }}>
                    <Button
                      variant="contained"
                      disabled={candidate.callStatus === "In Progress"}
                      onClick={() => onViewRecording?.(candidate)}
                      startIcon={<img src={play} alt="" style={{ height: "1.2vh", width: "auto" }} />}
                      sx={{
                        backgroundColor: candidate.callStatus === "In Progress" ? "#bdbdbd" : "#900B09",
                        color: "white",
                        textTransform: "none",
                        fontSize: "1.1vh",
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: "bold",
                        padding: "0.7vh 1.2vh",
                        borderRadius: "0.6vh",
                        flex: 1,
                        height: "3.5vh",
                        "&:hover": { backgroundColor: candidate.callStatus === "In Progress" ? "#bdbdbd" : "#900B09" },
                      }}
                    >
                      View Recording
                    </Button>
                    <Box sx={{ display: "flex", gap: "0.6vh" }}>
                      <IconButton
                        size="small"
                        disabled={downloadingRooms?.has((candidate as any).roomName)}
                        onClick={() => onDownload?.(candidate)}
                        sx={{
                          color: "#900B09",
                          backgroundColor: "white",
                          border: "1px solid #A6202133",
                          padding: "0.5rem",
                          borderRadius: "0.6vh",
                          "&:hover": { backgroundColor: "#ffd5cd" },
                        }}
                      >
                        {downloadingRooms?.has((candidate as any).roomName) ? (
                          <CircularProgress size={12} sx={{ color: "#900B09" }} />
                        ) : (
                          <DownloadOutlinedIcon sx={{ fontSize: "1.2rem" }} />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDelete?.(candidate)}
                        sx={{
                          color: "#900B09",
                          backgroundColor: "white",
                          border: "1px solid #A6202133",
                          padding: "0.5rem",
                          borderRadius: "0.6vh",
                          "&:hover": { backgroundColor: "#ffd5cd" },
                        }}
                      >
                        <DeleteOutlinedIcon sx={{ fontSize: "1.2rem" }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      )}
    </Box>
  );
};

export default InterviewRecordings;
