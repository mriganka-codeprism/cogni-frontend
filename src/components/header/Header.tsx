import { Box, CssBaseline, Divider, Icon, IconButton, Typography, Menu, MenuItem, Avatar } from "@mui/material";
import { styles } from "./header.styles";
import Text from "../textComponent";
import { globalStyles } from "../../config";
import { useLocation, useNavigate, useMatch } from "react-router-dom";
import { routes } from "../../constants/routes";
import ArrowBackIosOutlinedIcon from '@mui/icons-material/ArrowBackIosOutlined';
import PersonIcon from '@mui/icons-material/Person';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import SavedSearchOutlinedIcon from '@mui/icons-material/SavedSearchOutlined';
import { useCandidateStore } from "../../store/candidateStore";
import { logoConfig } from "../../constants/screensData";
import { logoutUser } from "../../api/api";
import React, { useState, useEffect } from "react";

function Header() {
  const location = useLocation()
  const navigate = useNavigate();
  const candidateSummaryMatch = useMatch('/candidate-evaluation/:id');
  const jobDetailsMatch = useMatch(routes.jobDetails);
  const isCallPage = location.pathname === routes.call;
  const isTranscriptionPage = location.pathname === routes.transcription;
  const isCollegePage = location.pathname === routes.collegeConfig;
  const isResumeUploadPage = location.pathname === routes.resumeUpload;
  const isCandidateSelectionPage = location.pathname === routes.aptitudeEvaluation;
  const isCandidateSummaryPage = !!candidateSummaryMatch;

  const user = useCandidateStore((state) => state.tokenPayload);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isCandidateHomePage = location.pathname === routes.candidateHome;
  const userName = (user as any)?.name || 'Kaushal';
  const userInitial = String(userName)?.[0]?.toUpperCase() || 'K';

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path: string) => {
    handleMenuClose();
    navigate(path);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logoutUser();
    sessionStorage.clear();
    navigate(routes.login);
  };

  const isAdminPage = location.pathname === routes.adminHome || location.pathname === routes.candidateEvaluation || location.pathname === routes.category;
  const isLateralPage = location.pathname === routes.lateralAdmin || location.pathname.startsWith('/create-job') || !!jobDetailsMatch || location.pathname === routes.atsProcessing || location.pathname === routes.frameworkDetails || location.pathname === routes.savedDrafts;

  return (
    <div style={{ width: "100%" }}>
      <CssBaseline />
      <Box
        sx={{
          ...styles.appbar,
        }}
      >
        {(isCallPage || isTranscriptionPage || isCandidateSummaryPage || isCandidateSelectionPage) && (
          <>
            <IconButton sx={styles.iconButton} onClick={() => {
              navigate(-1)
            }}>
              <ArrowBackIosOutlinedIcon fontSize="small" sx={styles.icon} />
            </IconButton>
            {isCallPage && (
              <Text
                text={`Interview Session : ${user?.sub ?? "1a70149c-0474-441f-b01d-1ba2adf408e7"}`}
                styles={styles.text1}
              />
            )}
          </>
        )}
        {/* Absolutely Centered Title */}
        {!isCallPage && (
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <Typography variant="h4" sx={styles.text}>
              <span style={{ color: "#006b66" }}>mu</span>
              <span style={{ color: "#86161B" }}>Cognitron</span>
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "1.5vh",
            flexGrow: 1,
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "1.5vh" }}>
            <Box sx={{ justifyContent: 'flex-start' }}>
              <img
                src={logoConfig.muSigmaLogo}
                alt="Logo"
                style={styles.logo}
              />
            </Box>
            <img
              src={logoConfig.muSigmaLabsLogo}
              alt="Mu Sigma Labs"
              style={{ height: "4vh" }}
            />

          </Box>

          {/* Profile Dropdown in Top Right */}
          {!(isCallPage || isCandidateSummaryPage || isCandidateHomePage) && (
            <Box sx={{ display: "flex", alignItems: "center", marginRight: "2vh" }}>
              <IconButton
                onClick={handleProfileClick}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8vh",
                  padding: "0.5vh 1vh",
                  borderRadius: "2vh",
                  backgroundColor: "#f5f5f5",
                  "&:hover": {
                    backgroundColor: "#e0e0e0",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: "3.2vh",
                    height: "3.2vh",
                    backgroundColor: "#006b66",
                    fontSize: "1.4vh",
                    fontWeight: 600,
                  }}
                >
                  {userInitial}
                </Avatar>
                <Typography
                  sx={{
                    fontSize: "1.3vh",
                    fontWeight: 600,
                    color: "#333",
                    textTransform: "capitalize",
                  }}
                >
                  {userName}
                </Typography>
              </IconButton>

              {/* Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    borderRadius: "1.5vh",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    minWidth: "20vh",
                  },
                }}
              >
                <MenuItem
                  onClick={() => handleMenuItemClick(isLateralPage ? routes.createJob : routes.category)}
                >
                  <AdminPanelSettingsOutlinedIcon sx={{ marginRight: "1vh", fontSize: "1.8vh" }} />
                  <Typography sx={{ fontSize: "1.5vh" }}>
                    Admin Management
                  </Typography>
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick(routes.networkDiagnostics)}>
                  <TuneOutlinedIcon sx={{ marginRight: "1vh", fontSize: "1.8vh" }} />
                  <Typography sx={{ fontSize: "1.5vh" }}>Network Diagnostics</Typography>
                </MenuItem>
                <MenuItem
                  disabled={isAdminPage}
                  onClick={() => handleMenuItemClick(routes.savedDrafts)}
                >
                  <SavedSearchOutlinedIcon sx={{ marginRight: "1vh", fontSize: "1.8vh" }} />
                  <Typography sx={{ fontSize: "1.5vh" }}>Saved Drafts</Typography>
                </MenuItem>
                <Divider sx={{ my: "0.8vh" }} />
                <MenuItem onClick={handleLogout}>
                  <LogoutOutlinedIcon sx={{ marginRight: "1vh", fontSize: "1.8vh" }} />
                  <Typography sx={{ fontSize: "1.5vh" }}>Sign Out</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Box>


      </Box>
      <Divider
        variant="middle"
        sx={{
          ...((isCallPage || isTranscriptionPage)
            ? {
              margin: '0vh',
              flexShrink: 0,
              borderWidth: "0.1vh",
              borderStyle: "solid",
              borderColor: "#7d91aa",
              borderBottomWidth: "0.1vh",
              marginLeft: "2vh",
              marginRight: "2vh",
              width: "auto",
            }
            : styles.divider),
        }}
      />
    </div>
  );
}

export default Header;