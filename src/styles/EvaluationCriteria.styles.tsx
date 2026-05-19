import { DocumentBackground } from "docx";
import { keyframes } from "@mui/system";

const sparklePulse = keyframes`
  0%   { filter: drop-shadow(0 0 0.2vh rgba(123,63,228,0.4)); }
  50%  { filter: drop-shadow(0 0 0.8vh rgba(123,63,228,0.9)); }
  100% { filter: drop-shadow(0 0 0.2vh rgba(123,63,228,0.4)); }
`;

const sparkleRotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;
const primaryGreen = "#006b66";
export const styles = {
  root: {
    width: "100%",
    height: "100%",
    padding: "1vh 0vw",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
  },

  backText: {
    fontSize: "1.5vh",
    color: "#777",
    marginBottom: "2vh",
    cursor: "pointer",
    marginLeft: "-10vh",
  },

  title: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "2.4vh",
    fontWeight: 500,
  },

  subtitle: {
    fontSize: "1.6vh",
    color: "#888",
    marginBottom: "3vh",
  },

  stepContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "2vh 2vw",
    border: "0.15vh solid #e0e0e0",
    borderRadius: "1vh",
    backgroundColor: "#fff",
    marginBottom: "4vh",
    width: "100%",
    boxShadow: "0 0.2vh 0.8vh rgba(0, 0, 0, 0.08)",
  },

  stepRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  stepColumn: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },

  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0.5vh",
  },

  labelColumn: {
    flex: 1,
    textAlign: "center",
  },

  dashedLine: {
    flex: 1,
    height: "0",
    borderTop: "0.2vh dashed #ccc",
    marginLeft: "0.5vw",
    marginRight: "0.5vw",
  },

  completedStep: {
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
    width: "3.2vh",
    height: "3.2vh",
    borderRadius: "50%",
    border: "0.25vh solid #006b66",
    color: "#006b66",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.4vh",
    fontWeight: 400,
    backgroundColor: "#fff",
  },

  step: {
    width: "3vh",
    height: "3vh",
    borderRadius: "50%",
    border: "0.2vh solid #ccc",
    color: "#777",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.4vh",
  },

  stepTextCompleted: {
    fontSize: "2vh",
    color: "#006b66",
    marginLeft: "1vw",
    // marginRight: "2vw",
  },

  stepTextActive: {
    fontSize: "2vh",
    color: "#006b66",
    marginLeft: "1vw",
    // marginRight: "2vw",
  },

  stepText: {
    fontSize: "2vh",
    color: "#aaa",
    marginLeft: "1vw",
    //marginRight: "2vw",
  },

  line: {
    width: "8vw",
    height: "0",
    borderTop: "0.2vh dashed #ccc",
    style: "dotted",
  },

  lineActive: {
    width: "4vw",
    height: "0.2vh",
    backgroundColor: "#006b66",
    marginRight: "2vw",
  },

  sectionTitle: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "2vh",
    fontWeight: 500,
    marginBottom: "1vh",
  },
  criteriaContainer: {
    input: {
      "& .MuiOutlinedInput-root": {
        height: "4.7vh",
        maxWidth: "75vw",
        fontSize: "1.8vh",
        backgroundColor: "#fff", // keeps it white normally
        borderColor: "red",
        "& fieldset": {
          // borderColor: "#c4c4c4",
          borderColor: "red",
          padding: "8.5vh 14 vh",
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
            borderWidth: "0.3vh",
          },
        },
      },
    },
  },

  label: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 400,
    fontSize: "1.6vh",
    lineHeight: "2vh",
    //color: "#606060",
    marginTop: "0.15vh",
    marginBottom: "1vh",
  },

  requiredStar: {
    color: "#900B09",
    marginLeft: "0.2vw",
  },

  criteriaBox: {
    height: "4.7vh",
    width: "18vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.6vh",
  },

  criteriaOuterContainer: {
    // border: "0.15vh solid white",
    border: "0 solid white",
    borderRadius: "0.3vh",
    //padding: "1vh",
    // marginTop: "0.3vh",
    backgroundColor: "white",
    maxWidth: "75vw",
    height: "38vh",
    fontSize: "1.4vh",
    display: "flex",
    //borderColor: "#c4c4c4",
  },

  chipBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.75vh",
    paddingX: "1vh",
    borderRadius: "0.5vh",
    width: "fit-content",
    height: "3vh",
    fontSize: "1.6vh",
  },

  criteriaWrapper: {
    display: "flex",
    gap: "0.75vh",
    flexWrap: "wrap" as const,
  },

  criteriaChip: {
    border: "0.15vh solid #ccc",
    borderRadius: "0.6vh",
    padding: "1vh",
    minHeight: "5vh",
    whiteSpace: "pre-line",
    backgroundColor: "#fafafa",
    fontSize: "1.6vh",
    // maxHeight: "45vh",
    height: "auto",
    // overflowY: "auto",
    paddingRight: "1vh",
    width: "100%",

    outline: "none",
    "&:focus": {
      outline: "none",
      borderColor: "#ccc",
    },
    "&:focus-visible": {
      outline: "none",
      borderColor: "#ccc",
    },
    "&:focus-within": {
      outline: "none",
      borderColor: "#ccc",
    },
  },

  criteriaPlaceholder: {
    fontSize: "1.4vh",
    color: "#999",
    //padding: "1vh 0.5vw",
  },

  addBoxText: {
    fontSize: "1.5vh",
    color: "#666",
    maxHeight: "2vh",
    minWidth: "5vh",
    padding: "0.5vh 0.5vw",
    paddingBottom: "3vh",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#c4c4c4",
    },

    /* HOVER BORDER */
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#c4c4c4",
    },

    /* FOCUS BORDER — REMOVE BLUE */
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#c4c4c4",
      borderWidth: "0.2vh",
    },

    /* REMOVE FOCUS RING */
    "&.Mui-focused": {
      backgroundColor: "#fff",
      boxShadow: "none",
    },
  },

  removeIcon: {
    fontSize: "1.25vh", // reduce size
    lineHeight: "1",
    padding: 0, // no extra space
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    color: "grey",
  },

  addBox: {
    border: "0.15vh dashed #999",
    borderRadius: "0.6vh",
    padding: "0.8vh 1.2vh",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",

    // optional hover effect
    "&:hover": {
      backgroundColor: "#f2f2f2",
    },
  },

  criteriaInput: {
    width: "15vh",
    fontFamily: "Poppins, sans-serif",
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#999",
      },
      "&:hover fieldset": {
        borderColor: "#999",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#999",
        borderWidth: "0.15vh",
      },
    },
  },

  input: {
    "& .MuiOutlinedInput-root": {
      height: "4.7vh",
      maxWidth: "75vw",
      fontSize: "1.6vh",
      fontFamily: "Poppins, sans-serif",
      backgroundColor: "#fff", // keeps it white normally
      "& fieldset": {
        borderColor: "#c4c4c4",
        padding: "8.5vh 14 vh",
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
          borderWidth: "0.3vh",
        },
      },
    },
  },

  textArea: {
    "& .MuiOutlinedInput-root": {
      alignItems: "flex-start",
      fontFamily: "Poppins, sans-serif",
      fontSize: "1.6vh",
      maxWidth: "75vw",
      maxHeight: "15vw",
      "& fieldset": {
        borderColor: "#ccc",
        padding: "8.5vh 14 vh",
      },
      "&:hover fieldset": {
        borderColor: "#ccc",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#ccc",
      },
    },
    "& textarea": {
      paddingBottom: "2vh",
    },
  },

  footer: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    marginTop: "7.3vh",
  },

  backButton: {
    border: "0.2vh solid #006b66",
    color: "#006b66",
    width: "6.93vw",
    height: "3.88vh",

    borderRadius: "0.56vh",
    borderWidth: "0.09vh",
    borderStyle: "solid",

    opacity: "1",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Poppins",
    fontWeight: "500",
    fontStyle: "normal",
    fontSize: "1.67vh",
    lineHeight: "100%",
    letterSpacing: "0vw",
    textAlign: "center",
    textTransform: "none",
  },

  solidLine: {
    flex: 1,
    height: "0",
    borderTop: "0.25vh solid #006b66",
    marginLeft: "0.5vw",
    marginRight: "0.5vw",
  },

  saveButton: {
    backgroundColor: "#006b66",
    color: "#fff",
    width: "9.11vw",
    height: "3.88vh",
    borderRadius: "0.56vh",
    borderWidth: "0.09vh",
    padding: "1.11vh",
    gap: "0.93vh",
    opacity: 1,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontFamily: "Poppins",
    fontStyle: "normal",
    fontSize: "1.67vh",
    lineHeight: "100%",
    letterSpacing: "0vw",
    textAlign: "center",
    textTransform: "none",

    "&:hover": {
      backgroundColor: "#005752",
    },

    // 🔑 Disabled state override
    "&.Mui-disabled": {
      backgroundColor: "#e0e0e0",
      color: "#006b66",
      cursor: "not-allowed",
    },
  },

  generateHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    //alignItems: "center",
    alignItems: "center",
    marginTop: "2vh",
    marginBottom: "0.5vh",
     gap:"1vh",
      padding:"0vh",
  },

  generateBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5vh",
    cursor: "pointer",
    maxWidth: "75vw",
   
    padding:"0vh",
  },

  generateIcon: {
    color: "#7b3fe4",
    fontSize: "1.8vh",
    transition: "all 0.3s ease",
    width:"2vh",
    height:"2vh",
  },
  generateText: {
    fontFamily:"Poppins, sans-serif",
    color: "#7b3fe4",
    fontSize: "1.4vh",
    fontWeight: 500,
    transition: "all 0.3s ease",
  },

  textAreaWrapper: {
    width: "100%",
    marginTop: "0.3vh",
  },

  belowTextArea: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0.5vh",
  },

  warningText: {
    color: "#900B09",
    fontSize: "1.4vh",
  },

  wordCountText: {
    color: "#888",
    fontSize: "1.4vh",
  },

  wordCountError: {
    color: "#900B09",
    fontSize: "1.4vh",
  },

  stepsWrapper: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "flex-start",
    paddingLeft: "2vw",
    paddingRight: "2vw",
  },

  stepBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    position: "relative",
  },

  card: {
    position: "relative",
    width: "100%",
    borderRadius: "0.8vh",
    border: "0.15vh solid #e0e0e0",
    padding: "2vh",
    marginBottom: "2vh",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
    height: "auto",
  },


  cardHighlight: {
    //  borderColor: "#900B09",
    // boxShadow: "0 0 0 0.3vh rgba(144, 11, 9, 0.15)",
  },

  cardError: {
    borderColor: "#900B09",
  },

  addCriteriaButton: {

    marginTop: "1vh",
    padding: "1.2vh",
    borderRadius: "0.6vh",
    border: "0.15vh dashed #bdbdbd",
    textAlign: "center",
    cursor: "pointer",
    fontSize: "1.4vh",
    color: "#006b66",
    "&:hover": {
      backgroundColor: "#f7f7f7",
    },
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5vh",
  },

  sectionSubtitle: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.4vh",
    color: "#777",
  },

  addCriteriaTopBtn: {

    border: "0.19vh solid #006B66",
    color: "#006B66",
    padding: "0.5vh 1.6vh",
    borderRadius: "0.6vh",
    fontSize: "1.4vh",
    cursor: "pointer",
    fontWeight: 700,
    background: "#fff",
    height: "fit-content",
    transition: "0.2s",
    marginRight: "1.8vh",
    marginTop: "2vh",

    "&:hover": {
      backgroundColor: "#006B66",
      color: "#fff",
    },
  },
  suggestedLabel: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.5vh",
    color: "#424242",
  },

  suggestedTag: {
    fontFamily: "Poppins, sans-serif",
    border: `0.1vh solid #a6acab`,
    borderRadius: "0.7vh",
    padding: "0.4vh 1vh",
    fontSize: "1.2vh",
    color: "#5F5F5F",
    cursor: "pointer",
    fontWeight: 500,
    backgroundColor: "#FCFCFC",
    minWidth: "3vw",
  },

  deleteIcon: {
    position: "absolute",
    top: "1vh",
    right: "1.5vh",
    color: "#900B09",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
    "&:hover": {
      transform: "scale(1.15)",
    },
  },


  descHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1.2vh",
  },

  generateBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.6vh",
    cursor: "pointer",
    borderRadius: "0.8vh",
    padding: "0.2vh 0.6vh",

    "&:hover .generateIcon": {
      animation: `${sparkleRotate} 1.4s linear infinite`,
      transform: "scale(1.15)",
    },

    "&:hover .generateText": {
      color: "#9f6bff",
    },
  },
  cardsContainer: {
    overflowY: "auto",
    paddingRight: "1vh",
    marginTop: "1vh",
    height: "40vh", // 👈 sets max height for scrolling
    width: "75vw",



    "&::-webkit-scrollbar": {
      width: "0.6vh",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#c1c1c1",
      borderRadius: "1vh",
    },
  },
  suggestedRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    //marginTop: "1.5vh",
    // marginBottom:"1.5vh",
  },

  suggestedLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1vh",
  },

  titleInput: {
    
    fontFamily: "Poppins, sans-serif",
    "& .MuiOutlinedInput-root": {
      fontSize:"1.4vh",
      borderRadius: "0.6vh",
      backgroundColor: "#fff",
      fontFamily: "Poppins, sans-serif",

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
      "& .MuiOutlinedInput-input": {
      padding: "1.2vh 1.4vh",   // remove default 16.5px padding
    },
    },
  },

  descriptionInput: {
    minHeight: "12vw",
    
    fontFamily: "Poppins, sans-serif",
    //height:"auto",
    scrollbarWidth: "thin",
    "& .MuiOutlinedInput-root": {
      fontFamily: "Poppins, sans-serif",
      fontSize:"1.4vh",
      borderRadius: "0.6vh",
      backgroundColor: "#fff",
      overflow: "hidden",
       padding: "1.2vh 1.4vh",

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
      "& textarea": {
        overflow: "hidden",    // ✅ removes inner scroll
        resize: "none",
      },
    //   "& .MuiOutlinedInput-input": {
    //   padding: "1.2vh 1.4vh",   // remove default 16.5px padding
    // },
    },


  },

  loadingText: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.4vh",
    color: "#666",
    marginLeft: "1vw",
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

};
