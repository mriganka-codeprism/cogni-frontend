import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Slider,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { styles } from "../styles/ATSDetails.styles";
import { createAtsJob } from "../api/api";
import { clearCreateJobPostSession } from "../utils/clearCreateJobPostSession";


const DEFAULT_THRESHOLD = 70;
const DEFAULT_WEIGHTS = {
  requiredSkill: 10,
  educationAlignment: 30,
  preferredSkill: 15,
  responsibilityOverlap: 30,
  experienceAlignment: 15,
};

const WEIGHT_LABELS: { key: keyof typeof DEFAULT_WEIGHTS; label: string }[] = [
  { key: "requiredSkill", label: "Required skill (1-40)" },
  { key: "educationAlignment", label: "Education alignment (1-40)" },
  { key: "preferredSkill", label: "Preferred skill (1-40)" },
  { key: "responsibilityOverlap", label: "Responsibility overlap (1-40)" },
  { key: "experienceAlignment", label: "Experience alignment (1-40)" },
];

const MAX_WEIGHT_MAP: Record<keyof typeof DEFAULT_WEIGHTS, number> = {
  requiredSkill: 40,
  educationAlignment: 40,
  preferredSkill: 40,
  responsibilityOverlap: 40,
  experienceAlignment: 40,
};

const MIN_WEIGHT = 1;
const MAX_WEIGHT = 40;
const WEIGHT_SUM = 100;

const weightsToDisplay = (w: typeof DEFAULT_WEIGHTS): Record<keyof typeof DEFAULT_WEIGHTS, string> => ({
  requiredSkill: String(w.requiredSkill),
  educationAlignment: String(w.educationAlignment),
  preferredSkill: String(w.preferredSkill),
  responsibilityOverlap: String(w.responsibilityOverlap),
  experienceAlignment: String(w.experienceAlignment),
});

const STORAGE_KEY = "atsDetailsForm";

interface ATSDetailsProps {
  embedded?: boolean;
  onValidationChange?: (valid: boolean) => void;
  clearTrigger?: number;
  onSave?: (saveFn: () => Promise<boolean>) => void;
}

