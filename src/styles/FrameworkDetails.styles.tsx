import { WidthFull } from "@mui/icons-material";

export const styles = {
  root: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    padding: "1vh 0vw",
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
    fontWeight: 500,
    fontSize: "2.2vh",
    lineHeight: "2vh",
    color: "#141414",
  },

  subtitle: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 400,
    fontSize: "1.6vh",
    lineHeight: "2vh",
    color: "#7E7E7E",
    marginBottom: "3vh",
  },

  stepContainer: {
    display: "flex",
    flexDirection: "column",
    padding: "2vh 1vw",
    border: "0.15vh solid #e0e0e0",
    borderRadius: "0.3vh",
    backgroundColor: "#fff",
    marginBottom: "2vh",
    width: "65vw",
    boxShadow: "0 0.2vh 0.8vh rgba(0, 0, 0, 0.08)",
  },

  stepRow: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    paddingLeft: "2vw",
    paddingRight: "2vw",
  },

  labelRow: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: "1vh",
    paddingLeft: "2vw",
    paddingRight: "2vw",
  },

  stepColumn: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },

  labelColumn: {
    flex: 1,
    textAlign: "center",
    marginLeft: "1vw",
    marginRight: "1vw",
  },

  activeStep: {
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
  labelWrapper: {
    width: "100%",
    textAlign: "center" as const,
  },
  stepWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    width: "100%",
  },

  dashedLine: {
    flex: 1,
    height: "0",
    borderTop: "0.2vh dashed #ccc",
    marginLeft: "1vw",
    marginRight: "1vw",
  },

  solidLine: {
    flex: 1,
    height: "0",
    borderTop: "0.25vh solid #006b66",
    marginLeft: "1vw",
    marginRight: "1vw",
  },

  stepTextActive: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "2vh",
    color: "#006b66",
  },

  stepText: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "2vh",
    color: "#999",
  },

  sectionTitle: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    fontSize: "2vh",
    lineHeight: "3vh",
    color: "#424242",
  },
  label: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 400,
    fontSize: "1.6vh",
    lineHeight: "3vh",
    //color: "#606060",
    marginTop: "1vh",
    // marginBottom:"0.3vh",
  },
  label1: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 400,
    fontSize: "1.6vh",
    lineHeight: "3vh",
    marginTop: "1vh",
    width: "50%",
    marginBottom: "0.3vh",
    // color: "#606060",
  },
  requiredStar: {
    color: "#900B09",
    marginLeft: "0.2vw",
  },

  titleBox: {
    "& .MuiOutlinedInput-root": {
      fontFamily: "Poppins, sans-serif",
      height: "4.7vh",
      maxWidth: "75vw",
      fontSize: "1.4vh",

      backgroundColor: "#fff", // keeps it white normally
      "& fieldset": {
        borderColor: "#c4c4c4",
        padding: "7.5vh 14 vh",
      },

      /* HOVER BORDER */
      "&:hover fieldset": {
        borderColor: "#c4c4c4",
      },

      /* FOCUS BORDER */
      "&.Mui-focused": {
        backgroundColor: "#fff", // prevents light blue on focus
        "& fieldset": {
          borderColor: "#c4c4c4",
          borderWidth: "0.2vh",
        },
      },
      "& .MuiOutlinedInput-input": {
      padding: "1.2vh 1.4vh",   // remove default 16.5px padding
    },
    },

  },

  uploadButton: {
    fontFamily: "Poppins, sans-serif",
    backgroundColor: "#ffffff",
    color: "#006b66",
    textTransform: "none",
    fontSize: "1.6vh",
    // marginTop: "1vh",
    minWidth: "9vw",
    width: "9vw",
   // marginRight: "1.8vh",
    padding: "0.5vh 0.5vw",
    //marginTop: "1.5vh",
    border: "0.1vh solid #006b66",
    borderRadius: "0.5vh",
    //"&:hover": { //backgroundColor: "#005752" },
  },

  extractedBox: {
    /// width: "100%",
    maxWidth: "75vw",
    height: "14vw",
    "& .MuiOutlinedInput-root": {
      fontFamily: "Poppins, sans-serif",
      fontSize: "1.4vh",
      alignItems: "flex-start",
      padding: "1.2vh 1.4vh",
      //marginTop:"0.38vh",

      "& fieldset": { borderColor: "#c4c4c4" },
      "&:hover fieldset": { borderColor: "#c4c4c4", },
      "&.Mui-focused fieldset": { borderColor: "#c4c4c4", borderWidth: "0.2vh" },
    },
    "& .MuiOutlinedInput-input": {
    //  padding: "1.2vh 1.4vh",   // remove default 16.5px padding
    },
    // "& textarea": { padding: "1.5vh" },
  },
  sectionDivider: {
    flex: 1,
    height: "0.1vh",
    backgroundColor: "#E5E7EB",
    marginLeft: "1vh",
    maxWidth: "112vh",
  },
};
