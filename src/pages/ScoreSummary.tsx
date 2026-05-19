import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  Button,
  Tooltip,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LaunchIcon from "@mui/icons-material/Launch";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { styles } from "../styles/ScoreSummary.styles";
import { routes } from "../constants/routes";
import { getAtsJobById, getAtsJobs } from "../api/api";
import CandidateAnalysisModal from "../components/CandidateAnalysisModal/CandidateAnalysisModal";
import { saveResumeResponses } from "../utils/resumeStorage";
import { getAtsEvaluations } from "../api/api";

const ScoreSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [showSnackbar, setShowSnackbar] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [openTooltip, setOpenTooltip] = useState<number | null>(null);

  // Function to navigate to JobDetails with job data
  const handleJobDetailsClick = () => {
    if (!id) return;
    navigate(routes.jobDetails.replace(":id", id), {
      state: { job: (location.state as any)?.job, tab: 2 }, // tab: 2 for Candidate Scores
      replace: true
    });
  };

  // ✅ IMPORTANT: read ATS result correctly
  const evaluationData =
    (location.state as any)?.summary ||
    (location.state as any)?.result ||
    location.state || [];

  useEffect(() => {
    console.log(" ATS Response:", location.state);

    // ✅ Save evaluation responses to localStorage
    if (id && evaluationData && Array.isArray(evaluationData) && evaluationData.length > 0) {
      saveResumeResponses(id, evaluationData);
    }

    const timer = setTimeout(() => setShowSnackbar(false), 5000);
    return () => clearTimeout(timer);
  }, [location.state, id]);

  // ✅ Close tooltip on scroll
  useEffect(() => {
    const handleScroll = () => {
      setOpenTooltip(null);
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, true);
      return () => scrollContainer.removeEventListener("scroll", handleScroll, true);
    }
  }, [scrollContainerRef]);

  //  Map ATS response → table row
  const candidatesWithoutRank = Array.isArray(evaluationData)
    ? evaluationData.map((item, index) => {
      const extractedFileName = item.file_name
        ? item.file_name.split('/').pop() || item.file_name.split('\\').pop() || item.file_name
        : "Uploaded Resume";

      return {
        id: extractedFileName || index,
        name: extractedFileName || "Uploaded Resume",
        fileName: extractedFileName || "Uploaded Resume",
        email: item.email || "—",
        score: item["Resume Score"] ?? 0,
        status: item.status === "Success" ? "SUCCESS" : "FAILED",
        decision:
          item.Decision === "SHORTLISTED"
            ? "SHORTLIST"
            : item.Decision === "REJECTED"
              ? "REJECT"
              : "PENDING",
        threshold: item.threshold ?? 70,
        latency: item.latency ?? 0,
        strengths: item.strengths || [],
        gaps: item.gaps || [],
        scoreBreakdown: item.scoreBreakdown || [],
        reasoning: item.Reason || item["View Summary"] || "",
        reason: item.Reason || item["View Summary"] || "",
        fullData: item,
      };
    })
    : [];

  // Calculate rank based on score (top 3 get priority)
  const candidatesWithRank = candidatesWithoutRank.map(candidate => {
    // Count how many candidates have a higher score
    const higherScores = candidatesWithoutRank.filter(
      c => c.score > candidate.score
    ).length;
    return {
      ...candidate,
      rank: higherScores + 1,
    };
  });

  // Sort candidates by score in descending order (highest scores first)
  const candidates = candidatesWithRank.sort((a, b) => b.score - a.score);

  // Only get applicable (non-rejected) candidates
  const applicableCandidates = candidates.map((candidate, index) => ({ candidate, index })).filter(item => item.candidate.decision !== "REJECT");

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      // Only select applicable (non-rejected) candidates
      setSelectedRows(new Set(applicableCandidates.map(item => item.index)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleRowCheckboxChange = (index: number) => {
    const candidate = candidates[index];
    // Only allow selecting non-rejected candidates
    if (candidate.decision === "REJECT") return;
    
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const isAllApplicableSelected = applicableCandidates.length > 0 && applicableCandidates.every(item => selectedRows.has(item.index));
  const hasApplicableCandidatesSelected = selectedRows.size > 0;

  return (
    <>
      {/* Header Container with padding */}
      <Box sx={{ padding: '2vh 2vh',paddingBottom:"0vh" }}>
        <Box sx={styles.breadcrumb}>
          <Typography
            sx={styles.breadcrumbLink}
            onClick={() => navigate(routes.createJob)}
          >
            Home
          </Typography>
          <Typography sx={{ color: '#9CA3AF' }}>&gt;</Typography>
          <Typography
            sx={styles.breadcrumbLink}
            onClick={handleJobDetailsClick}
          >
            Job Details
          </Typography>
          <Typography sx={{ color: '#9CA3AF' }}>&gt;</Typography>
          <Typography sx={{ color: '#111827', fontWeight: 700 }}>Score Summary</Typography>
        </Box>

        {/* Header Row */}
        <Box sx={styles.headerRow}>
          <Box>
            <Box sx={styles.jobTitleContainer}>
              <Typography sx={styles.jobTitle}>
                {(location.state as any)?.job?.title || "Job Title"}
              </Typography>
              <Box sx={styles.activeStatusChip}>
                <Box sx={styles.statusDot} />
                Active
              </Box>
            </Box>
            <Box sx={styles.jobInfoSubRow}>
              <Typography sx={styles.jobId}>
                ID: {(location.state as any)?.job?.id || "N/A"}
              </Typography>
              {/* <Box sx={styles.viewJobDescLink}>
                View Job Description
                <LaunchIcon sx={{ fontSize: '1.2vh' }} />
              </Box> */}
            </Box>
          </Box>

          <Box sx={styles.headerActionButtons}>
            <Button
              variant="contained"
              disabled={!hasApplicableCandidatesSelected}
              startIcon={<MailOutlineOutlinedIcon />}
              onClick={() => navigate(routes.sendEmail.replace(":id", id || ""))}
              sx={styles.sendMailButton}
            >
              Send Mail ({selectedRows.size})
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Lower container flush with sidebar */}
      <Box sx={{
        backgroundColor: '#fff',
        borderRadius: '1.2vh',
        boxShadow: '0 0.4vh 1.2vh rgba(0,0,0,0.05)',
        border: '1px solid #E5E7EB',
        marginTop: '2vh',
        maxWidth: '100%',
        overflowX: 'auto',
        padding:"1vh 2vh",
        height:"78vh",
      }}>
        {/* Candidate Scores Section Header */}
        <Box sx={styles.sectionHeader}>
          <Box>
            <Typography sx={styles.sectionTitle}>
              Candidate Scores
            </Typography>
            <Typography sx={styles.sectionSubtitle}>
              Candidate list with AI generated scores
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<PersonOutlineOutlinedIcon />}
            sx={styles.candidateDetailsButton}
            onClick={handleJobDetailsClick}
          >
            Candidate Details
          </Button>
        </Box>

        <Box sx={styles.tableWrapper}>
          <Box sx={{ maxWidth: '100%', overflowX: 'auto' }}>
            <Table sx={{ tableLayout: 'fixed', minWidth: '90vh' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...styles.tableHeaderCell, width: '5%' }}>
                    <Checkbox
                      checked={isAllApplicableSelected}
                      indeterminate={selectedRows.size > 0 && selectedRows.size < applicableCandidates.length}
                      onChange={handleSelectAll}
                      disabled={applicableCandidates.length === 0}
                      sx={styles.checkboxBase}
                    />
                  </TableCell>
                  <TableCell sx={{ ...styles.tableHeaderCell, width: '8%' }}>Rank</TableCell>
                  <TableCell sx={{ ...styles.tableHeaderCell, width: '18%' }}>File Name</TableCell>
                  <TableCell sx={{ ...styles.tableHeaderCell, width: '10%' }}>Status</TableCell>
                  <TableCell sx={{ ...styles.tableHeaderCell, width: '16%' }}>Resume Score</TableCell>
                  <TableCell sx={{ ...styles.tableHeaderCell, width: '12%' }}>Decision</TableCell>
                  <TableCell sx={{ ...styles.tableHeaderCell, width: '13%' }}>View Summary</TableCell>
                  <TableCell sx={{ ...styles.tableHeaderCell, width: '18%' }}>Reason</TableCell>
                </TableRow>
              </TableHead>
            </Table>

            <Box ref={scrollContainerRef} sx={styles.bodyScroll}>
              <Table sx={{ tableLayout: 'fixed' }}>
                <TableBody>
                  {candidates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        No evaluation data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    candidates.map((candidate, index) => (
                      <TableRow key={index} sx={{ borderBottom: '1px solid #e5e7eb', '&:hover': { backgroundColor: '#f9fafb' } }}>
                        <TableCell sx={{ width: '5%', py: 2 }}>
                          <Checkbox
                            checked={selectedRows.has(index)}
                            onChange={() => handleRowCheckboxChange(index)}
                            disabled={candidate.decision === "REJECT"}
                            sx={styles.checkboxBase}
                          />
                        </TableCell>
                        <TableCell sx={{ width: '8%', py: 2 }}>
                          <Box sx={candidate.rank <= 3 ? styles.rankCircle : styles.rankPlain}>
                            {candidate.rank < 10 && candidate.rank > 3 ? `0${candidate.rank}` : candidate.rank}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ width: '18%', py: 2 }}>
                          <Tooltip title={candidate.fileName} arrow>
                            <Typography sx={{ 
                              fontWeight: 700, 
                              fontSize: '1.4vh', 
                              color: '#111827',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '100%'
                            }}>
                              {candidate.fileName}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ width: '10%', py: 2 }}>
                          <Typography sx={candidate.status === 'SUCCESS' ? styles.statusSuccess : styles.statusFailed}>
                            {candidate.status}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: '16%', py: 2 }}>
                          <Box sx={styles.progressBarContainer}>
                            <Box sx={styles.progressBarIndicator}>
                              <Box sx={{
                                ...styles.progressFill,
                                width: candidate.status === 'FAILED' ? '0%' : `${candidate.score}%`,
                                backgroundColor: candidate.decision === 'REJECT' 
                                  ? '#DC2626' 
                                  : candidate.score >= candidate.threshold 
                                    ? '#10B981' 
                                    : '#FBBF24',
                              }} />
                            </Box>
                            <Typography sx={{
                              ...styles.scorePercent,
                              color: candidate.decision === 'REJECT'
                                ? '#DC2626'
                                : candidate.status === 'FAILED' 
                                  ? '#A62021' 
                                  : (candidate.score >= candidate.threshold ? '#10B981' : '#FBBF24')
                            }}>
                              {candidate.status === 'FAILED' ? '—' : `${candidate.score}%`}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ width: '12%', py: 2 }}>
                          <Box sx={
                            candidate.status === 'FAILED' ? styles.decisionPillPending :
                              (candidate.decision === 'SHORTLIST' || candidate.decision === 'APPROVED') ? styles.decisionPill :
                                styles.decisionPillRejected
                          }>
                            {candidate.status === 'FAILED' ? '—' : (candidate.decision === 'SHORTLIST' ? 'APPROVED' : candidate.decision === 'REJECT' ? 'REJECTED' : candidate.decision)}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ width: '13%', py: 2 }}>
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
                            <Typography sx={{ color: '#A62021', fontWeight: 600, fontSize: '1.4vh', textAlign: 'center', width: '100%' }}>—</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ width: '18%', py: 2 }}>
                          <Typography sx={styles.reasonText}>
                            {candidate.reasoning || candidate.reason}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </Box>

        <Snackbar
          open={showSnackbar}
          autoHideDuration={5000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Box sx={{ p: 2, backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" ,mt:"5vh"}}>
            <Typography sx={{ fontWeight: 600, color: "#000", fontSize: "1.3vh", marginBottom: "0.3vh" }}>
              AI analysis complete
            </Typography>
            <Typography sx={{ color: "#6b7280", fontSize: "1.2vh" }}>
              Candidate scores have been generated successfully.
            </Typography>
          </Box>
        </Snackbar>

        {/* Analysis Modal */}
        <CandidateAnalysisModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          candidate={selectedCandidate}
        />
      </Box>
    </>
  );
};

export default ScoreSummary;