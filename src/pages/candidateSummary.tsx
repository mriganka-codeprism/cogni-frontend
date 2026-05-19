import React, { useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import HistoryIcon from "@mui/icons-material/History";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  InputBase,
  CircularProgress,
  Divider,
  Stack,
  Rating,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { getStatusColor } from "./candidateEvaluation";
import { addUserComment, getActiityLogs, getReport } from "../api/api";
import DescriptionIcon from "@mui/icons-material/Description";
import CodeIcon from "@mui/icons-material/Code";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

const calculateFrontendOverallScore = (formattedReport: any) => {
  const scores = formattedReport
    .map((item: any) => Number(item.score))
    .filter((n: number) => Number.isFinite(n));
  if (scores.length === 0) return 0;
  const average = scores.reduce((sum: number, n: number) => sum + n, 0) / scores.length;
  return Number(average.toFixed(2));
};

const getScoreColor = (score: number, maxScore = 5) => {
  const normalizedScore = maxScore > 0 ? score / maxScore : 0;

  if (normalizedScore >= 0.8) return "#2e7d32";
  if (normalizedScore >= 0.6) return "#f9a825";
  return "#b71c1c";
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) =>
      typeof item === "string" ? item.trim() : String(item ?? "").trim()
    )
    .filter(Boolean);
};

