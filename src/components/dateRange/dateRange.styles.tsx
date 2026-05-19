import { globalStyles } from "../../config";

export const dateStyles = {
  OutlinedInput: {
    cursor: "pointer",
    paddingRight: "0vh",
    width: "34vh",
    "@media (max-device-width: 1200px)": {
      width: "31vw",
    },
    "@media (max-device-width: 890px)": {
      width: "32vw",
    },

    "@media (max-device-width: 480px)": {
      width: "auto",
      height: "6.2vh",
    },
    "& .MuiOutlinedInput-input": {
      fontSize: "1.8vh",
      color: "#131313",
      width: "17vw",
      "@media (max-device-width: 1200px)": {
        width: "24vw",
      },
      "@media (max-device-width: 480px)": {
        fontSize: "2.25vh",
        width: "65vw",
      },
      "@media (max-device-width: 380px)": {
        fontSize: "1.9vh",
      },
    },
    OutlinedInput1: {
      cursor: "pointer",
      paddingRight: '0vh',
      // "@media (max-device-width: 1200px)": {
      //   width:"31vw"
      // },
      // "@media (max-device-width: 890px)": {
      //   width:"32vw"
      // },

      // "@media (max-device-width: 480px)": {
      //   width:"auto",
      //  // height:"6.2vh"
      // },
      "& .MuiOutlinedInput-input": {
        fontSize: "1.8vh",
        color: "#131313",
        // width:'17vw',
        // "@media (max-device-width: 1200px)":{
        //   width:"24vw"
        // },
        // "@media (max-device-width: 480px)": {
        //   width:"65vw"
        // },

      },

      "& fieldset": {
        border: "0.19vh solid rgba(0, 0, 0, 0.23)",
        borderRadius: '0.6vh'

      },
      "& .Mui-focused fieldset": {
        borderColor: globalStyles.colors.primary,
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: globalStyles.colors.primary,
        borderWidth: "0.1vh",
      },
    },
    "& .Mui-focused fieldset": {
      borderColor: globalStyles.colors.primary,
      borderWidth: "0.15vh",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: globalStyles.colors.primary,
      borderWidth: "0.15vh",
    },
  },
  CalendarMonthOutlinedIcon: {
    fontSize: "2.7vh",

    "@media (max-device-width: 480px)": { fontSize: "2vh" },
  },
  OutlinedInput1: {
    cursor: "pointer",
    paddingRight: "0vh",

    "@media (max-device-width: 1200px)": {
      width: "31vw",
    },
    "@media (max-device-width: 890px)": {
      width: "32vw",
    },

    "@media (max-device-width: 480px)": {
      width: "auto",
      // height:"6.2vh"
    },
    "& .MuiOutlinedInput-input": {
      fontSize: "1.8vh",
      color: "#131313",
      width: "17vw",
      "@media (max-device-width: 1200px)": {
        width: "24vw",
      },
      "@media (max-device-width: 480px)": {
        width: "73vw",
      },
    },

    "& fieldset": {
      border: "0.19vh solid rgba(0, 0, 0, 0.23)",
      borderRadius: "0.6vh",
    },
    "& .Mui-focused fieldset": {
      borderColor: globalStyles.colors.primary,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: globalStyles.colors.primary,
      borderWidth: "0.1vh",
    },
  },
  SurveyDashboardFormControl: {
    "& legend": {
      width: "16vh",
    },
    "& .MuiInputAdornment-root": {
      "& .MuiIconButton-root": {
        padding: "2.1vh",
      },
    },
  },
  IconButton: {
    height: "4vh",
    width: "4vh",
  },
  Stack: {
    padding: "2vh",
    "@media (max-device-width: 480px)": {
      paddingX: "1vh",
      paddingBottom: "1vh",
      paddingTop: "1.5vh"
    }
  },
  box1: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
  },
  DemoItem: {
    height: "6vh",
    width: "22vw",
    minWidth: "5vw",
    display: "flex",
    flexDirection: "row",
    textAlign: "center",
    alignItems: "center",
  },
  Stack1: {
    display: "flex",
    flexDirection: "row",
    // Custom styles applied here
    "& > :not(style) ~ :not(style)": {
      marginTop: "0vh",
    },
  },
  box2: {
    mx: "2vh",
    fontSize: "3vh",
  },
  datepicker: {
    "& .MuiFormLabel-root": {
      margin: "0vh",
    },
    "& .MuiInputLabel-root": { fontSize: "2.5vh", color: "#86161B" },
    "& .MuiInputBase-root": {
      padding: "0vh",
    },
    "& .MuiOutlinedInput-root": {
      padding: "0vh",
      borderRadius: "1vh",
      // border:'0.1vh solid',
      height: "4.8vh",
      width: "10vw",
    },
    "& .MuiInputBase-input": {
      padding: "0vh",
    },
    "& .MuiOutlinedInput-input": {
      padding: "1.5vh",
      width: "6vw",
      fontSize: "1.9vh",
    },
    "& .MuiInputAdornment-root": {
      marginLeft: "0vh",
    },
    "& .MuiButtonBase-root": {
      padding: "0vh",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "3vh",
    },
    "& .MuiFormControl-root-MuiTextField-root": {
      margin: "0vh",
      padding: "0vh",
    },
  },
};
