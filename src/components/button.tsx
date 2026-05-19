import React from "react";
import { Button as MUIButton } from "@mui/material";
import { globalStyles } from "../config";

interface ButtonProps {
  type: "primary" | "secondary" | "tertiary"; // Define button types
  children?: React.ReactNode; // Button text or components
  onClick?: any; // Click handler
  disabled?: boolean; // Disable button
  [key: string]: any; // Allow any other props
  text?: string;
  additionalStyles?: any; //
}

const CustomButton: React.FC<ButtonProps> = ({
  type,
  children,
  onClick,
  disabled = false,
  text,
  additionalStyles,
  ...props
}) => {
  const buttonStyles = {
    backgroundColor:
      type === "primary" ? globalStyles.colors.primary : "transparent", // Primary background for primary button
    color:
      type === "primary"
        ? globalStyles.colors.buttonText // White text for primary
        : globalStyles.colors.primary, // Primary color for secondary and tertiary
    border:
      type === "secondary"
        ? `0.1vh solid ${globalStyles.colors.primary}`
        : "none",
    textTransform: "none",
    paddingX: "0.3vw",
    paddingY: "0.2vw",
    textDecoration: type === "tertiary" ? "underline" : "none",
    fontFamily: `"Open Sans", sans-serif`,

    fontSize: "2vh",
    width: "auto",
    minWidth: "auto",
    borderRadius: "1vh",
    textWrap: "nowrap",
    height: "4.5vh",
   
  };
  const combinedStyles = { ...buttonStyles, ...additionalStyles };

  return (
    <MUIButton
      onClick={onClick}
      sx={combinedStyles}
      variant={type === "primary" ? "contained" : "outlined"} // MUI variant for primary and secondary buttons
      disabled={disabled} // Disable button if prop is true
      {...props} // Pass down any additional props
    >
      {children}
      {text}
    </MUIButton>
  );
};

export default CustomButton;
