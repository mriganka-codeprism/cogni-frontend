import React, { useEffect, useState, useRef } from "react";
import { Box, Avatar, IconButton, Tooltip } from "@mui/material";
import { logoConfig } from "../../constants/screensData";
import { sidebarstyles } from "./sidebar.styles";
import { useLocation, useNavigate } from "react-router-dom";
import { useMenuItems } from "../hooks/useMenuItems";
import { routes } from "../../constants/routes";
import { Popover, Typography, Divider } from "@mui/material";
import CustomButton from "../button";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { globalStyles } from "../../config";
import Text from "../textComponent";
import { useCandidateStore } from "../../store/candidateStore";
import { logoutUser, submitAtsJobDraft } from "../../api/api";
import { useDraftsStore } from "../../store/draftsStore";
import LeaveJobCreationModal from "../LeaveJobCreationModal";
import uploadexcel from "../assets/images/uploadexcel.png";
import loginadmin from "../../assets/images/loginadmin.png";

const Sidebar = () => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const user = useCandidateStore((state) => state.tokenPayload);

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = useMenuItems();
  const { isDirty, setDirty, drafts, addDraft, removeDraft, setPendingLocation, pendingLocation, showLeaveModal, setShowLeaveModal } = useDraftsStore();
  const [anchorEl, setAnchorEl] = useState(null);


  useEffect(() => {
    if (user?.role != 'admin') {
      sessionStorage.clear();
    }
  }, [user?.role]);


  const handleAvatarClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    if (isDirty) {
      setPendingLocation("/");
      setShowLeaveModal(true);
      return;
    }
    await logoutUser();
    sessionStorage.clear();
    sessionStorage.clear();
    navigate("/"); // Assuming "/" is your login route
  };
  // Filter sidebar icons based on role
  const filteredMenuItems = React.useMemo(() => {
    return menuItems;
  }, [menuItems]);

  // Separate Home item
  const homeItem = filteredMenuItems.find((item) => item.title === "Home");
  const savedDraftsItem = filteredMenuItems.find((item) => item.title === "Saved Drafts");
  const networkDiagnosticsItem = filteredMenuItems.find((item) => item.title === "Network Diagnostics");

  // Determine if we're in Lateral mode based on current route
  const isNetworkDiagnostics = location.pathname.startsWith(routes.networkDiagnostics);
  const isLateralRoute = location.pathname.startsWith(routes.createJob) ||
    location.pathname.startsWith("/job-details") ||
    // location.pathname.startsWith(routes.frameworkDetails) ||
    location.pathname.startsWith(routes.savedDrafts);

  const lastModeRef = useRef<boolean>(false);

  if (!isNetworkDiagnostics) {
    lastModeRef.current = isLateralRoute;
  }

  const isLateralMode = isNetworkDiagnostics ? lastModeRef.current : isLateralRoute;

  const lateralTitles = ["Create Job"];
  const fresherTitles = ["Category"];

  const otherItems = filteredMenuItems.filter((item) => {
    if (item.title === "Home" || item.title === "Saved Drafts" || item.title === "Network Diagnostics") return false;
    if (isLateralMode) return lateralTitles.includes(item.title);
    return fresherTitles.includes(item.title);
  });

  // Sync selected tab and joined interview flag based on URL
  useEffect(() => {
    // Find all matching items and select the one with the longest href (most specific match)
    const matchedIndices = filteredMenuItems
      .map((item, idx) => ({ idx, item }))
      .filter(({ item }) => location.pathname.startsWith(item.href))
      .sort((a, b) => b.item.href.length - a.item.href.length); // Sort by href length descending

    const matchedIndex = matchedIndices.length > 0 ? matchedIndices[0].idx : -1;

    if (matchedIndex !== -1 && matchedIndex !== selectedIndex) {
      setSelectedIndex(matchedIndex);
      sessionStorage.setItem("lastSidebarIndex", String(matchedIndex)); // persist
    }

    if (matchedIndex === -1) {
      const saved = sessionStorage.getItem("lastSidebarIndex");
      if (saved !== null && Number(saved) !== selectedIndex) {
        setSelectedIndex(Number(saved));
      }
    }
  }, [location.pathname, filteredMenuItems, selectedIndex]);

  return (
    <Box sx={sidebarstyles.box}>
      {/* Top Logo */}
      {/* <Box sx={{ mb: '2vh',justifyContent:'flex-start' }}>
        <img
          src={logoConfig.muSigmaLogo}
          alt="Logo"
          style={sidebarstyles.logo}
        />
      </Box> */}

      {/* Nav Icons */}
      <Box
        sx={{ ...sidebarstyles.box1, flexDirection: "column", height: "100%" }}
      >
        {/* Home Icon (only in Fresher mode) */}
        {!isLateralMode && homeItem && (
          <Tooltip key={homeItem.id} title={homeItem.title} placement="right" sx={{ fontSize: '2vh' }}>
            <Box
              onClick={() => {
                const targetIndex = filteredMenuItems.findIndex((item) => item.id === homeItem.id);
                if (isDirty) {
                  setPendingLocation(homeItem.href);
                  setShowLeaveModal(true);
                  return;
                }
                setSelectedIndex(targetIndex);
                navigate(homeItem.href);
              }}
              sx={{
                ...sidebarstyles.box2,
              }}
            >
              {selectedIndex ===
                filteredMenuItems.findIndex(
                  (item) => item.id === homeItem.id
                ) && <Box sx={sidebarstyles.box3} />}
              <IconButton
                disableRipple
                sx={{
                  transform: `scale(${1.2})`,
                  transition: "transform 0.3s",
                  padding: "1vh",
                  fontSize: "3vh",
                  color:
                    selectedIndex ===
                      filteredMenuItems.findIndex(
                        (item) => item.id === homeItem.id
                      )
                      ? "#006b66"
                      : "#006b66",
                }}
              >
                {React.cloneElement(homeItem.icon, {
                  sx: {
                    fontSize: selectedIndex ===
                      filteredMenuItems.findIndex(
                        (item) => item.id === homeItem.id
                      )
                      ? "3vh"
                      : "3vh",
                    color:
                      selectedIndex ===
                        filteredMenuItems.findIndex(
                          (item) => item.id === homeItem.id
                        )
                        ? "#009688"
                        : "#006b66",

                  },
                })}
              </IconButton>
            </Box>
          </Tooltip>
        )}

        {/* Other Icons */}
        <Box>
          {otherItems.map((item) => {
            const index = filteredMenuItems.findIndex((i) => i.id === item.id);
            const isSelected = selectedIndex === index;

            // Disable "Call" tab on candidateHome, and disable "Home" tab on call
            const shouldDisable =
              (user?.role != 'admin' &&
                item.title === "Call") ||
              (location.pathname === routes.call && item.title === "Home");

            const iconColor = isSelected ? "#006b66" : shouldDisable ? "#a0a0a0" : "#006b66";

            return (
              <Tooltip key={item.id} title={item.title} placement="right" sx={{ fontSize: '2vh' }}>
                <Box
                  onClick={() => {
                    if (!shouldDisable) {
                      if (isDirty) {
                        setPendingLocation(item.href);
                        setShowLeaveModal(true);
                        return;
                      }
                      setSelectedIndex(index);
                      navigate(item.href);
                    }
                  }}
                  sx={{
                    // transform: "scale(1.2)",
                    transition: "transform 0.3s",
                    color: iconColor,
                    // fontSize: "2.5vh",
                    cursor: shouldDisable ? "not-allowed" : "pointer",
                    opacity: shouldDisable ? 0.4 : 1,
                    ...sidebarstyles.box2,
                  }}
                >
                  {isSelected && <Box sx={sidebarstyles.box3} />}
                  <IconButton
                    disableRipple
                    disabled={shouldDisable}
                    sx={{
                      transform: isSelected ? "scale(1.2)" : "scale(1.2)",
                      transition: "transform 0.2s ease-in-out",
                      color: iconColor,
                      padding: "0vh",
                      // fontSize: "2.5vh",
                    }}
                  >
                    {React.cloneElement(item.icon, {
                      sx: {
                        color: iconColor,
                        padding: "0vh",
                        fontSize: isSelected ? "2.8vh" : "3vh",
                        // fontSize: isSelected ? "3vh" : "2vh",
                        transition: "font-size 0.1s ease-in-out",
                      },
                    })}
                  </IconButton>
                </Box>
              </Tooltip>
            );
          })}
        </Box>

        {/* Saved Drafts Icon (shown in lateral mode) */}
        {isLateralMode && savedDraftsItem && (
          <Tooltip key={savedDraftsItem.id} title={savedDraftsItem.title} placement="right" sx={{ fontSize: '2vh' }}>
            <Box
              onClick={() => {
                const targetIndex = filteredMenuItems.findIndex((item) => item.id === savedDraftsItem.id);
                if (isDirty) {
                  setPendingLocation(savedDraftsItem.href);
                  setShowLeaveModal(true);
                  return;
                }
                setSelectedIndex(targetIndex);
                navigate(savedDraftsItem.href);
              }}
              sx={{
                ...sidebarstyles.box2,
              }}
            >
              {selectedIndex ===
                filteredMenuItems.findIndex(
                  (item) => item.id === savedDraftsItem.id
                ) && <Box sx={sidebarstyles.box3} />}
              <IconButton
                disableRipple
                sx={{
                  transform: 'scale(1.2)',
                  transition: 'transform 0.2s ease-in-out',
                  color: selectedIndex === filteredMenuItems.findIndex((item) => item.id === savedDraftsItem.id) ? '#006b66' : '#006b66',
                  padding: '0vh',
                }}
              >
                {React.cloneElement(savedDraftsItem.icon, {
                  sx: {
                    color: selectedIndex === filteredMenuItems.findIndex((item) => item.id === savedDraftsItem.id) ? '#009688' : '#006b66',
                    padding: '0vh',
                    fontSize: selectedIndex === filteredMenuItems.findIndex((item) => item.id === savedDraftsItem.id) ? '2.8vh' : '3vh',
                    transition: 'font-size 0.1s ease-in-out',
                  },
                })}
              </IconButton>
            </Box>
          </Tooltip>
        )}
      </Box>

      {/* Network Diagnostics Icon at Bottom */}
      {networkDiagnosticsItem && (
        <Tooltip key={networkDiagnosticsItem.id} title={networkDiagnosticsItem.title} placement="right" sx={{ fontSize: '2vh' }}>
          <Box
            onClick={() => {
              const targetIndex = filteredMenuItems.findIndex((item) => item.id === networkDiagnosticsItem.id);
              if (isDirty) {
                setPendingLocation(networkDiagnosticsItem.href);
                setShowLeaveModal(true);
                return;
              }
              setSelectedIndex(targetIndex);
              navigate(networkDiagnosticsItem.href);
            }}
            sx={{
              ...sidebarstyles.box2,
              mb: '1vh',
            }}
          >
            {selectedIndex ===
              filteredMenuItems.findIndex(
                (item) => item.id === networkDiagnosticsItem.id
              ) && <Box sx={sidebarstyles.box3} />}
            <IconButton
              disableRipple
              sx={{
                transform: `scale(${1.2})`,
                transition: "transform 0.3s",
                padding: "1vh",
                fontSize: "3vh",
                color: "#006b66",
              }}
            >
              {React.cloneElement(networkDiagnosticsItem.icon, {
                sx: {
                  fontSize: "3vh",
                  color:
                    selectedIndex ===
                      filteredMenuItems.findIndex(
                        (item) => item.id === networkDiagnosticsItem.id
                      )
                      ? "#009688"
                      : "#006b66",
                },
              })}
            </IconButton>
          </Box>
        </Tooltip>
      )}

      {!(
        user?.role != 'admin' ||
        location.pathname === routes.call
      ) && (
          <img
            src={loginadmin}
            alt=""
            style={{ height: "2.5vh", width: "auto", color: "#5f0101", cursor: "pointer" }}
            onClick={handleAvatarClick}
          />
        )}

      {/* User Avatar */}

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        PaperProps={{
          sx: { padding: '2vh', minWidth: '25vw' },
        }}
      >
        <Text type="body" styles={{ fontSize: '2.1vh' }}>
          {user?.name as string}
        </Text>
        <Text type="body" color="light" styles={{ mb: '1vh', fontSize: '2.1vh' }}>
          {user?.email as string}
        </Text>

        <Divider sx={{ my: '1vh' }} />
        <Box
          sx={{ display: "flex", alignItems: "center", mb: '1vh', gap: "0.5vh" }}
        >
          <LogoutOutlinedIcon sx={{ color: globalStyles.colors.primary, fontSize: '2.3vh' }} />
          <CustomButton
            fullWidth
            type="tertiary"
            color="light"
            onClick={handleLogout}
            additionalStyles={{ padding: "0vh" }}
          >
            Logout
          </CustomButton>
        </Box>
      </Popover>

      <LeaveJobCreationModal
        open={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={(action) => {
          const STORAGE_KEYS = {
            basic: "createJobPostForm",
            evaluation: "evaluationCriteriaForm",
            other: "otherDetailsForm",
            ats: "atsDetailsForm",
            criteriaMode: "criteriaMode",
            questionnaire: "questionnaireForm",
          };

          if (action === "save") {
            const getReviewData = () => {
              const savedBasic = sessionStorage.getItem("createJobPostForm");
              const savedEval = sessionStorage.getItem("evaluationCriteriaForm");
              const savedOther = sessionStorage.getItem("otherDetailsForm");
              const savedATS = sessionStorage.getItem("atsDetailsForm");
              const savedMode = sessionStorage.getItem("criteriaMode");
              const savedQuestions = sessionStorage.getItem("questionnaireForm");
              const savedFrameworks = sessionStorage.getItem("frameworkDetailsForm");

              const basicDetails = savedBasic ? JSON.parse(savedBasic) : null;
              const evaluationCriteria = savedEval ? JSON.parse(savedEval) : null;
              const otherData = savedOther ? JSON.parse(savedOther) : null;
              const questionnaireData = savedQuestions ? JSON.parse(savedQuestions) : [];
              const frameworksData = savedFrameworks ? JSON.parse(savedFrameworks) : null;

              return {
                basicDetails,
                evaluationCriteria,
                otherDetails: otherData,
                atsDetails: savedATS ? JSON.parse(savedATS) : {},
                criteriaMode: savedMode,
                questionnaire: questionnaireData,
                frameworks: frameworksData,
                criteria: evaluationCriteria, // Map evaluationCriteria to criteria for sync
              };
            };

            const data = getReviewData();

            // Infer progress for sidebar save
            const labels = data.criteriaMode === "upload" ?
              ["Basic Details", "questionnaire", "Interview Settings", "ATS Configuration"] :
              ["Basic Details", "Focus of Evaluation", "Interview Settings", "ATS Configuration"];

            let inferredStep = 0;
            const savedStep = sessionStorage.getItem("currentActiveStep");
            if (savedStep) {
              inferredStep = parseInt(savedStep, 10);
            } else {
              if (data.atsDetails && Object.keys(data.atsDetails).length > 0) inferredStep = labels.length - 1;
              else if (data.otherDetails && Object.keys(data.otherDetails).length > 0) inferredStep = labels.length - 2;
              else if (data.evaluationCriteria) inferredStep = 2;
              else if (data.questionnaire && data.questionnaire.length > 0) inferredStep = 1;
            }

            const progress = Math.round(((inferredStep + 1) / labels.length) * 100);

            let draftId = sessionStorage.getItem("currentDraftId");
            if (!draftId) {
              draftId = Date.now().toString();
              sessionStorage.setItem("currentDraftId", draftId);
            }

            try {
              // ✅ Step 1: Sync draft to backend API
              const token = sessionStorage.getItem("access_token") || "";
              const realDraftId = sessionStorage.getItem("realDraftId");
              
              // Only sync if we have a title or description (minimum required for backend)
              if (data.basicDetails?.jobTitle) {
                console.log("🔄 Syncing draft to backend from Sidebar...");
                submitAtsJobDraft(
                  token,
                  data.basicDetails?.jobTitle,
                  data.basicDetails?.jobDescription,
                  data.atsDetails?.threshold,
                  {
                    skills_required: Number(data.atsDetails?.weights?.requiredSkill || 10),
                    skills_preferred: Number(data.atsDetails?.weights?.preferredSkill || 15),
                    education_alignment: Number(data.atsDetails?.weights?.educationAlignment || 30),
                    experience_alignment: Number(data.atsDetails?.weights?.experienceAlignment || 15),
                    responsibility_overlap: Number(data.atsDetails?.weights?.responsibilityOverlap || 30),
                  },
                  {
                    role: data.otherDetails?.role || "Lateral",
                    category: data.otherDetails?.roleCategory || "",
                    duration: Number(data.otherDetails?.duration || 30),
                    questionPersonalizer: data.otherDetails?.questionLevel || "",
                    interviewMode:
                      data.otherDetails?.interviewMode === "Avatar"
                        ? "Avatar Based Interview"
                        : "Audio",
                    avatar: Array.isArray(data.otherDetails?.avatar) ? data.otherDetails.avatar[0] : (data.otherDetails?.avatar || ""),
                    avatarOptions: Array.isArray(data.otherDetails?.avatar) ? data.otherDetails.avatar : (data.otherDetails?.avatar ? [data.otherDetails.avatar] : []),
                    cutOff: Number(data.otherDetails?.cutoff || 3),
                    codingRound: data.otherDetails?.codingRound || "No",
                    numberOfQuestions: Number(data.otherDetails?.numberOfQuestions || 1),
                    codingTimeLimit: Number(data.otherDetails?.codingTimeLimit || 15),
                  },
                  data.questionnaire,
                  data.frameworks ? [data.frameworks] : undefined, // Frameworks if any
                  data.criteria?.criteriaList?.map((title: string, index: number) => ({
                    criteriaTitle: title,
                    criteriaDescription: data.criteria.generatedList?.[index] || ""
                  })), // Map to API format
                  realDraftId || undefined // Use existing ID if it's a resumed draft
                ).then(response => {
                  const newDraftId = response?.id || response?.job_id;
                  if (newDraftId) {
                    console.log("✅ Sidebar draft synced to backend:", newDraftId);
                    sessionStorage.setItem("realDraftId", newDraftId);
                  }
                }).catch(err => {
                  console.error("❌ Sidebar draft sync failed:", err);
                });
              }

              // ✅ Step 2: Save to local store for UI feedback
              addDraft({
                id: realDraftId || draftId,
                title: data.basicDetails?.jobTitle || "Untitled Job",
                description: data.basicDetails?.jobDescription || "",
                savedAt: new Date().toISOString(),
                progress: progress,
                stoppedAt: labels[inferredStep],
                activeStep: inferredStep,
                tags: [
                  data.criteriaMode === "upload" ? "Questionnaire-Based" : "Framework-Based",
                  "Lateral"
                ],
                data: data,
              });
              Object.values(STORAGE_KEYS).forEach(key => sessionStorage.removeItem(key));
              sessionStorage.removeItem("questionnaireFiles");
              sessionStorage.removeItem("currentDraftId");
              sessionStorage.removeItem("currentActiveStep");
            } catch (error: any) {
              if (error.name === 'QuotaExceededError' || error.message?.includes('quota')) {
                alert("Storage full! Please delete some old drafts to save new ones.");
              }
            }
          } else {
            // Exit Editing (Discard)
            const draftCleanupKeys = [
              "createJobPostForm",
              "evaluationCriteriaForm",
              "otherDetailsForm",
              "atsDetailsForm",
              "criteriaMode",
              "questionnaireForm",
              "questionnaireFiles",
              "currentDraftId",
              "realDraftId",
              "tempDraftId",
              "currentActiveStep"
            ];

            const existingDraftId = sessionStorage.getItem("realDraftId") || sessionStorage.getItem("currentDraftId");
            if (existingDraftId) {
              removeDraft(existingDraftId);
            }

            draftCleanupKeys.forEach(key => sessionStorage.removeItem(key));
          }

          setDirty(false);
          setShowLeaveModal(false);
          if (pendingLocation) {
            navigate(pendingLocation);
            setPendingLocation(null);
          }
        }}
      />
    </Box>
  );
};

export default Sidebar;
