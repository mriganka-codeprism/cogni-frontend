import React, { useRef } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  RadioGroup,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import { ReactComponent as UploadIcon } from "../assets/images/upload.svg";
import { globalStyles } from "../config";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import IOSSlider from "./slider/slider";

interface UploadAptitudeProps {
  cutoff: number;
  setCutoff: (value: number) => void;
  studentFile: File | null;
  setStudentFile: (file: File | null) => void;
  answerFile: File | null;
  setAnswerFile: (file: File | null) => void;
  mode: string;
  setMode: (mode: string) => void;
  sectionCutoff1: number;
  setSectionCutoff1: (value: number) => void;
  sectionCutoff2: number;
  setSectionCutoff2: (value: number) => void;
  sectionCutoff3: number;
  setSectionCutoff3: (value: number) => void;
  sectionCutoff4: number;
  setSectionCutoff4: (value: number) => void;
}

const UploadAptitude: React.FC<UploadAptitudeProps> = ({
  cutoff,
  setCutoff,
  studentFile,
  setStudentFile,
  answerFile,
  setAnswerFile,
  mode,
  setMode,
  sectionCutoff1,
  setSectionCutoff1,
  sectionCutoff2,
  setSectionCutoff2,
  sectionCutoff3,
  setSectionCutoff3,
  sectionCutoff4,
  setSectionCutoff4,
}) => {
  const studentInputRef = useRef<HTMLInputElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (value: number) => {
    if (value >= 0 && value <= 100) {
      setCutoff(value);
    }
  };

  const handleSectionCutoffChange = (idx: number, value: number) => {
    if (value < 0 || value > 100) return;
    switch (idx) {
      case 1:
        setSectionCutoff1(value);
        break;
      case 2:
        setSectionCutoff2(value);
        break;
      case 3:
        setSectionCutoff3(value);
        break;
      case 4:
        setSectionCutoff4(value);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Typography
        variant="subtitle1"
        fontWeight={600}
        sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
      >
        <UploadIcon /> Upload Aptitude Test Data
      </Typography>
      <Box display="flex" gap={1}>
        <Paper
          variant="outlined"
          sx={{ p: 2, textAlign: "center", borderStyle: "dashed", flex: 1 }}
        >
          <DescriptionIcon sx={{ fontSize: 30, color: "action.active" }} />
          <Typography variant="body2" fontWeight={600}>
            Student Response Excel
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload the file containing student test response
          </Typography>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: "none" }}
            ref={studentInputRef}
            onChange={(e) => setStudentFile(e.target.files?.[0] || null)}
          />
          {/* Student File Upload Section */}
          {studentFile ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 1,
              }}
            >
              <Typography variant="caption" sx={{ mr: 1, color: "#16A34A" }}>
                {studentFile.name}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setStudentFile(null)}
                sx={{ ml: 1 }}
                aria-label="Remove file"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Button
              variant="outlined"
              color="error"
              onClick={() => studentInputRef.current?.click()}
              sx={{
                color: globalStyles.colors.primary,
                border: `0.832px solid ${globalStyles.colors.primary}`,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                ml: "auto",
              }}
            >
              Choose File
            </Button>
          )}
        </Paper>
        <Paper
          variant="outlined"
          sx={{ p: 2, textAlign: "center", borderStyle: "dashed", flex: 1 }}
        >
          <DescriptionIcon sx={{ fontSize: 30, color: "action.active" }} />
          <Typography variant="body2" fontWeight={600}>
            Answer Key Excel
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload the file containing correct answers
          </Typography>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: "none" }}
            ref={answerInputRef}
            onChange={(e) => setAnswerFile(e.target.files?.[0] || null)}
          />
          {/* Answer File Upload Section */}
          {answerFile ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 1,
              }}
            >
              <Typography variant="caption" sx={{ mr: 1, color: "#16A34A" }}>
                {answerFile.name}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setAnswerFile(null)}
                sx={{ ml: 1 }}
                aria-label="Remove file"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Button
              variant="outlined"
              color="error"
              onClick={() => answerInputRef.current?.click()}
              sx={{
                color: globalStyles.colors.primary,
                border: `0.832px solid ${globalStyles.colors.primary}`,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                ml: "auto",
              }}
            >
              Choose File
            </Button>
          )}
        </Paper>
      </Box>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3 }}>
        Minimum Cutoff Marks
      </Typography>
      <Box display={"flex"} gap={10} mt={1}>
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="text.secondary"
          >
            Mode
          </Typography>
          <FormControl sx={{ mt: 2 }}>
            <RadioGroup
              aria-labelledby="radio-buttons-group-mode"
              name="radio-buttons-group-mode"
              onChange={(e) => setMode(e.target.value)}
              value={mode}
            >
              <FormControlLabel
                value="overall"
                control={
                  <Radio
                    size="small"
                    sx={{
                      "&.Mui-checked": {
                        color: globalStyles.colors.primary,
                      },
                    }}
                  />
                }
                label="Overall"
              />
              <FormControlLabel
                value="sections"
                control={
                  <Radio
                    size="small"
                    sx={{
                      "&.Mui-checked": {
                        color: globalStyles.colors.primary,
                      },
                    }}
                  />
                }
                label="Sections"
              />
               <FormControlLabel
                value="both"
                control={
                  <Radio
                    size="small"
                    sx={{
                      "&.Mui-checked": {
                        color: globalStyles.colors.primary,
                      },
                    }}
                  />
                }
                label="Both"
              />
            </RadioGroup>
          </FormControl>
        </Box>
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="text.secondary"
          >
            {mode === "overall" ? "Overall Cutoff" : "Section Cutoff"}
          </Typography>
          {mode === "overall" ? (
            <IOSSlider
              value={cutoff}
              min={1}
              max={100}
              step={1}
              valueLabelDisplay="on"
              onChange={(_, value) => handleInputChange(value as number)}
              sx={{ width: 600, color: globalStyles.colors.primary, mt: 3 }}
            />
          ) : (
            <Box
              sx={{
                width: 600,
                mt: 3,
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                rowGap: 2,
                columnGap: 4,
              }}
            >
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {"Aptitude"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sectionCutoff1}
                  </Typography>
                </Box>
                <IOSSlider
                  value={sectionCutoff1}
                  min={1}
                  max={100}
                  step={1}
                  valueLabelDisplay="off"
                  onChange={(_, value) =>
                    handleSectionCutoffChange(1, value as number)
                  }
                  sx={{ flex: 1, color: globalStyles.colors.primary }}
                />
              </Box>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {"Verbal Ability"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sectionCutoff2}
                  </Typography>
                </Box>
                <IOSSlider
                  value={sectionCutoff2}
                  min={1}
                  max={100}
                  step={1}
                  valueLabelDisplay="off"
                  onChange={(_, value) =>
                    handleSectionCutoffChange(2, value as number)
                  }
                  sx={{ flex: 1, color: globalStyles.colors.primary }}
                />
              </Box>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {"Reasoning"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sectionCutoff3}
                  </Typography>
                </Box>
                <IOSSlider
                  value={sectionCutoff3}
                  min={1}
                  max={100}
                  step={1}
                  valueLabelDisplay="off"
                  onChange={(_, value) =>
                    handleSectionCutoffChange(3, value as number)
                  }
                  sx={{ flex: 1, color: globalStyles.colors.primary }}
                />
              </Box>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {"Technical / Business / Mathematics"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sectionCutoff4}
                  </Typography>
                </Box>
                <IOSSlider
                  value={sectionCutoff4}
                  min={1}
                  max={100}
                  step={1}
                  valueLabelDisplay="off"
                  onChange={(_, value) =>
                    handleSectionCutoffChange(4, value as number)
                  }
                  sx={{ flex: 1, color: globalStyles.colors.primary }}
                />
              </Box>
            </Box>
          )}
        </Box>
        {mode === "both" && (
          <Box flex={1} maxWidth={600}>
            <Typography
            variant="subtitle1"
            fontWeight={600}
            color="text.secondary"
          >
            Overall Cutoff
          </Typography>
          <IOSSlider
            value={cutoff}
            min={1}
            max={100}
            step={1}
            valueLabelDisplay="on"
            onChange={(_, value) => handleInputChange(value as number)}
            sx={{ color: globalStyles.colors.primary, mt: 3 }}
          />
          </Box>
        )}
      </Box>
    </>
  );
};

export default UploadAptitude;
