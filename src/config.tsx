import { Slider } from "@mui/material";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";

export const globalStyles = {
     fonts: {
    heading: "Barlow",
    body: `"Open Sans", sans-serif`,
  },
  colors: {
    primaryLight: "#f2d2d4",
        primary: "#86161B",
         darkText: "#131313",
        lightText: "#5A5B5C",
    buttonText: "#f8e8e9",
  },
    
}


export const CustomSlider = styled(Slider)({
  color: globalStyles.colors.primary, // selected track color
  height: "1vh",
  padding: "13px 0",
  "& .MuiSlider-thumb": {
    height: 16,
    width: 16,
    backgroundColor: "#fff",
    border: "0.5vh solid #86161B",
    "&:hover": {
      boxShadow: "0 0 0 6px rgba(128, 0, 0, 0.2)",
    },
  },
  "& .MuiSlider-track": {
    backgroundColor: globalStyles.colors.primary,
  },
  "& .MuiSlider-rail": {
    backgroundColor: globalStyles.colors.primaryLight,
    opacity: 0.5,
  },
  "& .MuiSlider-valueLabel": {
    color: globalStyles.colors.primary,
    fontWeight: "bold",
    background: "#fff",
    border: "0.1vh solid #86161B",
    padding: "0.2vh",
    top: -6,
    "& *": {
      background: "#fff",
      color: globalStyles.colors.primary,
    },
    "&::before": {
      border: "0.1vh solid #86161B",
    },
  },
});

export const RoleSwitch = styled(Switch)(({ theme }) => ({
  width: 50,
  height: 20,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(9px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(28px)",
      color: "#86161B",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#F8E8E9",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 15,
    height: 15,
    borderRadius: 10,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 24 / 2,
    opacity: 1,
    backgroundColor: "#eee",
    boxSizing: "border-box",
  },
}));