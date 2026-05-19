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
    //padding: "1vh",
  },

  contentFlexContainer: {
    width: "100%",

    display: "flex",
    flexDirection: "column",
    gap: "2vh",
  },

  // Loading/Error States
  loadingContainer: {
    display: "flex",
    height: "85vh",
    background: "#f8f8f8",
    overflow: "hidden",
  },

  loadingContentBox: {
    flex: 1,
    padding: "2vh",
  },

  errorContainer: {
    display: "flex",
    height: "85vh",
    background: "#f8f8f8",
    overflow: "hidden",
  },

  errorContentBox: {
    flex: 1,
    padding: "2vh",
  },

  errorText: {
    color: "red",
  },

  goBackButton: {
    marginTop: "2vh",
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

  topContainer: {
    backgroundColor: "white",
    padding: "1vw",
    borderRadius: "1vh",
  },

  // Header Styles
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },

  buttonRow: {
    display: "flex",
    alignItems: "center",
    gap: "1vh",
  },

  breadcrumb: {
    fontSize: "1.5vh",
    fontFamily: "Poppins, sans-serif",
    color: "#999",
    marginBottom: "0vh",
    marginTop: "-2.5vh",
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    marginTop: "0vh",
    justifyContent: "space-between",
  },

  title: {
    fontFamily: "sans-serif poppins",
    fontSize: "2vh",
    fontWeight: "1000",
    color: "#111",
    marginRight: "1vh",
    marginTop: "-3vh",
  },

  statusBadge: {
    backgroundColor: "#F0F9F8", // Very light teal
    color: "#007664", // Teal text
    padding: "0vh 1.4vh",
    borderRadius: "10vh",
    fontSize: "1.3vh",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "0.8vh",
    border: "0.1vh solid #0076644D",
    marginTop: "-3vh",
    height: "2.5vh",
  },

  statusDot: {
    width: "0.8vh",
    height: "0.8vh",
    borderRadius: "50%",
    backgroundColor: "#007664",
  },

  jobId: {
    fontSize: "1.3vh",
    fontFamily: "Poppins, sans-serif",
    color: "#888",
    marginTop: "-1.5vh",
  },

  // Button Styles
  uploadButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#006b66",
    color: "#fff",
    padding: "1vh 1.5vw",
    borderRadius: "0.6vh",
    textTransform: "none",
    fontSize: "1.5vh",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    lineHeight: "1.75vh",
    letterSpacing: "0.03vh",
    marginRight: "0.8vh",
    marginLeft: "0vh",
    minWidth: "auto",
    marginTop: 0,
    transition: "background-color 250ms ease",
    "&:hover": {
      backgroundColor: "#005752",
    },
  },

  iconButton: {
    border: "0.1vh solid #006b66",
    borderRadius: "0.6vh",
    padding: "0.5vh 0.8vh",
    backgroundColor: "#fff",
    color: "#006b66",
    minWidth: "auto",
    marginRight: "0.8vh",
    marginLeft: "0vh",
    transition: "background-color 250ms ease, color 250ms ease",
    "&:hover": {
      backgroundColor: "#f0f9f8",
      color: "#005752",
    },
  },

  downloadIconButton: {
    color: "#6b6b6b",
    cursor: "pointer",
    marginTop: "-3vh",
    "&:hover": {
      color: "#006b66",
    },
  },

  expandButton: {
    minWidth: "auto",
    padding: "0.5vh",
    color: "#006b66",
  },

  downloadMenuPaper: {
    borderRadius: "1vh",
    minWidth: "12vh",
    padding: "0vh 0",
  },

  pdfDownloadMenuItem: {
    fontSize: "1.5vh",
    padding: "0.5vh 1.5vh",
    fontFamily: `"Open Sans", sans-serif`,
  },

  docDownloadMenuItem: {
    fontSize: "1.5vh",
    fontFamily: "Poppins, sans-serif",
    padding: "0.5vh 1.5vh",
  },

  filterButton: {
    backgroundColor: "#006b66",
    color: "#fff",
    textTransform: "none",
    fontSize: "1.2vh",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 500,
    px: 1.5,
    py: 0.8,
    borderRadius: "1vh",
    "&:hover": {
      backgroundColor: "#005054",
    },
  },

  statusDropdownButton: {
    textTransform: "none",
    fontSize: "1.2vh",
    fontFamily: "Poppins, sans-serif",
    border: "1px solid #d1d5db",
    borderRadius: "0.8vh",
    px: 1.2,
    py: 0.6,
    backgroundColor: "#fff",
    color: "black",
    minWidth: "10vh",
    // "&:hover": {
    //   backgroundColor: "#f9fafb",
    //   borderColor: "#9ca3af",
    // },
  },

  decisionDropdownButton: {
    textTransform: "none",
    fontSize: "1.2vh",
    fontFamily: "Poppins, sans-serif",
    border: "1px solid #d1d5db",
    borderRadius: "0.8vh",
    px: 1.2,
    py: 0.6,
    backgroundColor: "#fff",
    color: "black",
    minWidth: "10vh",
    // "&:hover": {
    //   backgroundColor: "#f9fafb",
    //   borderColor: "#9ca3af",
    // },
  },

  // Description and Text Styles
  descriptionText: {
    whiteSpace: "pre-line",
  },

  // Candidates Section - Paper & Container
  candidatesInfoPaper: {
    backgroundColor: "#fff",
    borderRadius: "0.8vh",
    //boxShadow: "0px 0.2vh 0.8vh rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
    height: "80vh",
    // marginRight:"2vh",
    borderTop: "0.1vh solid #f0f0f0",
    borderTopLeftRadius: "0.3vh",
    borderTopRightRadius: "0.3vh",
  },

  candidatesHeaderBox: {
    px: 2.5,
    pt: 2.5,
    pb: 1,
  },

  candidatesTitle: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "2vh",
    fontWeight: 700,
    color: "#1f2937",
    mb: 0.5,
  },

  candidatesSubtitle: {
    fontSize: "1.4vh",
    fontFamily: "Poppins, sans-serif",
    color: "#6b7280",
    mb: 1.5,
  },

  tabBorderBox: {
    borderBottom: "1px solid #e5e7eb",
  },

  candidateTabs: {
    "& .MuiTab-root": {
      fontSize: "1.4vh",
      fontFamily: "Poppins, sans-serif",
      fontWeight: 500,
      color: "#9ca3af",
      textTransform: "none",
      padding: "1.2vh 1.5vh",
      minWidth: "auto",
      borderBottom: "3px solid transparent",
      transition: "all 0.3s ease",
      "&.Mui-selected": {
        color: "#006b66",
        borderBottom: "3px solid #006b66",
      },
      "&:hover": {
        color: "#006b66",
      },
    },
    "& .MuiTabs-indicator": {
      display: "none",
    },
  },

  // Search & Filter Styles
  filterSearchContainer: {
    px: 2.5,
    py: 1.5,
    display: "flex",
    alignItems: "center",
    gap: 1.5,

    flexWrap: "wrap",

    // borderBottom: "1px solid #e5e7eb",
  },

  candidateSearchField: {
    width: "25vh",


    "& .MuiOutlinedInput-root": {
      fontSize: "1.2vh",
      fontFamily: "Poppins, sans-serif",
      borderRadius: "0.8vh",
      backgroundColor: "#FFFFFF",


    },
  },

  searchIcon: {
    mr: 1,
    color: "#9ca3af",
  },

  clearAllFilters: {
    color: "#900B09",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "1.3vh",
    fontFamily: "Poppins, sans-serif",
    textDecoration: "none",
    "&:hover": {
      textDecoration: "none",
    },
  },

  dateRangePickerBox: {
    '& .MuiOutlinedInput-root': { paddingLeft: '0vh', width: '22vh !important', height: "3.2vh !important" },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db !important' },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db !important' },
    '& .MuiOutlinedInput-input': { fontSize: '1.2vh !important' },
    '& .MuiIconButton-root svg': { fontSize: '1.8vh !important', marginRight: "0.5vh" },
  },

  // Table Styles
  tableContainer: {
    mx: 2.5,
    my: 2.5,
    border: "0.1vh solid #e5e7eb",
    borderRadius: "0.6vh",
    height: "45vh",
    minHeight: "5vh",
    overflow: "hidden",
    //overflow: "auto",
    // display: "block",
    width: "97.5%",

  },



  candidatesTable: {
    minWidth: "80vh",
    borderCollapse: "collapse",
  },

  tableHeaderRow: {
    backgroundColor: "#f9fafb",
    // position: "sticky",
    // top: 0,
    // zIndex: 1,
  },

  tableHeaderCell: {
    fontWeight: 700,
    fontSize: "1.4vh",
    fontFamily: "Poppins, sans-serif",
    color: "#374151",
    backgroundColor: "#F9FAFB",
    padding: "1vh 1.5vh",
  },

  noDataCell: {
    py: 3,
    color: "#9ca3af",
  },

  tableBodyRow: {
    borderBottom: "1px solid #e5e7eb",
    // "&:hover": {
    //   backgroundColor: "#f9fafb",
    // },

  },
  tableWrapper: {
    mx: 2.5,
    my: 2.5,
    border: "0.1vh solid #e5e7eb",
    borderRadius: "0.6vh",
    overflow: "hidden",
  },

  tableBodyScroll: {
    maxHeight: "5vh",
    overflowY: "auto",
    scrollbarGutter: "stable",
  },

  /* 🔹 Premium Row Styles */
  rankCircle: {
    width: "3.5vh",
    height: "3.5vh",
    borderRadius: "50%",
    backgroundColor: "#FFF8E1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#E67E22",
    fontWeight: 800,
    fontSize: "1.4vh",
    fontFamily: "Poppins, sans-serif",
    border: "0.1vh solid #FFECB3",
  },

  rankPlain: {
    width: "3.5vh",
    height: "3.5vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9CA3AF",
    fontWeight: 600,
    fontSize: "1.3vh",
    fontFamily: "Poppins, sans-serif",
  },

  statusSuccess: {
    color: "#007664",
    fontWeight: 700,
    fontSize: "1.3vh",
    fontFamily: "Poppins, sans-serif",
    letterSpacing: "0.05vh",
  },

  statusFailed: {
    color: "#A62021",
    fontWeight: 700,
    fontSize: "1.3vh",
    fontFamily: "Poppins, sans-serif",
    letterSpacing: "0.05vh",
  },

  progressBarIndicator: {
    flex: 0.6,
    height: "0.8vh",
    backgroundColor: "#F3F4F6",
    borderRadius: "1vh",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: "1vh",
    transition: "width 0.3s ease",
  },

  scorePercent: {
    fontWeight: 700,
    fontSize: "1.4vh",
    fontFamily: "Poppins, sans-serif",
  },

  decisionPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#006B66",
    color: "white",
    padding: "0.6vh 2vh",
    borderRadius: "10vh",
    fontSize: "1.2vh",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    textTransform: "uppercase",
    minWidth: "10vh",
  },

  decisionPillRejected: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#A62021",
    color: "white",
    padding: "0.6vh 2vh",
    borderRadius: "10vh",
    fontSize: "1.2vh",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    textTransform: "uppercase",
    minWidth: "10vh",
  },

  decisionPillPending: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    color: "#9CA3AF",
    padding: "0.6vh 2vh",
    borderRadius: "10vh",
    fontSize: "1.2vh",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    textTransform: "uppercase",
    minWidth: "10vh",
    border: "0.1vh solid #E5E7EB",
  },

  reasonText: {
    fontSize: "1.2vh",
    fontFamily: "Poppins, sans-serif",
    color: "#9CA3AF",
    fontWeight: 500,
    lineHeight: "1.6vh",
    maxWidth: "30vh",
  },

  viewAnalysisLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.8vh",
    color: "#006B66",
    fontWeight: 600,
    fontSize: "1.3vh",
    fontFamily: "Poppins, sans-serif",
    cursor: "pointer",
    textDecoration: "underline",
    "&:hover": {
      opacity: 0.8,
    },
  },

  documentIcon: {
    fontSize: "1.8vh",
    color: "#007664",
  },

  // Container Styles
  jobDetailsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "1.5vh",
    padding: "0vh 1vw",
    marginTop: "-3vh",
    marginRight: "3.5vh",
    display: "flex",
    flexDirection: "column",
  },

  scrollableDescription: {
    maxHeight: "18vh",
    overflowY: "auto",
    paddingRight: "1vh",
    "&::-webkit-scrollbar": {
      width: "0.6vh",
    },
    "&::-webkit-scrollbar-track": {
      background: "#f0f0f0",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#cccccc",
      borderRadius: "0.5vh",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "#aaaaaa",
    },
  },

  // Information Display Styles
  infoRow: {
    marginTop: "3vh",
    display: "flex",
    alignItems: "center",
    gap: "3vh",
    flexWrap: "wrap",
  },

  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "1vh",
    fontSize: "1.5vh",
    fontFamily: "Poppins, sans-serif",
    color: "#6B7280",
  },

  bold: {
    color: "#111827",
  },

  iconBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "3.2vh",
    height: "3.2vh",
    borderRadius: "0.8vh",
    backgroundColor: "#E6F4F1",
  },

  icon: {
    fontSize: "1.6vh",
    color: "#0D9488",
  },

  iconBoxRed: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "3.2vh",
    height: "3.2vh",
    borderRadius: "0.8vh",
    backgroundColor: "#E6F4F1",
  },

  iconRed: {
    fontSize: "1.6vh",
    color: "#0D9488",
  },

  // Accordion Styles
  accordion: {
    boxShadow: "none",
    border: "none",
    backgroundColor: "transparent",
    padding: "0vh 0vw",
    borderRadius: "1vh",
    "&:before": {
      display: "none",
    },
    "& .MuiCollapse-root": {
      margin: "0vh !important",
      padding: "0vh !important",
    },
  },

  accordionHeader: {
    padding: "0vh 0vw !important",
    minHeight: "0vh !important",
    "&.Mui-expanded": {
      minHeight: "0vh !important",
    },
    "& .MuiAccordionSummary-content": {
      margin: "0vh !important",
      padding: "0vh !important",
    },
    "& .MuiAccordionSummary-expandIconWrapper": {
      margin: "0vh !important",
      padding: "0vh !important",
    },
  },

  accordionDetails: {
    padding: "0vh 0vw 0vh 0vw !important",
    marginTop: "0vh !important",
  },

  jobHeader: {},
}
