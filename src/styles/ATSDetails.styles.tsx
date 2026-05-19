export const styles = {
  root: {
    width: "100%",
    height: "100%",
    padding: "0 0 1vh 0",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Poppins, sans-serif",
  },
  box1: {
    // paddingRight: "2vh",
    maxWidth: "78vw",
    overflow: "visible",
  },

  sectionTitle: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    fontSize: "1.8vh",
    lineHeight: "1.8vh",
    color: "#424242",
    // color: "#141414",
  },

  subsectionsubTitle: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 300,
    fontSize: "1.2vh",
    color: "#424242",
    marginTop: "1vh",
    // marginBottom: "1vh",
  },

  subsectionTitle: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    fontSize: "1.8vh",
    color: "#424242",
    marginTop: "1.2vh",
    // marginBottom: "1vh",
  },

  label: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.3vh",
    fontWeight: 500,
    color: "#606060",
    marginBottom: "0.3vh",
  },

  sliderBox: {
    padding: "0.3vh 0",
    marginTop: "0.6vh",
  },

  sliderTrack: {
    color: "#006b66",
  },

  radioGroup: {
    marginLeft: "-1vh",
    marginTop: "0.6vh",
    "& .MuiFormControlLabel-label": { fontFamily: "Poppins, sans-serif", fontSize: "1.4vh" },
  },

  radio: {
    color: "#ccc",
    // unchecked radio

    "&.Mui-checked": {
      color: "#006b66",         // checked radio
    },
  },

  weightGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "2vh 6.5vw",
    marginTop: "1.8vh",
    maxWidth: "100%",
  },

  weightGridItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3vh",
  },

  weightLabelContainer: {
    display: "flex",
    alignItems: "flex-end",
    gap: "1.5vw",
  },

  weightInputContainer: {
    display: "flex",
    alignItems: "center",
    border: "0.1vh solid",
    borderColor: "#F3F4F6",
    borderRadius: "1.2vh",
    backgroundColor: "#FBFBFB",
    height: "3.5vh",
    overflow: "hidden",
    width: "100%",
    maxWidth: "60.5vh",

  },

  weightValueBox: {
    fontSize: "1.3vh",
    fontWeight: 600,
    color: "#141414",
    flex: 1,
    padding: "0 1vh",
    fontFamily: "Poppins, sans-serif",
  },

  weightControlSeparator: {
    width: "0.1vh",
    height: "1.8vh",
    backgroundColor: "#d1d5db",
  },

  weightLabel: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.5vh",
    color: "#424242",
    fontWeight: 500,
    width: "100%",
    marginBottom: "0.2vh",
  },

  weightInput: {
    width: "8vh",
    flexShrink: 0,
    "& .MuiOutlinedInput-root": {
      height: "4vh",
      fontSize: "1.4vh",
      fontFamily: "Poppins, sans-serif",
      "& fieldset": { borderColor: "#c4c4c4" },
      "&:hover fieldset": { borderColor: "#006b66" },
      "&.Mui-focused fieldset": { borderColor: "#006b66" },
      "& .MuiOutlinedInput-root": {
        height: "4vh",
      },

      "& .MuiOutlinedInput-input": {
        padding: "0.8vh",
        fontSize: "1.6vh",
        textAlign: "center",
      },
    },
  },

  sumRow: {
    marginTop: "0.8vh",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    fontSize: "1.3vh",
    color: "#424242",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.3vw",
  },

  sumTotal: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    fontSize: "1.3vh",
    color: "#424242",
  },

  sumTarget: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 500,
    fontSize: "1.2vh",
    color: "#6b7280",
  },

  sumRemaining: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    fontSize: "1.2vh",
    color: "#006b66",
    marginLeft: "0.2vw",
  },

  sumOver: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    fontSize: "1.4vh",
    color: "#b91c1c",
    marginLeft: "0.3vw",
  },

  sumComplete: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    fontSize: "1.2vh",
    color: "#15803d",
  },

  sumError: {
    color: "#d32f2f",
    fontSize: "1.2vh",
    marginTop: "0.3vh",
  },

  description: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.2vh",
    fontWeight: 400,
    color: "#6e6e6e",
    marginBottom: "0.8vh",
    marginTop: "1vh",
  },

  weightControlBox: {
    display: "flex",
    alignItems: "center",
    gap: "0",
    flexShrink: 0,
  },

  weightButton: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.2vh",
    fontWeight: 600,
    width: "2.8vh",
    height: "100%",
    minWidth: "2.8vh",
    padding: "0",
    border: "none",
    backgroundColor: "#FBFBFB",
    color: "#424242",
    borderRadius: "0",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      backgroundColor: "#f0f9f8",
      color: "#006b66",
    },
    "&:active": {
      backgroundColor: "#e0f2f1",
    },
  },

  weightValue: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.6vh",
    fontWeight: 600,
    color: "#141414",
    minWidth: "3vh",
    textAlign: "center",
  },

  sectionDivider: {
    fontFamily: "Poppins, sans-serif",
    flex: 1,
    height: "0.1vh",
    backgroundColor: "#E5E7EB",
    marginLeft: "1vh",
  },
};
