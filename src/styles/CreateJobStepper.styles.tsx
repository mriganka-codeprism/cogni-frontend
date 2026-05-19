export const styles = {
  root: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    padding: "2vh 12.5vw",
    fontFamily: "Poppins, sans-serif",
  },

  backHomeContainer: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: "1.5vh 2.5vw",
    borderBottom: "0.15vh solid #f3f4f6",
    display: "flex",
    alignItems: "center",
  },

  backText: {
    fontSize: "1.5vh",
    color: "#006B66",
    cursor: "pointer",
    fontFamily: "Poppins, sans-serif",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "0.8vh",
    fontWeight: 600,
    "&:hover": {
      opacity: 0.8,
    },
  },

  title: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 700,
    fontSize: "2.2vh",
    lineHeight: "3vh",
    color: "#141414",
  },

  subtitle: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 400,
    fontSize: "1.6vh",
    lineHeight: "2.4vh",
    color: "#7E7E7E",
    marginBottom: "3vh",
  },

  stepContainer: {
    display: "flex",
    flexDirection: "column",
    padding: "2vh 2vw",
    border: "0.15vh solid #e0e0e0",
    borderRadius: "0.8vh",
    backgroundColor: "#fff",
    marginBottom: "2vh",
    width: "100%",
    maxWidth: "75vw",
    boxShadow: "0 0.2vh 0.8vh rgba(0, 0, 0, 0.06)",
  },

  stepRow: {
    display: "flex",
    alignItems: "center",
    width: "100%",
  },

  labelRow: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    marginTop: "1vh",
    paddingLeft: "0",
    paddingRight: "0",
  },

  stepColumn: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    marginLeft: "1vh",
    "&:last-child": {
      flex: "0 0 auto",
      marginRight: '1vw',
    },
  },

  labelColumn: {
    flex: 1,
    minWidth: 0,
    //marginLeft:"3vh",
    textAlign: "left",
    padding: "0 0.3vw",
    "&:last-child": {
      flex: "0 0 auto",
    },
  },

  completedStep: {
    width: "3.2vh",
    height: "3.2vh",
    minWidth: "3.2vh",
    borderRadius: "50%",
    border: "none",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.8vh",
    backgroundColor: "#006b66",
    flexShrink: 0,
    fontWeight: 600,
  },

  activeStep: {
    width: "3.2vh",
    height: "3.2vh",
    minWidth: "3.2vh",
    borderRadius: "50%",
    border: "0.2vh solid #999",
    color: "#666",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.3vh",
    fontWeight: 600,
    backgroundColor: "#fff",
    flexShrink: 0,
  },

  step: {
    width: "3.2vh",
    height: "3.2vh",
    minWidth: "3.2vh",
    borderRadius: "50%",
    border: "0.2vh solid #ccc",
    color: "#999",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.3vh",
    fontWeight: 600,
    backgroundColor: "#fff",
    flexShrink: 0,
  },

  dashedLine: {
    flex: 1,
    // minWidth: "1vw",
    height: "0",
    minWidth: "24vh",
    borderTop: "0.2vh dashed #ccc",
    marginLeft: "0.4vw",
    marginRight: "0.4vw",
  },

  solidLine: {
    flex: 1,
    minWidth: "24vh",
    height: "0",
    borderTop: "0.25vh solid #006b66",
    marginLeft: "0.4vw",
    marginRight: "0.4vw",
  },

  stepTextActive: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.6vh",
    fontWeight: 600,
    color: "#006b66",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  completedStepText: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.6vh",
    fontWeight: 600,
    color: "#006b66",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  stepText: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.6vh",
    fontWeight: 500,
    color: "#999",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  footer: {
    fontFamily: "Poppins, sans-serif",
    width: "75vw",
    display: "flex",
    justifyContent: "space-between",
    gap: "1vw",
    marginTop: "10vh",
    // borderTop: "0.2vh solid #e0e0e0",
    paddingTop: "1vh",
  },

  backButton: {
    border: "0.2vh solid #006b66",
    color: "#006b66",
    width: "6.93vw",
    minWidth: "6.93vw",
    height: "3.88vh",
    borderRadius: "0.56vh",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 500,
    fontSize: "1.67vh",
    textTransform: "none",
    marginLeft: "18.4vh",
    padding:"0vh",
    "&:hover": {
      borderColor: "#005752",
      backgroundColor: "rgba(0, 107, 102, 0.04)",
    },
  },


  clearallbutton: {
    border: "0.2vh solid #d3d3d3",
     padding:"0vh",
    color: "#6B6B6B",
    minWidth:"6.93vw",
    width: "6.93vw",
    height: "3.88vh",
    borderRadius: "0.56vh",
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.67vh",
    textTransform: "none",
    marginleft: "10vh",
    backgroundColor: "#FCFCFC",

    "&:hover": {

      //  borderColor: "#005752",
      //  backgroundColor: "rgba(0, 107, 102, 0.04)",
    },
  },
  saveButton: {
    backgroundColor: "#006b66",
     padding:"0vh",
     minWidth:"10.11vw",
    color: "#fff",
    width: "10.11vw",
    height: "3.88vh",
    borderRadius: "0.56vh",
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.67vh",
    textTransform: "none",
    marginLeft: "auto",
    marginRight: "18.3vh",
    "&:hover": {
      backgroundColor: "#005752",
    },
    "&.Mui-disabled": {
      backgroundColor: "#e0e0e0",
      color: "#006b66",
      cursor: "not-allowed",
    },
  },
};