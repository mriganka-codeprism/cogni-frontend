export const styles = {
  root: {
    fontFamily: "Poppins, sans-serif",
    width: "100%",
    height: "100%",
    padding: "1vh 0vw",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    //overflowY: "hidden",
  },

  backText: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.5vh",
    color: "#777",
    marginBottom: "2vh",
    cursor: "pointer",
    marginLeft: "-10vh",
    fontWeight: 400,
  },

  title: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "2.4vh",
    fontWeight: 600,
  },

  header: {
    fontFamily: "Poppins, sans-serif",
    padding: "1vh 1vw",
    borderBottom: "0.1vh solid #e6e6e6",
    backgroundColor: "#fff",
    //backgroundColor: "red",
  },

  subtitle: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.6vh",
    color: "#888",
    marginBottom: "3vh",
  },

  stepContainer: {
    fontFamily: "Poppins, sans-serif",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "2vh 2vw",
    border: "0.15vh solid #e0e0e0",
    borderRadius: "1vh",
    backgroundColor: "#fff",
    marginBottom: "1vh",
    width: "100%",
    boxShadow: "0 0.2vh 0.8vh rgba(0, 0, 0, 0.08)",
  },
  completedStep: {
    fontFamily: "Poppins, sans-serif",
    width: "3vh",
    height: "3vh",
    borderRadius: "50%",
    backgroundColor: "#006b66",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2vh",
  },

  activeStep: {
    fontFamily: "Poppins, sans-serif",
    width: "3.2vh",
    height: "3.2vh",
    borderRadius: "50%",
    border: "0.25vh solid #006b66",
    color: "#006b66",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.4vh",
    fontWeight: 600,
    backgroundColor: "#fff",
  },

  stepTextCompleted: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "2vh",
    color: "#006b66",
    marginLeft: "1vw",
    //marginRight: "2vw",
  },

  stepTextActive: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "2vh",
    color: "#006b66",
    marginLeft: "1vw",
    //marginRight: "2vw",
  },

  lineActive: {
    width: "8vw",
    height: "0.2vh",
    backgroundColor: "#006b66",
    style: "dotted",
    //marginRight: "2vw",
  },

  sectionTitle: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    fontSize: "1.8vh",
    lineHeight: "3vh",
    color: "#141414",
  },
  otherDetailsContainer: {
    fontFamily: "Poppins, sans-serif",
    // overflowY: "auto",
    height: "39vh",
    //paddingRight: "2vh",
  },

  label: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.8vh",
    marginTop: "1vh",
    marginBottom: "0.2vh",
    fontWeight: 400,
  },

  label1: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.6vh",
    marginTop: "1vh",
    marginBottom: "1.2vh",
    color: "black",
    fontWeight: 400,
  },
  label2: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.8vh",
    marginTop: "2vh",
    marginBottom: "1.2vh",
    color: "black",
    fontWeight: 400,
  },
  label3: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.6vh",
    marginTop: "1vh",
   // marginBottom: "1.2vh",
    color: "black",
    width: "12vw",
    fontWeight: 400,
  },

  label4: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.6vh",
    marginTop: "1vh",
    marginBottom: "1.2vh",
    color: "black",
    width: "8vw",
    fontWeight: 400,
  },


  requiredStar: {
    fontFamily: "Poppins, sans-serif",
    color: "#900B09",
    marginLeft: "0.2vw",
  },

  input: {
    
    width: "100%",
    fontWeight: 400,
    // padding:"1vh 2vh",
    padding: "0vh",


    "& .MuiOutlinedInput-root": {
      fontFamily: "Poppins, sans-serif",
      height: "4.7vh",
      maxWidth: "64vh",
      fontSize: "1.4vh",
      backgroundColor: "#fff",
      borderRadius: "0.5vh",

      /* border */
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

      "&.Mui-focused": {
        boxShadow: "none",
      },
    },

    "& .MuiSelect-select": {
      padding: "1.2vh 1.4vh",
      display: "flex",
      alignItems: "center",
    },

    "& .MuiSelect-select.MuiSelect-outlined": {
      paddingRight: "3.5vh",
    },
    "& .MuiSvgIcon-root": {
      right: "1vh",
      height: "3vh",
      width: "3vh",
      fontsize: "2vh",
      // marginTop:"1vh",// dropdown arrow spacing
    },

    "&.css-16wblaj-MuiInputBase-input-MuiOutlinedInput-input": {
      padding: "1.6vh 1.4vh",
      height: "1.4vh",
    },
    "& .MuiOutlinedInput-input": {
      padding: "0 1.2vh",
      height: "100%",
      display: "flex",
      paddingRight: "3.5vh",
      alignItems: "center",
      boxSizing: "border-box",
      fontSize: "1.6vh",
      paddingTop: 0,
      paddingBottom: 0,
    },
    "& .MuiSelect-icon": {
      right: "0.8vh",           // replaces default 7px
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: "2.2vh",
      width: "3vh",
      height: "3vh",
      pointerEvents: "none",
      color: "rgba(0,0,0,0.54)",
    },

  },

  MenuItem: {
    fontFamily: "Poppins, sans-serif",
    height: "3vh",
    fontSize: "1.6vh",
    "& svg": {
      fontSize: "2.5vh",
    },
  },

  gridRow: {
    fontFamily: "Poppins, sans-serif",
    display: "flex",
    gap: "5vw",
   // marginTop: "1vh",
    width: "100%",
  },
  gridRow2: {
    fontFamily: "Poppins, sans-serif",
    display: "flex",
    gap: "5vw",
    marginTop: "1vh",
    width: "100%",
  },

  gridItem: {
    fontFamily: "Poppins, sans-serif",
    flex: 1,
  },
  gridItem2: {
    fontFamily: "Poppins, sans-serif",
    flex: 1,
    marginLeft: "10vh"
  },

  footer: {
    fontFamily: "Poppins, sans-serif",
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    marginTop: "0vh",
  },

  radioGroup: {
    fontFamily: "Poppins, sans-serif",
    display: "flex",
    gap: "2vh",
     "& .MuiFormControlLabel-root": {
    marginLeft: "-1.2vh",
    marginRight: "1.8vh",
  },
    
  },
