export const styles = {
  root: {
    padding: "2vh 1.5vw",
    backgroundColor: "#ffffff", // Soft light grey background
    minHeight: "100%",
    borderTop: "2px solid #E5E7EB", // Add top border for section separation
  },

  /* 🔹 Breadcrumb */
  breadcrumb: {
    fontSize: "1.2vh",
    color: "#9CA3AF",
    marginBottom: "2vh",
    display: "flex",
    alignItems: "center",
    gap: "0.5vh",
  },

  breadcrumbLink: {
    cursor: "pointer",
    color: "#9CA3AF",
    "&:hover": {
      textDecoration: "underline",
    },
  },

  /* 🔹 Header Section */
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "0vh",
  },

  jobTitleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "1.5vh",
    marginBottom: "0.5vh",
  },

  jobTitle: {
    fontSize: "2vh",
    fontWeight: 800,
    color: "#111827",
  },

  activeStatusChip: {
    backgroundColor: "#F0F9F8",
    color: "#007664",
    padding: "0.4vh 1.4vh",
    borderRadius: "10vh",
    fontSize: "1.1vh",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "0.8vh",
    border: "0.1vh solid #0076644D",
    height: "2.5vh",
  },

  statusDot: {
    width: "0.8vh",
    height: "0.8vh",
    borderRadius: "50%",
    backgroundColor: "#007664",
  },

  jobInfoSubRow: {
    display: "flex",
    alignItems: "center",
    gap: "2vh",
  },

  jobId: {
    fontSize: "1.3vh",
    color: "#6B7280",
    fontWeight: 500,
  },

  viewJobDescLink: {
    fontSize: "1.3vh",
    color: "#007664",
    fontWeight: 600,
    textDecoration: "underline",
    display: "flex",
    alignItems: "center",
    gap: "0.5vh",
    cursor: "pointer",
    "&:hover": {
      opacity: 0.8,
    },
  },

  headerActionButtons: {
    display: "flex",
    alignItems: "center",
    gap: "2vh",
  },

  sendMailButton: {
    backgroundColor: "#006B66",
    color: "#ffffff",
    padding: "0.8vh 2.5vh",
    borderRadius: "0.8vh",
    textTransform: "none",
    fontWeight: 700,
    fontSize: "1.4vh",
    display: "flex",
    alignItems: "center",
    gap: "1vh",
    "&:hover": {
      backgroundColor: "#005752",
    },
  },

  candidateDetailsButton: {
    border: "0.1vh solid #006B66",
    color: "#006B66",
    padding: "0.8vh 1.5vh",
    borderRadius: "0.8vh",
    textTransform: "none",
    fontWeight: 700,
    fontSize: "1.4vh",
    display: "flex",
    alignItems: "center",
    gap: "1vh",
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "#F0F9F8",
      borderColor: "#006B66",
    },
  },

  /* 🔹 Candidate Scores Section Title */
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "3vh",
  },

  sectionTitle: {
    fontSize: "2vh",
    fontWeight: 800,
    color: "#111827",
    marginBottom: "0.5vh",
  },

  sectionSubtitle: {
    fontSize: "1.4vh",
    color: "#9CA3AF",
    fontWeight: 500,
  },

  /* 🔹 Table Container Styling */
  tableWrapper: {
    border: "0.1vh solid #E5E7EB",
    borderRadius: "1.2vh",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    position: "relative",
    boxShadow: "0 0.4vh 1.2vh rgba(0, 0, 0, 0.05)",
    marginTop: "2vh",
  },

  tableHeaderCell: {
    fontWeight: 700,
    fontSize: "1.4vh",
    color: "#374151",
    backgroundColor: "#F9FAFB",
    padding: "0.5vh 1.5vh",
  },

  bodyScroll: {
    maxHeight: "60vh",
    overflowY: "auto",
    backgroundColor: "#ffffff",
    "&::-webkit-scrollbar": {
      width: "0.5vh",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#E5E7EB",
      borderRadius: "1vh",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "#D1D5DB",
    },
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
  },

  statusSuccess: {
    color: "#007664",
    fontWeight: 700,
    fontSize: "1.3vh",
    letterSpacing: "0.05vh",
  },

  statusFailed: {
    color: "#A62021",
    fontWeight: 700,
    fontSize: "1.3vh",
    letterSpacing: "0.05vh",
  },

  progressBarContainer: {
    display: "flex",
    alignItems: "center",
    gap: "1.5vh",
    width: "100%",
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
  },

  decisionPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#006B66",
    color: "white",
    padding: "0.6vh 2vh",
    borderRadius: "1.2vh",
    fontSize: "1.2vh",
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
    borderRadius: "1.2vh",
    fontSize: "1.2vh",
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
    borderRadius: "1.2vh",
    fontSize: "1.2vh",
    fontWeight: 600,
    textTransform: "uppercase",
    minWidth: "10vh",
    border: "0.1vh solid #E5E7EB",
  },

  reasonText: {
    fontSize: "1.2vh",
    color: "#606266",
    fontWeight: 500,
    lineHeight: "1.6vh",
    maxWidth: "30vh",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  checkboxBase: {
    color: "#006B66",
    "&.Mui-checked": {
      color: "#006B66",
    },
  },

  viewAnalysisLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.8vh",
    color: "#006B66",
    fontWeight: 600,
    fontSize: "1.3vh",
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
};
