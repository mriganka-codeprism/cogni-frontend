import { globalStyles } from "../config";

export const homeStyle = {
  HeadingText: {
    marginTop: "0vh",
    fontSize: "2.2vh",
    textAlign: "center",
  },
  HomeContainer: {
    padding: "0vh",
  },
  paraText: {
    fontSize: "1.5vh",
    textAlign: "center"
  },
  paraTextBox: {
    paddingX: "4vh",
  },
  box: {
    width: "96%",
    height: "71vh",
    marginTop: "2vh",
    padding: "6vh",
    display: "flex",
    gap: "14vh",
    marginX: '4vh'
  },
  cameraBox: {
    width: "50vw",
    height: "54vh",
    mt: '-2vh',
    marginLeft: "0vw",
    borderRadius: "1vh",
  },


  submitButton: {
    backgroundColor: "#386465",
    textTransform: "none",
    borderRadius: "1vh",
    marginTop: '3vh'
  },
  icon: {
    fontSize: "3.5vh",
    color: "#fff",
  },
  iconButton: {
    border: globalStyles.colors.primary,
    borderRadius: "50%",
    p: 1.2,
    margin: '0.5vh',
    backgroundColor: globalStyles.colors.primary,
    "&:hover": {
      backgroundColor: "#666362",
      // border: "2px solid #ccc",
      transform: "none",
      boxShadow: "none"
    },
    '&.Mui-disabled': {
      cursor: 'not-allowed',
      pointerEvents: 'all',
    },

    '&.Mui-disabled svg': {
      color: 'gray',

    },

  },
  videoBox: {
    width: "100%",
    height: "100%",
    borderRadius: "1vh",
    // border: "0.3vh solid black",
  },
  noCameraBox: {
    width: "50vw",
    height: "54vh",
    backgroundColor: "#f0f0f0",
    border: "2px dashed #ccc",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#888",
    fontSize: "1rem",
    marginBottom: '0.8vh'
  },
  NoPhotographyIcon: {
    fontSize: "5vh",
    color: "#888",
  },
  box1: {
    display: "flex",
    justifyContent: "center",
    gap: 2,
    marginTop: 1,
  },
  CallEndIcon: {
    color: globalStyles.colors.primary,
    fontSize: "4.5vh",
  },
  box2: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "3vh",
  },
  box3: {
    display: "flex",
    justifyContent: "center",
    gap: 1,
    alignItems: "center",
  },
  callText: {
    fontSize: "2.5vh",
    color: globalStyles.colors.primary,
    fontWeight: 600,
  },
  thankyouText: {
    marginBottom: 2,
    color: "#000000",
    fontWeight: 600,
  },
  view: {
    backgroundColor: "#white",
    color: globalStyles.colors.primary,
    border: "0.1vh solid #86161B",
    textTransform: "none",
    borderRadius: "1vh",
    marginTop: '3vh'
  },
  savebutton: {
    backgroundColor: globalStyles.colors.primary,
    color: "#white",
    border: "0.1vh solid #86161B",
    textTransform: "none",
    borderRadius: "1vh",
    marginTop: '3vh'
  },
  ratingText: {
    marginTop: 3,
    color: "#386465",
    fontWeight: 600,
    fontSize: "3.2vh",
  },
  textfield: {
    width: "18vw",
    marginTop: "0.5vh",
    marginBottom: "0vh",
    borderRadius: "1vh",
    height: '5vh',
    "& .MuiTextField-root": {
      marginBottom: "1vh",
    },


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
    },
    "& fieldset": {
      borderWidth: "0.2vh",

      "&:focus": {
        borderColor: globalStyles.colors.primary,
      },
    },
    "& .MuiInputBase-root": {
      borderRadius: "1vh",
      paddingRight: "0vh",
      backgroundColor: "transparent",
      height: "4vh",
    },
    "& .MuiInputBase-root.MuiOutlinedInput-root": {
      padding: "0.4vh 1.5vh",
      fontSize: "1.6vh",
    },
    "& .MuiInputBase-input": {
      padding: "0.4vh 1.5vh",
      fontSize: "1.6vh",
      // width: "28vw",
      "@media (max-device-width: 480px)": {
        width: "69.5vw",
      },
      "&:hover": {
        borderColor: globalStyles.colors.primary,
      },
    },

    "& .MuiInputLabel-root.Mui-focused": {
      color: globalStyles.colors.primary,
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
  },

  // --- NEW STYLES FOR REDESIGNED LANDING PAGE ---
  landingWrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#f9fafb", // Very light gray background
    paddingTop: "0vh",
    paddingBottom: "2vh",
  },
  headerBox: {
    textAlign: "center",
    marginBottom: "1vh",
  },
  welcomeText: {
    fontSize: "3.5vh",
    fontWeight: 800,
    color: "#111827",
    marginBottom: "0.3vh",
  },
  muTeal: {
    color: "#006B66",
  },
  cognitronRed: {
    color: "#86161B",
  },
  subtitleText: {
    fontSize: "1.8vh",
    color: "#374151",
    fontWeight: 500,
  },
  twoColumnContainer: {
    display: "flex",
    gap: "2vh",
    width: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  mainCard: {
    backgroundColor: "#ffffff",
    overflowX: "hidden",
    width: "90%",
    maxWidth: "1400px",
    borderRadius: "2vh",
    padding: "2vh 3vh",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
    display: "flex",
    flexDirection: "column",
    marginTop: "1vh",
    marginBottom: "1vh",
  },
  leftCard: {
    flex: 1.2,
    display: "flex",
    flexDirection: "column",
    gap: "1vh",
    minWidth: 0,
  },
  rightCard: {
    flex: 0.8,
    backgroundColor: "#f9fafb",
    borderRadius: "2vh",
    border: "1px solid #e5e7eb",
    padding: "1.5vh 2vh",
    display: "flex",
    flexDirection: "column",
    gap: "1.5vh",
    minWidth: "30vh",
  },
  sectionTitle: {
    fontSize: "2.2vh",
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: "0.5vh",
  },
  inputLabel: {
    fontSize: "1.6vh",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "0.5vh",
    display: "flex",
    alignItems: "center",
    gap: "0.5vh",
  },
  requiredAsterisk: {
    color: "#ef4444",
  },
  consentBox: {
    backgroundColor: "#f9fafb",
    borderRadius: "1vh",
    border: "1px solid #e5e7eb",
    padding: "1.2vh 1.5vh",
    display: "flex",
    alignItems: "center",
    gap: "1vh",
    width: "100%",
  },
  consentText: {
    fontSize: "1.4vh",
    color: "#4b5563",
    lineHeight: 1.4,
  },
  proceedButton: {
    backgroundColor: "#006B66",
    color: "#ffffff",
    textTransform: "none",
    fontSize: "1.8vh",
    fontWeight: 700,
    padding: "1vh 3vh",
    borderRadius: "1vh",
    width: "100%",
    "&:hover": {
      backgroundColor: "#005a56",
    },
    "&.Mui-disabled": {
      backgroundColor: "#e5e7eb",
      color: "#9ca3af",
    },
  },
  instructionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1vh",
    marginBottom: "0.5vh",
  },
  instructionTitle: {
    fontSize: "1.8vh",
    fontWeight: 700,
    color: "#111827",
  },
  instructionList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8vh",
  },
  instructionItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.8vh",
  },
  checkIcon: {
    color: "#006B66",
    fontSize: "1.6vh",
    marginTop: "0.2vh",
  },
  instructionText: {
    fontSize: "1.4vh",
    color: "#374151",
    lineHeight: 1.3,
  },
  importantBox: {
    marginTop: "1.5vh",
    backgroundColor: "#ffffff",
    borderRadius: "1vh",
    border: "1px solid #006B66",
    padding: "1.2vh 1.5vh",
    display: "flex",
    alignItems: "center",
    gap: "1vh",
  },
  importantText: {
    fontSize: "1.4vh",
    color: "#374151",
    fontWeight: 500,
  },
  infoIcon: {
    color: "#0891b2",
    fontSize: "2.2vh",
  },
};