radioButton: {
  fontFamily: "Poppins, sans-serif",
  color: "#006b66",
  padding: "1.5vh",
  transform: "scale(0.8)",

  "& .MuiSvgIcon-root": {
    width: "3vh",
    height: "3vh",
    fontSize: "1.5vh",
  },

  "&.Mui-checked": {
    color: "#006b66",
    padding: "1vh",
  },
},

  radioLabel: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.6vh",
    color: "#000",
    fontWeight: 400,
  },

  dropdownMenu: {
    fontFamily: "Poppins, sans-serif",
    // disableAutoFocusItem: true,
    maxHeight: "35vh",
    width: "35vh",

    "& .MuiMenuItem-root": {
      minHeight: "3.5vh",
      fontSize: "1.4vh",
      padding: "0.5vh 1vh",

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
      color: "#666", // default unchecked color
    },

    "& .MuiCheckbox-root.Mui-checked": {
      color: "#006b66", // checked color (not blue)
    },

    overflowY: "hidden",
    scrollbarWidth: "none",
    "&::-webkit-scrollbar": {
      width: "0.6vw",
    },
  },

  errorField: {
    fontFamily: "Poppins, sans-serif",
    /* border color */
    "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
      borderColor: "#900B09",
    },

    /* border color when focused */
    "& .MuiOutlinedInput-root.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#900B09",
      borderWidth: "0.1vh",
    },

    /* helper text color */
    "& .MuiFormHelperText-root.Mui-error": {
      color: "#900B09",
    },

    /* label color */
    "& .MuiFormLabel-root.Mui-error": {
      color: "#900B09",
    },
  },
  sectionDivider: {
    fontFamily: "Poppins, sans-serif",
    flex: 1,
    height: "0.1vh",
    backgroundColor: "#E5E7EB",
    marginLeft: "1vh",
  },

  addCategoryContainer: {
    padding: "1vh 1vh",
    borderTop: "0.15vh solid #eee",
    display: "flex",
    gap: "1vh",
    alignItems: "center",
    backgroundColor: "#fff",
    position: "sticky",
    bottom: 0,
    zIndex: 1,
  },

  addCategoryInput: {
    flex: 1,
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.4vh",
    padding: "0.8vh 1vh",
    border: "0.15vh solid #e0e0e0",
    borderRadius: "0.4vh",
    outline: "none",
    "&:focus": {
      borderColor: "#006b66",
    },
  },

  addCategoryBtn: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.2vh",
    fontWeight: 600,
    color: "#006b66",
    cursor: "pointer",
    padding: "0.5vh 1vh",
    "&:hover": {
      backgroundColor: "rgba(0,107,102,0.05)",
      borderRadius: "0.4vh",
    },
  },

  deleteMenuItem: {
    marginLeft: "auto",
    color: "#900B09",
    cursor: "pointer",
    fontSize: "1.6vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2.5vh",
    height: "2.5vh",
    borderRadius: "50%",
    "&:hover": {
      backgroundColor: "rgba(144,11,9,0.05)",
    },
  },
};