export const ATSDetails = ({ embedded, onValidationChange, onSave, clearTrigger }: ATSDetailsProps) => {
  // ✅ Initialize state by loading from sessionStorage immediately
  const initializeState = () => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as {
          threshold?: number;
          allowThresholdEdit?: boolean;
          useCustomWeights?: boolean;
          weights?: typeof DEFAULT_WEIGHTS;
        };
        return parsed;
      } catch (e) {
        console.error("Error parsing ATS details from sessionStorage:", e);
        return null;
      }
    }
    return null;
  };

  const initialData = initializeState();

  const [threshold, setThreshold] = React.useState<number>(initialData?.threshold ?? DEFAULT_THRESHOLD);
  const [allowThresholdEdit, setAllowThresholdEdit] = React.useState<boolean>(initialData?.allowThresholdEdit ?? false);
  const [useCustomWeights, setUseCustomWeights] = React.useState<boolean>(initialData?.useCustomWeights ?? false);
  const [weights, setWeights] = React.useState<typeof DEFAULT_WEIGHTS>(initialData?.weights ?? DEFAULT_WEIGHTS);
  const [weightDisplay, setWeightDisplay] = React.useState<Record<keyof typeof DEFAULT_WEIGHTS, string>>(
    () => weightsToDisplay(initialData?.weights ?? DEFAULT_WEIGHTS)
  );
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const hasProcessedClear = useRef<number | null>(clearTrigger || 0);
  const hasInitializedRef = useRef(true);  // ✅ Skip save on first render

  // ✅ Initialize local state from sessionStorage if exists, but DON'T auto-populate defaults
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setThreshold(parsed.threshold ?? DEFAULT_THRESHOLD);
        setWeights(parsed.weights ?? DEFAULT_WEIGHTS);
        setWeightDisplay(weightsToDisplay(parsed.weights ?? DEFAULT_WEIGHTS));
        console.log("✅ ATS Details restored from sessionStorage:", parsed);
      } catch (err) {
        console.error("Error parsing saved ATS Details:", err);
      }
    }
    // ✅ Don't initialize with defaults on mount - let user provide data
  }, []);

  // ✅ Save whenever values change (skip first render)
  useEffect(() => {
    // Skip saving on the very first render when component mounts
    if (hasInitializedRef.current) {
      hasInitializedRef.current = false;
      return;
    }
    
    const snakeCaseWeights = {
      skills_required: weights.requiredSkill,
      skills_preferred: weights.preferredSkill,
      experience_alignment: weights.experienceAlignment,
      education_alignment: weights.educationAlignment,
      responsibility_overlap: weights.responsibilityOverlap,
    };
    
    const formData = {
      threshold,
      allowThresholdEdit,
      useCustomWeights,
      weights,
      // Store snake_case version for compatibility with ReviewSubmit
      weights_snake: snakeCaseWeights,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    
    // ✅ Remove fresh resume flag when user modifies values
    // ✅ This allows isStepCompletelyFilled to correctly count this step as complete
    if (sessionStorage.getItem("atsDetailsFormFreshResume")) {
      sessionStorage.removeItem("atsDetailsFormFreshResume");
      console.log("✅ Removed fresh resume flag - user is now actively modifying ATS");
    }
    
    console.log("✅ ATS Details saved to sessionStorage:", formData);
  }, [threshold, allowThresholdEdit, useCustomWeights, weights]);

  // ✅ Handle clear trigger
  useEffect(() => {
    if (clearTrigger && hasProcessedClear.current !== clearTrigger) {
      hasProcessedClear.current = clearTrigger;
      setThreshold(DEFAULT_THRESHOLD);
      setAllowThresholdEdit(false);
      setUseCustomWeights(false);
      setWeights(DEFAULT_WEIGHTS);
      setWeightDisplay(weightsToDisplay(DEFAULT_WEIGHTS));
      sessionStorage.removeItem(STORAGE_KEY);
      console.log("✅ ATS Details cleared");
    }
  }, [clearTrigger]);

  const weightSum = Object.values(weights).reduce((a, b) => a + b, 0);
  const weightsValid =
    !useCustomWeights ||
    (weightSum === WEIGHT_SUM &&
      Object.values(weights).every((v) => v >= MIN_WEIGHT && v <= MAX_WEIGHT));

  useEffect(() => {
    if (embedded && onValidationChange) onValidationChange(weightsValid);
  }, [embedded, weightsValid, onValidationChange]);

  // Show snackbar when weights sum doesn't equal 100
  useEffect(() => {
    if (useCustomWeights && weightSum !== WEIGHT_SUM && snackbarOpen === false) {
      setSnackbarMessage("Sum of weights must be equal to 100");
      setSnackbarOpen(true);
    }
  }, [weightSum, useCustomWeights]);

  const handleWeightDisplayChange = (key: keyof typeof DEFAULT_WEIGHTS, raw: string) => {
    if (raw === "" || /^\d+$/.test(raw)) {
      setUseCustomWeights(true);
      const num = raw === "" ? 0 : parseInt(raw, 10);
      if (raw !== "" && num > MAX_WEIGHT) {
        setWeightDisplay((prev) => ({ ...prev, [key]: String(MAX_WEIGHT) }));
        setWeights((prev: typeof DEFAULT_WEIGHTS) => ({ ...prev, [key]: MAX_WEIGHT }));
        return;
      }
      setWeightDisplay((prev) => ({ ...prev, [key]: raw }));
      if (raw !== "") {
        const clamped = Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, num));
        setWeights((prev: typeof DEFAULT_WEIGHTS) => ({ ...prev, [key]: clamped }));
      }
    }
  };

  const handleWeightBlur = (key: keyof typeof DEFAULT_WEIGHTS) => {
    const raw = weightDisplay[key];
    const num = raw === "" ? MIN_WEIGHT : parseInt(raw, 10);
    const clamped = Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, isNaN(num) ? MIN_WEIGHT : num));
    setWeights((prev: typeof DEFAULT_WEIGHTS) => ({ ...prev, [key]: clamped }));
    setWeightDisplay((prev) => ({ ...prev, [key]: String(clamped) }));
  };

  const handleUseDefaultWeights = () => {
    setWeights(DEFAULT_WEIGHTS);
    setWeightDisplay(weightsToDisplay(DEFAULT_WEIGHTS));
    setUseCustomWeights(false);
  };

  const saveATSSettings = useCallback(async () => {
    if (!weightsValid) {
      return false;
    }

    console.log("ATS settings saved (local only)");
    return true;
  }, [weightsValid]);


  useEffect(() => {
    if (onSave) {
      onSave(saveATSSettings);
    }
  }, [saveATSSettings, onSave]);


  return (
    <Box sx={styles.root}>
      <Box sx={{ 
        maxHeight: "68vh", 
        overflowY: "auto", 
        overflowX: "hidden",
        //paddingRight: "1vh",
        scrollbarWidth: "thin",
        "&::-webkit-scrollbar": { width: "0.4vw" },
        "&::-webkit-scrollbar-thumb": { backgroundColor: "#ccc", borderRadius: "0.2vw" }
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "2vh", marginBottom: "0vh" }}>
          <Typography sx={{ ...styles.sectionTitle, marginTop: 0, marginBottom: 0 }}>
            Set Threshold
          </Typography>
          <Box sx={{ flex: 1, height: "0.1vh", backgroundColor: "#e5e5e5", maxWidth: "66.5vw" }} />
        </Box>
        <Box sx={styles.box1}>
          <Typography sx={styles.subsectionsubTitle}>Decision threshold for this evaluation</Typography>
          <Box sx={{ border: "0.2vh dashed #c4c4c4", borderRadius: "0.4vh", padding: "1.5vh", mb: "1.5vh", paddingBottom: "0.5vh", marginTop: "1.5vh", backgroundColor: "#F9F9F9" }}>
            <Slider
              value={threshold}
              onChange={(event: Event, value: number | number[]) => {
                const newValue = Array.isArray(value) ? value[0] : value;
                if (newValue < 40) {
                  setSnackbarMessage("Minimum 40 threshold is required");
                  setSnackbarOpen(true);
                } else {
                  setThreshold(newValue);
                }
              }}
              min={0}
              max={100}
              valueLabelDisplay="on"
              valueLabelFormat={(v) => `${v}%`}
              disabled={!allowThresholdEdit}
             sx={{
  display: "block",
  position: "relative",
  cursor: "pointer",
  touchAction: "none",
  color: allowThresholdEdit ? "#006b66" : "#ccc",
  height: "0.4vh",
  padding: "1.5vh 0",
  borderRadius: "1.2vh",
  paddingBottom: "0.5vh",

  /* track */
  "& .MuiSlider-track": {
    height: "0.4vh",
    borderRadius: "1.2vh",
  },

  /* rail */
  "& .MuiSlider-rail": {
    height: "0.4vh",
    borderRadius: "1.2vh",
  },

  /* thumb */
  "& .MuiSlider-thumb": {
    width: "1.5vh",
    height: "1.5vh",
  },

  /* value label text */
  "& .MuiSlider-valueLabelLabel": {
    fontSize: "1.4vh",
    fontWeight: 600,
  },

  /* ✅ THIS is where your CSS goes */
  "& .MuiSlider-valueLabel": {
    top: "-1.2vh",              // replaces -10px
    borderRadius: "0.3vh",
    padding: "0.3vh 0.8vh",
    fontSize: "1.2vh",
  },
  "& .MuiSlider-valueLabel::before": {
  position: "absolute",
  content: '""',
  width: "1vh",          // ~8px
  height: "1vh",         // ~8px
  transform: "translate(-50%, 50%) rotate(45deg)",
  backgroundColor: "inherit",
  bottom: 0,
  left: "50%",
},
}}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: "0.5vh", px: "0.3vh" }}>
              <Typography sx={{ fontSize: "1.5vh", color: "#606060", fontWeight: 500 }}>0</Typography>
              <Typography sx={{ fontSize: "1.5vh", color: "#606060", fontWeight: 500 }}>100</Typography>
            </Box>
          </Box>
          <RadioGroup
            row
            value={allowThresholdEdit ? "manual" : "default"}
            onChange={(e) => {
              const isManual = e.target.value === "manual";
              setAllowThresholdEdit(isManual);
              if (!isManual) setThreshold(DEFAULT_THRESHOLD);
            }}
            sx={{
              ...styles.radioGroup,
              marginTop: "1vh",
              padding: "0 0vh",
              marginLeft: "-1vh",


              "& .MuiSvgIcon-root": {
                width: "2.5vh",
                height: "2.5vh",
                fontSize: "2.5vh",
              },

              "& .MuiFormControlLabel-root": {
                marginLeft: "0vh",
                marginRight: "1.2vh",
              },

              "& .MuiRadio-root": {
                padding: "0.8vh",
              },
            }}
          >
            <FormControlLabel
              value="default"
              control={<Radio sx={styles.radio} />}
              label="Use default (70%)"
            />
            <FormControlLabel
              value="manual"
              control={<Radio sx={styles.radio} />}
              label="Set threshold manually"
            />
          </RadioGroup>

          {/* Parameter weightages */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "2vh", marginBottom: "0vh", marginTop: "1.5vh" }}>
            <Typography sx={{ ...styles.subsectionTitle, marginTop: 0, marginBottom: 0 }}>
              Parameter Weights
            </Typography>
            <Box sx={{ flex: 1, height: "0.1vh", backgroundColor: "#e5e5e5" }} />
          </Box>

          <Typography sx={styles.description}>
            Default for Lateral hiring: Education 10, Required skills 30, Preferred 15, Experience 30, Responsibility 15. Changing hiring mode above resets to that default.
          </Typography>
          <Box sx={styles.weightGrid}>
            {WEIGHT_LABELS.map(({ key, label }) => (
              <Box key={key} sx={styles.weightGridItem}>
                <Typography sx={styles.weightLabel}>{label}</Typography>
                <Box sx={{
                  ...styles.weightInputContainer,
                  borderColor: (weightSum !== WEIGHT_SUM) ? "#d32f2f" : "#E5E7EB",
                }}>
                  <TextField
                    value={weightDisplay[key]}
                    onChange={(e) => handleWeightDisplayChange(key, e.target.value)}
                    onBlur={() => handleWeightBlur(key)}
                    type="number"
                    inputProps={{
                      min: MIN_WEIGHT,
                      max: MAX_WEIGHT,
                      style: { textAlign: "left", padding: 0, paddingLeft: "0.5vh" },
                    }}
                    sx={{
                      flex: 1,
                      "& .MuiOutlinedInput-root": {
                        border: "none",
                        height: "100%",
                        "& fieldset": { border: "none" },
                        "&:hover fieldset": { border: "none" },
                        "&.Mui-focused fieldset": { border: "none" },
                      },
                      "& .MuiOutlinedInput-input": {
                        textAlign: "left",
                        fontSize: "1.3vh",
                        fontWeight: 600,
                        color: "#141414",
                        padding: 0,
                        paddingLeft: "0.5vh",
                        /* Hide number spinner */
                        "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                          WebkitAppearance: "none",
                          margin: 0,
                        },
                        "&[type=number]": {
                          MozAppearance: "textfield",
                        },
                      },
                    }}
                  />
                  <Button
                    onClick={() => {
                      setUseCustomWeights(true);
                      setWeights((prev: typeof DEFAULT_WEIGHTS) => ({
                        ...prev,
                        [key]: Math.max(MIN_WEIGHT, prev[key] - 1),
                      }));
                      setWeightDisplay((prev) => ({
                        ...prev,
                        [key]: String(Math.max(MIN_WEIGHT, parseInt(prev[key], 10) - 1)),
                      }));
                    }}
                    sx={styles.weightButton}
                  >
                    −
                  </Button>
                  <Box sx={styles.weightControlSeparator} />
                  <Button
                    onClick={() => {
                      setUseCustomWeights(true);
                      setWeights((prev: typeof DEFAULT_WEIGHTS) => ({
                        ...prev,
                        [key]: Math.min(MAX_WEIGHT, prev[key] + 1),
                      }));
                      setWeightDisplay((prev) => ({
                        ...prev,
                        [key]: String(Math.min(MAX_WEIGHT, parseInt(prev[key], 10) + 1)),
                      }));
                    }}
                    sx={styles.weightButton}
                  >
                    +
                  </Button>
                </Box>
              </Box>
            ))}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "0.3vh" }}>
              <Typography sx={styles.weightLabel}></Typography>
              <Box sx={styles.sumRow}>
                <Typography component="span" sx={styles.sumTotal}>
                  Total: {weightSum}%
                </Typography>
                <Typography component="span" sx={styles.sumTarget}>
                  (must be 100%)
                </Typography>
                {weightSum < WEIGHT_SUM && (
                  <Typography component="span" sx={styles.sumRemaining}>
                    · {WEIGHT_SUM - weightSum} remaining
                  </Typography>
                )}
                {weightSum > WEIGHT_SUM && (
                  <Typography component="span" sx={styles.sumOver}>
                    · {weightSum - WEIGHT_SUM} over
                  </Typography>
                )}
                {weightSum === WEIGHT_SUM && (
                  <Typography component="span" sx={styles.sumComplete}>
                    · Complete
                  </Typography>
                )}
              </Box>
              {useCustomWeights && weightSum !== WEIGHT_SUM && (
                <Typography sx={styles.sumError}>
                  Sum must be 100. Adjust values accordingly.
                </Typography>
              )}
            </Box>
          </Box>

          <RadioGroup
            row
            value={useCustomWeights ? "custom" : "default"}
            onChange={(e) => {
              if (e.target.value === "default") handleUseDefaultWeights();
              else setUseCustomWeights(true);
            }}
            sx={{
              ...styles.radioGroup,
              marginTop: "1vh",
              padding: "0 0vh",


              "& .MuiSvgIcon-root": {
                width: "2.5vh",
                height: "2.5vh",
                fontSize: "2.5vh",
              },

              "& .MuiFormControlLabel-root": {
                marginLeft: "0vh",
                marginRight: "1.2vh",
              },

              "& .MuiRadio-root": {
                padding: "0.8vh",
              },
            }}

          >
            <FormControlLabel
              value="default"
              control={<Radio sx={styles.radio} />}
              label="Use default weightages"
            />
            <FormControlLabel
              value="custom"
              control={<Radio sx={styles.radio} />}
              label="Use updated weightages (must sum to 100)"
            />
          </RadioGroup>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ mt: "8vh" }}
      >
        <Alert 
          severity="error" 
          onClose={() => setSnackbarOpen(false)}
          sx={{
            borderRadius: "0.6vh",
            fontSize: "1.5vh",
            lineHeight: "2vh",
            padding: "1vh 2.5vh",
            fontFamily: "Poppins, sans-serif",
            alignItems: "center",
            "& .MuiSvgIcon-root": {
              fontSize: "2vh",
              height: "2vh",
              width: "2vh",
            },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ATSDetails;
