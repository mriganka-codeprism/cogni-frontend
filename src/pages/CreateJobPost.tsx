import { Box, Typography, TextField, Button, CircularProgress } from "@mui/material";
import { styles } from "../styles/CreateJobPost.styles";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { routes } from "../constants/routes";
import Sidenav from "./Sidenav";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { textAssistProps } from "../utils/textAssistProps";
import { uploadJd } from "../api/api";
import { useDraftsStore } from "../store/draftsStore";

import StyledPdfUpload from "../components/StyledPdfUpload";
import CloseIcon from "@mui/icons-material/Close";
import { ReactComponent as UploadIcon } from "../assets/images/upload.svg";



const STORAGE_KEY = "createJobPostForm";


interface CreateJobPostProps {
  embedded?: boolean;
  onValidationChange?: (valid: boolean) => void;
  clearTrigger?: number;
  validationTrigger?: number;
}

const CreateJobPost = ({ embedded, onValidationChange, clearTrigger, validationTrigger }: CreateJobPostProps) => {
  const navigate = useNavigate();
  const { setDirty } = useDraftsStore();
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileData, setUploadedFileData] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  //  const [processedClear, setProcessedClear] = useState(0);
  const hasProcessedClear = useRef<number | null>(clearTrigger || 0);
  const hasProcessedReset = useRef(false); // ✅ Track if reset flag has been processed
  const [titleTouched, setTitleTouched] = useState(false);
  const [descTouched, setDescTouched] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const hasAlphanumeric = /[a-zA-Z0-9]/;

  // Validation function: check that no single letter appears consecutively more than 2 times in any word
  const validateNoConsecutiveLetters = (text: string): boolean => {
    const words = text.trim().split(/\s+/);
    for (const word of words) {
      // Check if any letter appears more than 2 times consecutively
      if (/(.)\1{2,}/.test(word)) {
        return false;
      }
    }
    return true;
  };

  const titleError = titleTouched && (!hasAlphanumeric.test(jobTitle) || !validateNoConsecutiveLetters(jobTitle));
  const descError = descTouched && (!hasAlphanumeric.test(jobDescription) || !validateNoConsecutiveLetters(jobDescription));

  const [jdData, setJdData] = useState<any>(null);



  //const [storageLoaded, setStorageLoaded] = useState(false);

  const getWordCount = (text: string) =>
    text.trim() ? text.trim().split(/\s+/).length : 0;
  const MAX_WORDS = 1000;

  const getWordCountBottomPosition = () => {
    // When error is shown, the error message takes additional vertical space
    // So we need to push the word count down further
    return descError ? "2vh" : "0.6vh";
  };

  const formatJDText = (parsed: any, summary?: string) => {
    if (!parsed) return "";

    const section = (title: string, items?: string[]) =>
      items && items.length
        ? `\n${title}:\n${items.map(i => `• ${i}`).join("\n")}\n`
        : "";

    return `
${summary ? `SUMMARY:\n${summary}\n` : ""}
Role: ${parsed.jobTitle || ""}
Company: ${parsed.company || ""}
Location: ${parsed.locations?.join(", ") || ""}
Work Mode: ${parsed.workMode || ""}
Employment Type: ${parsed.employmentType || ""}

${section("Required Skills", parsed.skills?.requiredSkills)}
${section("Preferred Skills", parsed.skills?.preferredSkills)}
${section("Additional Skills", parsed.skills?.additionalSkills)}

Extra Details:
Education: ${parsed.extraDetails?.education || ""}

${section("Certifications", parsed.extraDetails?.certifications)}
`.trim();
  };


  const uploadAndSetDescription = async (file: File) => {
    setIsUploading(true);

    try {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        alert("Authentication token missing. Please log in again.");
        return;
      }

      const response = await uploadJd(file, token);
      const parsed = response?.result?.parsed;
      const summary = response?.result?.levels?.summary;

      if (parsed) {
        // insert formatted structured text into textbox
        const formattedText = formatJDText(parsed, summary);
        setJobDescription(formattedText);

        // autofill job title only if title field is empty
        if (parsed.jobTitle && !jobTitle.trim()) {
          setJobTitle(parsed.jobTitle);
        }

        // store the full JD data for reference
        setJdData(response?.result);

        // ✅ Clear evaluation criteria suggestions cache when new JD is uploaded
        sessionStorage.removeItem("evaluationCriteriaSuggestions");
      }

    } catch (error: any) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };


  const hasRestored = useRef(false);

  useEffect(() => {
    const formData = {
      jobTitle,
      jobDescription,
      fileName: uploadedFileName,
      fileData: uploadedFileData,
    };

    if (hasRestored.current) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [jobTitle, jobDescription, uploadedFileName, uploadedFileData]);

  // ✅ Mark as restored after loading
  useEffect(() => {
    hasRestored.current = true;
  }, []);



  useEffect(() => {
    if (!clearTrigger) return;
    if (hasProcessedClear.current === clearTrigger) return;

    hasProcessedClear.current = clearTrigger;

    setJobTitle("");
    setJobDescription("");
    setUploadedFileName("");
    setUploadedFileData("");
    setUploadedFileUrl(null);
    setTitleTouched(false);
    setDescTouched(false);

    const input = document.getElementById("upload-description") as HTMLInputElement;
    if (input) input.value = "";

    // ✅ Remove the page data from storage too
    sessionStorage.removeItem(STORAGE_KEY);
    // ✅ Clear evaluation criteria suggestions cache when form is cleared
    sessionStorage.removeItem("evaluationCriteriaSuggestions");

    onValidationChange?.(false);
  }, [clearTrigger, onValidationChange]);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved);
    setJobTitle(parsed.jobTitle || "");
    setJobDescription(parsed.jobDescription || "");
    setUploadedFileName(parsed.fileName || "");
    setUploadedFileData(parsed.fileData || "");
  }, []);



  const handleFileUploaded = (fileName: string, base64: string) => {
    setUploadedFileName(fileName);
    setUploadedFileData(base64);
  };

  useEffect(() => {
    if (validationTrigger) {
      setTitleTouched(true);
      setDescTouched(true);
    }
  }, [validationTrigger]);

  // Track if form has meaningful content and set isDirty accordingly
  useEffect(() => {
    const hasMeaningfulContent =
      /[a-zA-Z0-9]/.test(jobTitle) ||
      /[a-zA-Z0-9]/.test(jobDescription) ||
      !!uploadedFileName;

    setDirty(hasMeaningfulContent);
  }, [jobTitle, jobDescription, uploadedFileName, setDirty]);

  // Removed: useEffect(() => { return () => setDirty(false); }, [setDirty]);





  return <Box sx={styles.root}>{renderJobDetailsContent()}</Box>;

  function renderJobDetailsContent() {
    return (
      <>
        {/* Job Details */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "1vw", width: "75vw" }}>
          <Typography sx={styles.sectionTitle}>Job Details</Typography>
          <Box sx={styles.sectionDivider} />
        </Box>

        <Typography sx={styles.label}>
          Job Title<span style={styles.requiredStar}>*</span>
        </Typography>

        <TextField
          fullWidth
          placeholder="Enter job title"
          sx={{ ...styles.input, ...styles.errorField }}
          {...textAssistProps}
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          onBlur={() => setTitleTouched(true)}
          error={titleError}
          helperText={titleError ? (jobTitle.trim() === "" ? "Please enter this field" : !validateNoConsecutiveLetters(jobTitle) ? "Invalid input" : "Enter a valid job title (min 3 characters)") : ""}
          FormHelperTextProps={{
            sx: {
              fontSize: "1.4vh",
              marginTop: "0.4vh",
              marginLeft: "0vh",
              marginRight: "1.5vh",
              lineHeight: "1.6vh",
            },
          }}
        />



        <Box sx={styles.uploadHeader}>
          <Typography sx={styles.label}>
            Job Description<span style={styles.requiredStar}>*</span>
          </Typography>

          <input
            type="file"
            hidden
            id="upload-description"
            accept=".pdf,.doc,.docx"
          />


          <Box sx={{ display: "flex", alignItems: "baseline", gap: "1.5vh" }}>

            {uploadedFileName && (
              <Box sx={{ display: "flex", alignItems: "baseline", gap: "1vh", marginRight: "12vh" }}>



                <Typography
                  onClick={() => {
                    if (uploadedFileUrl) {
                      window.open(uploadedFileUrl, "_blank");
                    }
                  }}
                  sx={{
                    color: "#a21b09",
                    fontSize: "1.5vh",
                    display: "flex",
                    alignItems: "center",
                    lineHeight: 1,
                    margin: 0,
                    padding: 0,
                    cursor: "pointer",
                    textDecoration: "underline",
                    marginRight: "-10.8vh",
                  }}
                >
                  {uploadedFileName}

                  <CloseIcon
                    sx={{
                      fontSize: "1.8vh",
                      cursor: "pointer",
                      color: "#9c9898",
                      marginLeft: "1vh",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();

                      setUploadedFileName("");
                      setUploadedFileUrl(null);
                      setUploadedFileData("");
                      setJobDescription("");

                      const input = document.getElementById("upload-description") as HTMLInputElement;
                      if (input) {
                        input.value = "";
                      }

                      const fileUploadInput = document.getElementById("file-upload-job-desc") as HTMLInputElement;
                      if (fileUploadInput) {
                        fileUploadInput.value = "";
                      }
                    }}
                  />

                </Typography>


              </Box>
            )}



          </Box>



        </Box>


        <Box sx={{ ...styles.textAreaWrapper, position: "relative" }}>
          <TextField
            fullWidth
            multiline
            rows={12}
            placeholder="Enter the description here"
            {...textAssistProps}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            onBlur={() => setDescTouched(true)}
            error={descError}
            helperText={descError ? (jobDescription.trim() === "" ? "Please enter this field" : !validateNoConsecutiveLetters(jobDescription) ? "Invalid input" : "Enter a valid job description (min 10 characters)") : ""}
            FormHelperTextProps={{
              sx: {
                fontSize: "1.4vh",
                marginTop: "0.4vh",
                marginLeft: "0vh",
                marginRight: "1.5vh",
                lineHeight: "1.6vh",
              },
            }}
            sx={{ ...styles.textArea, ...styles.errorField }}
          />

          {isUploading && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1vh",
                zIndex: 10,
              }}
            >
              <CircularProgress size={40} sx={{ color: "#006B66" }} />
              <Typography sx={{ fontSize: "1.5vh", color: "#006B66", fontWeight: 500 }}>
                Processing...
              </Typography>
            </Box>
          )}

          <Typography
            variant="caption"
            sx={{
              ...(getWordCount(jobDescription) > MAX_WORDS
                ? styles.wordCountError
                : styles.wordCountText),
              bottom: getWordCountBottomPosition(),
            }}
          >
            {getWordCount(jobDescription)} / {MAX_WORDS}
          </Typography>
        </Box>

        {/* ✅ warning OUTSIDE */}
        <Box sx={{ minHeight: "1vh", bottom: "0.8vh", }}>
          {getWordCount(jobDescription) > MAX_WORDS && (
            <Typography variant="caption" sx={styles.warningText}>
              Word limit exceeded
            </Typography>
          )}
          <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: "1vh" }}>
            <Button
              variant="outlined"
              component="label"
              disabled={isUploading}
              startIcon={<UploadIcon style={{ height: "1.6vh", width: "1.6vh" }} />}
              sx={{
                textTransform: "none",      // remove uppercase
                fontSize: "1.6vh",
                fontFamily: "Poppins, sans-serif",

                minWidth: "auto",           // remove 64px default
                height: "3vh",
                padding: "0 1.2vh",         // better than vh vertical padding

                marginLeft: "auto",
                // marginRight: "1.8vh",
                marginTop: "0.5vh",

                borderRadius: "0.5vh",

                color: "#006B66",
                borderColor: "#006B66",
                backgroundColor: "#fff",
                border: "0.1vh solid #006B66",

                "&:hover": {
                  backgroundColor: isUploading ? "#fff" : "white",
                  borderColor: "#006B66",
                },

                "&.Mui-disabled": {
                  color: "#A3A3A3",
                  borderColor: "#A3A3A3",
                  backgroundColor: "#fff",
                  border: "0.1vh solid #A3A3A3",
                  cursor: "not-allowed",
                  opacity: 1,
                },

                /* icon size */
                "& .MuiButton-startIcon svg": {
                  fontSize: "2vh",
                },

                /* icon spacing */
                "& .MuiButton-startIcon": {
                  marginRight: "0.6vh",
                  marginLeft: "0.1vh",
                },
              }}
            >
              {isUploading ? "Uploading..." : "Upload"}
              <input
                hidden
                disabled={isUploading}
                type="file"
                id="file-upload-job-desc"
                accept=".pdf,.doc,.docx"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setUploadedFileName(file.name);
                  setUploadedFileUrl(URL.createObjectURL(file));

                  const reader = new FileReader();
                  reader.onload = () => {
                    setUploadedFileData(reader.result as string);
                  };
                  reader.readAsDataURL(file);

                  await uploadAndSetDescription(file);
                }}
              />
            </Button>
          </Box>
        </Box>


      </>
    );
  }
};
const renderList = (title: string, items?: string[]) => {
  if (!items || items.length === 0) return null;

  return (
    <Box sx={{ marginTop: "1.2vh" }}>
      <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
      {items.map((item, i) => (
        <Typography key={i} sx={{ fontSize: "1.6vh", color: "#444" }}>
          • {item}
        </Typography>
      ))}
    </Box>
  );
};

const renderField = (label: string, value?: string) => {
  if (!value) return null;

  return (
    <Typography sx={{ fontSize: "1.6vh", color: "#444" }}>
      <strong>{label}:</strong> {value}
    </Typography>
  );
};


export default CreateJobPost;