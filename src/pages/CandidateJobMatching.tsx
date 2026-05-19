import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  InputAdornment,
  InputBase,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import { getStatusColor, commonButtonSx, styles } from "../styles/CandidateJobmatching.styles";
import jobMatchingData from "../mock/jobmatching.json";


interface CandidateData {
  id: string;
  name: string;
  date: string;
  email: string;
  score: number;
  emailStatus: string;
  summary: string;
  cv?: string;
}

const CandidateJobMatching: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [emailTemplateDialogOpen, setEmailTemplateDialogOpen] = useState(false);
  const [sendEmailDialogOpen, setSendEmailDialogOpen] = useState(false);

  // Mock data from JSON file
  const [candidates] = useState<CandidateData[]>(jobMatchingData as CandidateData[]);

  const handleSelectCandidate = (id: string) => {
    const newSelected = new Set(selectedCandidates);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCandidates(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCandidates.size === candidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(candidates.map((c) => c.id)));
    }
  };

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
      setSortBy("date");
      setSortOrder("DESC");
      return;
    }
  };

  const filteredCandidates = candidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={styles.mainBox}>
      {/* Header with Back Button */}
      <Box sx={styles.headerBox}>
        <Box sx={styles.headerLeftBox}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={styles.backButton}
          >
            <ArrowBackIcon sx={{ fontSize: "3vh" }} />
          </IconButton>
          <Typography
            variant="h4"
            fontWeight={700}
            fontSize={"3vh"}
            sx={{ flex: 1 }}
          >
            Candidates Matching Job Description
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={styles.headerButtonsBox}>
          <Button
            variant="outlined"
            startIcon={<CloudDownloadIcon />}
            sx={commonButtonSx}
          >
            Download Excel Report
          </Button>
          <Button
            variant="outlined"
            sx={commonButtonSx}
            onClick={() => setEmailTemplateDialogOpen(true)}
          >
            Edit Email Template
          </Button>
          <Button
            variant="outlined"
            sx={commonButtonSx}
            onClick={() => setSendEmailDialogOpen(true)}
          >
            Send Email
          </Button>
        </Box>
      </Box>

      {/* Search and Buttons Bar */}
      <Box sx={styles.searchAndButtonsBar}>
        <InputBase
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: "2vh", color: "#999" }} />
            </InputAdornment>
          }
          sx={styles.searchInput}
        />

        <Box sx={styles.sortFilterButtonsBox}>
          <Button
            variant="outlined"
           sx={commonButtonSx}
          >
            Sort & Filter
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            sx={commonButtonSx}
          >
            Refresh Email Status
          </Button>
          <Button
            variant="outlined"
            sx={commonButtonSx}
          >
            Select All
          </Button>
        </Box>

        <Typography sx={styles.emailStatusText}>
          <span style={{ color: "#a00", fontWeight: 600 }}>
            Email status last updated on:
          </span>{" "}
          Never updated
        </Typography>
      </Box>

      {/* Table */}
      <Paper sx={styles.tableContainerPaper}>
        <TableContainer sx={styles.tableContainer}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={styles.tableHeadRow}>
                <TableCell sx={styles.checkboxCell}>
                  <Checkbox
                    checked={selectedCandidates.size === candidates.length}
                    onChange={handleSelectAll}
                    sx={{ color: "#a00", "&.Mui-checked": { color: "#a00" } }}
                  />
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Email ID</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Email Status</TableCell>
                <TableCell>Summary</TableCell>
                <TableCell>CV</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((row) => (
                  <TableRow key={row.id} sx={styles.tableBodyRow}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCandidates.has(row.id)}
                        onChange={() => handleSelectCandidate(row.id)}
                      />
                    </TableCell>
                    <TableCell sx={styles.nameCellStyle}>{row.name}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell sx={styles.emailCellStyle}>{row.email}</TableCell>
                    <TableCell sx={styles.scoreCellStyle}>{row.score}</TableCell>
                    <TableCell>
                      <Box sx={{ ...styles.statusBadge, ...getStatusColor(row.emailStatus) }}>
                        {row.emailStatus}
                      </Box>
                    </TableCell>
                    <TableCell sx={styles.summaryCellStyle}>
                      {row.summary}
                    </TableCell>
                    <TableCell>
                      <Box sx={styles.cvBadge}>
                        {row.cv}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} sx={styles.noCandidatesCell}>
                    No candidates found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Email Template Dialog */}
      <Dialog
        open={emailTemplateDialogOpen}
        onClose={() => setEmailTemplateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Email Template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Email template editing feature coming soon...
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailTemplateDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog
        open={sendEmailDialogOpen}
        onClose={() => setSendEmailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Email</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedCandidates.size > 0
              ? `You are about to send emails to ${selectedCandidates.size} candidate(s).`
              : "Please select at least one candidate before sending emails."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendEmailDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => setSendEmailDialogOpen(false)}
            variant="contained"
            disabled={selectedCandidates.size === 0}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CandidateJobMatching;
