import React, { useState } from "react";
import { Button, Snackbar, Alert } from "@mui/material";

const FormPage = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [openSnackbar, setOpenSnackbar] = useState(false);

  const isValid = jobTitle !== "" && jobDescription !== "";

  const handleSubmit = () => {
    if (!isValid) {
      setOpenSnackbar(true);
      return;
    }

    // Actual save logic here
    console.log("Form submitted");
  };

  const handleClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <div>
      <input
        placeholder="Job Title"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
      />

      <input
        placeholder="Job Description"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />

      <Button
        variant="contained"
        onClick={handleSubmit}
        style={{
          opacity: isValid ? 1 : 0.6,   // looks disabled
          cursor: isValid ? "pointer" : "not-allowed",
        }}
      >
        Save and Continue
      </Button>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleClose}>
        <Alert severity="error" onClose={handleClose}>
          Please enter all required fields
        </Alert>
      </Snackbar>
    </div>
  );
};

export default FormPage;
