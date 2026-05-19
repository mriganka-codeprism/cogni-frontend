import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import WifiIcon from "@mui/icons-material/Wifi";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DnsIcon from "@mui/icons-material/Dns";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import Home from "@mui/icons-material/Home";
import { useNetworkDiagnostics } from "../hooks/useNetworkDiagnostics";
import { diagnosticsStyles } from "../styles/networkDiagnostics.styles";
import { CheckStatus, DiagnosticCheck } from "../types/networkDiagnostics";
import Wifi from "../assets/images/Wifi.png";
import networkperformance from "../assets/images/networkperformance.png";
import browser from "../assets/images/browser.png";
import { useNavigate } from "react-router-dom";
import { routes } from "../constants/routes";

const firewallRules = [
  { service: "API Server", protocol: "HTTPS", port: "443", direction: "Outbound", requiredFor: "All API calls" },
  { service: "LiveKit Signaling", protocol: "WSS", port: "7882", direction: "Outbound", requiredFor: "Video interview setup" },
  { service: "LiveKit Media", protocol: "UDP", port: "50000-60000", direction: "Bidirectional", requiredFor: "Video/audio streaming" },
  { service: "STUN", protocol: "UDP", port: "19302", direction: "Outbound", requiredFor: "NAT traversal" },
];

function getOverallStatus(categories: { checks: DiagnosticCheck[] }[]): CheckStatus {
  let hasRunning = false;
  let hasFail = false;
  let hasWarn = false;
  let allPending = true;

  categories.forEach((cat) =>
    cat.checks.forEach((ch) => {
      if (ch.status !== "pending") allPending = false;
      if (ch.status === "running") hasRunning = true;
      if (ch.status === "fail") hasFail = true;
      if (ch.status === "warn") hasWarn = true;
    })
  );

  if (allPending) return "pending";
  if (hasRunning) return "running";
  if (hasFail) return "fail";
  if (hasWarn) return "warn";
  return "pass";
}

function getCategorySummary(checks: DiagnosticCheck[]): {
  status: CheckStatus;
  label: string;
} {
  const pass = checks.filter((c) => c.status === "pass").length;
  const warn = checks.filter((c) => c.status === "warn").length;
  const fail = checks.filter((c) => c.status === "fail").length;
  const running = checks.filter((c) => c.status === "running").length;
  const total = checks.length;

  if (running > 0) return { status: "running", label: "Testing..." };
  if (checks.every((c) => c.status === "pending")) return { status: "pending", label: "Not tested" };
  if (fail > 0) return { status: "fail", label: `${fail}/${total} failed` };
  if (warn > 0) return { status: "warn", label: `${pass} passed, ${warn} warning(s)` };
  return { status: "pass", label: `${pass}/${total} passed` };
}

const overallLabels: Record<CheckStatus, string> = {
  pending: "Not Tested",
  running: "Testing...",
  pass: "All Checks Passed",
  warn: "Warnings Detected",
  fail: "Issues Found",
};

