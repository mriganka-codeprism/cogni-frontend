import React, { useRef, useState, useEffect } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import * as XLSX from "xlsx";
import { styles } from "../styles/FrameworkDetails.styles";
import { useNavigate, useLocation } from "react-router-dom";
import { routes } from "../constants/routes";
import uploadexcel from "../assets/images/uploadexcel.png";

interface FrameworkDetailsProps {
  embedded?: boolean;
  onValidationChange?: (valid: boolean) => void;
  clearTrigger?: number;

}

const STORAGE_KEY = "frameworkDetailsForm";

const ACCEPT_EXCEL = ".xlsx,.xls";

const FrameworkDetails = ({ embedded, onValidationChange, clearTrigger }: FrameworkDetailsProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const location = useLocation();
  const { frameworkDetails } = (location.state as any) || {};

  const [title, setTitle] = React.useState("");
  const [extractedText, setExtractedText] = React.useState("");

  const [wasCleared, setWasCleared] = React.useState(false);
  const [hasMounted, setHasMounted] = useState(false);


  const handleUploadClick = () => fileInputRef.current?.click();

  const isFormValid = title.trim() !== "" && extractedText.trim() !== "";



  useEffect(() => {
    if (!onValidationChange) return;

    // Force invalid on first render
    if (!hasMounted) {
      onValidationChange(false);
      setHasMounted(true);
      return;
    }

    // After first mount, send actual validation result
    onValidationChange(isFormValid);

  }, [isFormValid, onValidationChange, hasMounted]);



  useEffect(() => {
    if (wasCleared) return;

    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setTitle(parsed.title || "");
      setExtractedText(parsed.extractedText || "");
    }
  }, [wasCleared]);

  const hasRestored = useRef(false);

  React.useEffect(() => {
    if (wasCleared) return;

    if (!hasRestored.current) return;

    const data = {
      title,
      extractedText
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [title, extractedText, wasCleared]);

  // ✅ Mark as restored after loading
  React.useEffect(() => {
    hasRestored.current = true;
  }, []);

  const hasProcessedClear = useRef<number | null>(clearTrigger || 0);

  React.useEffect(() => {
    if (clearTrigger && hasProcessedClear.current !== clearTrigger) {
      hasProcessedClear.current = clearTrigger;
      setWasCleared(true);

      setTitle("");
      setExtractedText("");

      sessionStorage.removeItem(STORAGE_KEY);

      if (onValidationChange) {
        onValidationChange(false);
      }
    }
  }, [clearTrigger, onValidationChange]);



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (data == null) return;
        const workbook = XLSX.read(
          data as string | ArrayBuffer,
          { type: typeof data === "string" ? "binary" : "array" }
        );
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!firstSheet) {
          setExtractedText("");
          return;
        }
        const text = XLSX.utils.sheet_to_txt(firstSheet, { FS: "\t", RS: "\n" });
        setExtractedText(text || "");
      } catch (err) {
        console.error("Excel parse error:", err);
        setExtractedText("Failed to read Excel file. Please ensure it is a valid .xlsx or .xls file.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const content = (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: "1vw" }}>
        <Typography sx={styles.sectionTitle}>Personality Traits</Typography>
        <Box sx={styles.sectionDivider} />
      </Box>
      <Typography sx={styles.label}>
        Title<span style={styles.requiredStar}>*</span>
      </Typography>
      <TextField
        fullWidth
        placeholder="Enter title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={styles.titleBox}
        size="small"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_EXCEL}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />


      <Typography sx={styles.label1}>
        Description<span style={styles.requiredStar}>*</span>
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={10}
        // maxRows={10}
        placeholder="Extracted text from Excel will appear here. You can edit it."
        value={extractedText}
        onChange={(e) => setExtractedText(e.target.value)}
        sx={styles.extractedBox}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          startIcon={<img src={uploadexcel} alt="" style={{ height: "1.6vh", width: "auto" }} />}
          onClick={handleUploadClick}
           sx={{
      ...styles.uploadButton, // keep your existing styles
      "& .MuiButton-startIcon": {
        marginRight: "0.4vh",   // adjust as needed
        marginLeft: "0.4vh"     // remove negative spacing if needed
      }
    }}
        >
          Upload Excel
        </Button>
      </Box>
    </>
  );

  if (embedded) {
    return <Box sx={styles.root}>{content}</Box>;
  }
  return null;
};

export default FrameworkDetails;
