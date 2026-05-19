import React from "react";
import {
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  SxProps,
} from "@mui/material";
import { FormControlComponent } from "./formControl";

interface OptionType {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label?: string; // Optional label
  value: string;
  onChange: (event: SelectChangeEvent<any>) => void;
  options?: (string | OptionType) [];
  sx?: SxProps; // Custom styles
  inputLabelSx?: SxProps; // Custom styles for InputLabel
  menuItemSx?: SxProps; // Custom styles for MenuItem
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  onChange,
  options = [],
  sx,
  inputLabelSx,
  menuItemSx,
}) => {

  const capitalizeFirstLetter = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  return (
    <FormControlComponent sx={{width:'20%',...sx}}>
      <Select
        value={value}
        onChange={onChange}
        variant="outlined"
        sx={{width:'100%',height:'5vh'}}
        inputProps={{ notched: false }}
        displayEmpty
        renderValue={(selected) => {
          if (selected === "") {
            return label || "Select";
          }
      
          // Try to find the label
          const selectedOption = options.find((opt: any) =>
            typeof opt === "string" ? opt === selected : opt.value === selected
          );
      
          if (typeof selectedOption === "string") {
            if (label === "Status") {
              const text = selectedOption.replaceAll("_", " ");
              return capitalizeFirstLetter(text);
            }
            return selectedOption;
          }

          return selectedOption?.label || selected;
        }}
      >
        {options?.map((option : any, index : any) => {
          // Handle both string and object cases
          const displayText =
            typeof option === "string"
              ? label === "Status"
                ? option.charAt(0).toUpperCase() +
                  option.replaceAll("_", " ").slice(1).toLowerCase()
                : option
              : option.label; // For object, use `label`

          return (
            <MenuItem
              key={index}
              value={typeof option === "string" ? option : option.value} // Store correct value
              sx={{ fontSize: "1.8vh", textTransform: "capitalize" }}
            >
              {displayText}
            </MenuItem>
          );
        })}
      </Select>
    </FormControlComponent>
  );
};

export default CustomSelect;

