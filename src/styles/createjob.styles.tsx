export const styles = {

  root: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    padding: "0.8vh 0.5vh",
  },

  header: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    // marginBottom: "3vh",
  },

  title: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "2.2vh",
    fontWeight: 700,
    marginTop: "1.2vh",
    marginLeft: "1.5vh",
    color: "#111111",
  },

  subtitle: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.6vh",
    color: "#888",
    marginBottom: "2.2vh",
    marginLeft: "1.5vh",
  },

  createButton: {
    fontFamily: "Poppins, sans-serif",
    backgroundColor: "#006b66",
    color: "#ffffff",
    fontSize: "1.5vh",
    padding: "0.8vh 1.3vh",
    borderRadius: "0.6vh",
    textTransform: "none",
    marginRight: "1.5vh",
    minWidth: "6vh",
    "&:hover": {
      backgroundColor: "#005752",
    },
    "& .MuiButton-startIcon": {
      marginRight: "0.8vh",
    },

    /* icon size */
    "& .MuiSvgIcon-root": {
      fontSize: "2vh",
      width: "2vh",
      height: "2vh",
    },
  },

  body: {
    flex: 1,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    // overflow: "hidden",
    //padding: "0.3vh",
    // marginTop:"3vh",

  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
    gap: "1.5vh",
  },

  image: {
    width: "20vw",
    maxWidth: "40vh",
    marginBottom: "2vh",
  },

  noJobText: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.8vh",
    color: "#b0b0b0",
  },

  filterLabel: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.6vh",
    //marginBottom: "0.5vh",
    fontWeight: 400,
    color: "#424242",

    // padding:"0vh 0vh 4vh 0vh",
  },

  filterField: {
    width: "12vw",
    marginTop: "1vh",
  },


  gridOuterContainer: {
    height: "67vh",
    // border: "0.1vh solid #d8d8d8",
    borderRadius: "1vh",
    backgroundColor: "#ffffff",
    margin: "0vh",
    display: "flex",
    flexDirection: "column",
    padding: "0vh 0vh 1.5vh 1.5vh",
    overflowY: "overlay",

    scrollbarWidth: "thin",
    //scrollbarColor: "#aaa #f1f1f1",

    "&::-webkit-scrollbar": {
      width: "3vh",
    },

    "&::-webkit-scrollbar-track": {
      background: "#f0f0f0",
    },

    "&::-webkit-scrollbar-thumb": {
      background: "#cccccc",
      borderRadius: "4vh",
    },

    "&::-webkit-scrollbar-thumb:hover": {
      background: "#aaaaaa",
    },
  },


  gridWrapper: {
    flex: 1,
    minHeight: 0,
    //overflowY: "auto",
    padding: "0vh",
    paddingLeft: "0vh",

    /* Thin Scrollbar */


  },

  gridContainer: {

    rowGap: "1.5vh",
    columnGap: "1.5vh",

    "& > .MuiGrid-item": {
      paddingLeft: "1vh",
      paddingRight: "1vh",
    },
  },

  /* ============= CARD DESIGN ============= */

  jobCard: {
    backgroundColor: "#ffffff",
    border: "0.1vh solid #d8d8d8",
    borderRadius: "1vh",
    height: "18vh",
    // maxHeight: "23vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "none",
    cursor: "pointer",
    overflow: "hidden",
    //marginBottom:"1.5vh",
  },

  cardTopRow: {

    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1vh",
    padding: "0.8vh 1vh",
  },

  cardTitle: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.8vh",
    fontWeight: 500,
    color: "#1f2937",
    borderLeft: "0.4vh solid #006b66",
    paddingLeft: "1vh",
    borderRadius: "0.3vh",
  },

  statusWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "0.6vh",
  },

  statusDot: {
    width: "0.8vh",
    height: "0.8vh",
    borderRadius: "50%",
    backgroundColor: "#0a7f6e",
  },

  statusText: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.4vh",
    color: "#0a7f6e",
    fontWeight: 500,
  },

  cardSub: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.3vh",
    color: "#6b7280",
    marginBottom: "0.6vh",
    padding: "0vh 2vh",
  },

  metaWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8vh",
    padding: "0vh 2vh",
  },

  metaRow: {
    display: "flex",
    gap: "1vh",
    alignItems: "center",
    flexWrap: "wrap",
  },

  metaText: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.5vh",
    color: "#000000",
  },

  cardFooter: {

    // marginTop: "auto",
    backgroundColor: "#eefafa",
    padding: "0.2vh 2vh",
    display: "flex",
    justifyContent: "space-between",
    borderRadius: "0 0 1vh 1vh",
    fontSize: "1.3vh",
    color: "#374151",
    width: "100%",
    height: "3vh",
  },

  footerText: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.5vh",
    color: "#374151",
  },

  /* ============= FILTER BAR ============= */

  filterBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "3vh",
    gap: "2vh",
    marginRight: "3.9vh",
    marginTop: "-1vh",
  },

  searchRow: {
    flex: 1,
  },

  searchBox: {
    width: "44vh",
    height: "4.2vh",
    border: "0.2vh solid #ddd",
    borderRadius: "0.8vh",
    padding: "0vh 1vh",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    marginLeft: "3vh",
  },

  filterContainer: {
    fontFamily: "Poppins, sans-serif",
    display: "flex",
    gap: "2vh",
    alignItems: "center",
  },



  select: {
    fontFamily: "Poppins, sans-serif",
    height: "4.2vh",
    minWidth: "22vh",
    borderRadius: "0.8vh",
    fontSize: "1.6vh",
    backgroundColor: "#fff",
    cursor: "pointer",
    marginBottom: "2vh",
    padding: "1vh 0.5vh",
    border: "0.2vh solid #fff",

    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#c4c4c4",
    },

    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#c4c4c4",
    },

    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#c4c4c4",
      borderWidth: "0.2vh",
    },

    "& .MuiSelect-select": {
      padding: "0.9vh 3.5vh 0.9vh 1.2vh",   // replaces 16.5px 14px & 32px right
      display: "flex",
      alignItems: "center",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    "& .MuiSvgIcon-root": {
      right: "1vh",   // dropdown arrow spacing
    },

    "& .MuiSelect-icon": {
      right: "0.8vh",
      fontSize: "3vh",
      top: "50%",
      transform: "translateY(-50%)",
      width: "3vh",
      height: "3vh",
    },

    "& .MuiOutlinedInput-root": {
      borderRadius: "0.4vh",
    },
  },



  menuButton: {
    padding: "0.4vh",
    "& .MuiSvgIcon-root": {
      fontSize: "2.2vh",
      color: "#777",
    },
  },

  smallMenuPaper: {
    backgroundColor: "#ffffff",
    border: "0.1vh solid #e5e7eb",
    borderRadius: "1.2vh",
    width: "8vw",
    padding: "0.5vh 0",
    boxShadow: "0 1vh 3vh rgba(0,0,0,0.08)",

    "& .MuiList-root": {
      padding: "0vh",

    },

    "& .MuiMenuItem-root": {
      padding: "0.5vh 0.2vw",
      // minHeight: "4vh",
      display: "flex",
      alignItems: "center",
      gap: "0.5vw",
    },

    "& .MuiListItemIcon-root": {
      minWidth: "unset",
      marginRight: "0vh",
    },

    "& .MuiListItemText-primary": {
      fontSize: "1.5vh !important",
      fontWeight: 500,
    },

    "& .MuiSvgIcon-root": {
      fontSize: "2vh !important",
    },

    "& .MuiMenuItem-root:hover": {
      backgroundColor: "#f9fafb",
    },
  },


  tableWrapperPaper: {
    width: "98%",
    marginLeft: "1.5vh",
    marginRight: "3.2vh",
    borderRadius: "1vh",
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
    // Ensure the last column has extra right padding so icons aren't hidden by scrollbar
    "& .MuiTableRow-root > *:last-child": {
      paddingRight: "2vh",
    },
  },

  tableContainerBox: {
    maxHeight: "70vh",
    overflowY: "auto",
    overflowX: "hidden",
    scrollbarWidth: "thin",

    /* thin scrollbar */
    "&::-webkit-scrollbar": {
      width: "0.45vh",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#cbd5e1",
      borderRadius: "1vh",
    },
  },

  th: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.5vh",
    fontWeight: 700,
    height: "7vh",
    whiteSpace: "nowrap",
    backgroundColor: "#fafbfc",
    position: "sticky",
    top: 0,
    zIndex: 2,

  },

  td: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.5vh",
    height: "7vh",
    whiteSpace: "nowrap",
    padding: "0.9vh 1.2vh",
    borderBottom: "0.1vh solid #F3F4F6"
  },

  tdBold: {
    fontSize: "1.6vh",
    fontWeight: 700,

  },

  tr: {
    cursor: "pointer",
    borderBottom: "0.1vh solid #175ce6",

    "&:hover": {
      backgroundColor: "#fafafa",
    },
  },
  tableTitle: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "2vh",
    fontWeight: 600,
    padding: "1vh 1.2vh",
    color: "#111",
  },

  /* job reference text under title */
  jobRef: {
    fontSize: "1.2vh",
    color: "#6b7280",
    marginTop: "0.2vh",
  },

  statusBadge: (status: string = "Active") => ({
    backgroundColor:
      status.toLowerCase() === "active"
        ? "#dcfce7"
        : "#fee2e2",

    color:
      status.toLowerCase() === "active"
        ? "#166534"
        : "#991b1b",

    borderRadius: "1vh",
    padding: "0.3vh 0.8vh",
    fontSize: "1.2vh",
    textAlign: "center",
    display: "inline-block",
    minWidth: "6vh",
    fontWeight: 500,
  }),

  viewToggleBox: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.5vh",
    width: "97.5%",

  },


  viewToggleButton: {
    borderRadius: "1vh",
    width: "4.5vh",
    height: "4.5vh",

  },

  viewToggleButtonActive: {
    border: "0.15vh solid #0a7f6e",
    color: "#0a7f6e",
  },

  viewToggleButtonInactive: {
    border: "0.15vh solid rgba(224,224,224,1)",
    color: "#444",
  },

  dropdownMenu: {
    // disableAutoFocusItem: true,
    maxHeight: "22vh",

    "& .MuiMenuItem-root": {
      minHeight: "3.5vh",
      fontSize: "1.8vh",
      padding: "0.2vh 1vh",

      // Remove blue selection color
      "&.Mui-selected": {
        backgroundColor: "transparent !important",
      },

      "&.Mui-selected:hover": {
        backgroundColor: "rgba(0,0,0,0.04) !important",
      },

      "&:hover": {
        backgroundColor: "rgba(0,0,0,0.04)",
      },
    },

    "& .MuiCheckbox-root": {
      padding: "0.3vh",
      color: "#666",                     // default unchecked color
    },

    "& .MuiCheckbox-root.Mui-checked": {
      color: "#006b66",                    // checked color (not blue)
    },

    overflowY: "auto",
    scrollbarWidth: "thin",
    "&::-webkit-scrollbar": {
      width: "0.6vw",
    },
  },
  /* ================= COMPACT FILTER BAR (MATCHES UI) ================= */

  compactFilterBar: {
    display: "flex",
    alignItems: "center",
    gap: "1vh",
    background: "#f3f4f6",
    padding: "0.8vh",
    borderRadius: "1vh",
    margin: "0 3vh 2vh 3vh",
  },

  /* Search pill */
  compactSearchBox: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    borderRadius: "2vh",
    padding: "0.6vh 1.2vh",
    minWidth: "26vh",
    border: "0.15vh solid #e5e7eb",
  },

  compactSearchInput: {
    border: "none",
    outline: "none",
    fontSize: "1.3vh",
    width: "100%",
    background: "transparent",
  },

  /* Filters button */
  filtersButton: {
    fontFamily: "Poppins, sans-serif",
    background: "#0f766e",
    color: "#fff",
    borderRadius: "2vh",
    textTransform: "none",
    fontSize: "1.2vh",
    padding: "0.6vh 1.5vh",
    "&:hover": {
      background: "#115e59",
    },
  },

  /* Filter chips (Date, Category, Status) */
  filterChip: {
    fontFamily: "Poppins, sans-serif",
    height: "3.4vh",
    borderRadius: "2vh",
    background: "#fff",
    border: "0.15vh solid #e5e7eb",
    fontSize: "1.2vh",
    paddingLeft: "1.5vh",
    paddingRight: "1.5vh",
    display: "flex",
    alignItems: "center",
  },

  /* Clear all */
  clearAllText: {
    color: "#ef4444",
    fontSize: "1.2vh",
    textTransform: "none",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  /* View toggle container */
  compactViewToggle: {
    display: "flex",
    border: "0.15vh solid #e5e7eb",
    borderRadius: "1vh",
    overflow: "hidden",
    background: "#fff",
    marginLeft: "auto",
  },

  /* Toggle buttons */
  compactToggleBtn: {
    padding: "0.6vh 1vh",
    borderRadius: 0,
  },

  compactToggleActive: {
    backgroundColor: "#ecfdf5",
    color: "#0d9488",
  },

  compactToggleInactive: {
    color: "#6b7280",
  },

  compactFilterWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "1.5vh",
    padding: "1.2vh 0.9vw",
    // background: "#f8fafc",
    //marginLeft: "1vh",
    borderRadius: "1.2vh",
  },

  searchField: {
    display: "flex",
    alignItems: "center",
    background: "#ffffff",
    borderRadius: "0.8vh",
    padding: "0.6vh 1vw",
    width: "22vw",
    height: "3.8vh",
    border: "0.15vh solid #bebbbb",
  },

  searchInput: {
    fontFamily: "Poppins, sans-serif",
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "1.4vh",
    background: "transparent",
  },

  filtersBtn: {
    fontFamily: "Poppins, sans-serif",
    background: "#0f766e",
    color: "#fff",
    textTransform: "none",
    borderRadius: "0.8vh",
    padding: "0.6vh 1.4vw",
    fontSize: "1.2vh",
    fontWeight: 600,
    height: "3.8vh",
    "&:hover": { background: "#115e59" },
  },

  chip: {
    color: "#374151",
    height: "4.2vh",
    width: "22vh",
    "& .MuiOutlinedInput-root": {
      height: "4.2vh",
      borderRadius: "0.8vh",
      "& fieldset": {
        borderColor: "#d1d5db",
        borderWidth: "1px",
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
    "& .MuiSvgIcon-root": {
      fontSize: "2.2vh",
      color: "#6b7280",
    },
  },

  clearText: {
    fontFamily: "Poppins, sans-serif",
    color: "#900B09",
    fontSize: "1.4vh",
    textTransform: "none",
    padding: "0.6vh 0.6vh",
    fontWeight: 500,
  },

  viewToggle: {
    display: "flex",
    borderRadius: "1vh",
    border: "0.15vh solid #e5e7eb",
    overflow: "hidden",
    marginRight: "1.5vh",
  },

  toggleBtn: {
    width: "3.5vh",
    height: "3.5vh",
  },

  toggleActive: {
    background: "#e6fffa",
    color: "#0f766e",
  },

  toggleInactive: {
    color: "#6b7280",
  },
  collapsibleFilters: {
    display: "flex",
    alignItems: "center",
    gap: "1.5vh",
    overflow: "hidden",
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    whiteSpace: "nowrap",
  },
  backButton: {
    width: "4.2vh",
    height: "4.2vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "1.2vh",
    border: "0.15vh solid #E5E7EB",
    backgroundColor: "#fff",
    color: "#374151",
    padding: "0.6vh",
    "&:hover": {
      backgroundColor: "#f9fafb",
      borderColor: "#d1d5db",
    },
  },
  backIcon: {
    fontSize: "1.8vh",
    marginLeft: "0.4vh",
  },
};