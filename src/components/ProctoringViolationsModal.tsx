import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  IconButton,
  Typography,
  Backdrop,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { getProctoringViolations } from "../api/api";

interface ProctoringViolationsModalProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  candidateName: string;
}

interface Violation {
  timestamp: number;
  violation_type: string;
  severity: string;
  reason: string;
  confidence?: number;
  duration_seconds?: number;
  frame_url?: string;
  detections?: any;
}

interface ViolationsSummary {
  total_violations: number;
  warnings_issued: number;
  terminated: boolean;
}

const severityColors: Record<string, { bg: string; text: string }> = {
  critical: { bg: "#FEE2E2", text: "#991B1B" },
  high: { bg: "#FFEDD5", text: "#9A3412" },
  medium: { bg: "#FEF9C3", text: "#854D0E" },
  low: { bg: "#F3F4F6", text: "#374151" },
};

const violationTypeLabels: Record<string, string> = {
  no_face: "No Face Detected",
  multiple_faces: "Multiple Faces",
  unauthorized_object: "Unauthorized Object",
  eyes_closed_sustained: "Eyes Closed",
  head_pose_away: "Head Turned Away",
  gaze_away: "Gaze Off-Screen",
  fullscreen_exit: "Fullscreen Exit",
  tab_switch: "Tab Switch",
};

const formatTimestamp = (ts: number): string => {
  const date = new Date(ts);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const ProctoringViolationsModal: React.FC<ProctoringViolationsModalProps> = ({
  open,
  onClose,
  conversationId,
  candidateName,
}) => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [summary, setSummary] = useState<ViolationsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !conversationId) return;

    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getProctoringViolations(conversationId);
        if (cancelled) return;
        setViolations(result?.violations ?? []);
        setSummary(result?.summary ?? null);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load violations");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [open, conversationId]);

  const handleClose = () => {
    setLightboxUrl(null);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "0.7vh",
            maxHeight: "80vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(108deg, #004d40 0%, #00605a 45%, #004d40 100%)",
            padding: "1.5vh 2vh",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "white",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 600,
                fontSize: "2vh",
                color: "white",
              }}
            >
              Proctoring Violations — {candidateName}
            </Typography>
            {summary && (
              <Box display="flex" gap="1.2vh" mt="0.5vh" alignItems="center">
                {summary.terminated && (
                  <Chip
                    label="TERMINATED"
                    size="small"
                    sx={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "1.3vh",
                      fontWeight: 700,
                      backgroundColor: "#EF4444",
                      color: "white",
                    }}
                  />
                )}
              </Box>
            )}
          </Box>
          <IconButton onClick={handleClose} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ padding: "0 !important" }}>
          {loading ? (
            <Box p="2vh">
              {[...Array(4)].map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height="6vh"
                  sx={{ borderRadius: "0.5vh", mb: "1vh" }}
                />
              ))}
            </Box>
          ) : error ? (
            <Box p="3vh" textAlign="center">
              <Typography
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "1.6vh",
                  color: "#B91C1C",
                }}
              >
                {error}
              </Typography>
            </Box>
          ) : violations.length === 0 ? (
            <Box p="3vh" textAlign="center">
              <Typography
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "1.6vh",
                  color: "#6B7280",
                }}
              >
                No proctoring violations recorded for this interview.
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: "60vh" }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {["#", "Time", "Type", "Severity", "Reason", "Frame"].map(
                      (header) => (
                        <TableCell
                          key={header}
                          sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: 700,
                            fontSize: "1.4vh",
                            backgroundColor: "#F9FAFB",
                            color: "#374151",
                            borderBottom: "2px solid #E5E7EB",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {header}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {violations.map((v, idx) => {
                    const colors = severityColors[v.severity?.toLowerCase()] ?? severityColors.medium;
                    return (
                      <TableRow
                        key={`${v.timestamp}-${idx}`}
                        sx={{
                          "&:hover": { backgroundColor: "#F9FAFB" },
                        }}
                      >
                        <TableCell
                          sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "1.3vh",
                            color: "#6B7280",
                          }}
                        >
                          {idx + 1}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "1.3vh",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatTimestamp(v.timestamp)}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "1.3vh",
                            fontWeight: 500,
                          }}
                        >
                          {violationTypeLabels[v.violation_type] ?? v.violation_type}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={v.severity?.charAt(0).toUpperCase() + v.severity?.slice(1)}
                            size="small"
                            sx={{
                              fontFamily: "Poppins, sans-serif",
                              fontSize: "1.2vh",
                              fontWeight: 700,
                              backgroundColor: colors.bg,
                              color: colors.text,
                              minWidth: "7vh",
                            }}
                          />
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "1.3vh",
                            maxWidth: "25vh",
                          }}
                        >
                          {v.reason}
                        </TableCell>
                        <TableCell>
                          {v.frame_url ? (
                            <Box
                              component="img"
                              src={v.frame_url}
                              alt="Alert frame"
                              onClick={() => setLightboxUrl(v.frame_url!)}
                              sx={{
                                width: "6vh",
                                height: "4.5vh",
                                objectFit: "cover",
                                borderRadius: "0.4vh",
                                cursor: "pointer",
                                border: "1px solid #E5E7EB",
                                "&:hover": {
                                  border: "1px solid #004d40",
                                  boxShadow: "0 0 0 1px #004d40",
                                },
                              }}
                            />
                          ) : (
                            <Typography
                              sx={{
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "1.2vh",
                                color: "#9CA3AF",
                              }}
                            >
                              —
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox for frame image */}
      <Backdrop
        open={!!lightboxUrl}
        onClick={() => setLightboxUrl(null)}
        sx={{ zIndex: 10002, backgroundColor: "rgba(0,0,0,0.85)" }}
      >
        {lightboxUrl && (
          <Box
            component="img"
            src={lightboxUrl}
            alt="Violation frame"
            sx={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: "0.5vh",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          />
        )}
      </Backdrop>
    </>
  );
};

export default ProctoringViolationsModal;
