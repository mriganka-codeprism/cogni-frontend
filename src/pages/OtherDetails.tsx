import {
  Box,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  MenuItem,
  FormControl,
  Select,
  Checkbox,
  ListItemText,
  Paper,
} from "@mui/material";

import { styles } from "../styles/OtherDetails.styles";
import { useState, useEffect, useRef, forwardRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const STORAGE_KEY = "otherDetailsForm";

interface OtherDetailsProps {
  embedded?: boolean;
  onValidationChange?: (valid: boolean) => void;
  clearTrigger?: number;
  validationTrigger?: number;
}

const OtherDetails = ({ embedded, onValidationChange, clearTrigger, validationTrigger }: OtherDetailsProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [roleCategory, setRoleCategory] = useState("");
  const [avatar, setAvatar] = useState<string[]>([]);
  const [questionLevel, setQuestionLevel] = useState("Medium");
  const [duration, setDuration] = useState("30");
  const [cutoff, setCutoff] = useState("3");
  const [interviewMode, setInterviewMode] = useState("Avatar");
  const [codingRound, setCodingRound] = useState("Yes");
  const [proctoringEnabled, setProctoringEnabled] = useState(true);
  const [numberOfQuestions, setNumberOfQuestions] = useState("1");
  const [codingTimeLimit, setCodingTimeLimit] = useState("15");
  const [criteriaMode, setCriteriaMode] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [durationError, setDurationError] = useState(false);
  const [cutoffError, setCutoffError] = useState(false);
  const [numberOfQuestionsError, setNumberOfQuestionsError] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  const hasProcessedClear = useRef<number | null>(clearTrigger || 0);
  const hasRestored = useRef(false);

  // Validation function to check if value is a valid positive number
  const isValidNumber = (value: string): boolean => {
    if (!value?.trim()) return false;
    const num = Number(value);
    return !isNaN(num) && num > 0;
  };

  const isFormValid =
    roleCategory?.trim() !== "" &&
    (interviewMode === "Audio" || avatar.length > 0) &&
    questionLevel?.trim() !== "" &&
    duration?.trim() !== "" &&
    cutoff?.trim() !== "" &&
    interviewMode?.trim() !== "" &&
    isValidNumber(duration) &&
    isValidNumber(cutoff) &&
    (codingRound === "No" || (isValidNumber(numberOfQuestions) && isValidNumber(codingTimeLimit)));

  useEffect(() => {
    if (embedded && onValidationChange) onValidationChange(isFormValid);
  }, [embedded, isFormValid, onValidationChange]);

  // Restore on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setRoleCategory(parsed.roleCategory || "");
      setAvatar(Array.isArray(parsed.avatar) ? parsed.avatar : []);
      setQuestionLevel(parsed.questionLevel || "Medium");
      setDuration(parsed.duration || "30");
      setCutoff(parsed.cutoff || "3");
      setInterviewMode(parsed.interviewMode || "Avatar");
      setCodingRound(parsed.codingRound || "Yes");
      setNumberOfQuestions(parsed.numberOfQuestions || "1");
      setCodingTimeLimit(parsed.codingTimeLimit || "15");
      setProctoringEnabled(parsed.proctoringEnabled ?? true);
      setCustomCategories(parsed.customCategories || []);
    }
    const savedCriteriaMode = sessionStorage.getItem("criteriaMode");
    setCriteriaMode(savedCriteriaMode);
    if (savedCriteriaMode === "upload") {
      setCodingRound("No");
    }

    hasRestored.current = true;
  }, []);

  // Save on change
  useEffect(() => {
    if (hasRestored.current) {
      const formData = {
        roleCategory,
        avatar,
        questionLevel,
        duration,
        cutoff,
        interviewMode,
        codingRound,
        numberOfQuestions,
        codingTimeLimit,
        proctoringEnabled,
        customCategories,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [roleCategory, avatar, questionLevel, duration, cutoff, interviewMode, codingRound, numberOfQuestions, codingTimeLimit, proctoringEnabled, customCategories]);

  // Clear trigger
  useEffect(() => {
    if (clearTrigger && hasProcessedClear.current !== clearTrigger) {
      hasProcessedClear.current = clearTrigger;
      setRoleCategory("");
      setAvatar([]);
      setQuestionLevel("Medium");
      setDuration("30");
      setCutoff("3");
      setInterviewMode("Avatar");
      setCodingRound("Yes");
      setNumberOfQuestions("1");
      setCodingTimeLimit("15");
      setProctoringEnabled(true);
      setCustomCategories([]);
      setShowErrors(false);
      sessionStorage.removeItem(STORAGE_KEY);
      onValidationChange?.(false);
    }
  }, [clearTrigger, onValidationChange]);

  // Validation trigger
  useEffect(() => {
    if (validationTrigger && validationTrigger > 0) {
      setShowErrors(true);
    }
  }, [validationTrigger]);

  const handleAddCategory = () => {
    if (newCategoryName?.trim()) {
      if (!customCategories.includes(newCategoryName?.trim()) && !["TDS 1", "TDS 2", "TDS 3", "TDS 4", "AL", "HR", "Finance"].includes(newCategoryName?.trim())) {
        const updated = [...customCategories, newCategoryName?.trim()];
        setCustomCategories(updated);
        setRoleCategory(newCategoryName?.trim());
      } else if (customCategories.includes(newCategoryName?.trim())) {
        setRoleCategory(newCategoryName?.trim());
      }
      setNewCategoryName("");
    }
  };

  const handleDeleteCategory = (cat: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customCategories.filter(c => c !== cat);
    setCustomCategories(updated);
    if (roleCategory === cat) {
      setRoleCategory("");
    }
  };

  const formContent = (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: "1vw", width: "75vw" }}>
        <Box sx={styles.sectionTitle}>Lateral</Box>
        <Box sx={styles.sectionDivider} />
      </Box>

      <Box sx={styles.otherDetailsContainer}>
        <Box sx={{ marginBottom: "2vh", marginTop: "2vh" }}>
          <Box sx={{
            maxHeight: "48vh",
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: "1vw",
            scrollbarWidth: "thin",
            scrollbarColor: "#888 #f1f1f1",
            "&::-webkit-scrollbar": { width: "0.8vw" },
            "&::-webkit-scrollbar-track": { backgroundColor: "#f1f1f1" },
            "&::-webkit-scrollbar-thumb": { backgroundColor: "#888", borderRadius: "0.4vw" },
            "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#555" },
          }}>
            {/* CATEGORY AND CUTOFF */}
            <Box sx={{ marginBottom: "2vh" }}>
              <Box sx={styles.gridRow}>
                <Box sx={styles.gridItem}>
                  <Typography sx={styles.label1}>Category<span style={styles.requiredStar}>*</span></Typography>
                  <FormControl fullWidth sx={{ ...styles.input, ...(showErrors && !roleCategory?.trim() ? styles.errorField : {}) }} error={showErrors && !roleCategory?.trim()}>
                    <Select
                      value={roleCategory}
                      displayEmpty
                      sx={styles.input}
                      onChange={(e) => setRoleCategory(e.target.value)}
                      renderValue={(value) => value ? value : <Typography sx={{ color: "#B0B0B0", fontSize: "1.4vh", fontFamily: "Poppins, sans-serif" }}>Select Category</Typography>}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            ...styles.dropdownMenu,
                            position: 'relative', // Anchor for absolute footer
                            overflow: 'hidden',
                          }
                        },
                        MenuListProps: {
                          sx: {
                            maxHeight: "25vh",
                            overflowY: "auto",
                            scrollbarWidth: "thin",
                            position: "relative",
                            paddingBottom: "0",
                            "& ::-webkit-scrollbar": {
                              width: "0.6vh",
                            },
                            "& ::-webkit-scrollbar-track": {
                              background: "transparent",
                            },
                            "& ::-webkit-scrollbar-thumb": {
                              background: "#ccc",
                              borderRadius: "0.3vh",
                            },
                          }
                        },
                        autoFocus: false,
                      }}
                    >
                      {["TDS 1", "TDS 2", "TDS 3", "TDS 4", "AL", "HR", "Finance"].map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                      {customCategories.map((cat) => (
                        <MenuItem
                          key={cat}
                          value={cat}
                          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                        >
                          {cat}
                          <Box
                            component="span"
                            onClick={(e) => handleDeleteCategory(cat, e)}
                            sx={{
                              marginLeft: "1vh",
                              cursor: "pointer",
                              color: "#666",
                              fontSize: "1.2vh",
                              fontWeight: "bold",
                              "&:hover": { color: "#900B09" }
                            }}
                          >
                            ✕
                          </Box>
                        </MenuItem>
                      ))}
                      {/* Fixed Add Category Input via Sticky Positioning */}
                      <MenuItem
                        disabled
                        sx={{
                          position: "sticky",
                          bottom: 0,
                          backgroundColor: "white",
                          zIndex: 10,
                          padding: 0,
                          cursor: "default",
                          "&.Mui-disabled": { opacity: 1 },
                          borderTop: "0.15vh solid #eee",
                          "&:hover": { backgroundColor: "white !important" },
                        }}
                      >
                        <Box
                          sx={{ ...styles.addCategoryContainer, borderTop: "none", width: "100%", pointerEvents: "auto" }}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <input
                            placeholder="Add Category"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCategory();
                              }
                            }}
                            style={{
                              flex: 1,
                              fontFamily: "Poppins, sans-serif",
                              fontSize: "1.4vh",
                              padding: "0.8vh 1vh",
                              border: "0.15vh solid #e0e0e0",
                              borderRadius: "0.4vh",
                              outline: "none",
                            }}
                          />
                          <Typography
                            onClick={handleAddCategory}
                            sx={styles.addCategoryBtn}
                          >
                            Add
                          </Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                  {showErrors && !roleCategory?.trim() && (
                    <Typography sx={{ fontSize: "1.2vh", marginTop: "0.4vh", color: "#900B09" }}>
                      Please select this field
                    </Typography>
                  )}
                </Box>
                <Box sx={styles.gridItem}>
                  <Typography sx={styles.label1}>Evaluation Cutoff (1-5)<span style={styles.requiredStar}>*</span></Typography>
                  <TextField
                    value={cutoff}
                    error={(showErrors && cutoff?.trim() === "") || cutoffError}
                    helperText={(showErrors && cutoff?.trim() === "" ? "Please enter this field" : "") || (cutoffError ? "Please enter a valid number" : "")}
                    sx={{ ...styles.input, ...((showErrors && cutoff?.trim() === "") || cutoffError ? styles.errorField : {}) }}
                    onChange={(e) => {
                      setCutoff(e.target.value);
                      if (e.target.value.trim() && !isValidNumber(e.target.value)) {
                        setCutoffError(true);
                      } else {
                        setCutoffError(false);
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: "5vw", width: "100%" }}>
              {/* LEFT COLUMN */}
              <Box sx={{ flex: 1 }}>
                {/* QUESTION LEVEL */}
                <Box sx={{ marginBottom: "2vh" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "2vh", marginBottom: "0.4vh" }}>
                    <Typography sx={styles.label1}>Question Personalize<span style={styles.requiredStar}>*</span></Typography>
                    <Box sx={{ flex: 1, height: "0.1vh", backgroundColor: "#e5e5e5" }} />
                  </Box>
                  <RadioGroup
                    row
                    value={questionLevel}
                    onChange={(e) => setQuestionLevel(e.target.value)}
                    sx={styles.radioGroup}
                  >
                    <FormControlLabel value="Easy" control={<Radio sx={styles.radioButton} />} label={<Typography sx={styles.radioLabel}>Easy</Typography>} />
                    <FormControlLabel value="Medium" control={<Radio sx={styles.radioButton} />} label={<Typography sx={styles.radioLabel}>Medium</Typography>} />
                    <FormControlLabel value="Hard" control={<Radio sx={styles.radioButton} />} label={<Typography sx={styles.radioLabel}>Hard</Typography>} />
                  </RadioGroup>
                </Box>

                {/* DURATION */}
                <Box sx={{ marginBottom: "2vh" }}>
                  <Typography sx={styles.label1}>Interview Duration (min)<span style={styles.requiredStar}>*</span></Typography>
                  <TextField
                    value={duration}
                    error={(showErrors && duration?.trim() === "") || durationError}
                    helperText={(showErrors && duration?.trim() === "" ? "Please enter this field" : "") || (durationError ? "Please enter a valid number" : "")}
                    sx={{ ...styles.input, ...((showErrors && duration?.trim() === "") || durationError ? styles.errorField : {}) }}
                    onChange={(e) => {
                      setDuration(e.target.value);
                      if (e.target.value.trim() && !isValidNumber(e.target.value)) {
                        setDurationError(true);
                      } else {
                        setDurationError(false);
                      }
                    }}
                  />
                </Box>

                {/* INTERVIEW MODE */}
                <Box sx={{ marginBottom: "1vh", display: "flex", alignItems: "center", gap: "1vw" }}>
                  <Typography sx={styles.label1}>Interview Mode :<span style={styles.requiredStar}>*</span></Typography>
                  <RadioGroup
                    row
                    value={interviewMode}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInterviewMode(val);
                      if (val === "Audio") setAvatar([]);
                    }}
                    sx={styles.radioGroup}
                  >
                    <FormControlLabel value="Avatar" control={<Radio sx={styles.radioButton} />} label={<Typography sx={styles.radioLabel}>Avatar</Typography>} />
                    <FormControlLabel value="Audio" control={<Radio sx={styles.radioButton} />} label={<Typography sx={styles.radioLabel}>Audio</Typography>} />
                  </RadioGroup>
                </Box>

                {/* AVATAR */}
                <Box>
                  <Typography sx={{ ...styles.label1, color: interviewMode === "Audio" ? "#d1d5db" : "inherit", opacity: interviewMode === "Audio" ? 0.6 : 1 }}>
                    Avatar<span style={styles.requiredStar}>*</span>
                  </Typography>
                  <FormControl fullWidth sx={{ ...styles.input, ...(showErrors && interviewMode !== "Audio" && avatar.length === 0 ? styles.errorField : {}) }} disabled={interviewMode === "Audio"} error={showErrors && interviewMode !== "Audio" && avatar.length === 0}>
                    <Select
                      multiple
                      value={avatar}
                      displayEmpty
                      disabled={interviewMode === "Audio"}
                      sx={styles.input}
                      onChange={(e) => setAvatar(e.target.value as string[])}
                      renderValue={(selected) => (selected as string[]).length > 0 ? `${(selected as string[]).length} Selected` : <Typography sx={{ color: "#B0B0B0", fontSize: "1.4vh", fontFamily: "Poppins, sans-serif" }}>Select Avatar</Typography>}
                      MenuProps={{ PaperProps: { sx: styles.dropdownMenu } }}
                    >
                      {["Male Interview Agent", "Hacker", "Musigma Interview Agent", "Professional Interview Agent"].map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          <Checkbox sx={styles.MenuItem} checked={avatar.includes(opt)} />
                          <ListItemText primary={opt} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {showErrors && interviewMode !== "Audio" && avatar.length === 0 && (
                    <Typography sx={{ fontSize: "1.2vh", marginTop: "0.4vh", color: "#900B09" }}>Please select at least one avatar</Typography>
                  )}
                  {avatar.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "0.6vh", marginTop: "1vh" }}>
                      {avatar.map((item) => (
                        <Box key={item} sx={{ display: "flex", alignItems: "center", gap: "0.4vh", padding: "0.4vh 0.8vh", borderRadius: "0.6vh", backgroundColor: "#e8e8e8", fontSize: "1.4vh", color: "#000808" }}>
                          <Typography sx={{ fontSize: "1.4vh" }}>{item}</Typography>
                          <Box onClick={() => setAvatar(avatar.filter(v => v !== item))} sx={{ cursor: "pointer", fontSize: "1.8vh", color: "#900B09", lineHeight: 1 }}>✕</Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>

              {/* RIGHT COLUMN */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ marginBottom: "2vh" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "2vh", marginBottom: "0.4vh" }}>
                    <Typography sx={styles.label1}>Enable Proctoring</Typography>
                    <Box sx={{ flex: 1, height: "0.1vh", backgroundColor: "#e5e5e5" }} />
                  </Box>
                  <FormControlLabel
                    control={<Checkbox checked={proctoringEnabled} onChange={(e) => setProctoringEnabled(e.target.checked)} sx={styles.radioButton} />}
                    label={<Typography sx={styles.radioLabel}>{proctoringEnabled ? "Enabled" : "Disabled"}</Typography>}
                  />
                </Box>
                <Box sx={{ marginBottom: "2vh" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "2vh", marginBottom: "0.4vh" }}>
                    <Typography sx={styles.label1}>Coding Round<span style={styles.requiredStar}>*</span></Typography>
                    <Box sx={{ flex: 1, height: "0.1vh", backgroundColor: "#e5e5e5" }} />
                  </Box>
                  {criteriaMode === "upload" ? (
                    <Typography sx={{ fontSize: "1.2vh", color: "#6B7280", marginTop: "0.5vh", fontFamily: "Poppins, sans-serif", fontStyle: "italic" }}>
                      Coding round is disabled for static questionnaire mode
                    </Typography>
                  ) : (
                    <RadioGroup row value={codingRound} onChange={(e) => setCodingRound(e.target.value)} sx={styles.radioGroup}>
                      <FormControlLabel value="Yes" control={<Radio sx={styles.radioButton} />} label={<Typography sx={styles.radioLabel}>Yes</Typography>} />
                      <FormControlLabel value="No" control={<Radio sx={styles.radioButton} />} label={<Typography sx={styles.radioLabel}>No</Typography>} />
                    </RadioGroup>
                  )}
                </Box>
                <Box sx={{ marginBottom: "2vh" }}>
                  <Typography sx={{ ...styles.label1, color: codingRound === "No" ? "#B0B0B0" : "inherit", opacity: codingRound === "No" ? 0.6 : 1 }}>Number of Questions<span style={styles.requiredStar}>*</span></Typography>
                  <TextField
                    value={numberOfQuestions}
                    disabled={codingRound === "No"}
                    error={(showErrors && codingRound !== "No" && numberOfQuestions?.trim() === "") || numberOfQuestionsError}
                    helperText={(showErrors && codingRound !== "No" && numberOfQuestions?.trim() === "" ? "Please enter this field" : "") || (numberOfQuestionsError ? "Please enter a valid number" : "")}
                    sx={{ ...styles.input, ...((showErrors && codingRound !== "No" && numberOfQuestions?.trim() === "") || numberOfQuestionsError ? styles.errorField : {}) }}
                    onChange={(e) => {
                      setNumberOfQuestions(e.target.value);
                      if (e.target.value.trim() && !isValidNumber(e.target.value)) {
                        setNumberOfQuestionsError(true);
                      } else {
                        setNumberOfQuestionsError(false);
                      }
                    }}
                  />
                </Box>
                <Box>
                  <Typography sx={{ ...styles.label1, color: codingRound === "No" ? "#B0B0B0" : "inherit", opacity: codingRound === "No" ? 0.6 : 1 }}>Coding Time Limit (min)<span style={{ ...styles.requiredStar, opacity: codingRound === "No" ? 0.5 : 1 }}>*</span></Typography>
                  <TextField
                    value={codingTimeLimit}
                    disabled={codingRound === "No"}
                    error={(showErrors && codingRound !== "No" && codingTimeLimit?.trim() === "") || (!isValidNumber(codingTimeLimit) && codingTimeLimit?.trim() !== "")}
                    helperText={showErrors && codingRound !== "No" && codingTimeLimit?.trim() === "" ? "Please enter this field" : (!isValidNumber(codingTimeLimit) && codingTimeLimit?.trim() !== "" ? "Please enter a valid number" : "")}
                    type="number"
                    sx={{ ...styles.input, ...((showErrors && codingRound !== "No" && codingTimeLimit?.trim() === "") || (!isValidNumber(codingTimeLimit) && codingTimeLimit?.trim() !== "") ? styles.errorField : {}) }}
                    onChange={(e) => setCodingTimeLimit(e.target.value)}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );

  return <Box sx={styles.root}>{formContent}</Box>;
};

export default OtherDetails;
