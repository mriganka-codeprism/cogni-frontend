export const styles = {
  root: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    padding: "1vh 0vh",
    fontFamily: "Poppins, sans-serif",
  },

  backText: {
    fontSize: "1.5vh",
    color: "#777",
    marginBottom: "2vh",
    cursor: "pointer",
    marginLeft: "-10vh",
    fontFamily: "Poppins, sans-serif",
  },

  title: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    fontSize: "12vh",
    lineHeight: "2vh",
    color: "#141414",
    marginTop: "-1vh",
  },



  subtitle: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 400,
    fontSize: "2vh",
    lineHeight: "3vh",
    //textAlign: "center",
    color: "#7E7E7E",
    marginBottom: "2vh",
    // marginTop
  },


  stepContainer: {
    display: "flex",
    flexDirection: "column",
    padding: "2vh 1vw",
    border: "0.15vh solid #e0e0e0",
    borderRadius: "2vh",
    backgroundColor: "#fff",
    marginBottom: "2vh",
    width: "61.3vw",
    boxShadow: "0 0.2vh 0.8vh rgba(0, 0, 0, 0.08)",
  },

  stepRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },

  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0.5vh",
  },

  stepWrapper: {
    display: "flex",
    justifyContent: "center",
    width: "20%",
  },

  labelWrapper: {
    display: "flex",
    justifyContent: "center",
    width: "20%",
  },

  labelColumn: {
    flex: 1,
    textAlign: "center",
  },

  stepColumn: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  dashedLine: {
    flex: 1,
    height: "0",
    borderTop: "0.2vh dashed #ccc",
    marginLeft: "0.5vw",
    marginRight: "0.5vw",
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
    fontSize: "1.5vh",
    fontWeight: 400,
    backgroundColor: "#fff",
  },


  step: {
    width: "3.2vh",
    height: "3.2vh",
    borderRadius: "50%",
    border: "0.2vh solid #ccc",
    color: "#aaa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5vh",
  },


  stepTextActive: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "2vh",
    fontWeight: 500,
    color: "#006b66",
    marginLeft: "0.8vw",
    // marginRight: "8vw",
    // fontWeight: 500,
  },


  stepText: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "2vh",
    color: "#999",
    marginLeft: "0.8vw",
    // marginRight: "2vw",
  },


  line: {
    width: "8vw",
    height: "0",
    borderTop: "0.2vh dashed #ccc",
    style: "dotted",
  },


  sectionTitle: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    fontSize: "2vh",
    lineHeight: "3vh",
    color: "#424242",
    //marginBottom: "2vh",
  },

  label: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 400,
    fontSize: "1.6vh",
    lineHeight: "3vh",
    color: "#606060",
    marginTop: "1vh",
    // marginBottom: "0.3vh",
  },
  requiredStar: {
    color: "#900B09",
    marginLeft: "0.2vw",
  },

  completedStep: {
    width: "3.2vh",
    height: "3.2vh",
    borderRadius: "50%",
    border: "0.25vh solid #006b66",
    color: "#006b66",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5vh",
    backgroundColor: "#fff",
  },

  solidLine: {
    flex: 1,
    height: "0",
    borderTop: "0.25vh solid #006b66",
    marginLeft: "0.5vw",
    marginRight: "0.5vw",
  },


  input: {
    "& .MuiOutlinedInput-root": {
      fontFamily: "Poppins, sans-serif",
      height: "4.7vh",
      maxWidth: "75vw",
      fontSize: "1.4vh",
      backgroundColor: "#fff",
      borderRadius: "0.3vh",
      lineHeight: "1.5vh",

      "& fieldset": {
        borderColor: "#c4c4c4",
      },

      "&:hover fieldset": {
        borderColor: "#c4c4c4",
      },

      "&.Mui-focused fieldset": {
        borderColor: "#c4c4c4",
        borderWidth: "0.1vh",
      },
    },

    "& .MuiOutlinedInput-input": {
      padding: "1.2vh 1.4vh",   // remove default 16.5px padding
    },

  },

  errorField: {
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




  textArea: {

    "& .MuiOutlinedInput-root": {
      fontFamily: "Poppins, sans-serif",
      alignItems: "flex-start",
      fontSize: "1.4vh",
      padding: "3vh 1.4vh",
      //maxWidth: "75vw",
      width: "100%",
      height: "15vw",
      borderRadius: "0.3vh",
      lineHeight: "1.5vh",

      "& fieldset": {
        borderColor: "#ccc",
        padding: "7.5vh 14 vh",
        marginTop: "0vh",
      },
      "&:hover fieldset": {
        borderColor: "#ccc",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#ccc",
        borderWidth: "0.1vh",
      },
    },
    "& textarea": {
      paddingBottom: "1.5 vh",
    },



  },

  saveButton: {
    backgroundColor: "#006b66",
    color: "#fff",
    width: "9.11vw",        // 175px
    height: "3.88vh",       // 41.93px

    borderRadius: "0.56vh", // 6px
    borderWidth: "0.09vh",  // 1px
    borderStyle: "solid",

    padding: "1vh 2vh",      // 12px
    gap: "0.93vh",          // 10px

    opacity: "1",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // marginright:"-20vw",

    fontFamily: "Poppins",
    //fontWeight: "500",
    fontStyle: "normal",
    fontSize: "1.67vh",
    lineHeight: "100%",
    letterSpacing: "0vw",
    textAlign: "center",
    textTransform: "none",
    marginTop: "-3.5vh",
    marginRight: "12vh",
    "&:hover": {
      backgroundColor: "#005752",
    },
  },


  uploadHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "0.3vh",
  },

  uploadBox: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.5vh",
    cursor: "pointer",
    color: "#006b66",
    fontWeight: 500,
    fontSize: "0.8vh",

  },

  uploadText: {
    fontFamily: "Poppins, sans-serif",
    display: "flex",
    fontSize: "1.6vh",   // reduce as needed
    fontWeight: 500,
    color: "#006b66",
    marginTop: "2vh",
    // marginBottom: "0.2vh",
    alignItems: "baseline",
    marginRight: "12vh",


  },

  belowTextArea: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    // marginTop: "0.5vh",
  },

  warningText: {
    color: "error.main",
  },

  wordCountText: {
    position: "absolute",
    bottom: "0.8vh",
    right: "1.2vh",
    fontSize: "1.4vh",
    fontFamily: "Poppins, sans-serif",
    color: "text.secondary",
    pointerEvents: "none",
    // marginRight:"15vh",
  },

  wordCountError: {
    position: "absolute",
    bottom: "0.8vh",
    right: "1.2vh",
    fontSize: "1.4vh",
    fontFamily: "Poppins, sans-serif",
    color: "error.main",
    pointerEvents: "none",
  },


  uploadIcon: {
    display: "flex",
    fontSize: "1vh",
    marginTop: "2vh",
    //marginBottom: "0.2vh",
    alignItems: "baseline",
  },

  textAreaWrapper: {
    width: "75vw",
    //marginTop: "0.3vh",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },

  sectionDivider: {
    flex: 1,
    height: "0.1vh",
    backgroundColor: "#E5E7EB",
    marginLeft: "1vh",
  },

  jobTitleWithBar: {
    borderLeft: "0.4vh solid #006b66",
    paddingLeft: "1vh",
    fontSize: "2vh",
    fontWeight: 500,
    color: "#141414",
    fontFamily: "Poppins",
  },


};