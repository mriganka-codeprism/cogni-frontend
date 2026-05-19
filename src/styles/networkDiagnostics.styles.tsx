import { globalStyles } from "../config";
import { CheckStatus } from "../types/networkDiagnostics";

const statusColorMap: Record<CheckStatus, { bg: string; text: string }> = {
  pass: { bg: "#DCFCE7", text: "#15803D" },
  warn: { bg: "#FEF3C7", text: "#B45309" },
  fail: { bg: "#FEE2E2", text: "#B91C1C" },
  running: { bg: "#DBEAFE", text: "#1D4ED8" },
  pending: { bg: "#F3F4F6", text: "#6B7280" },
};

export const getStatusColors = (status: CheckStatus) => statusColorMap[status];

export const diagnosticsStyles = {
  pageContainer: {
    height: "88vh", // Reduced from 100vh to account for global app header
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: globalStyles.fonts.body,
  },

  headerBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "2vh 2vw",
    backgroundColor: "#fff",
    borderBottom: "0.1vh solid #E5E7EB",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1vw",
  },

  iconCircle: {
    width: "4.8vh",
    height: "4.5vh",
    borderRadius: "1.8vh",
    backgroundColor: "#065F46", // Dark green
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0.4vh 1.2vh rgba(6, 95, 70, 0.2)",
  },

  titleStack: {
    display: "flex",
    flexDirection: "column",
  },

  pageTitle: {
    fontSize: "2.4vh",
    fontWeight: 700,
    fontFamily: globalStyles.fonts.heading,
    color: "#111827",
    lineHeight: 1.2,
  },

  pageSubtitle: {
    fontSize: "1.4vh",
    fontWeight: 500,
    color: "#6B7280",
    letterSpacing: "0.01em",
  },

  runButton: {
    backgroundColor: "#9B1C1C", // Reddish button
    color: "#fff",
    fontSize: "1.6vh",
    fontWeight: 600,
    padding: "0.5vh 1.5vh",
    borderRadius: "1.2vh",
    textTransform: "none" as const,
    boxShadow: "0 0.4vh 1vh rgba(155, 28, 28, 0.2)",
    "&:hover": {
      backgroundColor: "#7F1D1D",
    },
    "&.Mui-disabled": {
      backgroundColor: "#F3F4F6",
      color: "#9CA3AF",
    },
  },

  scrollContainer: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "3vh 2vw",
    backgroundColor: "#F9FAFB", // Light grey background
    scrollbarWidth: "none" as const,
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },

  overallStatusBox: {
    display: "flex",
    flexDirection: "column" as const,
    width: "100%",
    padding: "2vh 2vw",
    borderRadius: "1.5vh",
    border: "0.1vh solid #E5E7EB",
    backgroundColor: "#fff",
    marginBottom: "3vh",
    boxShadow: "0 0.2vh 0.5vh rgba(0,0,0,0.02)",
    gap: "1.5vh",
  },

  statusTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },

  overallBadge: {
    backgroundColor: "#c77a77",
    color: "#374151",
    padding: "0.6vh 1.8vh",
    borderRadius: "2vh",
    fontSize: "1.3vh",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  progressBarContainer: {
    width: "100%",
    height: "0.6vh",
    borderRadius: "0.3vh",
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
  },

  progressBar: (pct: number) => ({
    width: `${pct}%`,
    height: "100%",
    backgroundColor: "#D32F2F", // Red progress bar for running tests
    borderRadius: "0.3vh",
    transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  }),

  progressText: {
    fontSize: "1.4vh",
    fontWeight: 600,
    color: "#6B7280",
    minWidth: "8vw",
    textAlign: "right",
  },

  accordion: {
    border: "0.1vh solid #E5E7EB",
    borderRadius: "1.5vh !important",
    marginBottom: "2vh",
    boxShadow: "0 0.2vh 0.5vh rgba(0,0,0,0.02)",
    overflow: "hidden",
    "&:before": { display: "none" },
    "&.Mui-expanded": { margin: "0 0 2vh 0" },
  },

  accordionSummary: {
    minHeight: "6.5vh",
    padding: "0 2vw",
    backgroundColor: "#fff",
    borderBottom: "0.1vh solid #c3c4c5", // Divider between header and details
    "& .MuiAccordionSummary-content": {
      margin: "2vh 0",
      alignItems: "center",
      display: "flex",
      gap: "1vw",
    },
    "& .MuiAccordionSummary-expandIconWrapper": {
      color: "#9CA3AF",
    },
  },

  categoryIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "4vh",
    height: "4vh",
    borderRadius: "1vh",
    backgroundColor: "#F0FDFA",
    color: "#0D9488",
  },

  categoryTitle: {
    fontSize: "1.8vh",
    fontWeight: 700,
    color: "#111827",
  },

  categorySummaryChip: (status: CheckStatus) => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "0.4vh 1.2vh",
    borderRadius: "2vh",
    backgroundColor: status === "pending" ? "#F3F4F6" : statusColorMap[status].bg,
    color: status === "pending" ? "#374151" : statusColorMap[status].text,
    fontSize: "1.2vh",
    fontWeight: 600,
    marginLeft: "0.5vw",
  }),

  checkRow: {
    display: "grid",
    gridTemplateColumns: "4vw 20vw 10vw 1fr",
    alignItems: "center",
    padding: "1.5vh 0",
    borderBottom: "0.1vh solid #F3F4F6",
    height: "7vh",
    "&:last-child": {
      borderBottom: "none",
    },
  },

  statusDot: (status: CheckStatus) => ({
    width: "1.2vh",
    height: "1.2vh",
    borderRadius: "50%",
    backgroundColor: status === "pending" ? "#E5E7EB" : statusColorMap[status].text,
    justifySelf: "center",
  }),

  checkName: {
    fontSize: "1.6vh",
    fontWeight: 700,
    color: "#111827",
    paddingRight: "1vw",
  },

  checkValue: {
    fontSize: "1.6vh",
    color: "#6B7280",
    fontWeight: 500,
  },

  checkDescriptionBox: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4vh",
  },

  checkDescription: {
    fontSize: "1.6vh",
    fontWeight: 600,
    color: "#374151",
  },

  checkThresholds: {
    fontSize: "1.3vh",
    color: "#9CA3AF",
    fontWeight: 500,
  },

  thresholdsText: {
    fontSize: "1.2vh",
    color: "#9CA3AF",
    marginTop: "0.3vh",
    fontFamily: "monospace",
    letterSpacing: "0.02em",
  },

  recommendationBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.5vw",
    marginTop: "0.5vh",
    padding: "0.8vh 1vh",
    borderRadius: "0.5vh",
    backgroundColor: "#FEF3C7",
  },

  recommendationText: {
    fontSize: "1.4vh",
    color: "#92400E",
  },

  firewallSection: {
    marginTop: "4vh",
    padding: "3vh 2vw",
    border: "0.1vh solid #E5E7EB",
    borderRadius: "2vh",
    backgroundColor: "#fff",
    boxShadow: "0 0.2vh 0.5vh rgba(0,0,0,0.02)",
  },

  firewallHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1.2vw",
    marginBottom: "3vh",
  },

  firewallIconCircle: {
    width: "4.5vh",
    height: "4.5vh",
    borderRadius: "1.2vh",
    backgroundColor: "#F0FDFA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#0D9488",
  },

  firewallTitleBox: {
    display: "flex",
    flexDirection: "column",
  },

  firewallTitle: {
    fontSize: "1.8vh",
    fontWeight: 700,
    color: "#111827",
  },

  firewallSubtitle: {
    fontSize: "1.3vh",
    color: "#6B7280",
    fontWeight: 500,
  },

  firewallTable: {
    border: "none",
    "& .MuiTableCell-root": {
      borderBottom: "none",
      padding: "1.2vh 1vh",
    },
    "& .MuiTableHead-root .MuiTableCell-root": {
      fontSize: "1.2vh",
      fontWeight: 800,
      color: "#9CA3AF",
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
      backgroundColor: "#F9FAFB", // Light grey background for header row
      padding: "1.5vh 1vh",
    },
  },

  serviceCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.8vw",
    color: "#059669",
    fontWeight: 700,
    fontSize: "1.4vh",
  },

  serviceDot: {
    width: "0.8vh",
    height: "0.8vh",
    borderRadius: "50%",
    backgroundColor: "#059669",
  },

  protocolChip: {
    display: "inline-flex",
    padding: "0.4vh 1vh",
    borderRadius: "0.6vh",
    backgroundColor: "#F3F4F6",
    color: "#374151",
    fontSize: "1.1vh",
    fontWeight: 800,
    textTransform: "uppercase" as const,
  },

  portText: {
    color: "#059669",
    fontWeight: 800,
    fontSize: "1.4vh",
  },

  directionChip: (direction: string) => ({
    display: "inline-flex",
    padding: "0.4vh 1vh",
    borderRadius: "0.6vh",
    backgroundColor: direction === "Bidirectional" ? "#FAF5FF" : "#EFF6FF",
    color: direction === "Bidirectional" ? "#9333EA" : "#2563EB",
    fontSize: "1.1vh",
    fontWeight: 800,
    whiteSpace: "nowrap",
  }),

  requiredForText: {
    fontSize: "1.4vh",
    color: "#4B5563",
    fontWeight: 500,
  },

  actionsBox: {
    display: "flex",
    gap: "1vw",
    marginTop: "2vh",
    marginBottom: "2vh",
  },

  actionButton: {
    fontSize: "1.5vh",
    padding: "0.8vh 1.5vh",
    borderRadius: "0.8vh",
    textTransform: "none" as const,
    border: `0.15vh solid ${globalStyles.colors.primary}`,
    color: globalStyles.colors.primary,
    "&:hover": {
      backgroundColor: globalStyles.colors.primaryLight,
    },
  },

  spinnerBox: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5vw",
  },

  spinner: {
    color: "#1D4ED8",
    width: "1.6vh !important",
    height: "1.6vh !important",
  },

  statusTag: (status: CheckStatus) => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "0.3vh 1vh",
    borderRadius: "1.5vh",
    backgroundColor: statusColorMap[status].bg,
    color: statusColorMap[status].text,
    fontSize: "1.3vh",
    fontWeight: 600,
    textTransform: "uppercase" as const,
  }),
};
