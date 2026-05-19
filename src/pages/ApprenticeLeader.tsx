import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TablePagination,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import EmailIcon from "@mui/icons-material/Email";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TuneIcon from "@mui/icons-material/Tune";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { globalStyles } from "../config";
import candidatesData from "../mock/candidates.json";
import { styles, roleActionButtonStyle } from "../styles/ApprenticeLeader.styles";



interface Candidate {
  id: string;
  name: string;
  email: string;
  score: number;
  totalScore: number;
  status: string;
}

const ApprenticeLeader = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [candidates, setCandidates] = useState<Candidate[]>(candidatesData as Candidate[]);

  // Mock data - replace with API call
  

  const interviewLink =
    "https://neorecruit.web.app/?data=%7B%22CompanyName%2D...";

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(interviewLink);
    alert("Interview link copied to clipboard!");
  };

  const handleDeleteAllCandidates = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAllCandidates = () => {
    setCandidates([]);
    setDeleteDialogOpen(false);
  };

  const handleViewAnalysis = (candidateId: string) => {
    // Navigate to candidate analysis page
    navigate(`/apprentice-leader/analysis/${candidateId}`);
  };

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get paginated candidates
  const paginatedCandidates = filteredCandidates.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={ styles.page}>
      {/* Header with back button, title, and action buttons */}
      <Box sx={styles.headerRow}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "2vh" }}>
          <IconButton size="small" sx={styles.backButton}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: "3vh" }}>
            Apprentice Leader - FP&A
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: "1vh" }}>
          <Button
            variant="outlined"
            sx={roleActionButtonStyle}
            >
            Edit Role
            </Button>

            <Button
            variant="outlined"
            sx={roleActionButtonStyle}
            >
            Delete Role
            </Button>

            <Button
            variant="outlined"
            sx={roleActionButtonStyle}
            >
            Disable Role
        </Button>


        </Box>
      </Box>

      {/* Breadcrumb */}
      <Typography sx={{ mb: "1vh", color: "#666", fontSize: "1.4vh" }}>
        Job Role &gt; Candidates
      </Typography>

      {/* Interview link section */}
      <Box sx={styles.interviewLinkBox}>
        <Typography sx={{ fontWeight: 600, whiteSpace: "nowrap", fontSize: "2vh" }}>Interview link:</Typography>
        <Typography sx={{ color: globalStyles.colors.primary, flex: 1, overflow: "hidden", textOverflow: "ellipsis", fontSize: "2vh" }}>
          {interviewLink}
        </Typography>
        <Box sx={styles.interviewIcons}>
          <IconButton size="small" onClick={handleCopyLink} sx={styles.iconButtonSmall}><ContentCopyIcon fontSize="small" /></IconButton>
          <IconButton size="small" sx={styles.iconButtonSmall}><CloudDownloadIcon fontSize="small" /></IconButton>
          <IconButton size="small" sx={styles.iconButtonSmall}><EmailIcon fontSize="small" /></IconButton>
        </Box>
      </Box>

      {/* Candidates header with delete all button */}
      <Box sx={styles.candidatesHeader}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "2vh" }}>
          Candidates ({candidates.length})
        </Typography>
        
      </Box>

      <Box sx={styles.searchRow}>

        <TextField
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          variant="standard"
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={styles.searchInput}
        />
        <Button variant="outlined" sx={styles.filterButton} startIcon={<TuneIcon />}>Filter</Button>
        <Button
          variant="outlined"
          sx={styles.deleteButton}
          startIcon={<DeleteOutlineIcon />}
          onClick={handleDeleteAllCandidates}
        >
          Delete All Candidates
        </Button>
      </Box>

      <Box sx={styles.gridWrapper}>
        <Grid container spacing="2vh" sx={styles.gridContainer}>
          {paginatedCandidates.map((candidate) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={candidate.id}>
              <Card sx={styles.card}>
                <Box sx={styles.cardHeader}>
                  <Box>
                    <Typography sx={styles.candidateName}>
                      {candidate.name}
                    </Typography>
                    <Typography sx={styles.candidateEmail}>
                      {candidate.email}
                    </Typography>
                  </Box>

                  <Typography sx={styles.scoreText}>
                    {candidate.score}/{candidate.totalScore}
                  </Typography>
                </Box>

                <Typography sx={styles.statusText}>
                  {candidate.status}
                </Typography>

                <Button
                  variant="outlined"
                  size="small"
                  sx={styles.viewAnalysisButton}
                  onClick={() => handleViewAnalysis(candidate.id)}
                >
                  View Analysis
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={styles.paginationContainer}>
        <TablePagination
          component="div"
          count={filteredCandidates.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[6, 12, 24]}
          sx={styles.tablePagination}
        />
      </Box>


      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete All Candidates</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure? This cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteAllCandidates} variant="contained" sx={{ bgcolor: globalStyles.colors.primary, color: "#fff", "&:hover": { bgcolor: globalStyles.colors.darkText } }}>Delete All</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApprenticeLeader;