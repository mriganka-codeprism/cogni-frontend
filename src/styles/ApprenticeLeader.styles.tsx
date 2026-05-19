import { Scale } from "@mui/icons-material";
import { globalStyles } from "../config";

export const roleActionButtonStyle = {
  borderRadius: "1vh",
  borderColor: "#a00",
  borderWidth: "0.15vh",
  color: "#a00",
  minWidth: "10vh",
  fontWeight: 600,
  fontSize: "1.5vh",
  padding: "0.8vh 1.5vh",

  "& .MuiButton-startIcon>*:nth-of-type(1)": {
    fontSize: "2.5vh",
  },
  "& .MuiButton-startIcon": {
    marginLeft: "0vh",
    marginRight: "0.7vh",
  },
};

export const styles = {
  page: {
    width: "100%",
    height: "100%",
    padding: "2vh",
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    "@media (max-device-width: 480px)": {
      padding: "1.5vh",
    },
  },

  /* HEADER */

  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1vh",
    gap: "2vh",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "2vh",
    flexWrap: "wrap",
  },

  backButton: {
  backgroundColor: globalStyles.colors.primary,
  color: "#fff",

  width: "clamp(4vh, 4.5vh, 5vh)",
  height: "clamp(4vh, 4.5vh, 5vh)",
  minWidth: "clamp(4vh, 4.5vh, 5vh)",
  minHeight: "clamp(4vh, 4.5vh, 5vh)",

  padding: "0",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  "& .MuiSvgIcon-root": {
    fontSize: "clamp(2vh, 2.5vh, 2.6vh)",
    width: "clamp(2vh, 2.5vh, 2.6vh)",
    height: "clamp(2vh, 2.5vh, 2.6vh)",
    lineHeight: 1,
  },
},



  breadcrumb: {
    marginBottom: "1vh",
    color: "#666",
    fontSize: "1.4vh",
  },

  /* INTERVIEW LINK ROW */

  interviewLinkBox: {
    p: "0.2vh",
    mb: "0vh",
    display: "flex",
    marginTop: "0.2vh",
    gap: "0.5vh",
    alignItems: "center",
    flexWrap: "wrap",
    //background:" #af1818"
  },

  interviewLinkLabel: {
    fontWeight: 600,
    fontSize: "2vh",
    whiteSpace: "nowrap",
  },

  interviewLinkText: {
    color: globalStyles.colors.primary,
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: "2vh",
    minWidth: 0,
  },

  interviewIcons: {
    display: "flex",
    gap: "2vh",
    flexWrap: "wrap",
    alignItems: "center",
  },

  iconButtonSmall: {
    border: "0.15vh solid #ddd",
    width: "3.6vh",
    height: "3.6vh",
    minWidth: "3.6vh",
    minHeight: "3.6vh",
    padding: "2.5vh",

    "& .MuiSvgIcon-root": {
      fontSize: "3vh",
    },
  },


  /* CANDIDATE HEADER */

  candidatesHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1vh",
    marginBottom: "0.5vh",
  },

  /* SEARCH ROW */

  searchRow: {
  display: "flex",
  gap: "min(1vh, 0.6vw)",
  mb: "min(1.5vh, 1vw)",
  marginTop: "min(0.8vh, 0.6vw)",
  alignItems: "center",
  flexWrap: "wrap",
},



  searchInput: {
  width: "min(50vh, 40vw)",
  fontSize: "clamp(1.4vh, 1.8vh, 2vh)",
  border: "0.15vh solid rgba(224, 224, 224, 1)",
  borderRadius: "1vh",
  padding: "clamp(0.4vh, 0.6vh, 0.8vh) clamp(0.6vh, 0.8vh, 1vh)",
  background: "#fff",

  /* Lock the whole input row */
  "& .MuiInputBase-root": {
    height: "clamp(3vh, 2vh, 5vh)",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
  },

  /* Lock the text */
  "& .MuiInputBase-input": {
    fontSize: "clamp(1.8vh, 2vh, 2.2vh)",
    lineHeight: "1vh",
    padding: "0",
  },

  /* Lock the search icon */
  "& .MuiSvgIcon-root": {
    fontSize: "clamp(1.8vh, 2vh, 2.2vh)",
    flexShrink: 0,
  },

  /* Lock the adornment container */
  "& .MuiInputAdornment-root": {
    height: "100%",
    display: "flex",
    alignItems: "center",
    marginRight: "0.6vh",
  },

  "& .MuiInput-root:before": {
    borderBottom: "none !important",
  },
  "& .MuiInput-root:after": {
    borderBottom: "none !important",
  },
  "& .MuiInput-root:hover:before": {
    borderBottom: "none !important",
  },
},



  filterButton: {
    ...roleActionButtonStyle,
  },

  deleteButton: {
    ...roleActionButtonStyle,
    marginLeft: "auto",
  },

  /* GRID */

    gridWrapper: {
    flex: 1,
    minHeight: 0,              // ⭐ REQUIRED for scroll inside flex
    overflow: "auto",
    margin: "0.5vh",
    display: "flex",
    flexDirection: "column",
    paddingRight: "1vh",

    /* Firefox scrollbar */
    scrollbarWidth: "thin",
    scrollbarColor: "#888 #f1f1f1",

    /* Chrome, Safari, Edge scrollbar */
    "&::-webkit-scrollbar": {
      width: "0.8vw",
    },
    "&::-webkit-scrollbar-track": {
      background: "#f1f1f1",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#888",
      borderRadius: "0.4vw",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "#555",
    },
  },

  gridContainer: {
    marginTop: "1vh",
    "& > .MuiGrid-item": {
      paddingTop: "1vh",
      paddingLeft: "1vw",
      paddingRight: "0.5vh",
    }
    },

  /* PAGINATION */

