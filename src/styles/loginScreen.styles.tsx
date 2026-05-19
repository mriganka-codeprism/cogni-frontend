import { globalStyles } from "../config";

export const loginstyle = {
  loginContainer: {
    height: "100vh",
    overflow: "hidden",
    "@media (max-device-width: 480px)": {
      justifyContent: "center",
    },
  },
  gridItemBackground: {
    "@media (max-device-width: 480px)": {
      display: "none",
    },
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    height: "100vh",
    // width: "100vw",
  },
  gridItem: {
    backgroundColor: "#eeeeee",
    maxWidth: "41.6%",
    textAlign: "center",
    "@media (max-device-width: 480px)": {
      maxWidth: "100%",
    },
  },
  fieldBox: {
    display: "flex",
    // justifyContent: "Left",
    width: "90vw",
    gap: "2vh",
    "@media (max-device-width: 480px)": { justifyContent: "center" },
  },
  heading: {
    fontWeight: 600,
    marginTop: "0vh",
    fontSize: "2.5vh",
    paddingLeft: "3.5vw",
    "@media (max-device-width: 480px)": {
      marginLeft: "16vh",
    },
    "@media (max-device-width: 420px)": {
      marginLeft: "14vh",
    },
    "@media (max-device-width: 380px)": {
      marginLeft: "12vh",
    },
    "@media (max-device-width: 350px)": {
      marginLeft: "10vh",
    },
    "@media (max-device-width: 333px)": {
      marginLeft: "8vh",
    },
    "@media (max-device-width: 315px)": {
      marginLeft: "8vh",
    },
    "@media (max-device-width: 273px)": {
      marginLeft: "9vh",
    },
    "@media (max-device-width: 230px)": {
      marginLeft: "7vh",
    },
  },
  submitButton: {
    marginTop: "8vh",
    width: "83%",
    height: "6vh",
    fontSize: "2.2vh",
    backgroundColor: "#BF2026",
    borderRadius: "1.5vh",
    textTransform: "none",
    padding: "1vh",
    minWidth: "5vw ",
    "@media (max-device-width: 480px)": {
      width: "88vw",
    },
  },
  textfield: {
    width: "35vw",
    marginTop: "4vh",
    marginBottom: "0vh",
    borderRadius: "1.5vh",
    "@media (max-device-width: 1200px)": {
      width: "40vw",
    },
    "@media (max-device-width: 480px)": {
      width: "89vw",
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
      borderRadius: "1.5vh",
      paddingRight: "0vh",

      backgroundColor: "transparent",
      height: "5vh",
    },
    "& .MuiInputBase-input": {
      padding: "0.6vh 2vh",
      fontSize: "1.8vh",
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
  visibilityicon: {
    fontSize: "2.5vh",
    marginRight: "1vw",
  },
  passwordLink: {
    color: "#BF2026",
    textDecoration: "underline",
    fontSize: "1.7vh",
  },
  logoBox: {
    backgroundColor: "#ffffff",
    display: "flex",
    marginTop: "27vh",
    // textAlign: "center",
    "@media (max-device-width: 600px) and (min-device-width: 481px)": {
      marginTop: "10vh",
      height: "9vh",
      flexDirection: "column-reverse",
    },

    "@media (max-device-width: 480px)": {
      marginTop: "20vh",
      width: "90vw",
      gap: "2vh",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    alignItems: "center",
    justifyContent: "center",
    // width: "70%",
    // paddingLeft: "5vw",
    "@media (max-device-width: 1200px) and (min-device-width: 481px)": {
      width: "80%",
    },
  },
  poweredtext: {
    fontStyle: "brand",
    fontSize: "1.8vh",
    paddingRight: "0vw",
    paddingTop: "0.5vh",
  },
  logo: {
    width: "5vw",
    height: "8vh",
    marginTop: "0vh",
    zIndex: 999,
    // backgroundColor: '#d8d8d8'
  },
  logoStyle: {
    height: "20vh",
    // width:'10vw'
  },
  linkBox: {
    marginTop: "1vh",
    position: "absolute",
    right: "35vw",
  },
  guestText: {
    color: globalStyles.colors.primary,
  },
};
