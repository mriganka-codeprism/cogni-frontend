export const styles = {
  header: {
    backgroundColor: "#0f6c63",
    color: "#fff",
    padding: "2vh 3vh",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: { fontWeight: 600, fontSize: "2vh" },
  file: { fontSize: "1.3vh", opacity: 0.9 },
  closeBtn: { color: "#fff" },
  content: { padding: "3vh" },

  kpiRow: {
    display: "flex",
    gap: "2vh",
    flexWrap: "wrap",
  },

  kpiCard: {
    flex: 1,
    minWidth: "180px",
    background: "#f7f8fa",
    borderRadius: "1.2vh",
    padding: "2vh",
  },

  kpiLabel: { fontSize: "1.2vh", color: "#6b7280" },
  kpiValue: { fontSize: "3vh", fontWeight: 700, color: "#0f6c63" },
  statusApproved: { color: "#0f6c63", fontWeight: 600 },

  emailRow: { 
    display: "flex", 
    alignItems: "center", 
    gap: "0.8vh",
    width: "100%",
    overflow: "hidden"
  },
  emailText: { 
    fontWeight: 500,
    fontSize: "1.3vh",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%"
  },

  thresholdCard: {
    background: "#f7f8fa",
    borderRadius: "1.2vh",
    padding: "2vh",
    marginTop: "2vh",
  },

  thresholdTitle: { fontWeight: 600 },
  thresholdText: { fontSize: "1.3vh", color: "#555" },

  breakdownWrapper: { marginTop: "3vh" },
  breakdownTitle: { fontWeight: 700 },
  breakdownSub: { fontSize: "1.3vh", color: "#666", marginTop: "0.5vh" },

  tableHeader: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 2fr",
    fontWeight: 600,
  },

  tableRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 2fr",
    padding: "0.6vh 0",
  },

  scoreGreen: { color: "#0f6c63", fontWeight: 600 },

  totalScore: {
    textAlign: "right",
    fontWeight: 700,
    "& span": { color: "#0f6c63" },
  },
};