const CheckRow: React.FC<{ check: DiagnosticCheck }> = ({ check }) => {
  const isActive = check.status === "running";

  return (
    <Box sx={diagnosticsStyles.checkRow}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        {isActive ? (
          <CircularProgress size="1.6vh" sx={{ color: "#065F46", marginTop: '0.5vh' }} />
        ) : (
          <Box sx={diagnosticsStyles.statusDot(check.status)} />
        )}
      </Box>
      <Typography sx={diagnosticsStyles.checkName}>{check.name}</Typography>
      <Typography sx={diagnosticsStyles.checkValue}>
        {isActive ? "Testing..." : (check.value || "—")}
      </Typography>
      <Box sx={diagnosticsStyles.checkDescriptionBox}>
        <Typography sx={diagnosticsStyles.checkDescription}>
          {check.description}
        </Typography>
        {check.thresholds && (
          <Typography sx={diagnosticsStyles.checkThresholds}>
            {check.thresholds}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const categoryIcons: Record<string, React.ReactNode> = {
  network: <img src={networkperformance} alt="" style={{ height: "2vh", width: "auto" }} />,
  browser: <img src={browser} alt="" style={{ height: "2vh", width: "auto" }} />,
  connections: <DnsIcon sx={{ fontSize: "2.4vh" }} />,
};

const NetworkDiagnostics: React.FC = () => {
  const navigate = useNavigate();
  const { categories, isRunning, progress, totalChecks, runAllTests, generateReport } =
    useNetworkDiagnostics();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const overall = getOverallStatus(categories);
  const progressPct = totalChecks > 0 ? Math.round((progress / totalChecks) * 100) : 0;

  const handleCopyReport = async () => {
    const report = generateReport();
    try {
      await navigator.clipboard.writeText(report);
      setSnackbar({ open: true, message: "Report copied to clipboard" });
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = report;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setSnackbar({ open: true, message: "Report copied to clipboard" });
    }
  };

  const handleDownloadReport = () => {
    const report = generateReport();
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mutalent-diagnostics-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={diagnosticsStyles.pageContainer}>
      {/* Header */}
      <Box sx={diagnosticsStyles.headerBox}>
        <Box sx={diagnosticsStyles.headerLeft}>
          <IconButton onClick={() => navigate(routes.adminHome)} sx={{ p: "0.6vh", mr: "1vh" }}>
            <Home sx={{ fontSize: "2.4vh", color: "#333", fontFamily: "Poppins, sans-serif" }} />
          </IconButton>
          <Box sx={diagnosticsStyles.iconCircle}>
            <img src={Wifi} alt="" style={{ height: "2.6vh", width: "auto" }} />
          </Box>
          <Box sx={diagnosticsStyles.titleStack}>
            <Typography sx={diagnosticsStyles.pageTitle}>Network Diagnostics</Typography>
            <Typography sx={diagnosticsStyles.pageSubtitle}>muCognitron System Health Check</Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          sx={diagnosticsStyles.runButton}
          onClick={runAllTests}
          disabled={isRunning}
          startIcon={
            isRunning ? (
              <CircularProgress size="1.6vh" sx={{ color: "#fff" }} />
            ) : (
              <PlayArrowIcon sx={{ fontSize: "2.5vh" }} />
            )
          }
        >
          {isRunning ? "Running..." : "Run All Tests"}
        </Button>
      </Box>

      <Box sx={diagnosticsStyles.scrollContainer}>
        {/* Overall Status + Progress */}
        <Box sx={diagnosticsStyles.overallStatusBox}>
          <Box sx={diagnosticsStyles.statusTopRow}>
            <Box sx={diagnosticsStyles.overallBadge}>
              {overall === "pending" ? "Not Tested" : overallLabels[overall]}
            </Box>
            <Typography sx={diagnosticsStyles.progressText}>
              {progress}/{totalChecks} checks
            </Typography>
          </Box>
          <Box sx={diagnosticsStyles.progressBarContainer}>
            <Box sx={diagnosticsStyles.progressBar(progressPct)} />
          </Box>
        </Box>

        {/* Category Accordions */}
        {categories.map((cat) => {
          const summary = getCategorySummary(cat.checks);
          return (
            <Accordion key={cat.id} defaultExpanded sx={diagnosticsStyles.accordion}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ fontSize: "2.5vh" }} />}
                sx={diagnosticsStyles.accordionSummary}
              >
                <Box sx={diagnosticsStyles.categoryIcon}>
                  {categoryIcons[cat.id] || <WifiIcon sx={{ fontSize: "2.4vh" }} />}
                </Box>
                <Typography sx={diagnosticsStyles.categoryTitle}>
                  {cat.title}
                </Typography>
                <Box sx={diagnosticsStyles.categorySummaryChip(summary.status)}>
                  {summary.label}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: "0 2vw 2vh" }}>
                {cat.checks.map((check) => (
                  <CheckRow key={check.id} check={check} />
                ))}
              </AccordionDetails>
            </Accordion>
          );
        })}

        {/* Firewall Requirements */}
        <Box sx={diagnosticsStyles.firewallSection}>
          <Box sx={diagnosticsStyles.firewallHeader}>
            <Box sx={diagnosticsStyles.firewallIconCircle}>
              <ShieldOutlinedIcon sx={{ fontSize: "2.4vh" }} />
            </Box>
            <Box sx={diagnosticsStyles.firewallTitleBox}>
              <Typography sx={diagnosticsStyles.firewallTitle}>
                Firewall Requirements for IT Staff
              </Typography>
              <Typography sx={diagnosticsStyles.firewallSubtitle}>
                Configure these rules to enable full platform functionality
              </Typography>
            </Box>
          </Box>

          <Table sx={diagnosticsStyles.firewallTable}>
            <TableHead>
              <TableRow>
                <TableCell>Service</TableCell>
                <TableCell>Protocol</TableCell>
                <TableCell>Port</TableCell>
                <TableCell>Direction</TableCell>
                <TableCell>Required For</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {firewallRules.map((rule) => (
                <TableRow key={rule.service}>
                  <TableCell>
                    <Box sx={diagnosticsStyles.serviceCell}>
                      <Box sx={diagnosticsStyles.serviceDot} />
                      {rule.service}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={diagnosticsStyles.protocolChip}>
                      {rule.protocol}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={diagnosticsStyles.portText}>
                      {rule.port}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={diagnosticsStyles.directionChip(rule.direction)}>
                      {rule.direction}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={diagnosticsStyles.requiredForText}>
                      {rule.requiredFor}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* Report Actions */}
        <Box sx={diagnosticsStyles.actionsBox}>
          <Button
            variant="outlined"
            sx={diagnosticsStyles.actionButton}
            onClick={handleCopyReport}
            disabled={overall === "pending" || overall === "running"}
            startIcon={<ContentCopyIcon sx={{ fontSize: "1.8vh" }} />}
          >
            Copy Report
          </Button>
          <Button
            variant="outlined"
            sx={diagnosticsStyles.actionButton}
            onClick={handleDownloadReport}
            disabled={overall === "pending" || overall === "running"}
            startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: "1.8vh" }} />}
          >
            Download Report (.txt)
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ open: false, message: "" })}
          severity="success"
          sx={{ fontSize: "1.5vh" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NetworkDiagnostics;
