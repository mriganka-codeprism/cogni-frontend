import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

interface StyledPdfUploadProps {
  styles: any;
  onFileSelected: (file: File) => void;
}

const StyledPdfUpload: React.FC<StyledPdfUploadProps> = ({
  styles,
  onFileSelected,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // NEW allowed types: PDF, DOC, DOCX only
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    // Silently ignore invalid files – NO ALERT
    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF and DOC files should be uploaded");
      e.target.value = "";
      return;
    }

    // Keep size validation but remove alerts
    if (file.size > 5 * 1024 * 1024) {
      e.target.value = "";
      return;
    }

    setUploading(true);

    setTimeout(() => {
      onFileSelected(file);
      setUploading(false);
    }, 800);

    e.target.value = "";
  };

  return (
    <>
      <input
        type="file"
        hidden
        id="styled-upload"

        // EXTENSION BASED FILTER – more strict
        accept=".pdf,.doc,.docx"

        onChange={handleFileUpload}
      />

      <Box component="label" htmlFor="styled-upload" sx={styles.uploadBox}>
        <UploadFileOutlinedIcon sx={styles.uploadIcon} />

        <Typography sx={styles.uploadText}>
          {uploading ? "Uploading..." : "Upload"}
        </Typography>
      </Box>
    </>
  );
};

export default StyledPdfUpload;
