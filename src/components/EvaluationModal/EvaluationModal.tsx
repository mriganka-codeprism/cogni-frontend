import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Stack,
  Rating,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import DescriptionIcon from "@mui/icons-material/Description";
import BookmarkIcon from "@mui/icons-material/Bookmark";

interface EvaluationItem {
  title: string;
  comment: string;
  score: number;
  evidence: any;
  confidence: number;
  reasoning: string;
}

interface EvaluationModalProps {
  open: boolean;
  onClose: () => void;
  candidateName?: string;
  email?: string;
  experience?: string;
  duration?: string;
  date?: string;
  status?: string;
  evaluationData?: EvaluationItem[];
  overallScore?: number;
  criteriaCount?: number;
  avgEvidence?: number;
  aiEngineVersion?: string;
  aiComments?: string;
  loading?: boolean;
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({
  open,
  onClose,
  candidateName = "Pranit S",
  email = "Pranit.s@protechtmanize.com",
  experience = "2 years",
  duration = "12 min 34 sec",
  date = "",
  status = "Not Selected",
  evaluationData = [],
  overallScore = 2.63,
  criteriaCount = 4,
  avgEvidence = 3.8,
  aiEngineVersion = "v4.0.19",
  aiComments = "",
  loading = false,
}) => {
  const [userComment, setUserComment] = React.useState("");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: "90vh",
          borderRadius: "2vh",
          maxWidth: "50vw",
        },
      }}
    >
      <DialogTitle
        sx={{
          padding: 0,
          background: "linear-gradient(90deg, #007664, #006655, #007664)",
          borderBottom: "none",
        }}
      >
        {/* Teal Header Section */}
        <Box sx={{ padding: "2.5vh 1.5vw", pb: "2vh" }}>
          {/* Top Row: Candidate Info + Status Button + Close */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "2vh" }}>
            {/* Left: Avatar + Candidate Info */}
            <Box sx={{ display: "flex", gap: "1.5vh", alignItems: "flex-start" }}>
              <Avatar
                sx={{
                width: "5vh",
                height: "5vh",
                bgcolor: "#069b84",
                color: "#fff",
                fontSize: "2.2vh",
                fontWeight: 700,
                borderRadius: "1.5vh",
                boxShadow: "0px 4px 6px -4px rgba(0,0,0,0.1)",
}}
              >
                {candidateName.charAt(0)}
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: "2.3vh", fontWeight: 700, color: "#fff", mb: "0.2vh" }}>
                  {candidateName}
                </Typography>
                <Typography sx={{ fontSize: "1.6vh", color: "#fff", fontWeight: 500, mb: "1.5vh" }}>
                  {email}
                </Typography>
                <Box sx={{ display: "flex", gap: "1vh" }}>
                  <Box sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    borderRadius: "0.8vh",
                    padding: "0.5vh 1.4vh",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8vh",
                    fontSize: "1.4vh",
                    fontWeight: 600
                  }}>
                    <CalendarTodayOutlinedIcon sx={{ fontSize: "1.6vh" }} />
                    {experience}
                  </Box>
                  <Box sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    borderRadius: "0.8vh",
                    padding: "0.5vh 1.4vh",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8vh",
                    fontSize: "1.4vh",
                    fontWeight: 600
                  }}>
                    <AccessTimeOutlinedIcon sx={{ fontSize: "1.6vh" }} />
                    {duration}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Right: Status + Close Button */}
            <Box sx={{ display: "flex", alignItems: "center", gap: "1vh" }}>
              <Chip
                label={status}
                sx={{
                  backgroundColor: "#fff",
                  color: "#b91c1c",
                  fontWeight: 800,
                  fontSize: "1.4vh",
                  px: "1.5vh",
                  height: "3.5vh",
                  borderRadius: "0.8vh",
                  "& .MuiChip-label": {
                    padding: "0 0.5vh",
                  }
                }}
              />
              <IconButton
                onClick={onClose}
                size="small"
                sx={{ color: "#fff" }}
              >
                <CloseIcon sx={{ fontSize: "2.2vh" }} />
              </IconButton>
            </Box>
          </Box>

          {/* KPI Cards Row */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5vh" }}>
            {[
              { label: "OVERALL SCORE", value: `${overallScore}/5` },
              
              { label: "AVG EVIDENCE", value: `${avgEvidence}/5` },
             
            ].map((kpi, idx) => (
              <Box
                key={idx}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderRadius: "1.2vh",
                  padding: "0.8vh 1.5vh",
                  textAlign: "left",
                  backdropFilter: "blur(8px)",
                  border: "0.1vh solid rgba(255,255,255,0.15)",
                }}
              >
                <Typography sx={{ fontSize: "1vh", fontWeight: 700, color: "rgba(255,255,255,0.6)",  letterSpacing: "0.05em" }}>
                  {kpi.label}
                </Typography>
                <Typography sx={{ fontSize: "2vh", fontWeight: 800, color: "#fff" }}>
                  {kpi.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          padding: "2.5vh",
         // backgroundColor: "#f9fafb",
          overflowY: "auto",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: "3vh" }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* AI Interview Results */}
            <Box
              sx={{
                background: "#F9FAFB",
                borderRadius: "1.2vh",
                padding: "2vh",
                marginBottom: "3vh",
                marginTop:"2vh",
                position: "relative",
                border: "0.1vh solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "1.5vh", mb: "2vh" }}>
                <Box sx={{
                  width: "4vh",
                  height: "4vh",
                  borderRadius: "1vh",
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <AutoAwesomeIcon sx={{ fontSize: "2.4vh", color: "#3b82f6" }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "1.8vh", fontWeight: 700, color: "#111" }}>
                    AI Interview Results
                  </Typography>
                  <Typography sx={{ fontSize: "1.4vh", color: "#3b82f6", fontWeight: 500 }}>
                    Generated automatically by muCognitron
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  background: "#fff",
                  borderRadius: "1vh",
                  padding: "2.5vh",
                  border: "0.1vh solid #eff6ff",
                  borderLeft: "0.6vh solid #3b82f6",
                }}
              >
                <Typography sx={{ fontSize: "1.4vh", color: "#44546f", lineHeight: 1.3 }}>
                  {aiComments}
                </Typography>
              </Box>
            </Box>

            {/* Detailed Evaluation Section */}
            <Box sx={{ mb: "2vh", pt: "2.5vh", border: "0.1vh solid #e5e7eb",borderRadius:"1vh",padding:"2vh" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "1.5vh", mb: "2.5vh" }}>
                <Box sx={{
                  width: "4.5vh",
                  height: "4.5vh",
                  borderRadius: "1.2vh",
                  backgroundColor: "#006b66",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}>
                  <DescriptionIcon sx={{ fontSize: "2.4vh" }} />
                </Box>
                <Box><Box sx={{ display: "flex", alignItems: "center", gap: "0.8vh", mb: "0.5vh" ,borderColor:"#aaa"}}></Box>
                  <Typography sx={{ fontSize: "1.8vh", fontWeight: 1000, color: "#111" }}>
                    Detailed Evaluation
                  </Typography>
                  <Typography sx={{ fontSize: "1.4vh", color: "#666", fontWeight: 500 }}>
                    AI-powered analysis across all criteria
                  </Typography>
                </Box>
              </Box>

              {/* Evaluation Cards */}
              {evaluationData && evaluationData.length > 0 ? (
                evaluationData.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      background: "#F9FAFB",
                      borderRadius: "1.5vh",
                      padding: "2vh",
                      mb: "1.5vh",
                      border: "0.1vh solid #e5e7eb",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                    }}
                  >
                    {/* Top Row: Info */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "1.5vh" }}>
                      <Box sx={{ display: "flex", gap: "2vh" }}>
                        <Box
                          sx={{
                            backgroundColor: "#991b1b",
                            color: "#fff",
                            width: "4vh",
                            height: "4vh",
                            borderRadius: "1.2vh",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "2vh",
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: "1.6vh", fontWeight: 1000, color: "#111", mb: "0.5vh" }}>
                            {item.title}
                          </Typography>
                          <Typography sx={{ fontSize: "1.4vh", color: "#666", fontWeight: 500 }}>
                            Maximum score: {Math.round(item.score)}/5
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: "right" }}>
                        <Rating
                          value={item.confidence * 5 || 0}
                          readOnly
                          size="small"
                          sx={{ mb: "0.5vh", color: "#f59e0b" }}
                        />
                        <Typography sx={{ fontSize: "1.1vh", fontWeight: 700, color: "#666", textTransform: "uppercase" }}>
                          EVIDENCE QUALITY
                        </Typography>
                      </Box>
                    </Box>

                    {/* AI Comment Section */}
                    <Box sx={{ mb: "1.5vh" }}>
                      <Typography sx={{ fontSize: "1.2vh", fontWeight: 700, color: "#111", mb: "1vh", ml: "0.5vh" }}>
                        AI COMMENT
                      </Typography>
                      <Box
                        sx={{
                          padding: "1vh 1.5vh",
                          borderRadius: "1.2vh",
                          background: "#fff",
                          border: "0.1vh solid #fee2e2",
                          borderLeft: "0.6vh solid #ef4444",
                        }}
                      >
                        <Typography sx={{ fontSize: "1.5vh", color: "#44546f", lineHeight: 1.3 }}>
                          {item.comment}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Evidence and Reasoning Grid */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5vh" }}>
                      <Box>
                        <Typography sx={{ fontSize: "1.2vh", fontWeight: 700, color: "#111", mb: "1vh", ml: "0.5vh" }}>
                          EVIDENCE
                        </Typography>
                        <Box
                          sx={{
                            padding: "1vh 1.5vh",
                            borderRadius: "1.2vh",
                            background: "#fff",
                            border: "0.1vh solid #ecfdf5",
                            borderLeft: "0.6vh solid #059669",
                           // height: "100%"
                          }}
                        >
                          <Typography sx={{ fontSize: "1.4vh", color: "#44546f", lineHeight: 1.3 }}>
                            {item.evidence && item.evidence[1] ? item.evidence[1] : item.evidence}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: "1.2vh", fontWeight: 700, color: "#111", mb: "1vh", ml: "0.5vh" }}>
                          REASONING
                        </Typography>
                        <Box
                          sx={{
                            padding: "1vh 1.5vh",
                            borderRadius: "1.2vh",
                            background: "#fff",
                            border: "0.1vh solid #f5f3ff",
                            borderLeft: "0.6vh solid #8b5cf6",
                            //height: "100%"
                          }}
                        >
                          <Typography sx={{ fontSize: "1.4vh", color: "#44546f", lineHeight: 1.3 }}>
                            {item.reasoning}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography sx={{ color: "#888" }}>No evaluation data available</Typography>
              )}
            </Box>

            {/* Overall Score */}
            {overallScore > 0 && (
              <Box
                sx={{
                  background: "#fee2e2",
                  borderRadius: "1.5vh",
                  padding: "2.5vh",
                  mb: "2.5vh",
                  border: "0.15vh solid #fecaca",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "2vh" }}>
                  <Box
                    sx={{
                      width: "6vh",
                      height: "6vh",
                      borderRadius: "1.2vh",
                      backgroundColor: "#991b1b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    <BookmarkIcon sx={{ fontSize: "3.2vh" }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "2vh", fontWeight: 700, color: "#111", mb: "0.3vh" }}>
                      Overall Score
                    </Typography>
                    <Typography sx={{ fontSize: "1.3vh", color: "#666", fontWeight: 500 }}>
                      Average across all evaluation criteria
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5vh" }}>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: "0.5vh" }}>
                    <Typography sx={{ fontSize: "2.5vh", fontWeight: 800, color: "#991b1b" }}>
                      {Number(overallScore).toFixed(2)}
                    </Typography>
                    <Typography sx={{ fontSize: "2.5vh", color: "#888", fontWeight: 600 }}>/ 5</Typography>
                  </Box>
                  <Rating
                    value={Math.floor(overallScore)}
                    readOnly
                    size="small"
                    sx={{ color: "#f59e0b" }}
                  />
                </Box>
              </Box>
            )}
            

            {/* User Comments Section */}
            {/* User Comments Section */}
            <Accordion defaultExpanded sx={{ mb: "1.5vh", border: "0.1vh solid #e5e7e0", boxShadow: "none" ,borderRadius:"0.8vh"}}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ borderBottom: "0.15vh solid #0c0c0c", pb: "0vh" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "1vh" }}>
                  <Box sx={{ color: "#dc2626", fontSize: "1.8vh" }}>💬</Box>
                  <Typography sx={{ fontSize: "1.7vh", fontWeight: 700, color: "#111" }}>
                    User Comments
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: "2vh" }}>
                <Box sx={{ width: "100%" }}>
                  <TextField
                    multiline
                    rows={5}
                    placeholder="Add your comments about this candidate's evaluation, additional observations, or recommendations..."
                    fullWidth
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    sx={{
                      mb: "2vh",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "1.2vh",
                        fontSize: "1.4vh",
                        color: "#44546f",
                      },
                      "& .MuiOutlinedInput-input::placeholder": {
                        color: "#aaa",
                        opacity: 1,
                      },
                    }}
                  />
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#991b1b",
                        color: "white",
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "1.4vh",
                        borderRadius: "1vh",
                        px: "2.5vh",
                        py: "1vh",
                        "&:hover": { backgroundColor: "#7f1515" },
                      }}
                    >
                      Save Comment
                    </Button>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Activity Logs */}
            <Accordion defaultExpanded sx={{ mb: "1.5vh", border: "0.1vh solid #e5e7eb",boxShadow: "0 4px 12px rgba(255, 255, 255, 0.02)",borderRadius:"0.8vh" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "1vh" }}>
                  <Box sx={{ color: "#dc2626", fontSize: "1.8vh" }}>⏱️</Box>
                  <Typography sx={{ fontSize: "1.7vh", fontWeight: 700, color: "#111" }}>
                    Activity Logs
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  sx={{
                    background: "#f0fdf4",
                    padding: "2vh 2.5vh",
                    borderRadius: "1.2vh",
                    border: "0.1vh solid #bbf7d0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: "2vh" }}>
                    <Box
                      sx={{
                        width: "5vh",
                        height: "5vh",
                        borderRadius: "50%",
                        background: "#10b981",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "1.6vh",
                        fontWeight: 700,
                      }}
                    >
                      AB
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "1.6vh", fontWeight: 700, color: "#065f46", mb: "0.3vh" }}>
                        AI evaluation completed successfully
                      </Typography>
                      <Typography sx={{ fontSize: "1.3vh", color: "#666", fontWeight: 500 }}>
                        By AI Bot
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: "1.3vh", color: "#888", fontWeight: 500, whiteSpace: "nowrap" }}>
                    12/11/2025, 12:28 PM
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EvaluationModal;
