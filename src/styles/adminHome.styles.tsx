import { globalStyles } from "../config";

export const adminHomeStyles = {
  clearAllFilters: {
    color: "#900B09",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1.4vh",
    fontFamily: "Poppins, sans-serif",
    textDecoration: "none",
    padding: "0.5vh 1vh",
    display: "flex",
    alignItems: "center",
    gap: "0.5vh",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  box1: {
    height: "10%",
    display: " flex",
  },
  statusBox: {
    width: "1.4vh",
    height: "1.4vh",
    borderRadius: "50%",
    marginRight: "1vh",
    color: "#006b66"
  },
  surveystatustext: {
    fontSize: "1.5vh",
    fontFamily: "Poppins, sans-serif",
    textTransform: "capitalize",
    textWrap: "nowrap",
  },
  gridContainer: {
    marginTop: "0vh",
    width: "100%",
    boxSizing: "border-box",
    "& > .MuiGrid-item": {
      padding: 0,
    },
  },
  grid: {
    width: '100%',
    // minWidth:'20vw',
    // maxWidth:'30vw'
  },
  box2: {
    display: "flex",
    alignItems: "center",
    gap: '0.5vh',
    // width: "70%",
    justifyContent: "end",
  },
  card: {
    border: "0.1vh solid #d8d8d8",
    backgroundColor: "#fdfdfd",
    borderRadius: "1vh",
    padding: "0.8vh",
    //height: "22vh",
    maxHeight: "21.5vh",
    boxShadow: 'none',
  },
  idtext: {
    fontSize: "2vh",
    fontFamily: "Poppins, sans-serif",
    textTransform: "capitalize",
  },
  nameText: {
    fontSize: "1.5vh",
    fontFamily: "Poppins, sans-serif",
    textTransform: "capitalize",
  },
  collegeText: {
    fontSize: "1.5vh",
    fontFamily: "Poppins, sans-serif",
    textTransform: "capitalize",

    // color: "#75818F",
  },
  dateText: {
    fontSize: "1.5vh",
    fontFamily: "Poppins, sans-serif",
    textTransform: "capitalize",
    marginTop: "0.4vh",
    // color: "#75818F",
  },
  box3: {
    display: "flex",
    alignItems: "center",
    gap: "0.5vh",
    // width: "30%",
    justifyContent: "end",
  },
  evaluationText: {
    fontSize: "1.5vh",
    fontFamily: "Poppins, sans-serif",
    textTransform: "capitalize",

    // color: "#75818F",
  },
  box4: {
    p: 0.5,
    borderRadius: "3vh",
  },
  evaluationStatusText: {
    fontSize: "1.4vh",
    fontFamily: "Poppins, sans-serif",
    textTransform: "capitalize",
  },
  button: {
    padding: "1.0vh 1.2vh",
    gap: "0.5vh",
    fontSize: "1.6vh",
    fontFamily: "Poppins, sans-serif",
    boxShadow: "none",
    height: "3.5vh",
  },
  statusfieldwidth: {
    color: "#374151",
    height: "4.2vh",
    width: "22vh",
    "& .MuiOutlinedInput-root": {
      height: "4.2vh",
      borderRadius: "0.8vh",
      "& fieldset": {
        borderColor: "#d1d5db",
        borderWidth: "1.5px",
      },
      "&:hover fieldset": {
        borderColor: "#9ca3af",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#0f766e",
      },
    },
    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
      padding: "0 1.2vh !important",
      height: "4.2vh !important",
      fontSize: "1.4vh",
      fontFamily: "Poppins, sans-serif",
    },
  },

  searchIcon: {
    fontSize: "4vh",
    width: "4vh",
    height: "4vh",
    cursor: "pointer",
  },

  searchBarStyles: {
    borderRadius: "1h",
    width: "40vh",
    boxSizing: "border-box",
    justifyContent: "flex-end",
    // alignItems:"flex-start",
    // marginBottom: "0.8vh",

    "& .MuiInputBase-root": {
      height: "4vh",
      borderRadius: "1vh",
      paddingRight: "0.5vh",
      paddingLeft: "1vh",
      backgroundColor: "transparent",
      boxSizing: "border-box",

    },

    "& .MuiInputBase-input": {
      fontSize: "1.8vh",
      fontFamily: "Poppins, sans-serif",
      padding: "0.4vh 0vh",
      lineHeight: "1vh",
      width: "100%",
      boxSizing: "border-box",
      WebkitTextSizeAdjust: "none",
      "&::placeholder": {
        fontSize: "1.5vh !important",
        opacity: 0.6,
        WebkitTextSizeAdjust: "none",
      },
    },

    "& .MuiInputLabel-root": {
      color: "#a6a8a6",
      fontSize: "1.8vh",
      transform: "translate(0vh, 1.6vh)",
      pointerEvents: "none",
    },

    "& .MuiInputLabel-root.MuiFormLabel-filled, & .MuiInputLabel-root.Mui-focused": {
      transform: "translate(0vh, 1.6vh) scale(1)",
      fontSize: "1.8vh",
      display: "none",
    },

    "& fieldset": {
      borderWidth: "0.2vh",
    },

    "& .MuiOutlinedInput-root.Mui-focused fieldset": {
      borderColor: globalStyles.colors.primary,
      borderWidth: "0.2vh",
    },

    "& .MuiSvgIcon-root": {
      fontSize: "2.2vh",
    },
  },

  ScheduleIcon: {
    fontSize: "2.2vh",
    marginTop: "0.2vh",
  },
  collegeIcon: {
    width: "2vh",
    height: "2vh",
  },
  paginationBox: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "0vh",
    width: "100%",
    boxSizing: "border-box",
    paddingLeft: "0vh",
    paddingRight: "0vh",
  },
  paginationStyles: {
    "& .MuiPagination-ul": {
      padding: "0vh 0vh",
      margin: "0vh",
      height: "4vh",
    },
    "& .MuiButtonBase-root-MuiPaginationItem-root": {
      borderRadius: "50%",
      fontSize: "1.8vh",
      //minWidth: "4vh",
      //height: "4vh",
      padding: "0vh 0vh",
      margin: "0vh 1vh",
    },
    "& .MuiPaginationItem-icon": {
      fontSize: "3.5vh",
      margin: "0vh -0.5vh",
      // width: "3.5vh",
      //height: "3.5vh",
    },
    "& .MuiPaginationItem-root": {
      minWidth: "2vh",
      padding: "0vh 1.4vh",
      margin: "0vh 0.5vh",
      height: "3.5vh",
      borderRadius: "2vh",
      fontSize: "1.6vh",
    },
  },
  tablePagination: {
    fontSize: "2vh",
    width: "100vw",

    "& .css-1gak8h1-MuiToolbar-root-MuiTablePagination-toolbar": {
      padding: "0vh",
      minHeight: "0vh",
    },

    "& .MuiTablePagination-selectLabel": {
      fontSize: "1.6vh",
      marginRight: "1vh",
    },

    "& .MuiInputBase-root": {
      mr: "1vw",
      ml: "-2vh",
      alignItems: "center",
      width: "2.5vw",
      border: "0.1vh solid #f2f2f2",
      borderRadius: "1vh",
      height: "3.3vh",
      fontFamily: `"Open Sans", sans-serif`,
    },

    "& .MuiTablePagination-select": {
      fontSize: "1.6vh",
      mr: "1vh",
      ml: "0vh",
      alignContent: "center",
      // mt: "0.5vh",
      alignItems: "center",
      padding: "0.2vw",
      minWidth: "3vw",
      width: "auto",
      maxWidth: "clamp(5vw, 15vw, 25vw)",
    },
    ".MuiSelect-icon": {
      fontSize: "3.8vh",
      alignItems: "center",
      alignContent: "center",
      mt: "0vh",
    },
    "& .MuiTablePagination-displayedRows": {
      fontSize: "1.6vh",
    },
    ".MuiToolbar-root": {
      padding: "0vh",
      justifyContent: "space-between",
      minHeight: "3vh",
      width: "100%",
      overflow: "hidden",
      paddingBottom: "0.5vh",
    },
    ":last-child": {
      padding: "0.5vh",
      minHeight: "5vh",
      width: "100%",
    },
    ".MuiInputBase-root-MuiTablePagination-select": {
      mr: "2vh",
    },

    ".MuiSelect-select": {
      paddingRight: "2vw",
    },
    "& .MuiInputBase-input": {
      paddingRight: "2vw",
    },

    ".MuiTablePagination-actions": {
      ml: "1.5vw",
    },
    ".MuiIconButton-root": {
      fontSize: "1.8vh",
      padding: "1vh",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "2.5vh",
    },
    ".MuiToolbar-root-MuiTablePagination-toolbar": {
      ml: "1vh",
    },

    "& .MuiPaper-root-MuiPopover-paper-MuiMenu-paper": {
      width: "2vw",
    },

    // Added new styles
    ".MuiList-root-MuiMenu-list": {
      padding: "1vh",
      backgroundColor: "#f4f4f4",
      border: "1px solid #ddd",
    },
    "& .MuiMenu-paper": {
      width: "2vw",
    },

    ".css-mmygx2-MuiSelect-select-MuiInputBase-input.css-mmygx2-MuiSelect-select-MuiInputBase-input.css-mmygx2-MuiSelect-select-MuiInputBase-input":
    {
      minWidth: "2vh",
      paddingRight: "2vh",
      paddingLeft: '1vh'
    },

    ".css-wlsqrd-MuiButtonBase-root-MuiMenuItem-root-MuiTablePagination-menuItem.Mui-selected": {
      backgroundColor: "#e0f7fa", // Light cyan as example
      fontWeight: "600",
      color: "#000", // Or your theme's primary text
      "&:hover": {
        backgroundColor: "#b2ebf2", // Optional hover style
      },
    },
  },
  rowsPerPageBox: {
    display: "flex",
    alignItems: "center",
    gap: "1vh",
  },
  rowsPerPageInput: {
    width: "8.5vh",
    '& .MuiInputBase-root': {
      height: '3.3vh',
      fontSize: '1.6vh',
      padding: 0,
    },
    '& input': {
      textAlign: 'center',
      padding: '0.5vh 1vh',
    },
  },
  rowsPerPageArrows: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    '& svg': { fontSize: '2.2vh', cursor: 'pointer' },
  },

  filterChipsBox: {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    flexWrap: "wrap",
    maxWidth: { xs: "100%", md: "50%" },
  },

  filterButtonsBox: {
    display: "flex",
    gap: 0.5,
    width: "auto",
    alignItems: "center",
    flexWrap: { xs: "wrap", md: "nowrap" },
    justifyContent: "flex-end",
  },

  viewToggleBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5vh",
  },

  viewToggleButton: {
    borderRadius: "1vh",
    width: "3.5vh",
    height: "3.5vh",
    marginBottom: "0.8vh",
  },

  viewToggleButtonActive: {
    border: "0.15vh solid #a00",
    color: "#a00",
  },

  viewToggleButtonInactive: {
    border: "0.15vh solid rgba(224,224,224,1)",
    color: "#444",
  },

  filterIconButton: {
    border: "0.15vh solid rgba(224,224,224,1)",
    color: "#444",
    borderRadius: "1vh",
    width: "3.5vh",
    height: "3.5vh",
    marginBottom: "0.8vh",
  },

  tableContainerBox: {
    // Body scroll area: leave room for header and pagination
    maxHeight: "70vh",
    height: "60vh",
    borderRadius: "1.5vh",
    overflowX: "hidden",
    overflowY: "auto",
    scrollbarWidth: "thin",
    "&::-webkit-scrollbar": { width: "6px" },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,0.2)",
      borderRadius: "3px",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "transparent",
    },
  },

  tablePaperBox: {
    borderRadius: "1.5vh",
    boxShadow: 0,
    border: "0.15vh solid rgba(224,224,224,1)",
  },

  // Combined paper wrapper for table header + scrollable body
  tableWrapperPaper: {
    borderRadius: "1.5vh",
    boxShadow: 0,
    border: "0.15vh solid rgba(224,224,224,1)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  tableStyles: {
    tableLayout: "fixed",
    width: "100%",
    "& .MuiTableRow-root > *": {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      verticalAlign: "middle",
    },
    "& .MuiTableHead-root .MuiTableCell-root": {
      fontSize: "1.6vh",
      fontFamily: "Poppins, sans-serif",
      fontWeight: 600,
      background: "#fafbfc",
      borderBottom: "0.15vh solid rgba(224,224,224,1)",
      paddingTop: "1.2vh",
      paddingBottom: "1.2vh",
      lineHeight: "2.2vh",
      height: "7vh",

    },
    "& .MuiTableCell-root": {
      padding: "0.8vh 1.2vh",
      fontSize: "1.6vh",
      fontFamily: "Poppins, sans-serif",
      lineHeight: 1.25,
      borderBottom: "0.15vh solid #F9FAFB",
      whiteSpace: "nowrap",
      verticalAlign: "middle",
      height: "7vh",

    },
    // Ensure the last column has extra right padding so icons aren't hidden by scrollbar
    "& .MuiTableRow-root > *:last-child": {
      paddingRight: "2.5vh",
    },
  },

  loadingBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "71vh",
  },

  loadingSpinner: {
    color: globalStyles.colors.primary,
    "& .MuiCircularProgress-svg": {
      width: "3.5vh",
      height: "3.5vh",
      fontSize: "3.5vh",
    },
  },

  emptyStateBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "50vh",
    gap: 2,
  },

  emptyStateTitle: {
    fontSize: "2.4vh",
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
  },

  emptyStateSubtitle: {
    fontSize: "1.8vh",
    fontFamily: "Poppins, sans-serif",
    color: "#999",
    textAlign: "center",
  },

  searchIconAdornment: {
    mr: 0,
  },

  searchIconButton: {
    p: 0.5,
  },

  inputAdornmentEnd: {
    mr: 0,
  },

  expandMoreIcon: {
    fontSize: "1.6vh",
    color: "#666",
  },

  expandLessIcon: {
    fontSize: "1.6vh",
    color: "#666",
  },

  cellPaddingSmall: {
    padding: "0.2vh",
  },

  sortIconSmall: {
    fontSize: "1.6vh",
    opacity: (isActive: boolean) => (isActive ? 1 : 0),
    transition: "transform 0.2s ease, opacity 0.2s ease",
    color: (isActive: boolean) => (isActive ? "#a00" : "#666"),
    transform: (isActive: boolean, sortOrder: string) =>
      isActive && sortOrder === "asc" ? "rotate(180deg)" : "none",
  },

  tableRowHover: {
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover .sortIcon": {
      opacity: 0.5,
    },
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

  tableHeaderCellExpandable: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  tableHeaderCellContent: {
    display: "flex",
    alignItems: "center",
    gap: "0.6vh",
  },

  tableCellTooltip: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4vh",
  },

  tableCellText: {
    noWrap: true,
    fontSize: "1.6vh",
    fontWeight: 700,
    sx: { textTransform: "capitalize" },
  },

  tableCellSecondaryText: {
    noWrap: true,
    fontSize: "1.3vh",
    color: "#9CA3AF",
  },

  tableCellEmail: {
    noWrap: true,
    fontSize: "1.5vh",
    color: "#111827",
  },

  tableCellCollege: {
    noWrap: true,
    fontSize: "1.6vh",
  },

  tableStatusCell: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    px: "1.2vh",
    py: "0.4vh",
    borderRadius: "1.6vh",
    whiteSpace: "nowrap",
    minWidth: "12vh",
  },

  tableStatusText: {
    fontSize: "1.4vh",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  tableActionBox: {
    display: "flex",
    alignItems: "center",
    gap: "1.2vh",
    flexWrap: "nowrap",
  },

  gridEmptyBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "50vh",
    gap: 2,
  },

  // Dialog wrapper styles
  filterDialogPaper: {
    bgcolor: "#ffffff",
    color: "#111827",
    borderRadius: "12px",
    width: 480,
    boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
  },

  filterDialogTitle: {
    fontWeight: 700,
    fontSize: "18px",
    fontFamily: "Poppins, sans-serif",
    color: "#fff",
    pt: 2,
    pb: 1,
    px: 3,
    background: "linear-gradient(108deg, #004d40 0%, #00605a 45%, #004d40 100%)",
  },

  filterDialogContent: {
    pt: 1,
    pb: 2,
    px: 3,
    display: "flex",
    flexDirection: "column",
    gap: 2.5,
  },

  filterDialogActions: {
    px: 3,
    py: 2,
    justifyContent: "flex-end",
    position: "sticky",
    bottom: 0,
    bgcolor: "#ffffff",
    borderTop: "1px solid rgba(0,0,0,0.08)",
  },

  filterButtonsBoxInDialog: {
    ml: "auto",
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  },

  // Dialog Button styles
  filterApplyButton: {
    minHeight: 36,
    px: 2.5,
    textTransform: "none",
    fontWeight: 700,
  },

  filterResetButton: {
    minHeight: 36,
    px: 2.5,
    borderColor: "#e5e7eb",
    color: "#6b7280",
    textTransform: "none",
    fontWeight: 700,
  },

  // Dialog TextField styles
  filterSearchTextField: {
    "& .MuiInputBase-root": {
      bgcolor: "#ffffff",
      color: "#111827",
      fontFamily: "Poppins, sans-serif",
      borderRadius: "10px",
      height: "48px",
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": (theme: any) => ({
      borderColor: globalStyles.colors.primary,
    }),
  },

  filterAutocompleteInput: {
    "& .MuiInputBase-root": {
      bgcolor: "#ffffff",
      color: "#111827",
      fontFamily: "Poppins, sans-serif",
      borderRadius: "10px",
      minHeight: "70px",
      paddingRight: "8px",
    },
    "& .MuiOutlinedInput-input": {
      paddingRight: 0,
    },
    "& .MuiInputAdornment-root.MuiInputAdornment-positionEnd": {
      marginRight: 0,
    },
  },

  filterAutocompleteTagContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 0.5,
    maxHeight: "64px",
    overflowY: "auto",
    width: "100%",
    scrollbarWidth: "thin",
    "&::-webkit-scrollbar": { width: "6px", height: "6px" },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#cbd5e1",
      borderRadius: "8px",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "#f1f5f9",
    },
  },

  filterSelectInDialog: {
    borderRadius: "1vh",
    height: "5vh",
    fontFamily: "Poppins, sans-serif",
    "& .MuiOutlinedInput-notchedOutline": {
      padding: "0vh 2vh",
    },
  },

  // Table header cell hover state styles
  tableHeaderCellHoverable: (isActive: boolean) => ({
    cursor: "pointer",
    transition: "width 0.3s ease",
    "&:hover .sortIcon": {
      opacity: isActive ? 1 : 0.5,
    },
  }),

  tableHeaderCellName: {
    width: "14.8%",
    transition: "width 0.3s ease",
    cursor: "pointer",
    "&:hover .sortIcon": {
      opacity: 0.5,
    },
  },

  tableHeaderCellEmail: {
    width: "16.3%",
    cursor: "pointer",
    transition: "width 0.3s ease",
    "&:hover .sortIcon": {
      opacity: 0.5,
    },
  },

  tableHeaderCellCollege: {
    width: "9.5%",
    cursor: "pointer",
    transition: "width 0.3s ease",
    "&:hover .sortIcon": {
      opacity: 0.5,
    },
  },

  tableHeaderCellDate: {
    width: "10.5%",
    cursor: "pointer",
    transition: "width 0.3s ease",
    "&:hover .sortIcon": {
      opacity: 0.5,
    },
  },

  tableHeaderCellDuration: {
    width: "11%",
    transition: "width 0.3s ease",
    cursor: "pointer",
    "&:hover .sortIcon": {
      opacity: 0.5,
    },
  },

  tableHeaderCellStatus: {
    width: "9%",
    transition: "width 0.3s ease",
    cursor: "pointer",
    "&:hover .sortIcon": {
      opacity: 0.5,
    },
  },

  tableHeaderCellEval: {
    whiteSpace: "nowrap",
    width: "9%",
    cursor: "pointer",
    transition: "width 0.3s ease",
    "&:hover .sortIcon": {
      opacity: 0.5,
    },
  },

  tableHeaderCellActions: {
    width: "16%",
    transition: "width 0.3s ease",
  },

  // Table sort icon styles
  activeSortIcon: {
    fontSize: "1.6vh",
    opacity: 1,
    transition: "transform 0.2s ease, opacity 0.2s ease",
    color: "#a00",
    transform: "rotate(180deg)",
  },

  inactiveSortIcon: {
    fontSize: "1.6vh",
    opacity: 0.5,
    transition: "transform 0.2s ease, opacity 0.2s ease",
    color: "#383838",
  },

  // Table header box layout
  tableHeaderBoxLayout: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  tableHeaderContentBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.6vh",
  },

  tableHeaderExpandButton: {
    padding: "0.2vh",
  },

  // Table body row cell styles
  tableBodyCellName: {
    maxWidth: "20vh",
    transition: "max-width 0.3s ease",
  },

  tableBodyCellCollege: {
    maxWidth: "25vh",
    overflow: "hidden",
    transition: "max-width 0.3s ease",
  },

  tableBodyCellDate: {
    whiteSpace: "nowrap",
    maxWidth: "15vh",
    transition: "max-width 0.3s ease",
  },

  tableBodyCellDateExpanded: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4vh",
  },

  tableBodyCellDuration: {
    maxWidth: "12vh",
    transition: "max-width 0.3s ease",
  },

  tableBodyCellStatus: {
    maxWidth: "8vh",
    transition: "max-width 0.3s ease",
  },

  tableBodyCellEval: {
    whiteSpace: "nowrap",
    maxWidth: "12vh",
    transition: "max-width 0.3s ease",
  },

  tableBodyCellActions: {
    minWidth: "25vh",
    transition: "min-width 0.3s ease",
  },

  // Skeleton style for loading
  skeletonBox: {
    display: "inline-block",
    width: "80%",
    height: "1.6vh",
    background: "#eee",
    borderRadius: "0.5vh",
  },

  // Dialog Section styles
  dialogSearchSection: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    mt: 1,
  },

  dialogSectionTitle: {
    fontWeight: 600,
    fontSize: "1.6vh",
  },

  dialogSectionTitleWithMargin: {
    fontWeight: 600,
    fontSize: "1.6vh",
    mt: 0.5,
  },

  // Dialog Label Box
  dialogLabelBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dialogSelectAllClearBox: {
    display: "flex",
    alignItems: "center",
    gap: 1,
  },

  // Dialog Button styles for select/clear
  dialogSelectAllButton: {
    textTransform: "none",
    fontWeight: 700,
    fontSize: "1.4vh",
    fontFamily: "Poppins, sans-serif",
    color: "#2563eb",
    minWidth: "auto",
    px: 0,
  },

  dialogClearAllButton: {
    textTransform: "none",
    fontWeight: 700,
    fontSize: "1.4vh",
    fontFamily: "Poppins, sans-serif",
    color: "#a00",
    minWidth: "auto",
    px: 0,
  },

  // Dialog DateRange Box
  dialogDateRangeBox: {
    width: "100%",
  },

  // Grid card status box with dynamic colors
  cardStatusBox: (borderColor: string) => ({
    ...adminHomeStyles.statusBox,
    border: `0.35vh solid ${borderColor}`,
  }),

  // Evaluation status span in grid view
  evaluationStatusSpanGrid: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.6vh 0.8vh",
    borderRadius: "1.2vh",
    fontWeight: 500,
    fontSize: "1.6vh",
    minWidth: "12vh",
  },

  // Evaluation status Box in table view
  evaluationStatusBoxTable: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    px: "1.2vh",
    py: "0.4vh",
    borderRadius: "1.6vh",
    whiteSpace: "nowrap",
    minWidth: "12vh",
  },

};

