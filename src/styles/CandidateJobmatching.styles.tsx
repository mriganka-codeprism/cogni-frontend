export const getStatusColor = (status: string) => {
  const normalized = String(status || "").toLowerCase();
  switch (normalized) {
    case "not sent":
      return { background: "#FEF3C7", color: "#F59E0B" };
    case "sent":
      return { background: "#E6FAEA", color: "#22C55E" };
    case "legacy":
      return { background: "#FEF3C7", color: "#F59E0B" };
    default:
      return { background: "#FEF3C7", color: "#F59E0B" };
  }
};

export const commonButtonSx = {
  borderRadius: "1vh",
  borderColor: "#a00",
  borderWidth: "0.15vh",
  color: "#a00",
  minWidth: "10vh",
  fontWeight: 600,
  fontSize: "1.5vh",
  padding: "0.8vh 1.5vh",
  textTransform: "none",
  background: "#fff",
  "& .MuiButton-startIcon>*:nth-of-type(1)": {
    fontSize: "2.5vh",
  },
  "& .MuiButton-startIcon": {
    marginLeft: "0vh",
    marginRight: "0.7vh",
  },
};

export const styles = {
  mainBox: {
    p: "2vh",
    background: "#fafbfc",
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
  },

  headerBox: {
    display: "flex",
    alignItems: "center",
    mb: "1.5vh",
    justifyContent: "space-between",
  },

  headerLeftBox: {
    display: "flex",
    alignItems: "center",
    gap: "1.5vh",
  },

  backButton: {
    color: "#a00",
    fontSize: "3vh",
    p: "0.5vh",
    "&:hover": { background: "rgba(160, 0, 0, 0.1)" },
  },

  headerTitle: {
    variant: "h4",
    fontWeight: 700,
    fontSize: "3vh",
    flex: 1,
  },

  headerButtonsBox: {
    display: "flex",
    gap: "1vh",
    alignItems: "center",
  },

  searchAndButtonsBar: {
    display: "flex",
    alignItems: "center",
    gap: "1vh",
    mb: "1.5vh",
  },

  searchInput: {
    width: "35vh",
    fontSize: "1.4vh",
    border: "0.15vh solid rgba(224, 224, 224, 1)",
    borderRadius: "1vh",
    padding: "0.8vh 1vh",
    background: "#fff",
    "& .MuiInputBase-input": {
      padding: "0",
      "&::placeholder": {
        color: "#999",
        opacity: 1,
      },
    },
  },

  sortFilterButtonsBox: {
    display: "flex",
    gap: "1vh",
    alignItems: "center",
  },

  emailStatusText: {
    fontSize: "1.3vh",
    color: "#666",
    fontWeight: 500,
    marginLeft: "auto",
  },

  tableContainerPaper: {
    borderRadius: "1.5vh",
    boxShadow: 0,
    border: "0.15vh solid rgba(224, 224, 224, 1)",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
  },

  tableContainer: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    borderRadius: "1.5vh",
  },

  tableHeadRow: {
    background: "#f5f5f5",
    "& .MuiTableCell-head": {
      background: "#f5f5f5",
      color: "#000",
      fontWeight: 700,
      fontSize: "1.4vh",
      padding: "1vh 1.2vh",
    },
  },

  tableBodyRow: {
    "& .MuiTableCell-body": {
      fontSize: "1.3vh",
      padding: "0.8vh 1.2vh",
    },
  },

  checkboxCell: {
    width: "5vh",
  },

  nameCellStyle: {
    fontWeight: 500,
  },

  emailCellStyle: {
    color: "#666",
  },

  scoreCellStyle: {
    fontWeight: 600,
  },

  statusBadge: {
    display: "inline-block",
    padding: "0.4vh 0.8vh",
    borderRadius: "0.5vh",
    fontSize: "1.2vh",
    fontWeight: 600,
  },

  summaryCellStyle: {
    color: "#666",
    maxWidth: "30vh",
  },

  cvBadge: {
    display: "inline-block",
    padding: "0.4vh 0.8vh",
    borderRadius: "0.5vh",
    fontSize: "1.2vh",
    background: "#F5F5F5",
    color: "#A0A0A0",
  },

  noCandidatesCell: {
    textAlign: "center",
    py: "2vh",
  },
};

export default styles;
