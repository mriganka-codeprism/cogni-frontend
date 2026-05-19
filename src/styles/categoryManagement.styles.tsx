import { globalStyles } from "../config";

export const categoryStyles = {
  textfield: {
    //  width: "35vw",
    //  marginTop: "1vh",
    // marginBottom: "3vh",
    borderRadius: "1.5vh",
    fontSize: "clamp(1.5vh, 2vh, 2.2vh)",
    fontFamily: "Poppins, sans-serif",
    //borderColor: "#006B66",
    // backgroundColor: "white",
    //width: "clamp(40vw, 50vw, 89vw)",

    "& .MuiInputLabel-root": {
      color: "#a6a8a6",
      fontSize: "2vh",
      transform: "translate(2vh, 1vh)", // Default position (center)
      transition: "transform 0.2s ease-in-out",
    },
    "& .MuiInputLabel-root.MuiFormLabel-filled, & .MuiInputLabel-root.Mui-focused":
    {
      transform: "translate(2.1vh, -1.4vh) scale(0.75)", // Move up when focused or filled
      fontSize: "1.8vh",
      "& fieldset": {
        borderWidth: "0.2vh",

        "&:focus": {
          borderColor: globalStyles.colors.primary,
        },
      },
    },
    "& fieldset": {
      borderWidth: "0.2vh",

      "&:focus": {
        //  borderColor: globalStyles.colors.primary,
      },
    },
    "& .MuiInputBase-root": {
      borderRadius: "1vh",
      paddingRight: "0vh",

      backgroundColor: "transparent",
      height: "4vh",
      width: "40vh",
    },
    "& .MuiInputBase-input": {
      padding: "0.4vh 1.6vh",
      fontSize: "1.5vh",
      fontFamily: "Poppins, sans-serif",
      //width: "clamp(28vw, 30vw, 50vw)",
      "&:hover": {
        borderColor: globalStyles.colors.primary,
      },
    },

    "& .MuiInputLabel-root.Mui-focused": {
      // color: globalStyles.colors.primary,
      fontSize: "1.8vh",
    },
    "& .MuiOutlinedInput-root.Mui-focused fieldset": {
      borderColor: globalStyles.colors.primary,
      borderWidth: "0.2vh",
    },

    "& .MuiSelect-select": {
      padding: "0.5vh 1.2vh",
    },

    "& .MuiSvgIcon-root": {
      fontSize: "3.2vh", // Ensures dropdown icon stays a fixed size
    },
    "& .MuiOutlinedInput-input": {},
    ".css-elo8k2-MuiInputAdornment-root": {
      marginLeft: "-1vh",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#006B66 !important",  // ✅ GREEN
      borderWidth: "0.2vh",
    },
  },
  textfield1: {
    //  width: "35vw",
    //  marginTop: "1vh",
    // marginBottom: "3vh",
    borderRadius: "1.5vh",
    fontSize: "clamp(1.5vh, 2vh, 2.2vh)",
    fontFamily: "Poppins, sans-serif",
    //borderColor: "#006B66",
    // backgroundColor: "white",
    //width: "clamp(40vw, 50vw, 89vw)",

    "& .MuiInputLabel-root": {
      color: "#a6a8a6",
      fontSize: "2vh",
      transform: "translate(2vh, 1vh)", // Default position (center)
      transition: "transform 0.2s ease-in-out",
    },
    "& .MuiInputLabel-root.MuiFormLabel-filled, & .MuiInputLabel-root.Mui-focused":
    {
      transform: "translate(2.1vh, -1.4vh) scale(0.75)", // Move up when focused or filled
      fontSize: "1.8vh",
      "& fieldset": {
        borderWidth: "0.2vh",
        borderColor: "#006B66 !important",

        "&:focus": {
          borderColor: "#006B66 !important",
        },
      },
    },
    "& fieldset": {
      borderWidth: "0.2vh",

      "&:focus": {
        borderColor: "#006B66 !important",
      },
    },
    "& .MuiInputBase-root": {
      borderRadius: "1vh",
      paddingRight: "0vh",

      backgroundColor: "transparent",
      height: "4vh",
      width: "40vh",
    },
    "& .MuiInputBase-input": {
      padding: "0.4vh 1.6vh",
      fontSize: "1.5vh",
      fontFamily: "Poppins, sans-serif",
      //width: "clamp(28vw, 30vw, 50vw)",
      "&:hover": {
        borderColor: globalStyles.colors.primary,
      },
    },

    "& .MuiInputLabel-root.Mui-focused": {
      // color: globalStyles.colors.primary,
      fontSize: "1.8vh",
      borderColor: "#006B66 !important",
    },
    "& .MuiOutlinedInput-root.Mui-focused fieldset": {
      borderColor: "#006B66 !important",
      borderWidth: "0.2vh",
    },

    "& .MuiSelect-select": {
      padding: "0.5vh 1.2vh",
    },

    "& .MuiSvgIcon-root": {
      fontSize: "3.2vh", // Ensures dropdown icon stays a fixed size
    },
    "& .MuiOutlinedInput-input": {},
    ".css-elo8k2-MuiInputAdornment-root": {
      marginLeft: "-1vh",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#006B66 !important",  // ✅ GREEN
      borderWidth: "0.2vh",
    },
  },
  tableBox: {
    display: "flex",
    flexDirection: "column",
    height: "70vh",
    borderRadius: "1.5vh",
    border: "0.15vh solid rgba(224,224,224,1)",
    boxShadow: 0,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  // Body scroll area: leave room for header + pagination within tableBox
  tableContainer: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    scrollbarWidth: "thin",
    scrollbarColor: "#c1c1c1 #ffffff",
    "&::-webkit-scrollbar": {
      width: "0.5vh",
    },
    "&::-webkit-scrollbar-track": {
      background: "#f1f1f1",
      borderRadius: "0.25vh",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#c1c1c1",
      borderRadius: "0.25vh",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "#a0a0a0",
    },
  },
  tableWrapperPaper: {
    borderRadius: "1.5vh",
    boxShadow: 0,
    border: "0.15vh solid rgba(224,224,224,1)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    height: "65vh",
    // maxHeight: "70vh",
    marginTop: "1vh",
  },
  tableStyles: {
    // tableLayout: "fixed",
    width: "100%",
    "& .MuiTableRow-root > *": {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      verticalAlign: "middle",
    },
    "& .MuiTableHead-root .MuiTableCell-root": {
      fontSize: "1.6vh",
      fontWeight: 600,
      background: "#fafbfc",
      borderBottom: "0.15vh solid rgba(224,224,224,1)",
      padding: "1.2vh 2.2vh",
      lineHeight: "2.2vh",
    },
    "& .MuiTableCell-root": {
      padding: "2.2vh 2.2vh",
      fontSize: "1.6vh",
      lineHeight: 1.25,
      borderBottom: "0.15vh solid #F9FAFB",
      whiteSpace: "nowrap",
      verticalAlign: "middle",
    },
    "& .MuiTableRow-root > *:last-child": {
      paddingRight: "2.5vh",
    },
  },
  tableHeadCell: {
    fontSize: "1.6vh",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    backgroundColor: "#fafbfc",
    color: "#374151",
    padding: "1.2vh 1.2vh",
    borderBottomWidth: "0.15vh",
    borderBottomColor: "rgba(224,224,224,1)",
    height: "5vh",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    textAlign: "left",
    "&:hover": {
      backgroundColor: "#f3f4f6",
    },
  },
  tableHeadCellSortable: {
    cursor: "pointer",
    "&:hover .sortIcon": {
      opacity: 0.5,
    },
  },
  teableHeadRow: {
    height: "7vh",
  },
  tableHead: {
    backgroundColor: "#F9FAFB",
    zIndex: 1,
    border: "0.15vh solid rgba(224,224,224,1)",
  },
  tableBodyCell: {
    fontSize: "1.6vh",
    fontFamily: "Poppins, sans-serif",
    padding: "1.2vh 1.2vh",
    borderBottomWidth: "0.15vh",
    borderBottomColor: "rgba(224,224,224,0.7)",
    color: "#1f2937",
    textAlign: "left",
  },
  tab: {
    borderBottom: "0.1vh solid #c3c5c7",
    height: "5vh",
    maxWidth: "54vw",
    width: "min-content",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    minHeight: "5vh",
    borderRadius: "1vh 1vh 0vh 0vh",
    backgroundColor: "#f8e8e9",
    padding: "0vh",
    margin: "0vh",
    overflowX: "auto",
    "& .MuiTabs-scroller": {
      marginBottom: "0vh",
    },
    "& .MuiTab-root": {
      color: "black",
      fontSize: "1.9vh",
      width: "max-content",
      // borderRight: '0.1vh solid #393939',
      paddingX: "0.5vh",
      borderRight: '0.1vh solid #c3c5c7',
      "&.Mui-selected": {
        color: "white",
        backgroundColor: globalStyles.colors.primary,
      },
    },

    "& .MuiTabs-indicator": {
      backgroundColor: "#86161B",
      height: "0.5vh",
      width: "5vw",
      display: "none",
    },
    "& .MuiTabs-flexContainer": {
      height: "5vh",
    },
    "& .MuiTabs-scrollButtons": {
      backgroundColor: globalStyles.colors.primaryLight,
      width: '5vh'
      // display:'none'
    },
    "& .MuiSvgIcon-root": {
      fontSize: '2.5vh',
      width: '2.5vh',
      height: '2.5vh'
    }
  },
  tabStyles: {
    fontFamily: `"Open Sans", sans-serif`,
    margin: "0vh",
    textTransform: "none",
    padding: "0vh",
    // minWidth: "15vw",
    // maxWidth: "15vw",
    // width: "15vw",
    textWrap: "nowrap",
    minHeight: "5vh",
    height: "5vh",
    maxHeight: "5vh",
  },
  tabPanel: {
    padding: "clamp(0vh, 2vh, 0vh)",
    // height: "51vh",
    // minHeight: "54vh",
    // maxHeight: "74vh",
    overflowY: "hidden",
    border: "0.1vh solid #fff",
    borderRadius: "0vh 1vh 1vh 1vh",
    height: "clamp(51vh, 70vh, 81vh)",
    maxHeight: "clamp(51vh, 70vh, 81vh)",
    margin: "0vh",
  },
  radiobutton: {
    padding: "1vh",
    // transform: "scale(1.5)",
    "& .MuiSvgIcon-root": {
      fontSize: "clamp(1vw, 1vw, 3.2vw)",
    },
    "&.Mui-checked": {
      color: "#86161b",
    },
  },
  pagination: {

    fontSize: "2vh",
    width: "100vw",

    "& .css-1gak8h1-MuiToolbar-root-MuiTablePagination-toolbar": {
      padding: "0vh",
      minHeight: "0vh",
    },

    "& .MuiTablePagination-selectLabel": {
      fontSize: "1.6vh",
      //marginRight: "1vh",
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
      //ml: "1.5vw",

      //margin-left:"0vh",
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
      //paddingRight: "2vh",
      //paddingLeft:'1vh'
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
  paginationBox: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "0.5vh",
    width: "100%",
    boxSizing: "border-box",
    paddingLeft: "0vh",
    paddingRight: "0vh",
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