paginationContainer: {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "0vh",
  backgroundColor: "#fff",
  borderTop: "0.1vh solid #f2f2f2",
},

tablePagination: {
  fontSize: "2vh",
  width: "100%",
  mt: "-0.5vh",

  "& .MuiToolbar-root": {
    padding: "0.4vh 0.6vh",
    minHeight: "3vh",
    justifyContent: "space-between",
  },

  "& .MuiTablePagination-selectLabel": {
    fontSize: "1.6vh",
    marginRight: "1vh",
  },

  "& .MuiInputBase-root": {
    alignItems: "center",
    height: "3.3vh",
    border: "0.1vh solid #f2f2f2",
    borderRadius: "1vh",
  },

  "& .MuiTablePagination-select": {
    fontSize: "1.6vh",
    padding: "0.2vw",
    minWidth: "4.5vw",
  },

  "& .MuiSelect-icon": {
    fontSize: "3vh",
  },

  "& .MuiTablePagination-displayedRows": {
    fontSize: "1.6vh",
    marginLeft: "1vh",
  },

  "& .MuiIconButton-root": {
    padding: "0.6vh",
    margin: "0 0.3vh",
  },

  "& .MuiSvgIcon-root": {
    fontSize: "2.5vh",
  },
},



  /* CARD */

  card: {
    border: "0.1vh solid #d8d8d8",
    backgroundColor: "#f8f8f8",
    borderRadius: "1vh",
    padding: "0.8vh",
    height: "22vh",
    maxHeight: "23vh",
    boxShadow: "none",
    justifyContent: "space-between",
    flexDirection: "column",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "1vh",
  },

  candidateName: {
    fontWeight: 600,
    fontSize: "2.2vh",
  },

  candidateEmail: {
    fontSize: "2vh",
    color: "#999",
  },

  scoreText: {
    fontWeight: 700,
    fontSize: "2.2vh",
    color: globalStyles.colors.primary,
  },

  statusText: {
    fontSize: "1.8vh",
    color: "#999",
  },

  viewAnalysisButton: {
  ...roleActionButtonStyle,

  /* Lock button size */
  height: "clamp(4vh, 4.5vh, 5vh)",
  minHeight: "clamp(4vh, 4.5vh, 5vh)",
  width: "20vh",

  padding: "0.5vh",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "5vh",
  marginLeft:"auto",
  marginRight:"auto",
  // alignSelf: "center", 

 

  /* Lock text size */
  fontSize: "clamp(1.4vh, 1.6vh, 1.8vh)",
  lineHeight: 1,

  /* Lock icon if you ever add one */
  "& .MuiSvgIcon-root": {
    fontSize: "clamp(1.6vh, 1.8vh, 2vh)",
    width: "clamp(1.6vh, 1.8vh, 2vh)",
    height: "clamp(1.6vh, 1.8vh, 2vh)",
    flexShrink: 0,
  },
},

};

export default styles;
