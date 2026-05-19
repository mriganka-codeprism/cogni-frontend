import React from "react";
import {
  Box,
  Stack,
  IconButton,
  OutlinedInput,
  InputAdornment,
  InputLabel,
  Popover,
  SxProps,
} from "@mui/material";
import { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import Close from "@mui/icons-material/Close";
import { globalStyles } from "../../config";
import { FormControlComponent } from "../formControl";
import { dateStyles } from "./dateRange.styles";


import { styled } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";

export const CustomDatePicker = styled(DatePicker)(({ theme }) => ({
  "& .MuiInputBase-root": {
    borderRadius: "0.7vh",
    borderWidth: "0.18vh",
  },

  "& .css-1dune0f-MuiInputBase-input-MuiOutlinedInput-input": {
    height: "1vh",
    width: "100%",
    fontSize: "1.8vh",
    padding: "0.5vh 1.5vh",
    "@media (max-device-width: 1200px)": {
      height: "3.5vh",
    }
  },
  "& .css-1umw9bq-MuiSvgIcon-root": {
    fontSize: "2.5vh",
  },
  "& .css-113d811-MuiFormLabel-root-MuiInputLabel-root": {
    fontSize: "2vh",
    color: globalStyles.colors.primary,
    transform: "translate(2.1vh, -1.4vh) scale(0.75)",
  },
  "& .css-jupps9-MuiInputBase-root-MuiOutlinedInput-root": {
    height: "4.5vh",
    "@media (max-device-width: 480px)": {
      height: "4vh",
    }
  },
  "& .css-oeq6yz-MuiButtonBase-root-MuiIconButton-root": {
    padding: "1vh",
    marginRight: "-1vh",
  },
  "& .Mui-focused fieldset": {
    borderColor: globalStyles.colors.primary,
    borderWidth: "0.18vh",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: globalStyles.colors.primary,
    borderWidth: "0.18vh",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderWidth: "0.18vh",
  },
}));


interface DateRangeSelectorProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  onStartDateChange: (date: Dayjs) => void;
  onEndDateChange: (date: Dayjs) => void;
  label?: string;
  width?: string;
  height?: string;
  top?: string;
  sx?: SxProps;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  disabled?: boolean;
  allowPastDates?: boolean;
  hideFieldLabel?: boolean;
  onClear?: () => void;
  emptyLabel?: string;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  label = "Date Range",
  width,
  height,
  top,
  sx,
  minDate,
  maxDate,
  disabled,
  allowPastDates = false,
  hideFieldLabel = false,
  onClear,
  emptyLabel = "All",
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [anchorWidth, setAnchorWidth] = React.useState<number | undefined>(undefined);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setAnchorWidth(rect.width);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };


  const handleStartDateChange = (newValue: Dayjs | null) => {
    if (newValue && newValue.isValid()) {
      onStartDateChange(newValue);
    }
  };

  const handleEndDateChange = (newValue: Dayjs | null) => {
    if (newValue && newValue.isValid()) {
      onEndDateChange(newValue);
    }
  };

  // Handle date acceptance (for manual input in the field)
  const handleStartDateAccept = (newValue: Dayjs | null) => {
    if (newValue && newValue.isValid()) {
      onStartDateChange(newValue);
    }
  };

  const handleEndDateAccept = (newValue: Dayjs | null) => {
    if (newValue && newValue.isValid()) {
      onEndDateChange(newValue);
    }
  };

  // Ensure the popup matches the trigger width and appears directly under it
  const popupWidth = Math.max(anchorWidth || 0, 520);

  // End date cannot be before both global minDate and chosen startDate
  const endMinDate =
    startDate && minDate
      ? (startDate.isAfter(minDate) ? startDate : minDate)
      : (startDate || minDate);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ marginTop: top || "0vh" }}>
        <FormControlComponent variant="outlined" fullWidth size="small">
          {!hideFieldLabel && (
            <InputLabel
              htmlFor="date-range-input"
              sx={{ color: globalStyles.colors.primary }}
            >
              {label}
            </InputLabel>
          )}
          <OutlinedInput
            id="date-range-input"
            label={hideFieldLabel ? undefined : label}
            value={
              startDate && endDate
                ? `${startDate.format('MMM D, YY')} – ${endDate.format('MMM D, YY')}`
                : emptyLabel
            }
            onClick={handleClick}
            disabled={disabled}
            sx={{
              height: height || "auto",
              ...dateStyles.OutlinedInput,
              width: width || (dateStyles.OutlinedInput as any).width,
              ...sx,
              '& .MuiOutlinedInput-input': {
                paddingRight: 0,
              },
              '& .MuiInputAdornment-root.MuiInputAdornment-positionEnd': {
                marginRight: 0,
              },
            }}
            endAdornment={
              <InputAdornment position="end" sx={{ mr: 0 }}>
                {(startDate || endDate) && (
                  <IconButton
                    size="small"
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onClear) onClear();
                    }}
                    sx={{ mr: 0, p: '0.4vh' }}
                    aria-label="Clear date range"
                  >
                    <Close sx={{ fontSize: "2.2vh" }} />
                  </IconButton>
                )}
                <IconButton size="small" disabled={disabled} sx={{ p: '0.4vh' }}>
                  <CalendarMonthOutlinedIcon
                    sx={dateStyles.CalendarMonthOutlinedIcon}
                  />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControlComponent>
        <Popover
          id="date-range-popover"
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          keepMounted
          disableEnforceFocus
          disableAutoFocus
          slotProps={{
            paper: {
              "aria-label": "Date Range",
              sx: { ml: 0, mr: 0, px: 1, width: popupWidth },
            },
          }}
        >
          <Stack direction="row" spacing={2} sx={{ ...dateStyles.Stack, width: popupWidth }}>
            <CustomDatePicker
              label="Start Date"
              value={startDate}
              onChange={handleStartDateChange}
              onAccept={handleStartDateAccept}
              format="DD-MM-YYYY"
              minDate={minDate || undefined}
              maxDate={maxDate || undefined}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                },
              }}
            />
            <CustomDatePicker
              label="End Date"
              value={endDate}
              onChange={handleEndDateChange}
              onAccept={handleEndDateAccept}
              format="DD-MM-YYYY"
              minDate={endMinDate || undefined}
              maxDate={maxDate || undefined}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                },
              }}
            />
          </Stack>
        </Popover>
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangeSelector;
