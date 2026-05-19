import React from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { styles } from "./CandidateAnalysisModal.styles";

interface Props {
  open: boolean;
  onClose: () => void;
  candidate?: {
    fileName?: string;
    name?: string;
    email?: string;
    score: number;
    decision?: string;
    threshold?: number;
    model?: string;
    latency?: number;
    datetime?: string;
    reasoning?: string;
    strengths?: string | Array<{
      category?: string;
      description?: string;
      evidence?: string;
      relevanceScore?: number;
    }>;
    gaps?: string | Array<{
      category?: string;
      ruleLabel?: string;
      description?: string;
      impact?: string;
      recommendation?: string;
    }>;
    rules?: Array<{
      rule_number?: number;
      rule_name?: string;
      score?: number;
      threshold?: number;
      status?: string;
    }>;
    scoreBreakdown?: Array<{
      criterion?: string;
      questionId?: string;
      weight?: number;
      score?: number;
      explanation?: string;
    }>;
    fullData?: any;
  };
}

const CandidateAnalysisModal: React.FC<Props> = ({
  open,
  onClose,
  candidate,
}) => {
  if (!candidate) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* HEADER */}
      <Box sx={styles.header}>
        <Box>
          <Typography sx={styles.name}>{candidate.name || "Resume Analysis"}</Typography>
          <Typography sx={styles.file}>
            {candidate.fileName || candidate.name?.replace(" ", "_").toUpperCase() + "_RESUME.PDF"}
          </Typography>
        </Box>

        <IconButton onClick={onClose} sx={styles.closeBtn}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={styles.content}>
        {/* KPI CARDS */}
        <Box sx={styles.kpiRow}>
          <Box sx={styles.kpiCard}>
            <Typography sx={styles.kpiLabel}>ATS SCORE</Typography>
            <Typography sx={styles.kpiValue}>
              {candidate.score}%
            </Typography>
          </Box>

          <Box sx={styles.kpiCard}>
            <Typography sx={styles.kpiLabel}>STATUS</Typography>
            <Typography
              sx={{
                fontSize: "1.4vh",
                fontWeight: 600,
                color:
                  candidate.decision === "SHORTLIST"
                    ? "#10b981"
                    : candidate.decision === "REJECT"
                      ? "#ef4444"
                      : "#f59e0b",
              }}
            >
              ✓ {candidate.decision || "PENDING"}
            </Typography>
          </Box>

          <Box sx={styles.kpiCard}>
            <Typography sx={styles.kpiLabel}>CONTACT EMAIL</Typography>

            <Box sx={styles.emailRow}>
              <EmailOutlinedIcon fontSize="small" />
              <Tooltip title={candidate.email} arrow>
                <Typography sx={styles.emailText}>
                  {candidate.email}
                </Typography>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* THRESHOLD */}
        <Box sx={styles.thresholdCard}>
          <Typography sx={styles.thresholdTitle}>
            ✦ THRESHOLD CONFIGURATION
          </Typography>

          <Typography sx={styles.thresholdText}>
            Threshold used: <b>system_default</b>, value:
            <span style={{ color: "#0f6c63" }}> {candidate.threshold || 70}</span>. Active system
            default threshold: {candidate.threshold || 70}. System default updated in this request: No.
          </Typography>
        </Box>

        {/* REASONING */}
        {candidate.reasoning && (
          <Box sx={{ ...styles.thresholdCard, backgroundColor: "#f0fdf4", mb: 2 }}>
            <Typography sx={{ fontWeight: 600, color: "#10b981", mb: 1 }}>
              💡 REASONING
            </Typography>
            <Typography sx={{ fontSize: "1.3vh", color: "#333" }}>
              {candidate.reasoning.replace(/\.\.\.$/, "")}
            </Typography>
          </Box>
        )}

        {/* STRENGTHS & GAPS */}
        <Box sx={{ display: "flex", gap: "2vh", mb: 2 }}>
          {candidate.strengths && (
            <Box sx={{ flex: 1, backgroundColor: "#f0fdf4", p: 1.5, borderRadius: 1 }}>
              <Typography sx={{ fontWeight: 600, color: "#10b981", mb: 1 }}>
                ✓ STRENGTHS
              </Typography>
              
              {typeof candidate.strengths === 'string' ? (
                <Typography sx={{ fontSize: "1.2vh", color: "#333", whiteSpace: "pre-wrap" }}>
                  {candidate.strengths}
                </Typography>
              ) : Array.isArray(candidate.strengths) ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {candidate.strengths.map((item, idx) => (
                    <Box key={idx} sx={{ pb: 1, borderBottom: idx < candidate.strengths!.length - 1 ? "1px solid #d1fae5" : "none" }}>
                      <Typography sx={{ fontSize: "1.1vh", fontWeight: 600, color: "#065f46", mb: 0.5 }}>
                        {item.category && item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        {item.relevanceScore !== undefined && ` (${(item.relevanceScore * 100).toFixed(0)}%)`}
                      </Typography>
                      <Typography sx={{ fontSize: "1.2vh", color: "#333", mb: 0.5 }}>
                        {item.description}
                      </Typography>
                      {item.evidence && (
                        <Typography sx={{ fontSize: "1.1vh", color: "#059669", fontStyle: "italic" }}>
                          Evidence: {item.evidence}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              ) : null}
            </Box>
          )}

          {candidate.gaps && (
            <Box sx={{ flex: 1, backgroundColor: "#fee2e2", p: 1.5, borderRadius: 1 }}>
              <Typography sx={{ fontWeight: 600, color: "#ef4444", mb: 1 }}>
                ⚠ GAPS
              </Typography>
              
              {typeof candidate.gaps === 'string' ? (
                <Typography sx={{ fontSize: "1.2vh", color: "#333", whiteSpace: "pre-wrap" }}>
                  {candidate.gaps}
                </Typography>
              ) : Array.isArray(candidate.gaps) ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {candidate.gaps.map((item, idx) => (
                    <Box key={idx} sx={{ pb: 1, borderBottom: idx < candidate.gaps!.length - 1 ? "1px solid #fecaca" : "none" }}>
                      <Typography sx={{ fontSize: "1.1vh", fontWeight: 600, color: "#7f1d1d", mb: 0.5 }}>
                        {item.ruleLabel || item.category}
                        {item.impact && ` (Impact: ${item.impact})`}
                      </Typography>
                      <Typography sx={{ fontSize: "1.2vh", color: "#333", mb: 0.5 }}>
                        {item.description}
                      </Typography>
                      {item.recommendation && (
                        <Typography sx={{ fontSize: "1.1vh", color: "#dc2626", fontStyle: "italic" }}>
                          Recommendation: {item.recommendation}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              ) : null}
            </Box>
          )}
        </Box>

        {/* SCORE BREAKDOWN */}
        <Box sx={styles.breakdownWrapper}>
          <Typography sx={styles.breakdownTitle}>
            SCORE BREAKDOWN
          </Typography>

          <Typography sx={styles.breakdownSub}>
            The overall score is the sum of each criterion’s contribution.
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* header */}
          <Box sx={styles.tableHeader}>
            <Typography>Criterion</Typography>
            <Typography>Weight (%)</Typography>
            <Typography>Score(%)</Typography>
            <Typography>Explanation</Typography>
          </Box>

          <Divider sx={{ my: 1 }} />

          {candidate.scoreBreakdown && candidate.scoreBreakdown.length > 0 ? (
            candidate.scoreBreakdown.map((item, i) => (
              <Box key={i} sx={styles.tableRow}>
                <Typography sx={{ flex: 1, fontWeight: 500 }}>{item.criterion || "N/A"}</Typography>
                <Typography sx={{ flex: 0.5 }}>{item.weight || 0}</Typography>
                <Typography sx={styles.scoreGreen}>{item.score?.toFixed(2) || 0}</Typography>
                <Tooltip title={item.explanation || "N/A"} arrow placement="top">
                  <Typography sx={{ flex: 1.5, fontSize: "0.95vw", color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "help" }}>
                    {item.explanation || "N/A"}
                  </Typography>
                </Tooltip>
              </Box>
            ))
          ) : (candidate.fullData?.scoreBreakdown && Array.isArray(candidate.fullData.scoreBreakdown) && candidate.fullData.scoreBreakdown.length > 0) ? (
            candidate.fullData.scoreBreakdown.map((item: any, i: number) => (
              <Box key={i} sx={styles.tableRow}>
                <Typography sx={{ flex: 1, fontWeight: 500 }}>{item.criterion || "N/A"}</Typography>
                <Typography sx={{ flex: 0.5 }}>{item.weight || 0}</Typography>
                <Typography sx={styles.scoreGreen}>{item.score?.toFixed(2) || 0}</Typography>
                <Tooltip title={item.explanation || "N/A"} arrow placement="top">
                  <Typography sx={{ flex: 1.5, fontSize: "0.95vw", color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "help" }}>
                    {item.explanation || "N/A"}
                  </Typography>
                </Tooltip>
              </Box>
            ))
          ) : candidate.rules && candidate.rules.length > 0 ? (
            candidate.rules.map((rule, i) => (
              <Box key={i} sx={styles.tableRow}>
                <Typography>{rule.rule_name || `Rule ${rule.rule_number}`}</Typography>
                <Typography sx={styles.scoreGreen}>{rule.score?.toFixed(1) || 0}</Typography>
                <Typography>{rule.threshold || 0}</Typography>
                <Tooltip title={rule.rule_name || "N/A"} arrow placement="top">
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: rule.status === "MATCHED" ? "#10b981" : "#ef4444",
                      cursor: "help",
                    }}
                  >
                    {rule.status || "N/A"}
                  </Typography>
                </Tooltip>
              </Box>
            ))
          ) : (
            <Box sx={styles.tableRow}>
              <Typography>No breakdown data available</Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography sx={styles.totalScore}>
            Total = <span>{candidate.score || 0}%</span>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateAnalysisModal;
