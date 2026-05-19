import React, { useEffect, useState } from "react";
import { Box, Typography, LinearProgress, Avatar } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useNavigate, useLocation } from "react-router-dom";
import { routes } from "../constants/routes";
import { evaluateResume } from "../api/api";
import { clearCreateJobPostSession } from "../utils/clearCreateJobPostSession";

const ATSProcessing = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState(
    "ATS analysis in progress",
  );
  const [isZipFile, setIsZipFile] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const MOCK_EVALUATION_DATA = {
    rank: 1,
    file_name: "Resume_Sample.pdf",
    status: "Success",
    "Resume Score": 85,
    Decision: "SHORTLISTED",
    Reason: "Strong technical background with relevant experience",
    "View Summary": "Score 85 >= threshold 70",
    email: "candidate@example.com",
  };

  useEffect(() => {
    const processResume = async () => {
  try {
    const { file, jobId } = location.state || {};

    if (!file) throw new Error("File missing. Please upload resume again.");
    if (!jobId)
      throw new Error("Job ID missing. Please restart evaluation.");

    // detect ZIP
    const isZip =
      file.type?.includes("zip") ||
      file.name?.toLowerCase().endsWith(".zip");

    setIsZipFile(isZip);

    if (isZip) {
      setProcessingMessage("Processing ZIP file with multiple resumes...");
    }

    let result: any = null;
    const maxRetries = isZip ? 5 : 2;
    let currentRetry = 0;

    while (currentRetry <= maxRetries) {
      try {
        result = await evaluateResume(
          file,
          String(jobId),
          isZip
        );

        if (
          result?.status !== "running" &&
          (result?.summary || result?.results || Array.isArray(result))
        ) {
          break;
        }

        if (result?.status === "running" && currentRetry < maxRetries) {
          const delay = Math.pow(2, currentRetry) * 2000;
          currentRetry++;

          setRetryCount(currentRetry);
          setProcessingMessage(
            isZip
              ? `Processing ZIP resumes… retry ${currentRetry}/${maxRetries}`
              : `ATS analysis… retry ${currentRetry}/${maxRetries}`
          );

          await new Promise((r) => setTimeout(r, delay));
        } else {
          break;
        }
      } catch (err) {
        if (currentRetry < maxRetries) {
          const delay = Math.pow(2, currentRetry) * 2000;
          currentRetry++;
          setRetryCount(currentRetry);
          await new Promise((r) => setTimeout(r, delay));
        } else {
          throw err;
        }
      }
    }

    const summaryData =
      result?.summary ||
      result?.results ||
      (Array.isArray(result) ? result : []);

    if (!summaryData || summaryData.length === 0) {
      throw new Error("No evaluation results received.");
    }

    navigate(routes.scoreSummary.replace(":id", jobId), {
      state: { summary: summaryData, job: location.state?.job },
      replace: true,
    });
  } catch (err: any) {
    let msg = err?.message || "Processing failed.";

    if (err?.code === "ECONNABORTED") {
      msg = "Request timeout. Backend may still be processing.";
    } else if (!err?.response) {
      msg = "Network error: cannot reach server.";
    }

    setError(msg);

    setTimeout(() => {
      navigate(
        routes.scoreSummary.replace(":id", location.state?.jobId || ""),
        { replace: true }
      );
    }, 3000);
  }
};

    if (location.state) processResume();
    else {
      // If reloaded or navigated directly, redirect to start
      navigate(routes.createJobPost, { replace: true });
    }
  }, [navigate, location.state]);

  useEffect(() => {
    const handleReload = () => {
      clearCreateJobPostSession();
    };

    window.addEventListener("beforeunload", handleReload);

    return () => {
      window.removeEventListener("beforeunload", handleReload);
    };
  }, []);

  useEffect(() => {
    const flipInterval = setInterval(() => {
      setIsFlipped((prev) => !prev);
    }, 2200);

    return () => clearInterval(flipInterval);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "85vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "min(440px, 92vw)",
          borderRadius: 3,
          p: 4,
          textAlign: "center",
          border: "1px solid rgba(15,118,110,0.12)",
          animation: "cardFloat 6s ease-in-out infinite",
          transformStyle: "preserve-3d",
        }}
      >
        {error ? (
          <>
            <Typography sx={{ color: "#dc2626", fontWeight: 700, mb: 2 }}>
              PROCESSING ERROR
            </Typography>
            <Typography sx={{ color: "#6b7280" }}>{error}</Typography>
          </>
        ) : (
          <>
            {/* Animated center */}
            <Box
              sx={{
                width: 140,
                height: 140,
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                perspective: "1000px",
              }}
            >
              {/* Rotating dots */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  animation: "spin 10s linear infinite",
                }}
              >
                {Array.from({ length: 16 }).map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: i % 2 === 0 ? 9 : 6,
                      height: i % 2 === 0 ? 9 : 6,
                      borderRadius: "50%",
                      bgcolor: "#0f766e",
                      transform: `rotate(${i * 22.5}deg) translate(70px)`,
                    }}
                  />
                ))}
              </Box>

              {/* Flip Card */}
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  position: "relative",
                  transformStyle: "preserve-3d",
                  transition: "transform 0.8s ease-in-out",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Front */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 2,
                    bgcolor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      "0 12px 30px rgba(15,118,110,0.35), 0 0 0 1px rgba(15,118,110,0.12)",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 32, color: "#0f766e" }} />
                </Box>

                {/* Back (same icon) */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 2,
                    bgcolor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: "rotateY(180deg)",
                    boxShadow:
                      "0 12px 30px rgba(15,118,110,0.35), 0 0 0 1px rgba(15,118,110,0.12)",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 32, color: "#0f766e" }} />
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography sx={{ color: "#0f766e", fontWeight: 700 }}>
                PROCESSING
              </Typography>
            </Box>

            <Typography sx={{ mt: 2, fontSize: 24, fontWeight: 800 }}>
              {processingMessage}
            </Typography>

            <Typography sx={{ mt: 1, color: "#6b7280" }}>
              {isZipFile
                ? "Evaluating multiple resumes from ZIP file..."
                : "Scanning skills, experience & job fit..."}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <LinearProgress />
            </Box>
            <Box
              sx={{
                mt: 5,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
              }}
            >
              {["ATS", "AI", "HR"].map((label, index) => (
                <Box
                  key={label}
                  sx={{
                    position: "relative",
                    animation: "float 4s ease-in-out infinite",
                    animationDelay: `${index * 0.3}s`,
                  }}
                >
                  {/* Glow ring */}
                  <Box
                    sx={{
                      position: "absolute",
                      inset: -6,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(20,184,166,0.35), transparent 70%)",
                      filter: "blur(6px)",
                    }}
                  />

                  <Avatar
                    sx={{
                      width: 46,
                      height: 46,
                      fontSize: 14,
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #0f766e, #14b8a6)",
                      color: "#fff",
                      boxShadow: "0 10px 30px rgba(15,118,110,0.4)",
                    }}
                  >
                    {label}
                  </Avatar>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>

      <style>
        {`
    @keyframes spin {
      0% { transform: rotate(0); }
      100% { transform: rotate(360deg); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }

    @keyframes cardFloat {
      0% {
        transform: rotateY(0deg) rotateX(0deg) scale(1);
      }
      25% {
        transform: rotateY(1.5deg) rotateX(1deg) scale(1.01);
      }
      50% {
        transform: rotateY(0deg) rotateX(0deg) scale(1.02);
      }
      75% {
        transform: rotateY(-1.5deg) rotateX(-1deg) scale(1.01);
      }
      100% {
        transform: rotateY(0deg) rotateX(0deg) scale(1);
      }
    }
  `}
      </style>
    </Box>
  );
};

export default ATSProcessing;
 