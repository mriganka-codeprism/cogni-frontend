export const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "2vh",
    padding: "2vh",
  },

  // KPI Cards Styles
  kpiContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "1vw",
    marginBottom: "2vh",
  },

  kpiCard: {
    display: "flex",
    alignItems: "center",
    gap: "2vh",
    padding: "1.2vh 1.5vh",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderTop: "4px solid #006b66",
    borderRadius: "1vh",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    transition: "all 0.2s ease",
    "&:hover": {
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
    },
    "&:nth-of-type(3)": {
      borderTopColor: "#f59e0b",
    },
    "&:nth-of-type(5)": {
      borderTopColor: "#991b1b",
    },
    "&:nth-of-type(6)": {
      borderTopColor: "#991b1b",
    },
  },

  kpiIconBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  kpiIcon: {
    fontSize: "2.2vh",
    fontWeight: "bold",
  },

  kpiContent: {
    display: "flex",
    flexDirection: "column",
    gap: "0.1vh",
    flex: 1,
  },

  kpiLabel: {
    fontSize: "1vh",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    color: "#a2a4a8",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },

  kpiValue: {
    fontSize: "2.4vh",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 700,
    lineHeight: "1",
    color: "#006b66",
  },

  // Table Styles
  tableContainer: {
    borderRadius: "0.8vh",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    height: "33vh",
    scrollbarWidth: "thin",
  },

  candidatesTable: {
    "& .MuiTableCell-root": {
      padding: "1.2vh 1.5vh",
      fontSize: "1.3vh",
      fontFamily: "Poppins, sans-serif",
    },
  },

  tableHeaderRow: {
    backgroundColor: "#f9fafb",
    "& .MuiTableCell-head": {
      backgroundColor: "#f9fafb",
      borderBottom: "1px solid #e5e7eb",
    },
  },

  tableHeaderCell: {
    fontWeight: 600,
    color: "#1f2937",
    fontSize: "1.3vh",
    fontFamily: "Poppins, sans-serif",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
};
