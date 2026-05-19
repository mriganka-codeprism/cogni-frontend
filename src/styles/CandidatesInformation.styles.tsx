export const styles = {
  // Main Layout Styles
  mainContainer: {
    display: "flex",
    height: "85vh",
    background: "#f8f8f8",
    overflow: "hidden",
  },

  contentWrapper: {
    flex: 1,
  },

  contentFlexContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "2vh",
  },

  // Root/Top Container
  root: {
    width: "100%",
    height: "86vh",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    padding: "1vh 0vw",
    gap: "2vh",
  },

  // Job Details Container
  jobDetailsContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: "1.5vh",
    padding: "2vh 2.5vh",
    display: "flex",
    flexDirection: "column",
    gap: "1.5vh",
  },

  // Candidates Header Box
  candidatesHeaderBox: {
    display: "flex",
    flexDirection: "column",
    gap: "1.2vh",
  },

  candidatesTitle: {
    fontFamily: "sans-serif poppins",
    fontSize: "2.2vh",
    fontWeight: 700,
    color: "#111",
  },

  candidatesSubtitle: {
    fontSize: "1.5vh",
    color: "#999",
  },

  // Category Toggle Styles
  toggleContainer: {
    display: "flex",
    backgroundColor: "#006b66",
    borderRadius: "2.5vh",
    padding: "0.4vh",
    width: "fit-content",
    border: "1px solid #006b66",
    marginLeft: "auto",
  },

  toggleButton: {
    display: "flex",
    alignItems: "center",
    gap: "1vh",
    padding: "0.6vh 2vh",
    borderRadius: "2vh",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textTransform: "none",
    fontSize: "1.4vh",
    fontWeight: 600,
    minWidth: "10vh",
    justifyContent: "center",
  },

  selectedToggle: {
    backgroundColor: "#FFFFFF",
    color: "#006b66",
    "&:hover": {
      backgroundColor: "#FFFFFF",
    },
  },

  unselectedToggle: {
    backgroundColor: "transparent",
    color: "#FFFFFF",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  },

  // Tab Border Box
  tabBorderBox: {
    borderBottom: "1px solid #e0e0e0",
    marginTop: "1.5vh",
    marginBottom: "1vh",
  },

  candidateTabs: {
    "& .MuiTab-root": {
      fontSize: "1.5vh",
      fontWeight: 500,
      color: "#999",
      textTransform: "none",
      minHeight: "4vh",
    },
    "& .MuiTab-root.Mui-selected": {
      color: "#006b66",
      fontWeight: 700,
    },
    "& .MuiTabs-indicator": {
      backgroundColor: "#006b66",
    },
  },

  // Search & Filter Styles
  filterSearchContainer: {
    px: 0,
    py: 1.5,
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    flexWrap: "wrap",
  },

  candidateSearchField: {
    width: "25vh",
    "& .MuiOutlinedInput-root": {
      fontSize: "1.2vh",
      borderRadius: "0.8vh",
      backgroundColor: "#FFFFFF",
    },
  },

  searchIcon: {
    mr: 1,
    color: "#9ca3af",
  },

  filterButton: {
    backgroundColor: "#006b66",
    color: "#FFFFFF",
    textTransform: "none",
    fontSize: "1.4vh",
    fontWeight: 600,
    borderRadius: "0.8vh",
    border: "none",
    height:"3vh",
    "&:hover": {
      backgroundColor: "#005552",
      color: "#FFFFFF",
    },
  },

  dateRangePickerBox: {
    '& .MuiOutlinedInput-root': {
      paddingLeft: '0vh',
      width: '22vh !important',
      height: "3.2vh !important"
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#d1d5db !important'
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#d1d5db !important'
    },
    '& .MuiOutlinedInput-input': {
      fontSize: '1.2vh !important'
    },
    '& .MuiIconButton-root svg': {
      fontSize: '1.8vh !important',
      marginRight: "0.5vh"
    },
  },

  statusDropdownButton: {
    border: "1px solid #d1d5db",
    color: "#6b7280",
    textTransform: "none",
    fontSize: "1.4vh",
    fontWeight: 500,
    borderRadius: "0.6vh",
    backgroundColor: "#FFFFFF",
    height: "3vh",
    "&:hover": {
      borderColor: "#9ca3af",
      backgroundColor: "#FFFFFF",
    },
  },

  clearAllFilters: {
    color: "#900B09",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "1.3vh",
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },

  // Table Styles
  tableContainer: {
    mx: 0,
    my: 2.5,
    border: "0.1vh solid #e5e7eb",
    borderRadius: "0.6vh",
    height: "39vh",
    minHeight: "5vh",
    overflow: "hidden",
    width: "100%",
  },

  tableHeaderCell: {
    backgroundColor: "#f9fafb",
    fontSize: "1.4vh",
    fontWeight: 700,
    color: "#374151",
    padding: "1.5vh",
    borderBottom: "1px solid #e5e7eb",
  },

  tableBodyCell: {
    fontSize: "1.3vh",
    color: "#374151",
    padding: "1vh 1.5vh",
    borderBottom: "1px solid #e5e7eb",
  },

  statusSuccess: {
    color: "#059669",
    fontWeight: 600,
    fontSize: "1.3vh",
  },

  statusFailed: {
    color: "#A62021",
    fontWeight: 600,
    fontSize: "1.3vh",
  },

  progressBarIndicator: {
    width: "5vh",
    height: "0.6vh",
    backgroundColor: "#e5e7eb",
    borderRadius: "0.3vh",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: "0.3vh",
    transition: "width 0.3s ease",
  },

  scorePercent: {
    fontWeight: 700,
    fontSize: "1.3vh",
    minWidth: "4vh",
  },

  decisionPill: {
    backgroundColor: "#D1FAE5",
    color: "#059669",
    padding: "0.5vh 1vh",
    borderRadius: "1.5vh",
    fontWeight: 600,
    fontSize: "1.2vh",
    textAlign: "center",
  },

  decisionPillRejected: {
    backgroundColor: "#FEE2E2",
    color: "#A62021",
    padding: "0.5vh 1vh",
    borderRadius: "1.5vh",
    fontWeight: 600,
    fontSize: "1.2vh",
    textAlign: "center",
  },

  decisionPillPending: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    padding: "0.5vh 1vh",
    borderRadius: "1.5vh",
    fontWeight: 600,
    fontSize: "1.2vh",
    textAlign: "center",
  },

  viewAnalysisLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.5vh",
    color: "#006b66",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1.3vh",
    "&:hover": {
      textDecoration: "underline",
    },
  },

  documentIcon: {
    fontSize: "1.6vh",
    color: "#006b66",
  },

  reasonText: {
    fontSize: "1.3vh",
    color: "#6b7280",
    lineHeight: "1.4",
  },

  // Job Header Styles
  jobHeader: {
    display: "flex",
    flexDirection: "column",
    marginTop: "0vh",
  },

  title: {
    fontFamily: "sans-serif poppins",
    fontSize: "2.2vh",
    fontWeight: 700,
    color: "#111",
  },

  // Interview Recordings Wrapper - Custom styling for this page only
  interviewRecordingsWrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    marginLeft: "0",
    "& > div": {
      width: "100%",
      marginLeft: "0 !important",
    },
  }
};
