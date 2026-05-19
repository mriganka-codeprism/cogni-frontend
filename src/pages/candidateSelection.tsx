import {
  Box,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
} from "@mui/material";
import PeopleOutlineTwoToneIcon from "@mui/icons-material/PeopleOutlineTwoTone";
import React, { useEffect, useRef, useState } from "react";
import ScaledComponent from "../components/scaledComponent";
import Text from "../components/textComponent";
import { globalStyles } from "../config";
import UploadAptitude from "../components/UploadAptitude";
import {
  candidateSelectionUploadAptitude,
  candidateSelectionUploadFinalSubmission,
  downloadShortlistedCandidates,
  getProcessingStatus,
} from "../api/api";
import UploadSelectionResumes from "../components/UploadSelectionResumes";
import UploadSelectionSubmission from "../components/UploadSelectionSubmission";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CustomDialog from "../components/customDialog";
import { useNavigate } from "react-router-dom";

const steps = ["Upload Apt Data", "Upload Resumes", "Final Submission"];

export type SubmissionSummary = {
  studentsMeetingCriteria: number;
  completeProfiles: number;
  incompleteProfiles: number;
};

const CandidateSelection: React.FC = () => {
  const navigate = useNavigate();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [mode, setMode] = useState("overall");
  const [cutoff, setCutoff] = useState(50);
  const [sectionCutoff1, setSectionCutoff1] = useState(50);
  const [sectionCutoff2, setSectionCutoff2] = useState(50);
  const [sectionCutoff3, setSectionCutoff3] = useState(50);
  const [sectionCutoff4, setSectionCutoff4] = useState(50);
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [sessionId, setSessionId] = useState<string>("");
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [leftButtonLoading, setLeftButtonLoading] = useState(false);
  const [rightButtonLoading, setRightButtonLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [submissionSummary, setSubmissionSummary] = useState<SubmissionSummary>(
    {
      studentsMeetingCriteria: 0,
      completeProfiles: 0,
      incompleteProfiles: 0,
    }
  );
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [collegeDetails, setCollegeDetails] = useState<any>({
    collegeId: "",
    streamId: "",
  });

  const handleDownloadShortlistedCandidates = async () => {
    try {
      setDownloadLoading(true);
      await downloadShortlistedCandidates(sessionId);
    } catch (error) {
      console.error(error);
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleShortlistCandidates = async () => {
    try {
      if (!studentFile || !answerFile) {
        return;
      }
      setLeftButtonLoading(true);

      const formData = new FormData();
      formData.append("master_file", studentFile);
      formData.append("q_bank_file", answerFile);
      if(mode === "both"){
        formData.append("overall_threshold", String(cutoff));
        formData.append("aptus_threshold", String(sectionCutoff1));
        formData.append("comm_threshold", String(sectionCutoff2));
        formData.append("logi_threshold", String(sectionCutoff3));
        formData.append("tech_threshold", String(sectionCutoff4));
      }else if (mode === "overall") {
        formData.append("overall_threshold", String(cutoff));
      } else {
        formData.append("aptus_threshold", String(sectionCutoff1));
        formData.append("comm_threshold", String(sectionCutoff2));
        formData.append("logi_threshold", String(sectionCutoff3));
        formData.append("tech_threshold", String(sectionCutoff4));
      }
      formData.append("mode", mode);

      const response = await candidateSelectionUploadAptitude(formData);
      setSessionId(response.session_id);
      setShortlistedCount(response.candidate_count);
    } catch (error) {
      console.log(error);
    } finally {
      setLeftButtonLoading(false);
    }
  };

  const handleUploadFinalSubmission = async () => {
    try {
      setRightButtonLoading(true);
      const formData = new FormData();
      formData.append("college_id", collegeDetails.collegeId);
      formData.append("stream_id", collegeDetails.streamId);
      const response = await candidateSelectionUploadFinalSubmission(
        sessionId,
        formData
      );

      if (response.success === true) {
        navigate(-1);
        return;
      }

      // if (response.success === false) {
      //   setErrorDetails(response.details);
      //   setErrorDialogOpen(true);
      //   return;
      // }

      if (response.details?.processing_id) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        pollIntervalRef.current = setInterval(async () => {
          try {
            if (abortControllerRef.current?.signal.aborted) return;
            const statusResponse = await getProcessingStatus(
              response.details.processing_id,
              abortControllerRef.current?.signal
            );
            // setCandidates(statusResponse.users || []);
            if (statusResponse?.isComplete) {
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
              if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
              }
              setRightButtonLoading(false);
            }
          } catch (error) {
            console.error("Error polling status:", error);
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            if (abortControllerRef.current) {
              abortControllerRef.current.abort();
              abortControllerRef.current = null;
            }
            setRightButtonLoading(false);
          }
        }, 2000);
      }
    } catch (error) {
      console.error(error);
      setRightButtonLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  return (
    <ScaledComponent>
      <Box
        p={3}
        pt={"8px"}
        pb={"8px"}
        height={"100%"}
        display={"flex"}
        flexDirection={"column"}
      >
        <Text
          text="Admin - Candidate Selection Management"
          styles={{ fontSize: "1.248rem", fontWeight: "600" }}
        />
        <Divider
          sx={{
            my: "9.984px",
            mx: "-24.96px",
            height: "1px",
            borderColor: "#d9d9d9",
          }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Manage aptitude test results and student selection process
        </Typography>
        <Box display={"flex"} justifyContent={"space-between"} mb={3}>
          <Stepper
            activeStep={activeStep}
            sx={{
              mx: "-8px",
              flex:
                activeStep === 1 && sessionId && shortlistedCount > 0
                  ? 0.76
                  : 1,
            }}
          >
            {steps.map((label, idx) => (
              <Step
                key={label}
                sx={{
                  "& .MuiStepIcon-root.Mui-active": {
                    color: globalStyles.colors.primary,
                  },
                  "& .MuiStepIcon-root.Mui-completed": {
                    color: globalStyles.colors.primary,
                  },
                }}
              >
                <StepLabel
                  sx={{
                    "& .MuiStepLabel-label.Mui-active": {
                      color: globalStyles.colors.primary,
                      fontWeight: 600,
                    },
                    "& .MuiStepLabel-label.Mui-completed": {
                      color: globalStyles.colors.primary,
                      fontWeight: 600,
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === 1 && sessionId && shortlistedCount > 0 && (
            <Button
              variant="outlined"
              onClick={handleDownloadShortlistedCandidates}
              disabled={downloadLoading}
              sx={{
                border: `0.832px solid ${globalStyles.colors.primary}`,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                color: globalStyles.colors.primary,
              }}
            >
              <FileDownloadOutlinedIcon sx={{ mr: 1 }} />
              Download Shortlisted Candidates
            </Button>
          )}
        </Box>
        {activeStep === 0 && (
          <UploadAptitude
            cutoff={cutoff}
            setCutoff={setCutoff}
            studentFile={studentFile}
            setStudentFile={setStudentFile}
            answerFile={answerFile}
            setAnswerFile={setAnswerFile}
            mode={mode}
            setMode={setMode}
            sectionCutoff1={sectionCutoff1}
            setSectionCutoff1={setSectionCutoff1}
            sectionCutoff2={sectionCutoff2}
            setSectionCutoff2={setSectionCutoff2}
            sectionCutoff3={sectionCutoff3}
            setSectionCutoff3={setSectionCutoff3}
            sectionCutoff4={sectionCutoff4}
            setSectionCutoff4={setSectionCutoff4}
          />
        )}
        {activeStep === 1 && (
          <UploadSelectionResumes
            sessionId={sessionId}
            setSubmissionSummary={setSubmissionSummary}
          />
        )}
        {activeStep === 2 && (
          <UploadSelectionSubmission
            sessionId={sessionId}
            submissionSummary={submissionSummary}
            cutoff={cutoff}
            setCollegeDetails={setCollegeDetails}
          />
        )}
        <Box
          sx={{
            marginTop: "auto",
            padding: 1,
            borderTop: "1px solid #d9d9d9",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {activeStep === 0 && (
            <Button
              variant="contained"
              onClick={handleShortlistCandidates}
              disabled={leftButtonLoading || !studentFile || !answerFile}
              sx={{
                border: `0.832px solid ${globalStyles.colors.primary}`,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                backgroundColor: globalStyles.colors.primary,
                "&:disabled": {
                  color: "#666666",
                  borderColor: "#d9d9d9",
                },
              }}
            >
              <PeopleOutlineTwoToneIcon
                sx={{
                  mr: 1,
                }}
              />
              Shortlist Candidates
            </Button>
          )}
          {activeStep === 0 && sessionId && shortlistedCount > 0 && (
            <Typography sx={{ color: "#16A34A", fontWeight: 600 }}>
              {shortlistedCount} students shortlisted
            </Typography>
          )}

          {activeStep !== 0 && (
            <Button
              variant="outlined"
              onClick={() => setActiveStep((step) => step - 1)}
              sx={{
                border: `0.832px solid ${globalStyles.colors.primary}`,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                color: globalStyles.colors.primary,
              }}
            >
              Go Back
            </Button>
          )}
          <Button
            variant={activeStep === 0 ? "outlined" : "contained"}
            onClick={() => {
              if (activeStep === 0) {
                setActiveStep(1);
              } else if (activeStep === 1) {
                setActiveStep(2);
              } else if (activeStep === 2) {
                handleUploadFinalSubmission();
              }
            }}
            disabled={
              rightButtonLoading ||
              (activeStep === 2 &&
                (!collegeDetails.collegeId ||
                  !collegeDetails.streamId ||
                  !sessionId))
            }
            sx={{
              backgroundColor:
                activeStep === 0 ? "white" : globalStyles.colors.primary,
              border: `0.832px solid ${globalStyles.colors.primary}`,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              display:
                activeStep === 0 && sessionId && shortlistedCount > 0
                  ? undefined
                  : activeStep !== 0
                  ? undefined
                  : "none",
              color: activeStep === 0 ? globalStyles.colors.primary : "white",
              ml: "auto",
              "&:disabled": {
                color: "#666666",
                borderColor: "#d9d9d9",
              },
            }}
          >
            {activeStep === 0
              ? "Continue to Upload"
              : activeStep === 1
              ? "Continue to Submission"
              : "Complete Submission"}
          </Button>
        </Box>
      </Box>
      <CustomDialog
        open={errorDialogOpen}
        title="Upload Failed"
        handleClose={() => setErrorDialogOpen(false)}
      >
        <div>
          {errorDetails && (
            <div>
              <div>Total files: {errorDetails.total_files}</div>
              <div>Successful uploads: {errorDetails.successful_uploads}</div>
              <div>Failed uploads: {errorDetails.failed_uploads}</div>
              <div>Processing ID: {errorDetails.processing_id ?? "N/A"}</div>
              <div>Server message: {errorDetails.server_message ?? "N/A"}</div>
            </div>
          )}
        </div>
      </CustomDialog>
    </ScaledComponent>
  );
};

export default CandidateSelection;
