export const styles = {
  root: {
    padding: "2vh 2vw",
    backgroundColor: "#f9fafb",
    Height: "100%",
  },

  breadcrumbWrapper: {
    marginBottom: "1.5vh",
  },

  breadcrumb: {
    fontSize: "1.4vh",
    color: "#667085",
    display: "flex",
    alignItems: "center",
    gap: "0.4vh",
  },

  breadcrumbLink: {
    cursor: "pointer",
    "&:hover": {
      color: "#006b66",
      textDecoration: "underline",
    },
  },

  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2vh",
  },

  jobTitle: {
    fontSize: "2.4vh",
    fontWeight: 700,
    color: "#101828",
  },

  statusBadge: {
    backgroundColor: "#ecfdf3",
    color: "#027a48",
    fontSize: "1.2vh",
    padding: "0.3vh 0.9vh",
    borderRadius: "2vh",
    fontWeight: 600,
  },

  jobId: {
    fontSize: "1.3vh",
    color: "#667085",
    marginTop: "0.3vh",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: "1vh",
    padding: "2vh",
    border: "1px solid #eaecf0",
  },

  cardTitle: {
    fontSize: "2vh",
    fontWeight: 600,
    marginBottom: "0.5vh",
    color: "#101828",
  },

  cardSubtitle: {
    fontSize: "1.4vh",
    color: "#667085",
    marginBottom: "2vh",
  },

  /* ✅ ADD THESE ↓↓↓ */

  label: {
    fontSize: "1.3vh",
    fontWeight: 600,
    color: "#344054",
    marginTop: "1.5vh",
    marginBottom: "0.5vh",
  },

  chipContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.6vh",
    marginBottom: "1vh",
  },

  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "2vh",
  },

  sendButton: {
    backgroundColor: "#006b66",
    textTransform: "none",
    padding: "0.9vh 2.5vh",
    borderRadius: "0.8vh",
    "&:hover": {
      backgroundColor: "#005a55",
    },
  },

  recipientBox: {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.6vh",
  padding: "0.8vh",
  borderRadius: "0.8vh",
  backgroundColor: "#ffffff",
  alignContent: "flex-start",
  scrollbarWidth: "thin",
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f3f4f6",
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#d1d5db",
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "#9ca3af",
  },
},

recipientChip: {
  fontSize: "1.3vh",
  backgroundColor: "#f2f4f7",
  borderRadius: "2vh",
  border: "1px solid #e5e7eb",
  height: "3.2vh",
  "& .MuiChip-label": {
    padding: "0 0.8vh",
    fontWeight: 500,
    color: "#374151",
  },
  "& .MuiChip-deleteIcon": {
    fontSize: "1.6vh",
    color: "#9ca3af",
    marginRight: "0.4vh",
    "&:hover": {
      color: "#ef4444",
    },
  },
  "&:hover": {
    backgroundColor: "#e5e7eb",
    border: "1px solid #d1d5db",
  },
},
moreText: {
  fontSize: "1.2vh",
  color: "#667085",
  alignSelf: "center",
  marginLeft: "0.5vh",
},

};
