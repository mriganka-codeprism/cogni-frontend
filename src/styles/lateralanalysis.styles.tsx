import { categoryStyles } from "./categoryManagement.styles";

// base style extracted to avoid referencing `styles` during initialization
export const evaluationButtonBase = {
  borderRadius: "8px",
  color: "#fff",
  fontWeight: 600,
  fontSize: "13px",
  padding: "6px 12px",
  minWidth: "140px",
  mr: "12px",
  position: "relative",
  overflow: "hidden",
  whiteSpace: "nowrap",
};

export const getStatusColor = (status: string) => {
  const normalized = String(status || "")
    .toLowerCase()
    .replaceAll("_", " ");
  switch (normalized) {
    case "selected":
      return { background: "#E6F4EA", color: "#1E8E3E" };
    case "not selected":
      return { background: "#FEE7E9", color: "#A62021" };
    case "not evaluated":
      return { background: "#FEF3C7", color: "#F59E0B" };
    case "disqualified":
      return { background: "#DBEAFE", color: "#3B82F6" };
    default:
      return { background: "#DBEAFE", color: "#3B82F6" };
  }
};

export const styles = {
  mainBox: {
    p: "12px",
    pb: "48px",
    background: "#fafbfc",
    height: "91vh",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    width: "100%",
    overflow: "hidden",
  },

  titleBox: {
    display: "flex",
    alignItems: "center",
    mb: "6px",
    justifyContent: "space-between",
    flexShrink: 0,
  },

  title: {
    variant: "h4",
    fontWeight: 700,
    fontSize: "20px",
    flex: 1,
    fontFamily: "Poppins, sans-serif",
  },

  dropdownsContainer: {
    display: "flex",
    alignItems: "flex-end",
    gap: "12px",
    mb: "12px",
    justifyContent: "space-between",
    boxSizing: "border-box",
    width: "100%",
    flexShrink: 0,
    flexWrap: "wrap",
  },

  dropdownsLeftBox: {
    display: "flex",
    gap: "8px",
    marginBottom: 0,
    flexWrap: "wrap",
    alignItems: "flex-end",
  },

  dropdownSection: {
    display: "flex",
    flexDirection: "column",
  },

  dropdownLabel: {
    variant: "body2",
    fontSize: "12px",
    fontWeight: 600,
    mb: "4px",
    color: "text.primary",
    fontFamily: "Poppins, sans-serif",
  },

  collegeSelect: {
    ...categoryStyles.textfield,
    fontSize: "13px",
    minWidth: "160px",
    width: "160px",
    borderRadius: "8px",
    "& .MuiSelect-icon": {
      fontSize: "20px",
      right: "6px",
      width: "24px",
      height: "20px",
      fontFamily: "Poppins, sans-serif",
    },
  },

  collegeSelectMenu: {
    disableAutoFocusItem: true,
    PaperProps: {
      sx: {
        height: "auto",
        width: "360px",
        maxWidth: "90vw",
        zIndex: 1400,
        "& .MuiMenuItem-root": {
          fontSize: "12px",
          py: "5px",
        },
        "& .MuiList-root": {
          p: "4px",
        },
      },
    },
    MenuListProps: { sx: { p: 0 } },
  },

  listSubheader: {
    position: "sticky",
    top: 0,
    zIndex: 2,
    bgcolor: "#fff",
    p: "5px",
    borderBottom: "1px solid #e0e0e0",
  },

  listSubheaderSearch: {
    position: "sticky",
    top: "28px",
    zIndex: 1,
    bgcolor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: "8px",
    py: "5px",
  },

  inputBase: {
    fontSize: "13px",
    fontFamily: "Poppins, sans-serif",
    border: "1px solid #ddd",
    borderRadius: "5px",
    padding: "3px 5px",
    background: "#fafafa",
    color: "#000",
    width: "100%",
    "& input": {
      color: "#000",
      "&::placeholder": {
        color: "#999",
        opacity: 1,
      },
    },
  },

  selectAllClearButton: {
    textTransform: "none",
    fontWeight: 600,
    fontSize: "12px",
    fontFamily: "Poppins, sans-serif",
    minWidth: "auto",
    px: "8px",
    py: 0,
    "&:hover": {
      backgroundColor: "transparent",
    },
  },

  candidateStatusBox: {
    // removed position: sticky — it has no effect in a non-scrolling flex row
    // and causes layout drift on zoom
  },

  candidateStatusSelect: {
    ...categoryStyles.textfield,
    borderRadius: "8px",
    fontSize: "13px",
    fontFamily: "Poppins, sans-serif",
    minWidth: "140px",
    width: "160px",
    "& .MuiSelect-icon": {
      fontSize: "20px",
      right: "6px",
      width: "24px",
      height: "20px",
    },
  },

  dateRangeBox: {
    // removed position: sticky — same reason as candidateStatusBox
  },

  buttonsRightBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
    marginLeft: "auto",
  },

  downloadButton: {
    borderRadius: "8px",
    borderColor: "#86161B",
    borderWidth: "1px",
    color: "#86161B",
    minWidth: "80px",
    fontWeight: 600,
    fontSize: "12px",
    fontFamily: "Poppins, sans-serif",
    padding: "4px 10px",
    height: "32px",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    "& .MuiButton-startIcon>*:nth-of-type(1)": {
      fontSize: "18px",
    },
    "& .MuiButton-startIcon": {
      marginLeft: 0,
      marginRight: "4px",
    },
  },

  statsGrid: {
    mb: "8px",
    width: "100%",
    boxSizing: "border-box",
    flexShrink: 0,
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderTop: "3px solid #006b66",
    borderRadius: "8px",
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

  statCardContent: {
    p: "0",
    "&.MuiCardContent-root:last-child": { pb: "0" },
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    flex: 1,
  },

  statLabel: {
    fontSize: "10px",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  statValue: {
    fontSize: "20px",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 700,
    lineHeight: "1",
    color: "#111827",
  },

  candidateDetailsBox: {
    mb: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifyContent: "space-between",
    boxSizing: "border-box",
    width: "100%",
    flexShrink: 0,
    flexWrap: "wrap",
  },

  candidateDetailsLeftBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  candidateDetailsTitle: {
    fontWeight: 700,
    fontSize: "16px",
    fontFamily: "Poppins, sans-serif",
  },

  candidateDetailsRightBox: {
    display: "flex",
    alignItems: "center",
  },

  evaluationButton: {
    ...evaluationButtonBase,

    "&:disabled": {
      color: (progressPercentage: number | null) =>
        progressPercentage !== null ? "#000" : undefined,
    },
  },

  searchCandidateInput: {
    width: "300px",
    maxWidth: "100%",
    fontSize: "13px",
    fontFamily: "Poppins, sans-serif",
    border: "1.5px solid rgba(224, 224, 224, 1)",
    borderRadius: "8px",
    padding: "8px",
    height: "36px",
    background: "#fff",
    boxSizing: "border-box",
    "& .MuiInputBase-input": {
      padding: "0",
    },
  },

  tableContainer: {
    borderRadius: "1.5vh",
    boxShadow: 0,
    border: "0.15vh solid rgba(224,224,224,1)",
    flex: 1,
    minHeight: 0,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },

  tableContainerScroll: {
    flex: 1,
    minHeight: 0,
    borderRadius: "1.5vh",
    overflowX: "hidden",
    overflowY: "auto",
    boxSizing: "border-box",
    scrollbarWidth: "none",
  },

  table: {
    tableLayout: "fixed",
    width: "100%",
    boxSizing: "border-box",
    "& .MuiTableRow-root > *": {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      verticalAlign: "middle",
      boxSizing: "border-box",
    },
    "& .MuiTableHead-root .MuiTableCell-root": {
      fontSize: "1.6vh",
      fontWeight: 600,
      background: "#fafbfc",
      borderBottom: "0.15vh solid rgba(224,224,224,1)",
      boxSizing: "border-box",
      paddingTop: "1.2vh",
      paddingBottom: "1.2vh",
      lineHeight: "2.2vh",

    },
    "& .MuiTableCell-root": {
      padding: "0.8vh 1.2vh",
      fontSize: "1.6vh",
      lineHeight: 1.25,
      borderBottom: "0.15vh solid rgba(224,224,224,0.7)",
      whiteSpace: "nowrap",
      verticalAlign: "middle",
      boxSizing: "border-box",

    },
  },

  tableHeaderCell: {
    fontSize: "1.6vh",
    fontWeight: 600,
    background: "#fafbfc",
    borderBottom: "0.15vh solid rgba(224,224,224,1)",
    width: "15%",
    cursor: "pointer",
    transition: "width 0.3s ease",
    height: "7vh",
  },

  tableHeaderCellName: {
    fontSize: "1.6vh",
    fontWeight: 600,
    background: "#fafbfc",
    borderBottom: "0.15vh solid rgba(224,224,224,1)",
    width: "13%",
    cursor: "pointer",
    transition: "width 0.3s ease",
  },

  tableHeaderCellEmail: {
    fontSize: "1.6vh",
    fontWeight: 600,
    background: "#fafbfc",
    borderBottom: "0.15vh solid rgba(224,224,224,1)",
    width: "14%",
    cursor: "pointer",
    transition: "width 0.3s ease",
  },

  tableHeaderCellDate: {
    fontSize: "1.6vh",
    fontWeight: 600,
    background: "#fafbfc",
    borderBottom: "0.15vh solid rgba(224,224,224,1)",
    width: "10%",
    cursor: "pointer",
    transition: "width 0.3s ease",
  },

  tableHeaderCellScore: {
    fontSize: "1.6vh",
    fontWeight: 600,
    background: "#fafbfc",
    borderBottom: "0.15vh solid rgba(224,224,224,1)",
    width: "10%",
    cursor: "pointer",
    transition: "width 0.3s ease",
  },

  tableHeaderCellStatus: {
    fontSize: "1.6vh",
    fontWeight: 600,
    background: "#fafbfc",
    borderBottom: "0.15vh solid rgba(224,224,224,1)",
    width: "14%",
    cursor: "pointer",
    transition: "width 0.3s ease",
  },

  tableHeaderCellActions: {
    fontSize: "1.6vh",
    fontWeight: 600,
    background: "#fafbfc",
    borderBottom: "0.15vh solid rgba(224,224,224,1)",
    width: "17%",
    cursor: "pointer",
    transition: "width 0.3s ease",
  },

  tableHeaderCellContent: {
    display: "flex",
    alignItems: "center",
    gap: "0.3vh",
    whiteSpace: "nowrap",
  },
  // helper that returns sx for the active sort icon (ArrowDownward)
  sortIcon: (isActive: boolean, sortOrder: string) => ({
    fontSize: "1.6vh",
    opacity: isActive ? 1 : 0,
    transition: "transform 0.2s ease, opacity 0.2s ease",
    color: isActive ? "#a00" : "#383838",
    transform: isActive && sortOrder === "ASC" ? "rotate(180deg)" : "none",
  }),

  // default sort icon shown when column is not actively sorted (SwapVert)
  defaultSortIcon: (isActive: boolean) => ({
    fontSize: "1.6vh",
    opacity: 0.5,
    transition: "transform 0.2s ease, opacity 0.2s ease",
    color: "#383838",
  }),

  tableDataCell: {
    fontSize: "1.3vh",
    width: "10%",
    cursor: "pointer",
    transition: "width 0.3s ease",
    height: "7vh",

  },

  tableDataCellName: {
    fontSize: "1.3vh",
    width: "17%",
    cursor: "pointer",
    transition: "width 0.3s ease",
  },

  tableDataCellEmail: {
    fontSize: "1.3vh",
    width: "18%",
    cursor: "pointer",
    transition: "width 0.3s ease",
  },

  tableDataCellDate: {
    fontSize: "1.3vh",
    width: "10%",
    cursor: "pointer",
    transition: "width 0.3s ease",
  },

  tableDataCellScore: {
    fontSize: "1.3vh",
    width: "10%",
    cursor: "pointer",
    transition: "width 0.3s ease",
    textAlign: "center",
  },

  tableDataCellStatus: {
    fontSize: "1.3vh",
    width: "14%",
  },

  tableDataCellActions: {
    fontSize: "1.3vh",
    width: "17%",
  },

  statusBadge: {
    display: "inline-block",
    px: "1vh",
    py: "0.5vh",
    borderRadius: "1vh",
    width: "12vh",
    textAlign: "center",
    fontWeight: 500,
    fontSize: "1.3vh",
  },

  actionButtonsBox: {
    display: "flex",
    gap: "0.5vh",
    alignItems: "center",
    flexWrap: "wrap",
  },

  evaluateButton: {
    background: "#a00",
    color: "#fff",
    borderRadius: "1vh",
    textTransform: "none",
    fontSize: "1.2vh",
    fontWeight: 600,
    padding: "0.5vh 1vh",
    whiteSpace: "nowrap",
    minWidth: "10vw",
    "&:hover": {
      background: "#c00",
    },
  },

  viewEvaluationButton: {
    borderColor: "#800000",
    backgroundColor: "#800000",
    color: "rgb(255, 255, 255)",
    borderRadius: "1vh",
    textTransform: "none",
    fontSize: "1.2vh",
    fontWeight: 600,
    padding: "0.5vh 1vh",
    borderWidth: "0.15vh",
    whiteSpace: "nowrap",
    minWidth: "10vw",
  },

  deleteIconButton: {
    border: "0.15vh solid #A6202133",
    borderRadius: "0.8vh",
    color: "#A62021",
    padding: "0.3vh",
  },

  loadingCell: {
    textAlign: "center",
    fontSize: "1.3vh",
  },

  emptyDataCell: {
    textAlign: "center",
    fontSize: "1.3vh",
  },

  noEvaluationText: {
    whiteSpace: "nowrap",
  },

  disqualifiedRow: {
    backgroundColor: "#fff1f1ff !important",
    transition: "all 0.3s ease",
    position: "relative",
    // Use only a visually appealing boxshadow for the highlight, no solid borders
    boxShadow: "0px 4px 15px rgba(196, 99, 90, 0.25) !important",
    zIndex: 1, // Elevate above row borders
    borderRadius: "1vh",
    "& td": {
      // Ensure row-level borders don't conflict with the shadow
      borderTop: "none !important",
      borderBottom: "none !important",
      "&:first-of-type": {
        borderTopLeftRadius: "1vh",
        borderBottomLeftRadius: "1vh",
      },
      "&:last-of-type": {
        borderTopRightRadius: "1vh",
        borderBottomRightRadius: "1vh",
      },
    },
    // Gentle lift and stronger shadow on hover
    "&:hover": {
      // backgroundColor: "#ffdfdfff !important",
      boxShadow: "0px 4px 15px rgba(95, 21, 14, 0.4) !important",
      transform: "translateY(-1px)",
      zIndex: 10,
    },
  },

  // Search icon styles
  searchIcon: {
    fontSize: "1.6vh",
  },

  searchBoxLabel: {
    fontSize: "1.4vh",
    fontWeight: 600,
  },

  collegeSearchBox: {
    display: "flex",
    gap: "0.5vh",
  },

  collegeMenuItemBox: {
    maxHeight: "60vh",
    overflowY: "auto",
    scrollbarWidth: "thin",
  },

  collegeMenuItemStyle: {
    fontSize: "1.2vh",
    py: "0.6vh",
  },

  checkboxSmall: {
    p: "0.4vh",
    mr: "0.6vh",
  },

  statusMenuItemStyle: {
    fontSize: "1.3vh",
  },

  circularProgress: {
    color: "#a00",
  },

  downloadIconButton: {
    fontSize: "2vh",
  },

  headerTitleBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1vh",
    mb: "1.5vh",
  },

  headerTitle: {
    fontSize: "2.5vh",
    fontWeight: 700,
  },

  paperWrapper: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  tableHeaderBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTableCell: {
    fontSize: "1.6vh",
    fontWeight: 600,
    backgroundColor: "#F3F4F6",
    height: "7vh",
    fontFamily: "Poppins, sans-serif",
  },

  sortIconButtonBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.3vh",
    whiteSpace: "nowrap",
  },

  sortIconButton: {
    padding: "0.2vh",
  },

  sortIconArrow: {
    fontSize: "1.6vh",
    opacity: 1,
    transition: "transform 0.2s ease, opacity 0.2s ease",
    color: "#a00",
  },

  sortIconSwapVert: {
    fontSize: "1.6vh",
    opacity: 0.5,
    transition: "transform 0.2s ease, opacity 0.2s ease",
    color: "#666",
  },

  scrollableTableContainer: {
    flex: 1,
    minHeight: 0,
    overflowX: "hidden",
    overflowY: "auto",
  },

  dataTableCell: {
    fontSize: "1.6vh",
  },

  statusBadgeContainer: {
    display: "inline-block",
    px: "1vh",
    py: "0.5vh",
    borderRadius: "1vh",
    width: "12vh",
    textAlign: "center",
    fontWeight: 500,
    fontSize: "1.3vh",
  },

  actionButtonsContainer: {
    display: "flex",
    gap: "1vh",
    alignItems: "center",
  },

  evaluateButtonContained: {
    flex: 1,
    background: "#86161B",
    color: "#fff",
    borderRadius: "1vh",
    textTransform: "none",
    fontSize: "1.6vh",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    padding: "0.6vh 1vh",
    whiteSpace: "nowrap",
    minWidth: "12vh",
    "&:hover": {
      background: "#c00",
    },
  },

  evaluateButtonOutlined: {
    flex: 1,
    borderColor: "#86161B",
    color: "#86161B",
    borderRadius: "1vh",
    textTransform: "none",
    fontSize: "1.6vh",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    padding: "0.6vh 1vh",
    borderWidth: "0.15vh",
    whiteSpace: "nowrap",
    minWidth: "12vh",
  },

  deleteIconButtonInline: {
    border: "0.15vh solid #e0e0e0",
    borderRadius: "0.8vh",
    color: "#86161B",
    borderColor: "#86161B"
  },

  loadingCellInline: {
    textAlign: "center",
    fontSize: "1.3vh",
  },

  emptyDataCellInline: {
    textAlign: "center",
    fontSize: "1.3vh",
  },

  dataTableCellDate: {
    fontSize: "1.3vh",
    whiteSpace: "nowrap",
    width: "15%",
  },

  dataTableCellScore: {
    fontSize: "1.3vh",
    textAlign: "center",
    width: "10%",
  },

  dataTableCellStatus: {
    width: "12%",
  },

  dataTableCellActions: {
    width: "15%",
  },

  scrollableTableContainerBox: {
    flex: 1,
    minHeight: 0,
    overflowX: "hidden",
    overflowY: "auto",
    width: "100%",
    boxSizing: "border-box",
  },

  statusBadgeInline: {
    borderRadius: "1vh",
    width: "auto",
    textAlign: "center",
    fontWeight: 500,
    fontSize: "1.6vh",
    px: "1vh",
    py: "0.5vh",
  },

  actionButtonsBoxInline: {
    display: "flex",
    gap: "1vh",
    alignItems: "center",
  },

  deleteIconButton22vh: {
    fontSize: "2.2vh",
  },

  paperTableContainer: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    height: "48vh",
    width: "100%",
    boxSizing: "border-box",
  },

  headerTableOnlyTable: {
    tableLayout: "fixed",
    width: "100%",
    boxSizing: "border-box",
    "& .MuiTableRow-root > *": {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      verticalAlign: "middle",
      boxSizing: "border-box",
      fontSize: "1.6vh",
    },
  },

  bodyTableOnlyTable: {
    tableLayout: "fixed",
    width: "100%",
    boxSizing: "border-box",
    "& .MuiTableRow-root > *": {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      verticalAlign: "middle",
      boxSizing: "border-box",
      fontSize: "1.6vh",
    },
  },

  startEvaluationButtonGradient: (progressPercentage: number | null) => ({
    ...evaluationButtonBase,
    background:
      progressPercentage !== null
        ? `linear-gradient(90deg, #a00 ${progressPercentage}%, rgba(160, 0, 0, 0.3) ${progressPercentage}%)`
        : "#a00",
    "&:hover": {
      background:
        progressPercentage !== null
          ? `linear-gradient(90deg, #c00 ${progressPercentage}%, rgba(192, 0, 0, 0.3) ${progressPercentage}%)`
          : "#c00",
    },
  }),

  headerTableCellWithSort: {
    fontSize: "1.4vh",
    fontWeight: 600,
    "&:hover .sortIcon": {
      opacity: 0.5,
    },
  },

  collegeNameHeaderBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.3vh",
    whiteSpace: "nowrap",
  },

  sortIconButtonSmall: {
    padding: "0.2vh",
  },

  sortIconArrowSmall: {
    fontSize: "1.6vh",
    opacity: 1,
    transition: "transform 0.2s ease, opacity 0.2s ease",
    color: "#a00",
  },

  scrollableTableContainerLoading: (isLoading: boolean) => ({
    opacity: isLoading ? 0.7 : 1,
    transition: "opacity 0.2s ease-in-out",
  }),

  // Infinite scroll dropdown styles
  collegeDropdownContainer: {
    maxHeight: "60vh",
    overflowY: "auto",
    scrollbarWidth: "thin",
    "&::-webkit-scrollbar": {
      width: "0.6vh",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#cbd5e1",
      borderRadius: "0.3vh",
    },
  },

  dropdownLoadingBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    py: "1.5vh",
  },

  dropdownLoadingSpinner: {
    fontSize: "2.2vh",
    color: "#3B82F6",
  },

  endOfListMessage: {
    textAlign: "center",
    py: "1vh",
    fontSize: "1.2vh",
    color: "#888",
  },

  // Fixed header + scrollable body table styles
  tableWrapperBox: {
    borderRadius: "1.5vh",
    border: "0.15vh solid rgba(224,224,224,1)",
    flex: 1,
    minHeight: 0,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  headerTableContainer: {
    flexShrink: 0,
    boxSizing: "border-box",
    borderRadius: "1.5vh 1.5vh 0 0",
  },

  headerTable: {
    tableLayout: "fixed",
    width: "100%",
    boxSizing: "border-box",
    "& .MuiTableRow-root": {
      backgroundColor: "#fafbfc",
    },
    "& .MuiTableCell-root": {
      paddingTop: "1.2vh",
      paddingBottom: "1.2vh",
      fontSize: "1.6vh",
      fontWeight: 600,
      borderBottom: "0.15vh solid rgba(224,224,224,1)",
      boxSizing: "border-box",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      verticalAlign: "middle",
    },
  },

  bodyTableContainer: {
    flex: 1,
    minHeight: 0,
    boxSizing: "border-box",
    overflowY: "auto",
    overflowX: "hidden",
    scrollbarWidth: "thin",
    "&::-webkit-scrollbar": {
      width: "0.6vh",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,0.2)",
      borderRadius: "0.3vh",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: "rgba(0,0,0,0.3)",
    },
  },

  bodyTable: {
    tableLayout: "fixed",
    width: "100%",
    boxSizing: "border-box",
    borderCollapse: "collapse",
    "& .MuiTableRow-root > *": {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      verticalAlign: "middle",
      boxSizing: "border-box",
    },
    "& .MuiTableCell-root": {
      padding: "0.8vh 1.2vh",
      fontSize: "1.6vh",
      lineHeight: 1.25,
      borderBottom: "0.15vh solid #F9FAFB",
      boxSizing: "border-box",
      fontFamily: "Poppins, sans-serif",
    },
  },

  emptyTableRow: {
    "& .MuiTableCell-root": {
      textAlign: "center",
      padding: "2vh",
      fontSize: "1.3vh",
    },
  },
};

export default styles;
