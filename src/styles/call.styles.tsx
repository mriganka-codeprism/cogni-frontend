import { globalStyles } from "../config";

export const callStyles = {
  recordIcon: {
    color: "red",
    fontSize: "3vh",
  },
  CallEndIconButton: {
    backgroundColor: "red",
    color: "#fff",
    padding: "0.4vh 1.2vh",
    "&:hover": {
      backgroundColor: "#FAA0A0",
      border: "0.25vh solid #ccc",
    },
  },
  CallEndIcon: {
    fontSize: "2.5vh",
    color: "#fff",
  },
  box1: {
    flex: 1,
    position: "relative",
    padding: 2,
    minWidth: "50vw",
    // maxWidth: '70vw',
  },
  transcriptButton: {
    marginBottom: '2vh',
    backgroundColor: "#386465",
    textTransform: "none",
    pointerEvents: "none",
    boxShadow: "none",
    fontSize:'2.2vh',
    minWidth:'8vh',
    padding:'2vh',
    borderRadius:'1vh'
  },
  box2: {
    display: "flex",
    height: "82vh",
    backgroundColor: "white",
  },
  box3: {
    position: "absolute",
    top: "5vh",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: "0.5vh 1.5vh",
    borderRadius: "2.5vh",
  },
  RadioButtonCheckedIcon: {
    color: "red",
    fontSize: "1.2rem",
    marginRight: "0.75vh",
  },
  box4: {
    borderRadius: 2,
    overflow: "hidden",
    // backgroundColor: "#000",
  },
  avatarBox: {
    position: "absolute",
    top: 26,
    right: 80,
    width: "10vw",
    height: "20vh",
    // borderRadius: "50%",
    overflow: "hidden",
    border: "0.25vh solid black",
  },
  GraphicEqIcon: {
    //   position: "absolute",
    //           top: 120,
    //           left: 10,
    fontSize: "3vh",
    color: "#fff",
    animation: "eq-pulse 1s infinite",
  },
  GraphicEqIconButton: {
    position: "absolute",
    top: 120,
    right: 10,
    borderRadius: "50%",
    backgroundColor: "#4caf50",
    p: 0.4,
  },
  divider: {
    border: "0.1vh solid #393939",
  },
  youText: {
    color: globalStyles.colors.primary,
    fontSize: "1.5vh",
  },
  botText: {
    color: "#fff",
    fontSize: "1.5vh",
  },
};
