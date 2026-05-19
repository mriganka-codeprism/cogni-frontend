import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  InputBase,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import React, { useEffect, useRef, useState } from "react";
import { globalStyles } from "../config";
import CloseIcon from "@mui/icons-material/Close";
import { ReactComponent as UploadIcon } from "../assets/images/upload.svg";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {
  candidateSelectionUploadResumes,
  getAllCandidates,
  candidateSelectionUploadFinish,
} from "../api/api";
import DoneIcon from "@mui/icons-material/Done";
import { SubmissionSummary } from "../pages/candidateSelection";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { arrayBufferToBase64 } from "../utils/helper";
import SearchIcon from "@mui/icons-material/Search";

const CHUNK_SIZE = 1023 * 1024; // 1MB

type Candidate = {
  Name: string;
  "Email Id": string;
  Comm_percent: number;
  Logi_percent: number;
  Tech_percent: number;
  Overall_percent: number;
  "Resume Uploaded": boolean;
  "Resume Filename": string | null;
};

interface UploadSelectionResumesProps {
  sessionId: string;
  setSubmissionSummary: React.Dispatch<React.SetStateAction<SubmissionSummary>>;
}

const UploadSelectionResumes: React.FC<UploadSelectionResumesProps> = ({
  sessionId,
  setSubmissionSummary,
}) => {
  const studentInputRef = useRef<HTMLInputElement>(null);
  const [resumes, setResumes] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [pendingResumeCount, setPendingResumeCount] = useState<number>(0);
  const [showExtraColumns, setShowExtraColumns] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    if (search) {
      const filtered = candidates.filter((candidate) =>
        candidate.Name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredCandidates(filtered);
    } else {
      setFilteredCandidates(candidates);
    }
  }, [search, candidates]);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await getAllCandidates(sessionId);
        const updatedCandidates = response.all_candidates.sort(
          (a: Candidate, b: Candidate) => a.Name.localeCompare(b.Name)
        );
        setCandidates(updatedCandidates);
        setPendingResumeCount(
          response.total_candidates - response.resumes_uploaded
        );
      } catch (error) {
        console.error(error);
      }
    };
    fetchCandidates();
  }, []);

  const handleUploadResumes = async (files: File[]) => {
    try {
      setLoading(true);
      const uploadId = `batch-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const fileMetas: Array<{
        fileName: string;
        fileSize: number;
        mimeType: string;
        totalChunks: number;
      }> = [];
      for (const file of files) {
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        fileMetas.push({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          totalChunks,
        });
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          const start = chunkIndex * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const blob = file.slice(start, end);
          const arrayBuffer = await blob.arrayBuffer();
          const chunkData = arrayBufferToBase64(arrayBuffer);
          const formData = new FormData();
          formData.append("file_name", file.name);
          formData.append("chunk_index", chunkIndex.toString());
          formData.append("chunk_data", chunkData);
          formData.append("total_chunks", totalChunks.toString());
          formData.append("file_size", file.size.toString());
          formData.append("mime_type", file.type);
          formData.append("upload_id", uploadId);
          await candidateSelectionUploadResumes(sessionId, formData);
        }
      }
      // After all chunks are uploaded, call finish
      const finishFormData = new FormData();
      finishFormData.append("upload_id", uploadId);
      const response = await candidateSelectionUploadFinish(
        sessionId,
        finishFormData
      );
      const updatedCandidates = response.all_candidates.sort(
        (a: Candidate, b: Candidate) => a.Name.localeCompare(b.Name)
      );
      setCandidates(updatedCandidates);
      setPendingResumeCount(
        response.total_candidates - response.resumes_uploaded
      );
      setSubmissionSummary({
        completeProfiles: response.resumes_uploaded,
        incompleteProfiles:
          response.total_candidates - response.resumes_uploaded,
        studentsMeetingCriteria: response.total_candidates,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography
        variant="subtitle1"
        fontWeight={600}
        sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
      >
        <DescriptionIcon sx={{ color: globalStyles.colors.primary }} /> Upload
        Resumes
      </Typography>
      <Paper
        variant="outlined"
        sx={{ p: 2, textAlign: "center", borderStyle: "dashed", mb: 1 }}
      >
        <UploadIcon />
        <Typography variant="body2" fontWeight={600}>
          Upload Resume Files
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select multiple PDF files or drag and drop them here
        </Typography>
        <input
          type="file"
          accept=".pdf"
          multiple
          style={{ display: "none" }}
          ref={studentInputRef}
          onChange={(e) => {
            if (e.target.files) {
              setResumes(Array.from(e.target.files));
              handleUploadResumes(Array.from(e.target.files));
            }
          }}
        />
        {/* Student File Upload Section */}
        {resumes.length > 0 ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: 1,
            }}
          >
            <Typography variant="caption" sx={{ mr: 1, color: "#16A34A" }}>
              {resumes.length} files{" "}
              {loading ? "uploading..." : "uploaded successfully"}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setResumes([])}
              sx={{ ml: 1 }}
              aria-label="Remove file"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Button
            variant="outlined"
            color="error"
            disabled={loading}
            onClick={() => studentInputRef.current?.click()}
            sx={{
              color: globalStyles.colors.primary,
              border: `0.832px solid ${globalStyles.colors.primary}`,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              ml: "auto",
            }}
          >
            Choose File
          </Button>
        )}
      </Paper>
      <Typography
        variant="subtitle1"
        fontWeight={600}
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <ErrorOutlineIcon color="warning" /> Pending Resume Uploads of Selected
        Candidates ({pendingResumeCount})
        <InputBase
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Candidate ID"
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: "0.875rem" }} />
            </InputAdornment>
          }
          sx={{
            width: "300px",
            ml: "auto",
            fontSize: "0.875rem",
            border: "1px solid rgba(224, 224, 224, 1)",
            borderRadius: "8px",
            padding: "0.5rem",
            background: "#fff",
            "& .MuiInputBase-input": {
              padding: "0",
            },
          }}
        />
      </Typography>
      <TableContainer sx={{ mt: "8px", flex: 1 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: "#eff3f5",
                  color: "#393939",
                  fontWeight: "600",
                  py: 1,
                }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#eff3f5",
                  color: "#393939",
                  fontWeight: "600",
                  py: 1,
                }}
              >
                Email
              </TableCell>
              {showExtraColumns && (
                <>
                  <TableCell
                    sx={{
                      backgroundColor: "#eff3f5",
                      color: "#393939",
                      fontWeight: "600",
                      py: 1,
                    }}
                  >
                    Comm Percent
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#eff3f5",
                      color: "#393939",
                      fontWeight: "600",
                      py: 1,
                    }}
                  >
                    Logi Percent
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#eff3f5",
                      color: "#393939",
                      fontWeight: "600",
                      py: 1,
                    }}
                  >
                    Tech Percent
                  </TableCell>
                </>
              )}
              <TableCell
                sx={{
                  backgroundColor: "#eff3f5",
                  color: "#393939",
                  fontWeight: "600",
                  py: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  Overall Percent
                  <IconButton
                    size="small"
                    onClick={() => setShowExtraColumns((prev) => !prev)}
                  >
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#eff3f5",
                  color: "#393939",
                  fontWeight: "600",
                  width: showExtraColumns ? undefined : "250px",
                  py: 1,
                }}
              >
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCandidates.map((candidate) => (
              <TableRow key={candidate["Email Id"]}>
                <TableCell>{candidate.Name}</TableCell>
                <TableCell>{candidate["Email Id"]}</TableCell>
                {showExtraColumns && (
                  <>
                    <TableCell>{candidate.Comm_percent}</TableCell>
                    <TableCell>{candidate.Logi_percent}</TableCell>
                    <TableCell>{candidate.Tech_percent}</TableCell>
                  </>
                )}
                <TableCell>{candidate.Overall_percent}</TableCell>
                <TableCell>
                  {candidate["Resume Uploaded"] ? (
                    <Chip
                      icon={<DoneIcon />}
                      label="Uploaded"
                      size="small"
                      sx={{
                        backgroundColor: "#E2FEE8",
                        color: "#238616",
                        fontWeight: 600,
                      }}
                    />
                  ) : (
                    <Chip
                      icon={<HighlightOffIcon />}
                      label="Not Uploaded"
                      size="small"
                      color="error"
                      sx={{
                        backgroundColor: "#FEE2E2",
                        color: "#991B1B",
                        fontWeight: 600,
                      }}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default UploadSelectionResumes;