const formatDuration = (ms?: number): string => {
  if (!ms) return "0 minutes";
  const durationObj = dayjs.duration(ms);
  const minutes = durationObj.minutes();
  const seconds = durationObj.seconds();
  return seconds > 0 ? `${minutes} min ${seconds} sec` : `${minutes} minutes`;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface ActivityLogsState {
  data: any[];
  loading: boolean;
  error: string | null;
}

interface EvaluationState {
  data: any[];
  loading: boolean;
  error: string | null;
}

interface ReportState {
  summary: string;
  AIComments: string[];
  overallScore: number;
  loading: boolean;
  error: string | null;
}

interface StaticQuestionEvidence {
  issues?: string[];
  candidate_matches?: string[];
  expected_key_points?: string[];
}

interface StaticQuestionAnalysisItem {
  question: string;
  reasoning?: string;
  confidence?: number;
  context_score?: number;
  overall_score?: number;
  semantic_score?: number;
  expected_answer?: string;
  relevancy_score?: number;
  candidate_answer?: string;
  similarity_score?: number;
  evidence?: StaticQuestionEvidence;
}

const CandidateSummary: React.FC = () => {
  const location = useLocation();
  const navigationState = location.state as {
    conversationId?: string;
    evaluationStatus?: string;
    name?: string;
    collegeName?: string;
    date?: string;
    duration?: number;
  } | null;

  const [activityLogs, setActivityLogs] = React.useState<ActivityLogsState>({
    data: [],
    loading: true,
    error: null,
  });

  const [evaluationData, setEvaluationData] = React.useState<EvaluationState>({
    data: [],
    loading: true,
    error: null,
  });

  const [reportData, setReportData] = React.useState<ReportState>({
    summary: "",
    AIComments: [],
    overallScore: 0,
    loading: true,
    error: null,
  });

  const [staticQuestionAnalysis, setStaticQuestionAnalysis] = React.useState<
    StaticQuestionAnalysisItem[]
  >([]);

  const [codingAssessment, setCodingAssessment] = React.useState<{
    tasks: any[];
    coding_score: number | null;
  } | null>(null);

  const [userCommentData, setUserCommentData] = React.useState<string[]>([]);
  const [userComment, setUserComment] = React.useState<string>("");
  const [userCommentLoading, setUserCommentLoading] =
    React.useState<boolean>(false);

  // When leaving the detail view, record that we left from detail
  React.useEffect(() => {
    return () => {
      try {
        sessionStorage.setItem("candidateEvaluation_lastLeftView", "detail");
      } catch (e) {
        /* ignore */
      }
    };
  }, []);

  // Get candidate details from navigation state or use defaults
  const candidateName = useMemo(() => navigationState?.name, []);
  const collegeName = useMemo(() => navigationState?.collegeName, []);
  const conversationId = useMemo(() => navigationState?.conversationId, []);
  const interviewDate = useMemo(
    () => (navigationState?.date ? formatDate(navigationState.date) : ""),
    []
  );
  const evaluationStatus = useMemo(() => navigationState?.evaluationStatus, []);

  const formattedDuration = useMemo(() => {
    return formatDuration(navigationState?.duration);
  }, []);

  const statusStyle = getStatusColor(evaluationStatus || "");
  const hasStaticQuestionAnalysis = staticQuestionAnalysis.length > 0;

  const fetchReport = async () => {
    try {
      const report = await getReport(conversationId || "");

      // Dynamically create formattedReport from traits
      const formattedReport = Object.entries(report?.data?.traits || {}).map(
        ([key, value]: [string, any]) => {
          return {
            title: key,
            comment: value.description,
            score: value.score,
            evidence: value.evidence,
            confidence: value.confidence,
            reasoning: value.reasoning,
          };
        }
      );

      const codingData = report?.data?.coding_assessment ?? null;
      setCodingAssessment(codingData);

      const userComments = report?.data?.user_comment || [];
      setUserCommentData(userComments);

      const recommendations = toStringArray(report?.data?.recommendations);
      const staticRecommendations = toStringArray(
        report?.data?.static_question_recommendations
      );

      setStaticQuestionAnalysis(
        Array.isArray(report?.data?.static_question_analysis_results)
          ? report.data.static_question_analysis_results
          : []
      );

      setReportData({
        summary:
          report?.data?.executive_summary ||
          report?.data?.static_question_summary ||
          "",
        AIComments:
          recommendations.length > 0
            ? recommendations
            : staticRecommendations,
        overallScore:
          process.env.REACT_APP_EVALUATION_CALCULATION === "frontend"
            ? calculateFrontendOverallScore(formattedReport)
            : Number(
                report?.data?.overall_score ??
                  report?.data?.static_question_overall_score ??
                  0
              ),
        loading: false,
        error: null,
      });

      setEvaluationData({
        data: formattedReport,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Failed to fetch report:", err);
      setReportData((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to fetch report",
      }));
      setEvaluationData((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to fetch evaluation data",
      }));
      setStaticQuestionAnalysis([]);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const logs = await getActiityLogs(conversationId || "");
      setActivityLogs({
        data: logs?.data || [],
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Failed to fetch activity logs:", err);
      setActivityLogs((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to fetch activity logs",
      }));
    }
  };

  // When leaving the detail view, record that we left from detail
  useEffect(() => {
    return () => {
      try {
        sessionStorage.setItem("candidateEvaluation_lastLeftView", "detail");
      } catch (e) {
        /* ignore */
      }
    };
  }, []);

  useEffect(() => {
    fetchReport();
    fetchActivityLogs();
  }, []);

  const handleAddUserComment = async () => {
    try {
      setUserCommentLoading(true);
      await addUserComment(userComment, conversationId || "");
      setUserComment("");
      fetchReport();
      fetchActivityLogs();
    } catch (err: any) {
      console.error("Failed to add user comment:", err);
    } finally {
      setUserCommentLoading(false);
    }
  };

  return (
    <Box
      sx={{
        background: "#fafbfc",
        padding: "2vh",
        paddingTop: "0",
        fontFamily: "Inter, sans-serif",
        height: "85vh",
        overflow: "auto",
      }}
    >
      {/* Candidate Details */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          background: "#fafbfc",
          paddingTop: "2vh",
          paddingBottom: "1vh",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            background: "#fff",
            border: "0.15vh solid #e0e0e0",
            margin: "0 auto 2vh auto",
            borderRadius: "2vh",
            padding: "2vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "14vh",
          }}
        >
          <Box display="flex" alignItems="center" gap="2vh">
            <Box
              sx={{
                width: "5vh",
                height: "5vh",
                borderRadius: "50%",
                background: "#fde7e7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3vh",
                color: "#b71c1c",
                fontWeight: 600,
                padding: "0.5vh",
              }}
            >
              {/* Fallback avatar icon */}
              <svg
                style={{ width: "3vh", height: "3vh" }}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="8" r="4" fill="#b71c1c" fillOpacity="0.2" />
                <rect
                  x="4"
                  y="16"
                  width="16"
                  height="6"
                  rx="3"
                  fill="#b71c1c"
                  fillOpacity="0.2"
                />
              </svg>
            </Box>
            <Box>
              <Typography fontWeight={700} fontSize="2.4vh" lineHeight={1.1}>
                {candidateName}
              </Typography>
              <Typography fontSize="1.7vh" color="#666" fontWeight={400}>
                {collegeName}
              </Typography>
              <Box display="flex" alignItems="center" gap="1.5vh" mt="0.5vh">
                <Typography
                  fontSize="1.5vh"
                  color="#888"
                  display="flex"
                  alignItems="center"
                >
                  <svg
                    style={{
                      marginRight: "0.5vh",
                      width: "2vh",
                      height: "2vh",
                    }}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1z"
                      fill="#888"
                    />
                  </svg>
                  {interviewDate}
                </Typography>
                <Typography fontSize="1.5vh" color="#888">
                  Duration: {formattedDuration}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box>
            <Box
              sx={{
                background: statusStyle.background,
                color: statusStyle.color,
                fontWeight: 600,
                fontSize: "1.7vh",
                borderRadius: "2vh",
                px: "2.2vh",
                py: "0.7vh",
                display: "inline-block",
              }}
            >
              {evaluationStatus}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* AI Interview Results */}
      <Paper
        sx={{
          margin: "1vh",
          height: "61vh",
          backgroundColor: "inherit",
          boxShadow: "none",
          padding: "1vh",
          overflowY: "scroll",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            border: "0.15vh solid #e0e0e0",
            margin: "0vh auto 0 auto",
            borderRadius: "2vh",
            padding: "2vh",
            // height:'50vh'
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb="1vh"
          >
            <Typography fontWeight={600} fontSize="2.2vh">
              AI Interview Results
            </Typography>
            <Box
              display="flex"
              alignItems="center"
              fontSize="1.5vh"
              color="#888"
              fontWeight={400}
              gap="0.7vh"
            >
              <span role="img" aria-label="doc">
                📄
              </span>{" "}
              Generated automatically
            </Box>
          </Box>

          {reportData.loading || evaluationData.loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                p: 5,
              }}
            >
              <CircularProgress size={"5vh"} sx={{ color: "#a31515" }} />
            </Box>
          ) : reportData.error ? (
            <Box
              sx={{
                background: "#ffebee",
                borderRadius: "1.2vh",
                padding: "1.5vh",
                fontSize: "1.7vh",
                color: "#b71c1c",
                mb: "2vh",
              }}
            >
              Error loading report: {reportData.error}
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  background: "#e3f0ff",
                  borderRadius: "1.2vh",
                  padding: "1.5vh",
                  fontSize: "1.7vh",
                  color: "#2563eb",
                  mb: "2vh",
                  height: "17vh",
                  overflowY: "scroll",
                  // scrollbarWidth:'none',
                  "&::-webkit-scrollbar": {
                    width: "0.8vh",
                    height: "0.8vh",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "#f1f1f1",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#c1c1c1",
                    borderRadius: "0.2vh",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "#a8a8a8",
                  },
                  "&::-webkit-scrollbar-button": {
                    display: "none",
                    height: "0",
                    width: "0",
                  },
                }}
              >
                {reportData.summary}
              </Box>

              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb="1vh"
              >
                <Typography fontWeight={600} fontSize="2vh">
                  Detailed Evaluation
                </Typography>
                <Box
                  display="flex"
                  alignItems="center"
                  fontSize="1.5vh"
                  color="#888"
                  fontWeight={400}
                  gap="0.7vh"
                >
                  <span role="img" aria-label="doc">
                    📄
                  </span>{" "}
                  AI Generated Comments
                </Box>
              </Box>

              {/* Evaluation Cards */}
              {evaluationData.error ? (
                <Box
                  sx={{
                    background: "#ffebee",
                    borderRadius: "1.2vh",
                    padding: "1.5vh",
                    fontSize: "1.7vh",
                    color: "#b71c1c",
                    mb: "2vh",
                  }}
                >
                  Error loading evaluation data: {evaluationData.error}
                </Box>
              ) : (
                evaluationData.data.length > 0 &&
                evaluationData.data.map((item: any) => (
                  <Box
                    key={item.title}
                    sx={{
                      background: "#fafbfc",
                      borderRadius: "1.2vh",
                      padding: "1.5vh",
                      mb: "1.5vh",
                      border: "0.1vh solid #e0e0e0",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box flex={1}>
                      <Typography fontWeight={900} fontSize="2vh" mb="2vh">
                        {item.title}
                      </Typography>
                      <Typography
                        fontWeight={600}
                        fontSize="1.5vh"
                        mb="0.7vh"
                        mt="1vh"
                      >
                        AI Comment
                      </Typography>
                      <Box
                        sx={{
                          padding: "1.5vh 1.5vh",
                          borderRadius: "1vh",
                          background: "#fff",
                          borderLeft: "0.5vh solid #a31515",
                        }}
                      >
                        <Typography fontSize="1.5vh" color="#444">
                          {item.comment}
                        </Typography>
                      </Box>
                      <Stack
                        direction="row"
                        divider={<Divider orientation="vertical" flexItem />}
                        sx={{
                          mb: "0.7vh",
                          mt: "1vh",
                          justifyContent: "space-between",
                          gap: "5vh",
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight={600} fontSize="1.5vh">
                            Evidence
                          </Typography>
                          <Box
                            sx={{
                              padding: "1.5vh 1.5vh",
                              borderRadius: "1vh",
                              background: "#fff",
                              borderLeft: "0.5vh solid #a31515",
                            }}
                          >
                            <Typography fontSize="1.5vh" color="#444">
                              {item.evidence[1]}
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Typography
                            fontWeight={600}
                            fontSize="1.5vh"
                            mb="0.7vh"
                            mt="1vh"
                          >
                            Evidence Quality
                          </Typography>
                          <Rating value={item.confidence * 5} readOnly />
                        </Box>
                      </Stack>
                      <Typography
                        fontWeight={600}
                        fontSize="1.5vh"
                        mb="0.7vh"
                        mt="1vh"
                      >
                        Reasoning
                      </Typography>
                      <Box
                        sx={{
                          padding: "1.5vh 1.5vh",
                          borderRadius: "1vh",
                          background: "#fff",
                          borderLeft: "0.5vh solid #a31515",
                        }}
                      >
                        <Typography fontSize="1.5vh" color="#444">
                          {item.reasoning}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        fontWeight: 700,
                        fontSize: "2.2vh",
                        color: getScoreColor(Number(item.score), 5),
                        ml: "2vh",
                        minWidth: "7vh",
                        textAlign: "right",
                      }}
                    >
                      {item.score}
                      <span
                        style={{
                          fontWeight: 400,
                          fontSize: "1.5vh",
                          color: "#888",
                        }}
                      >
                        /5
                      </span>
                    </Box>
                  </Box>
                ))
              )}

              {hasStaticQuestionAnalysis && (
                <Box sx={{ mb: "1.5vh" }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb="1vh"
                    mt={evaluationData.data.length > 0 ? "2vh" : 0}
                  >
                    <Typography fontWeight={600} fontSize="2vh">
                      Static Question Analysis
                    </Typography>
                    <Box
                      display="flex"
                      alignItems="center"
                      fontSize="1.5vh"
                      color="#888"
                      fontWeight={400}
                      gap="0.7vh"
                    >
                      <span role="img" aria-label="analysis">
                        🧠
                      </span>{" "}
                      Question-wise report
                    </Box>
                  </Box>

                  {staticQuestionAnalysis.map((item, index) => {
                    const issues = toStringArray(item.evidence?.issues);
                    const candidateMatches = toStringArray(
                      item.evidence?.candidate_matches
                    );
                    const expectedKeyPoints = toStringArray(
                      item.evidence?.expected_key_points
                    );

                    return (
                      <Accordion
                        key={`${item.question}-${index}`}
                        disableGutters
                        elevation={0}
                        sx={{
                          background: "#fff",
                          borderRadius: "1.2vh",
                          mb: "1.5vh",
                          border: "0.1vh solid #e0e0e0",
                          overflow: "hidden",
                          "&:before": {
                            display: "none",
                          },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{
                            px: "1.5vh",
                            py: "0.5vh",
                            alignItems: "center",
                            "& .MuiAccordionSummary-content": {
                              margin: 0,
                            },
                            "& .MuiAccordionSummary-content.Mui-expanded": {
                              margin: 0,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "2vh",
                              pr: "1vh",
                            }}
                          >
                            <Typography fontWeight={900} fontSize="2vh">
                              {item.question}
                            </Typography>
                            <Box
                              sx={{
                                fontWeight: 700,
                                fontSize: "2vh",
                                color: getScoreColor(
                                  Number(item.overall_score || 0),
                                  5
                                ),
                                minWidth: "8vh",
                                textAlign: "right",
                                flexShrink: 0,
                              }}
                            >
                              {item.overall_score ?? "-"}
                              <span
                                style={{
                                  fontWeight: 400,
                                  fontSize: "1.4vh",
                                  color: "#888",
                                }}
                              >
                                /5
                              </span>
                            </Box>
                          </Box>
                        </AccordionSummary>

                        <AccordionDetails sx={{ px: "1.5vh", pb: "1.5vh", pt: 0 }}>
                          <Box flex={1}>
                            <Stack
                              direction="row"
                              flexWrap="wrap"
                              gap="1vh"
                              mb="1.5vh"
                            >
                              <Box
                                sx={{
                                  background: "#fff",
                                  border: "0.1vh solid #e0e0e0",
                                  borderRadius: "1vh",
                                  padding: "1vh 1.2vh",
                                  minWidth: "13vh",
                                }}
                              >
                                <Typography
                                  fontWeight={600}
                                  fontSize="1.3vh"
                                  color="#666"
                                >
                                  Context
                                </Typography>
                                <Typography fontWeight={700} fontSize="1.7vh">
                                  {item.context_score ?? "-"}
                                  <span
                                    style={{
                                      fontWeight: 400,
                                      fontSize: "1.2vh",
                                      color: "#888",
                                    }}
                                  >
                                    /5
                                  </span>
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  background: "#fff",
                                  border: "0.1vh solid #e0e0e0",
                                  borderRadius: "1vh",
                                  padding: "1vh 1.2vh",
                                  minWidth: "13vh",
                                }}
                              >
                                <Typography
                                  fontWeight={600}
                                  fontSize="1.3vh"
                                  color="#666"
                                >
                                  Semantic
                                </Typography>
                                <Typography fontWeight={700} fontSize="1.7vh">
                                  {item.semantic_score ?? "-"}
                                  <span
                                    style={{
                                      fontWeight: 400,
                                      fontSize: "1.2vh",
                                      color: "#888",
                                    }}
                                  >
                                    /5
                                  </span>
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  background: "#fff",
                                  border: "0.1vh solid #e0e0e0",
                                  borderRadius: "1vh",
                                  padding: "1vh 1.2vh",
                                  minWidth: "13vh",
                                }}
                              >
                                <Typography
                                  fontWeight={600}
                                  fontSize="1.3vh"
                                  color="#666"
                                >
                                  Relevancy
                                </Typography>
                                <Typography fontWeight={700} fontSize="1.7vh">
                                  {item.relevancy_score ?? "-"}
                                  <span
                                    style={{
                                      fontWeight: 400,
                                      fontSize: "1.2vh",
                                      color: "#888",
                                    }}
                                  >
                                    /5
                                  </span>
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  background: "#fff",
                                  border: "0.1vh solid #e0e0e0",
                                  borderRadius: "1vh",
                                  padding: "1vh 1.2vh",
                                  minWidth: "13vh",
                                }}
                              >
                                <Typography
                                  fontWeight={600}
                                  fontSize="1.3vh"
                                  color="#666"
                                >
                                  Similarity
                                </Typography>
                                <Typography fontWeight={700} fontSize="1.7vh">
                                  {item.similarity_score ?? "-"}
                                  <span
                                    style={{
                                      fontWeight: 400,
                                      fontSize: "1.2vh",
                                      color: "#888",
                                    }}
                                  >
                                    /5
                                  </span>
                                </Typography>
                              </Box>
                            </Stack>

                            <Typography fontWeight={600} fontSize="1.5vh" mb="0.7vh">
                              Candidate Answer
                            </Typography>
                            <Box
                              sx={{
                                padding: "1.5vh 1.5vh",
                                borderRadius: "1vh",
                                background: "#fff",
                                borderLeft: "0.5vh solid #a31515",
                                mb: "1vh",
                              }}
                            >
                              <Typography fontSize="1.5vh" color="#444">
                                {item.candidate_answer || "No candidate answer available"}
                              </Typography>
                            </Box>

                            <Typography fontWeight={600} fontSize="1.5vh" mb="0.7vh">
                              Expected Answer
                            </Typography>
                            <Box
                              sx={{
                                padding: "1.5vh 1.5vh",
                                borderRadius: "1vh",
                                background: "#fff",
                                borderLeft: "0.5vh solid #2563eb",
                                mb: "1vh",
                              }}
                            >
                              <Typography fontSize="1.5vh" color="#444">
                                {item.expected_answer || "No expected answer available"}
                              </Typography>
                            </Box>

                            <Typography fontWeight={600} fontSize="1.5vh" mb="0.7vh">
                              Reasoning
                            </Typography>
                            <Box
                              sx={{
                                padding: "1.5vh 1.5vh",
                                borderRadius: "1vh",
                                background: "#fff",
                                borderLeft: "0.5vh solid #a31515",
                              }}
                            >
                              <Typography fontSize="1.5vh" color="#444">
                                {item.reasoning || "No reasoning available"}
                              </Typography>
                            </Box>

                            {(issues.length > 0 ||
                              candidateMatches.length > 0 ||
                              expectedKeyPoints.length > 0) && (
                              <Stack
                                direction={{ xs: "column", md: "row" }}
                                spacing="1.5vh"
                                sx={{ mt: "1vh" }}
                              >
                                {issues.length > 0 && (
                                  <Box
                                    sx={{
                                      flex: 1,
                                      background: "#fff",
                                      borderRadius: "1vh",
                                      padding: "1.5vh",
                                      borderLeft: "0.5vh solid #f59e0b",
                                    }}
                                  >
                                    <Typography
                                      fontWeight={600}
                                      fontSize="1.5vh"
                                      mb="0.7vh"
                                    >
                                      Issues
                                    </Typography>
                                    {issues.map((issue, issueIndex) => (
                                      <Typography
                                        key={`${item.question}-issue-${issueIndex}`}
                                        fontSize="1.4vh"
                                        color="#444"
                                        mb="0.5vh"
                                      >
                                        • {issue}
                                      </Typography>
                                    ))}
                                  </Box>
                                )}

                                {candidateMatches.length > 0 && (
                                  <Box
                                    sx={{
                                      flex: 1,
                                      background: "#fff",
                                      borderRadius: "1vh",
                                      padding: "1.5vh",
                                      borderLeft: "0.5vh solid #22c55e",
                                    }}
                                  >
                                    <Typography
                                      fontWeight={600}
                                      fontSize="1.5vh"
                                      mb="0.7vh"
                                    >
                                      Candidate Matches
                                    </Typography>
                                    {candidateMatches.map((match, matchIndex) => (
                                      <Typography
                                        key={`${item.question}-match-${matchIndex}`}
                                        fontSize="1.4vh"
                                        color="#444"
                                        mb="0.5vh"
                                      >
                                        • {match}
                                      </Typography>
                                    ))}
                                  </Box>
                                )}

                                {expectedKeyPoints.length > 0 && (
                                  <Box
                                    sx={{
                                      flex: 1,
                                      background: "#fff",
                                      borderRadius: "1vh",
                                      padding: "1.5vh",
                                      borderLeft: "0.5vh solid #2563eb",
                                    }}
                                  >
                                    <Typography
                                      fontWeight={600}
                                      fontSize="1.5vh"
                                      mb="0.7vh"
                                    >
                                      Expected Key Points
                                    </Typography>
                                    {expectedKeyPoints.map((point, pointIndex) => (
                                      <Typography
                                        key={`${item.question}-point-${pointIndex}`}
                                        fontSize="1.4vh"
                                        color="#444"
                                        mb="0.5vh"
                                      >
                                        • {point}
                                      </Typography>
                                    ))}
                                  </Box>
                                )}
                              </Stack>
                            )}

                            <Box sx={{ mt: "1.5vh" }}>
                              <Typography fontWeight={600} fontSize="1.5vh" mb="0.7vh">
                                Confidence
                              </Typography>
                              <Rating
                                value={Number(item.confidence || 0) * 5}
                                readOnly
                              />
                            </Box>
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Box>
              )}

              <Box
                sx={{
                  background:
                    "linear-gradient(90deg, #F0FDF4 0%, #FEE2E2 100%)",
                  borderRadius: "1.2vh",
                  padding: "1.5vh",
                  mb: "1.5vh",
                  border: "0.1vh solid #e0e0e0",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box flex={1} position="relative">
                  <Typography fontWeight={600} fontSize="1.7vh">
                    Overall Score
                  </Typography>
                  <Box
                    sx={{
                      fontWeight: 700,
                      fontSize: "3vh",
                      color: getScoreColor(Number(reportData.overallScore), 5),
                      minWidth: "7vh",
                      position: "absolute",
                      right: "0",
                      top: "0",
                    }}
                  >
                    {reportData?.overallScore}
                    <span
                      style={{
                        fontWeight: 400,
                        fontSize: "1.5vh",
                        color: "#888",
                      }}
                    >
                      /5
                    </span>
                  </Box>
                  <Box
                    sx={{
                      padding: "1vh 0",
                    }}
                  >
                    <Typography fontSize="1.5vh" color="#444">
                      Average across all criteria
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {/* Coding Assessment Section */}
              {codingAssessment && codingAssessment.tasks?.length > 0 && (
                <Box sx={{ mb: "2vh" }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb="1vh"
                  >
                    <Box display="flex" alignItems="center" gap="1vh">
                      <CodeIcon sx={{ fontSize: "2.2vh", color: "#a31515" }} />
                      <Typography fontWeight={600} fontSize="2vh">
                        Coding Assessment
                      </Typography>
                    </Box>
                    {codingAssessment.coding_score !== null && (
                      <Box
                        sx={{
                          fontWeight: 700,
                          fontSize: "2vh",
                          color:
                            codingAssessment.coding_score >= 7
                              ? "#2e7d32"
                              : codingAssessment.coding_score >= 4
                              ? "#f9a825"
                              : "#b71c1c",
                          bgcolor:
                            codingAssessment.coding_score >= 7
                              ? "#e8f5e9"
                              : codingAssessment.coding_score >= 4
                              ? "#fff8e1"
                              : "#ffebee",
                          borderRadius: "2vh",
                          px: "2vh",
                          py: "0.5vh",
                        }}
                      >
                        {codingAssessment.coding_score}/10
                      </Box>
                    )}
                  </Box>
                  {codingAssessment.tasks.map((task: any, idx: number) => (
                    <Box
                      key={task.task_id || idx}
                      sx={{
                        background: "#fafbfc",
                        borderRadius: "1.2vh",
                        padding: "1.5vh",
                        mb: "1.5vh",
                        border: "0.1vh solid #e0e0e0",
                      }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        mb="1vh"
                      >
                        <Box display="flex" alignItems="center" gap="1vh">
                          <Typography fontWeight={700} fontSize="1.8vh">
                            Task {task.task_number || idx + 1}
                          </Typography>
                          {task.language && (
                            <Box
                              sx={{
                                bgcolor: "#e3f0ff",
                                color: "#2563eb",
                                fontSize: "1.3vh",
                                fontWeight: 600,
                                borderRadius: "1vh",
                                px: "1vh",
                                py: "0.2vh",
                              }}
                            >
                              {task.language.toUpperCase()}
                            </Box>
                          )}
                        </Box>
                        <Box display="flex" alignItems="center" gap="1vh">
                          {task.verdict && (
                            <Box
                              sx={{
                                bgcolor:
                                  task.verdict === "PASS"
                                    ? "#e8f5e9"
                                    : "#ffebee",
                                color:
                                  task.verdict === "PASS"
                                    ? "#2e7d32"
                                    : "#b71c1c",
                                fontWeight: 700,
                                fontSize: "1.4vh",
                                borderRadius: "1vh",
                                px: "1.2vh",
                                py: "0.3vh",
                              }}
                            >
                              {task.verdict}
                            </Box>
                          )}
                          {task.score !== undefined && task.score !== null && (
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: "1.8vh",
                                color:
                                  task.score >= 7
                                    ? "#2e7d32"
                                    : task.score >= 4
                                    ? "#f9a825"
                                    : "#b71c1c",
                              }}
                            >
                              {task.score}
                              <span
                                style={{
                                  fontWeight: 400,
                                  fontSize: "1.3vh",
                                  color: "#888",
                                }}
                              >
                                /10
                              </span>
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      {task.problem_text && (
                        <Box
                          sx={{
                            padding: "1vh",
                            borderRadius: "0.8vh",
                            background: "#fff",
                            borderLeft: "0.4vh solid #2563eb",
                            mb: "1vh",
                          }}
                        >
                          <Typography
                            fontSize="1.3vh"
                            color="#666"
                            fontWeight={600}
                            mb="0.3vh"
                          >
                            Problem
                          </Typography>
                          <Typography fontSize="1.4vh" color="#333">
                            {task.problem_text}
                          </Typography>
                        </Box>
                      )}
                      {task.submitted_code && (
                        <Box sx={{ mb: "1vh" }}>
                          <Typography
                            fontSize="1.3vh"
                            color="#666"
                            fontWeight={600}
                            mb="0.3vh"
                          >
                            Submitted Code
                          </Typography>
                          <Box
                            component="pre"
                            sx={{
                              bgcolor: "#1e1e2e",
                              borderRadius: "0.8vh",
                              padding: "1vh",
                              overflowX: "auto",
                              maxHeight: "20vh",
                              overflowY: "auto",
                              m: 0,
                              "&::-webkit-scrollbar": {
                                width: "0.5vh",
                                height: "0.5vh",
                              },
                              "&::-webkit-scrollbar-thumb": {
                                background: "#45475a",
                                borderRadius: "0.3vh",
                              },
                            }}
                          >
                            <code
                              style={{
                                color: "#cdd6f4",
                                fontSize: "1.3vh",
                                fontFamily:
                                  '"Fira Code", "Cascadia Code", monospace',
                              }}
                            >
                              {task.submitted_code}
                            </code>
                          </Box>
                        </Box>
                      )}
                      {task.review && (
                        <Box
                          sx={{
                            padding: "1vh",
                            borderRadius: "0.8vh",
                            background: "#fff",
                            borderLeft: "0.4vh solid #a31515",
                          }}
                        >
                          <Typography
                            fontSize="1.3vh"
                            color="#666"
                            fontWeight={600}
                            mb="0.3vh"
                          >
                            Review
                          </Typography>
                          <Typography fontSize="1.4vh" color="#444">
                            {task.review}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}

              <Typography fontWeight={600} fontSize="2vh" mb="1vh">
                AI Generated Comments
              </Typography>
              <Box
                sx={{
                  padding: "1.5vh 1.5vh",
                  borderRadius: "1vh",
                  background: "#fff",
                  borderLeft: "0.5vh solid #a31515",
                  height: "17vh",
                  overflowY: "scroll",
                  // scrollbarWidth:'none',
                  "&::-webkit-scrollbar": {
                    width: "0.8vh",
                    height: "0.8vh",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "#f1f1f1",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#c1c1c1",
                    borderRadius: "0.2vh",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "#a8a8a8",
                  },
                  "&::-webkit-scrollbar-button": {
                    display: "none",
                    height: "0",
                    width: "0",
                  },
                }}
              >
                <Typography fontSize="1.5vh" color="#444">
                  {reportData.AIComments.length > 0
                    ? reportData.AIComments.join(" ")
                    : reportData.summary}
                </Typography>
              </Box>

              <Box
                sx={{
                  my: "1vh",
                  display: "flex",
                  alignItems: "center",
                  gap: "1vh",
                }}
              >
                <ChatBubbleOutlineIcon
                  sx={{ fontSize: "2vh", color: "#a31515" }}
                />
                <Typography fontWeight={600} fontSize="2vh">
                  User Comments
                </Typography>
              </Box>
              <Box
                sx={{
                  background: "#fafbfc",
                  borderRadius: "1.2vh",
                  padding: "1.5vh",
                  mb: "1.5vh",
                  border: "0.1vh solid #e0e0e0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2vh",
                }}
              >
                {userCommentData.map((comment: any, index: number) => (
                  <Box
                    key={index}
                    sx={{
                      padding: "1.5vh 1.5vh",
                      borderRadius: "1vh",
                      background: "#fff",
                      borderLeft: "0.5vh solid #a31515",
                    }}
                  >
                    <Typography fontSize="1.5vh" color="#444">
                      {comment}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <InputBase
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Add your comments about this candidate's evaluation, additional observations, or recommendations..."
                sx={{
                  fontSize: "1.5vh",
                  width: "100%",
                  border: "0.1vh solid #e0e0e0",
                  borderRadius: "1vh",
                  padding: "1vh",
                }}
              />
              <Box
                sx={{ display: "flex", justifyContent: "flex-end", mt: "1vh" }}
              >
                <Button
                  variant="contained"
                  disabled={userCommentLoading}
                  sx={{
                    minWidth: "0",
                    textTransform: "none",
                    fontSize: "1.5vh",
                    padding: "1vh 2vh",
                    background: "#a31515",
                    borderRadius: "0.7vh",
                  }}
                  onClick={handleAddUserComment}
                >
                  Save Comment
                </Button>
              </Box>
            </>
          )}
        </Paper>
        {/* Activity Logs */}
        <Paper
          elevation={0}
          sx={{
            border: "0.15vh solid #e0e0e0",
            margin: "2vh auto 0 auto",
            borderRadius: "2vh",
            padding: "2vh",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1vh",
              mb: "1.5vh",
            }}
          >
            <HistoryIcon sx={{ fontSize: "2vh", color: "#a31515" }} />
            <Typography fontWeight={600} fontSize="2vh">
              Activity Logs
            </Typography>
          </Box>
          <Box>
            {activityLogs.loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress size={"5vh"} sx={{ color: "#a31515" }} />
              </Box>
            ) : activityLogs.error ? (
              <Box
                sx={{
                  background: "#ffebee",
                  borderRadius: "1.2vh",
                  padding: "1.5vh",
                  fontSize: "1.7vh",
                  color: "#b71c1c",
                  mb: "2vh",
                }}
              >
                Error loading activity logs: {activityLogs.error}
              </Box>
            ) : activityLogs.data.length > 0 ? (
              activityLogs.data.map((log: any) => (
                <Box
                  key={log.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    background: "#E6FAEA",
                    borderRadius: "1vh",
                    padding: "1.2vh",
                    mb: "1vh",
                    gap: "1.5vh",
                  }}
                >
                  {/* Icon */}
                  <Box>
                    {log.userAgent === "AI Bot" && (
                      <DescriptionIcon
                        sx={{ fontSize: "2vh", color: "#800080" }}
                      />
                    )}
                    {log.actionType.includes("comment") && (
                      <ChatBubbleOutlineIcon
                        sx={{ fontSize: "2vh", color: "#22C55E" }}
                      />
                    )}
                  </Box>
                  {/* Log Details */}
                  <Box flex={1}>
                    <Typography fontSize="1.7vh" fontWeight={500}>
                      {log.actionType}
                    </Typography>
                    <Typography fontSize="1.3vh" color="#888">
                      By {log.userAgent}
                    </Typography>
                  </Box>
                  {/* Timestamp */}
                  <Typography
                    fontSize="1.3vh"
                    color="#888"
                    sx={{ minWidth: "120px", textAlign: "right" }}
                  >
                    {formatDate(log.timestamp)}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography fontSize="1.5vh" color="#888" textAlign="center">
                No activity logs found
              </Typography>
            )}
          </Box>
        </Paper>
      </Paper>
    </Box>
  );
};

export default CandidateSummary;
