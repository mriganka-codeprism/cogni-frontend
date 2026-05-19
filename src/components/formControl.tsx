import { FormControl } from "@mui/material";
import { styled } from "@mui/material";
import { globalStyles } from "../config";

export const FormControlComponent = styled(FormControl)({
  // verticalAlign: "bottom",
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
    fontSize:'1.8vh'
  },
  "& .MuiInputBase-input": {
    padding: "0.6vh 0vh 0.6vh 2vh",
    fontSize: "1.8vh",
    "&:hover": {
      borderColor: globalStyles.colors.primary,
    },
    ".MuiOutlinedInput-input.MuiSelect-select": {
      minHeight:'3.5vh'
     }, 
  },
 
  "& .MuiInputLabel-root": {
    color: "#393939",
    fontSize: "2.2vh",
    transform: "translate(1.2vh, -0.7em) scale(0.75)",
    transformOrigin: "top left",
    transition: "transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: globalStyles.colors.primary,
  },

  "& .MuiSelect-select": {
    padding: "0.5vh 1.2vh",
    fontSize: "",
  },

  "& .MuiSvgIcon-root": {
    fontSize: "3.2vh", // Ensures dropdown icon stays a fixed size
  },

  ".css-elo8k2-MuiInputAdornment-root": {
    marginLeft: "0vh",
  },
  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
    borderColor: globalStyles.colors.primary,
    borderWidth: "0.2vh",

  },
  "& .css-w1u3ce>span":{
    paddingLeft:'1.5vh'
  }
});