import React, { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  MenuItem,
  Menu,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import PersonIcon from "@mui/icons-material/Person";
import { styles } from "../styles/CandidatesInformation.styles";
import { routes } from "../constants/routes";
import DateRangeSelector from "../components/dateRange/dateRangeFilter";
import InterviewRecordings from "../components/InterviewRecordings/InterviewRecordings";
import EvaluationKPICards from "../components/EvaluationKPICards/EvaluationKPICards";
import CandidateAnalysisModal from "../components/CandidateAnalysisModal/CandidateAnalysisModal";
import gridview from "../assets/images/gridview.png";
import tableview from "../assets/images/tableview.png";

const CandidatesInformation = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [interviewStatusAnchorEl, setInterviewStatusAnchorEl] = useState<null | HTMLElement>(null);
  const [callStatusAnchorEl, setCallStatusAnchorEl] = useState<null | HTMLElement>(null);
  const [collegeAnchorEl, setCollegeAnchorEl] = useState<null | HTMLElement>(null);
  const [interviewStatusFilter, setInterviewStatusFilter] = useState<string | null>(null);
  const [callStatusFilter, setCallStatusFilter] = useState<string | null>(null);
  const [collegeFilter, setCollegeFilter] = useState<string | null>(null);
  const [interviewRecordingsViewMode, setInterviewRecordingsViewMode] = useState<"table" | "grid">("grid");
  const [openModal, setOpenModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<"Fresher" | "Lateral">("Fresher");
  const [toggle, setToggle] = useState("Fresher");

  // Mock data - replace with API call
  const mockCandidates = [
    {
      id: 1,
      name: "Ganesh Ganapavarapu",
      email: "ganesh@gmail.com",
      college: "Mu Sigma University",
      duration: "1 min 22 sec",
      datetime: "12 Feb | 05:04 PM",
      status: "Be Interview",
      evaluation: "Evaluated",
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya.sharma@vit.ac.in",
      college: "Mu Sigma University",
      duration: "1 min 22 sec",
      datetime: "12 Feb | 05:04 PM",
      status: "Not Evaluated",
      evaluation: "Not Evaluated",
    },
    {
      id: 3,
      name: "Ananya Desai",
      email: "rajesh@ibits-pilani.ac.in",
      college: "Mu Sigma University",
      duration: "1 min 22 sec",
      datetime: "12 Feb | 05:04 PM",
      status: "Be Interview",
      evaluation: "Evaluated",
    },
    {
      id: 4,
      name: "Vikram Patel",
      email: "vikram.patel@gnit.edu",
      college: "Mu Sigma University",
      duration: "1 min 22 sec",
      datetime: "12 Feb | 05:04 PM",
      status: "Be Interview",
      evaluation: "Evaluated",
    },
  ];

  const handleDeleteCandidate = (id: number) => {
    console.log("Delete candidate:", id);
    // Add delete logic here
  };

  const handleDownloadCandidate = (id: number) => {
    console.log("Download candidate:", id);
    // Add download logic here
  };

  const candidateType =
    type === "fresher" ? "Fresher" : type === "lateral" ? "Lateral" : "";

  return (
    <>
      <Box sx={styles.mainContainer}>
        <Box sx={styles.contentWrapper}>
          <Box sx={styles.root}>
            <Box sx={styles.contentFlexContainer}>
              {/* Candidates Information Container */}
              <Box sx={styles.jobDetailsContainer}>
                {/* Header and Tabs */}
                <Box sx={styles.candidatesHeaderBox}>
                  <Typography sx={styles.candidatesTitle}>
                    Candidates Information
                  </Typography>
                  <Typography sx={styles.candidatesSubtitle}>
                    Candidates who all uploaded for this position
                  </Typography>
                </Box>

                {/* Tabs Row with Toggle */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e0e0e0", marginTop: "1.5vh", marginBottom: "1vh" }}>
                  <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    sx={styles.candidateTabs}
                  >
                    <Tab label="Candidate Details" />
                    <Tab label="Candidate Evaluation" />
                    <Tab label="Candidate Scores" />
                  </Tabs>

                  {/* Toggle in right corner */}
                  <Box sx={{
                    display: "flex",
                    backgroundColor: "#006b66",
                    borderRadius: "3vh",
                    padding: "0.4vh",
                    gap: "0.4vh",
                    height: "4.5vh",
                    alignItems: "center",
                    marginRight: "1vh",
                  }}>
                    <Box
                      onClick={() => {
                        setToggle("Fresher");
                        navigate(routes.candidatesInformation.replace(":type", "fresher"));
                      }}
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: "1vh",
                        padding: "0 1vh",
                        height: "3.7vh",
                        borderRadius: "2.5vh",
                        cursor: "pointer",
                        fontSize: "1.4vh",
                        fontWeight: 700,
                        transition: "all 0.3s ease",
                        backgroundColor: toggle === "Fresher" ? "#fff" : "transparent",
                        color: toggle === "Fresher" ? "#006b66" : "#fff",
                      }}
                    >
                      <PersonIcon sx={{ fontSize: "1.8vh" }} />
                      Fresher
                    </Box>
                    <Box
                      onClick={() => {
                        setToggle("Lateral");
                        navigate(routes.candidatesInformation.replace(":type", "lateral"));
                      }}
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: "1vh",
                        padding: "0 1vh",
                        height: "3.7vh",
                        borderRadius: "2.5vh",
                        cursor: "pointer",
                        fontSize: "1.4vh",
                        fontWeight: 700,
                        transition: "all 0.3s ease",
                        backgroundColor: toggle === "Lateral" ? "#fff" : "transparent",
                        color: toggle === "Lateral" ? "#006b66" : "#fff",
                      }}
                    >
                      <BusinessCenterIcon sx={{ fontSize: "1.8vh" }} />
                      Lateral
                    </Box>
                  </Box>
                </Box>

                {/* Search and Filters */}
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
                    sx={styles.filterButton}
                  >
                    Filters
                  </Button>

                  {/* Date Range Picker */}
                  <Box sx={styles.dateRangePickerBox}>
                    <DateRangeSelector
                      startDate={startDate}
                      endDate={endDate}
                      onStartDateChange={setStartDate}
                      onEndDateChange={setEndDate}
                      emptyLabel="DD/MM/YYYY – DD/MM/YYYY"
                      hideFieldLabel={true}
                      onClear={() => {
                        setStartDate(null);
                        setEndDate(null);
                      }}
                    />
                  </Box>

                  {/* Interview Status Dropdown */}
                  <Button
                    onClick={(e) => setInterviewStatusAnchorEl(e.currentTarget)}
                    endIcon={<ExpandMoreIcon />}
                    sx={styles.statusDropdownButton}
                  >
                    {interviewStatusFilter || "Interview Status"}
                  </Button>

                  <Menu
                    anchorEl={interviewStatusAnchorEl}
                    open={Boolean(interviewStatusAnchorEl)}
                    onClose={() => setInterviewStatusAnchorEl(null)}
                  >
                    <MenuItem onClick={() => { setInterviewStatusFilter(null); setInterviewStatusAnchorEl(null); }}>
                      All
                    </MenuItem>
                    <MenuItem onClick={() => { setInterviewStatusFilter("Be Interview"); setInterviewStatusAnchorEl(null); }}>
                      Re Interview
                    </MenuItem>
                    <MenuItem onClick={() => { setInterviewStatusFilter("Not Evaluated"); setInterviewStatusAnchorEl(null); }}>
                      Not Evaluated
                    </MenuItem>
                  </Menu>

                  {/* Call Status Dropdown */}
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
                    <MenuItem onClick={() => { setCallStatusFilter("Pending"); setCallStatusAnchorEl(null); }}>
                      Pending
                    </MenuItem>
                  </Menu>

                  {/* College Dropdown */}
                  <Button
                    onClick={(e) => setCollegeAnchorEl(e.currentTarget)}
                    endIcon={<ExpandMoreIcon />}
                    sx={styles.statusDropdownButton}
                  >
                    {collegeFilter || "College"}
                  </Button>

                  <Menu
                    anchorEl={collegeAnchorEl}
                    open={Boolean(collegeAnchorEl)}
                    onClose={() => setCollegeAnchorEl(null)}
                  >
                    <MenuItem onClick={() => { setCollegeFilter(null); setCollegeAnchorEl(null); }}>
                      All
                    </MenuItem>
                    <MenuItem onClick={() => { setCollegeFilter("Mu Sigma University"); setCollegeAnchorEl(null); }}>
                      Mu Sigma University
                    </MenuItem>
                  </Menu>

                  {/* Clear all button */}
                  <Typography
                    onClick={() => {
                      setSearchQuery("");
                      setInterviewStatusFilter(null);
                      setCallStatusFilter(null);
                      setCollegeFilter(null);
                      setStartDate(null);
                      setEndDate(null);
                    }}
                    sx={styles.clearAllFilters}
                  >
                    ✕ Clear all
                  </Typography>

                  {/* View Mode Toggle Box - Only for Tab 0 */}
                  {tabValue === 0 && (
                    <Box sx={{ backgroundColor: "#ffffff", border: "1px solid #f0f0f0", borderRadius: "0.6vh", width: "4vw", marginLeft: "auto", marginRight: "0.5vh", padding: "0.3vh" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: "0" }}>
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
                            <img src={gridview} alt="" style={{ height: "1.6vh", width: "auto" }} />
                          </Box>
                        </Tooltip>

                        <Box sx={{ width: "0.1vh", marginRight: "4.4vh", marginLeft: "0vh", gap: "0.4vh", backgroundColor: "#7d7f81", margin: "0.3vh" }} />

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
                            <img src={tableview} alt="" style={{ height: "1.6vh", width: "auto" }} />
                          </Box>
                        </Tooltip>
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Tab Content */}
                {tabValue === 0 && (
                  <Box sx={styles.interviewRecordingsWrapper}>
                    <InterviewRecordings
                      viewMode={interviewRecordingsViewMode}
                      onViewModeChange={setInterviewRecordingsViewMode}
                      gridColumns={4}
                      cardVariant="candidate-info"
                      containerHeight="57vh"
                    />
                  </Box>
                )}

                {tabValue === 1 && (
                  <EvaluationKPICards
                    kpiData={{
                      totalInterviews: 3900,
                      evaluated: 3797,
                      notEvaluated: 75,
                      selectedStudents: 1637,
                      notSelected: 2160,
                      defaulted: 28,
                    }}
                  />
                )}

                {tabValue === 2 && (
                  <Box sx={styles.tableContainer}>
                    <Table sx={{ tableLayout: "fixed" }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                          <TableCell sx={{ ...styles.tableHeaderCell, width: "20%" }}>File Name</TableCell>
                          <TableCell sx={{ ...styles.tableHeaderCell, width: "12%" }}>Status</TableCell>
                          <TableCell sx={{ ...styles.tableHeaderCell, width: "18%" }}>Resume Score</TableCell>
                          <TableCell sx={{ ...styles.tableHeaderCell, width: "12%" }}>Decision</TableCell>
                          <TableCell sx={{ ...styles.tableHeaderCell, width: "15%" }}>View Summary</TableCell>
                          <TableCell sx={{ ...styles.tableHeaderCell, width: "23%" }}>Reason</TableCell>
                        </TableRow>
                      </TableHead>
                    </Table>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Analysis Modal */}
      <CandidateAnalysisModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        candidate={selectedCandidate}
      />
    </>
  );
};

export default CandidatesInformation;
