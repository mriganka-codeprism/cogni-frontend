import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, TextField, MenuItem } from "@mui/material";
import { globalStyles } from "../config";
import { SubmissionSummary } from "../pages/candidateSelection";
import { downloadedSelectedCandidates, getColleges, getStreams } from "../api/api";

interface UploadSelectionSubmissionProps {
  sessionId: string;
  submissionSummary: SubmissionSummary;
  cutoff: number;
  setCollegeDetails: React.Dispatch<React.SetStateAction<{
    collegeId: string;
    streamId: string;
  }>>;
}

const UploadSelectionSubmission: React.FC<UploadSelectionSubmissionProps> = ({
  sessionId,
  submissionSummary,
  cutoff,
  setCollegeDetails,
}) => {
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState<any[]>([]);
  const [streamList, setStreamList] = useState<any[]>([]);
  const [availableStreams, setAvailableStreams] = useState<any[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [selectedStream, setSelectedStream] = useState("");

  useEffect(() => {
    Promise.all([getColleges(1, 0), getStreams()])
      .then(([collegesRes, streamsRes]) => {
        setColleges(collegesRes.data || []);
        setStreamList(streamsRes || []);
      })
      .catch(console.error);

      return () => {
       setCollegeDetails({
        collegeId: "",
        streamId: "",
       })
      }
  }, [setCollegeDetails]);

  useEffect(() => {
    const college = colleges.find((c) => c.id === selectedCollege);
    if (college) {
      const mappedStreams = college.streamIds.map((id: string) => {
        const s = streamList.find((stream) => stream.id === id);
        return {
          id: s?.id,
          name: s?.name ?? "Unknown",
        };
      });
      setAvailableStreams(mappedStreams);
    } else {
      setAvailableStreams([]);
    }
  }, [selectedCollege, colleges, streamList]);


  const handleDownload = async () => {
    try {
      setLoading(true);
      await downloadedSelectedCandidates(sessionId);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography fontWeight={700} sx={{ fontSize: "2rem", mb: 1 }}>
            Final Submission
          </Typography>
          <Typography color="#4B5563" sx={{ fontSize: "14px" }}>
            Review and submit all processed candidate data to the database
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleDownload}
          disabled={loading}
          sx={{
            background: globalStyles.colors.primary,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 500,
            fontSize: "1rem",
            boxShadow: "none",
            "&:hover": { background: "#6d1316" },
          }}
        >
          {loading ? "Downloading..." : "Download Resumes"}
        </Button>
      </Box>

      <Box display="flex" gap={3} mb={1} alignItems="center">
            <TextField
              select
              size="small"
              label="Select College"
              value={selectedCollege}
              onChange={(e) => {
                setSelectedCollege(e.target.value);
              }}
              sx={{
                width: "291.2px",
                mt: "8.32px",
                "& .MuiInputLabel-root.Mui-focused": {
                  color: globalStyles.colors.primary,
                },
                "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: `${globalStyles.colors.primary} !important`,
                  borderWidth: "1px !important",
                },
              }}
            >
              {colleges.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              required
              size="small"
              label="Select Stream"
              value={selectedStream}
              onChange={(e) => {
                setSelectedStream(e.target.value);
                setCollegeDetails({
                  collegeId: selectedCollege,
                  streamId: e.target.value,
                });
              }}
              disabled={!selectedCollege}
              sx={{
                width: "291.2px",
                mt: "8.32px",
                "& .MuiInputLabel-root.Mui-focused": {
                  color: globalStyles.colors.primary,
                },
                "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: `${globalStyles.colors.primary} !important`,
                  borderWidth: "1px !important",
                },
              }}
            >
              {availableStreams.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

      {/* Submission Summary Card */}
      <Box sx={{ mt: 0 }}>
        <Paper
          elevation={0}
          sx={{
            background: "#F8F9FA",
            borderRadius: 2,
            p: 2,
            mb: 1,
            minWidth: 320,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            Submission Summary
          </Typography>
          <Box
            component="ul"
            sx={{
              pl: 2,
              m: 0,
              color: "#111827",
              fontSize: "1rem",
              "& li:not(:last-child)": { mb: 1.5 },
            }}
          >
            <li>
              <b>Cutoff Threshold:</b> {cutoff}%
            </li>
            <li>
              <b>Students Meeting Criteria:</b> {submissionSummary.studentsMeetingCriteria}
            </li>
            <li>
              <b>Complete Profiles (with resumes):</b> {submissionSummary.completeProfiles}
            </li>
            <li>
              <b>Incomplete Profiles:</b> {submissionSummary.incompleteProfiles}
            </li>
          </Box>
        </Paper>
      </Box>

      {/* Warning Alert */}
      {/* <Box sx={{ display: submissionSummary.incompleteProfiles > 0 ? "block" : "none" }}>
        <Alert
          icon={
            <ErrorOutlineIcon fontSize="inherit" sx={{ color: "#B45309" }} />
          }
          severity="warning"
          sx={{
            background: "#FFFCF1",
            color: "#B45309",
            border: "1px solid #FDE68A",
            borderRadius: 2,
            fontSize: "1rem",
            alignItems: "center",
            py: 2,
          }}
        >
          <Typography fontWeight={700} sx={{ display: "inline" }}>
            Incomplete Profiles Warning
          </Typography>
          <br />
          <Typography sx={{ display: "inline", color: "#B45309" }}>
            {submissionSummary.incompleteProfiles} students don't have uploaded resumes. They will be marked as
            incomplete in the database.
          </Typography>
        </Alert>
      </Box> */}
    </>
  );
};

export default UploadSelectionSubmission;
