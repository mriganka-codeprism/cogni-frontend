import {
  Button,
  Box,
  Divider,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Tab,
  FormControlLabel,
  Radio,
  RadioGroup,
  Snackbar,
  Alert,
  IconButton,
  Stack,
  Typography,
  SelectChangeEvent,
  Tooltip,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../components/button";
import { FormControlComponent } from "../components/formControl";
import Text from "../components/textComponent";
import {
  copyJobDescription,
  createCategory,
  createCollege,
  createStream,
  getAllCategories,
  getAllFrameworks,
  getCollegeWithSettings,
  getJobDescription,
  getStreams,
  getUserModels,
  updateCollegeWithSettings,
  uploadJobDescription,
} from "../api/api";
import { globalStyles, RoleSwitch } from "../config";
import { categoryStyles } from "../styles/categoryManagement.styles";
import { Add, DeleteOutline, ArrowBack, Check, ArrowBackIosNew, ArrowForwardIos, CloudUploadOutlined, CheckCircle, InfoOutlined } from "@mui/icons-material";
import { routes } from "../constants/routes";
import { useLocation } from "react-router-dom";
import { ListSubheader } from "@mui/material";
import { StreamSetting } from "../types/college";
import { ReactComponent as UploadIcon } from "../assets/images/upload.svg";
import { ReactComponent as FileIcon } from "../assets/images/file.svg";

const formatFileSize = (sizeInBytes: number): string => {
  const sizeInKB = sizeInBytes / 1024;
  if (sizeInKB < 1024) {
    return `${sizeInKB.toFixed(2)} KB`;
  } else {
    const sizeInMB = sizeInKB / 1024;
    return `${sizeInMB.toFixed(2)} MB`;
  }
};

function CollegeConfigPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, collegeId, streamIds } = location.state || {};
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view";
  const [newCollege, setNewCollege] = useState("");
  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);
  const [streamOptions, setStreamOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [categories, setCategories] = useState<
    { id: string; categoryName: string }[]
  >([]);
  const [frameworks, setFrameworks] = useState<{ frameworks: string[] }>({
    frameworks: [],
  });
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [activeTab, setActiveTab] = useState<string>("");
  const [initialCategoryIds, setInitialCategoryIds] = useState<Set<string>>(new Set());
  const [streamSettings, setStreamSettings] = useState<
    Record<string, StreamSetting>
  >({});
  const [streamSelectOpen, setStreamSelectOpen] = useState(false);
  const [streamSearchQuery, setStreamSearchQuery] = useState("");
  const [isAddingStreamInline, setIsAddingStreamInline] = useState(false);
  const [inlineStreamInput, setInlineStreamInput] = useState("");
  const [userModels, setUserModels] = useState<string[]>([]);
  const [interviewType, setInterviewType] = useState<"audio" | "video">("video");
  const [jdFile, setJDFile] = useState<File | null>(null);
  const [jdIsUploaded, setJDisUploaded] = useState<boolean>(false);
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "warning" | "error" | "info">("success");
  const [showErrors, setShowErrors] = useState(false);
  const filteredStreamOptions = streamOptions.filter((option) =>
    option.name.toLowerCase().includes(streamSearchQuery.toLowerCase())
  );

  const checkIsStreamValid = (streamId: string) => {
    const s = streamSettings[streamId];
    if (!s) return false;

    // Required fields base
    const hasAvatar = Array.isArray(s.avatar) && s.avatar.length > 0;
    const hasQuestionScale = !!s.questionScale;
    const hasModelBehaviour = !!s.modelBehaviour;
    const hasPersonaType = !!s.personaType;
    const hasFramework = !!s.framework;
    const hasDuration = !!s.duration;
    const hasCutoff = !!s.cutoff;
    const hasCategories = Array.isArray(s.selectedCategories) && s.selectedCategories.length > 0;

    let baseValid = hasAvatar && hasQuestionScale && hasModelBehaviour && hasPersonaType && hasFramework && hasDuration && hasCutoff && hasCategories;

    // Coding round fields
    if (s.codingRound) {
      const hasCodingQuestionCount = !!s.codingQuestionCount;
      const hasCodingTimeLimit = !!s.codingTimeLimit;
      baseValid = baseValid && hasCodingQuestionCount && hasCodingTimeLimit;
    }

    return baseValid;
  };

  const isFormValid =
    newCollege.trim() !== "" &&
    selectedStreams.length > 0 &&
    selectedStreams.every((id) => checkIsStreamValid(id));

  const showIncompleteStreamsWarning =
    selectedStreams.length > 0 && !selectedStreams.every((id) => checkIsStreamValid(id));

  useEffect(() => {
    getStreams().then(setStreamOptions).catch(console.error);
    getAllCategories().then((cats) => {
      setCategories(cats);
      setInitialCategoryIds(new Set(cats.map((c: { id: string; categoryName: string }) => c.id)));
    }).catch(console.error);
    getAllFrameworks().then(setFrameworks).catch(console.error);
    getUserModels().then(setUserModels).catch(console.error);
    if ((isEditMode || isViewMode) && collegeId && streamIds[0]) {
      getJobDescription(collegeId, streamIds[0])
        .then((data) => {
          if (data.id) setJDisUploaded(true);
        })
        .catch(console.error);
    }

    if ((isEditMode || isViewMode) && collegeId && Array.isArray(streamIds)) {
      getCollegeWithSettings(collegeId).then((response) => {
        setNewCollege(response.name ?? ""); // Set college name
        setSelectedStreams(streamIds); // Set selected tabs
        if (response.streams?.[0]?.settingValue?.avatar) {
          setUserModels((prev) => {
            const existingModels = new Set([...prev, ...response.streams[0].settingValue.avatar]);
            return Array.from(existingModels);
          });
        }

        const settingsMap: Record<string, StreamSetting> = {};
        for (const stream of response.streams || []) {
          const { streamId, settingValue } = stream;
          settingsMap[streamId] = {
            questionScale: settingValue.questionScale ?? "Easy",
            modelBehaviour: settingValue.modelBehaviour ?? "Lenient",
            selectedCategories: settingValue.selectedCategories ?? [],
            personaType: settingValue.personaType ?? "Technical",
            framework: settingValue.framework ?? "DEFAULT",
            avatar: settingValue.avatar ?? ["MuSigma Interview Agent"],
            duration: settingValue.duration ?? 30,
            cutoff: settingValue.cutoff ?? 3,
            codingRound: settingValue.codingRound ?? false,
            proctoringEnabled: settingValue.proctoringEnabled ?? true,
            codingQuestionCount: settingValue.codingQuestionCount ?? 1,
            codingTimeLimit: settingValue.codingTimeLimit ?? 15,
          };
        }

        setStreamSettings(settingsMap);
        setActiveTab(streamIds[0]);

        // Load interview type from first stream's settings
        const firstSetting = response.streams?.[0]?.settingValue;
        if (firstSetting?.interviewType) {
          setInterviewType(firstSetting.interviewType === "Audio Based" ? "audio" : "video");
        }
      }).catch((err) => {
        console.error("Failed to fetch college settings:", err);
        setSnackbarMessage("Failed to load college settings");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
    }
  }, []);

  const handleSubmit = async () => {
    if (isViewMode) return;

    if (!isFormValid) {
      setShowErrors(true);
      setSnackbarMessage("Please fill all required fields in every selected stream");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setSubmitLoading(true);

    const payload = {
      collegeId: collegeId!,
      name: newCollege,
      streams: selectedStreams.map((streamId) => ({
        streamId,
        settingValue: {
          questionScale: streamSettings[streamId]?.questionScale ?? "Easy",
          modelBehaviour:
            streamSettings[streamId]?.modelBehaviour ?? "Lenient",
          selectedCategories:
            streamSettings[streamId]?.selectedCategories ?? [],
          personaType: streamSettings[streamId]?.personaType ?? "Technical",
          framework: streamSettings[streamId]?.framework ?? "DEFAULT",
          avatar: streamSettings[streamId]?.avatar ?? ["MuSigma Interview Agent"],
          duration: streamSettings[streamId]?.duration || 30,
          cutoff: streamSettings[streamId]?.cutoff || 3,
          codingRound: streamSettings[streamId]?.codingRound ?? false,
          proctoringEnabled: streamSettings[streamId]?.proctoringEnabled ?? true,
          codingQuestionCount: streamSettings[streamId]?.codingQuestionCount || 1,
          codingTimeLimit: streamSettings[streamId]?.codingTimeLimit || 15,
          interviewType: interviewType === "audio" ? "Audio Based" : "Video Based",
        },
      })),
    };

    try {
      if (jdFile) {
        await uploadJobDescription(jdFile, collegeId!, activeTab);
        await handleJDCopy()
      }
      if (isEditMode) {
        await updateCollegeWithSettings(payload);
      } else {
        await createCollege(payload.name, payload.streams);
      }
      navigate(routes.category);
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleJDCopy = async () => {
    if (!collegeId || !streamIds || streamIds.length < 2) {
      console.error("Insufficient stream IDs provided.");
      return;
    }

    const sourceStreamId = activeTab || streamIds[0];
    const targetStreamIds = streamIds.filter((id: string) => id !== sourceStreamId);
    await copyJobDescription(collegeId, sourceStreamId, targetStreamIds);
    return
  };
  const handleToggleCategory = (categoryName: string) => {
    if (isViewMode) return;

    const current = streamSettings[activeTab]?.selectedCategories ?? [];
    const updated = current.includes(categoryName)
      ? current.filter((c) => c !== categoryName)
      : [...current, categoryName];

    setStreamSettings((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        selectedCategories: updated,
      },
    }));
  };
  return (
    <Box sx={{ height: "90vh", display: "flex", flexDirection: "column", backgroundColor: "#F9FAFB", overflow: "hidden", cursor: isViewMode ? "not-allowed" : "default" }}>
      {/* Header Bar */}
      <Box sx={{ display: "flex", width: "100vw", alignItems: "center", gap: "1.5vh", px: "3vh", py: "1.8vh", borderBottom: "0.1vh solid #e5e7eb", backgroundColor: "#fff", overflow: "hidden", flexShrink: 0 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ p: "0.6vh", cursor: "pointer" }}>
          <ArrowBack sx={{ fontSize: "2.4vh", color: "#333", fontFamily: "Poppins, sans-serif" }} />
        </IconButton>
        <Box sx={{ width: "4.5vh", height: "4.5vh", borderRadius: "1.5vh", backgroundColor: "#00695c", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Check sx={{ color: "#fff", fontSize: "2.4vh", fontFamily: "Poppins, sans-serif" }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "2.2vh", color: "#1a1a1a", lineHeight: 1.3, fontFamily: "Poppins, sans-serif" }}>
            Add New College
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflowY: "auto", px: "3vh", py: "2vh", scrollbarWidth: "thin", marginLeft: "16vw", scrollbarColor: "#c1c1c1 transparent", "&::-webkit-scrollbar": { width: "0.6vh" }, "&::-webkit-scrollbar-track": { background: "transparent" }, "&::-webkit-scrollbar-thumb": { background: "#c1c1c1", borderRadius: "0.3vh" }, "&::-webkit-scrollbar-thumb:hover": { background: "#a0a0a0" } }}>
        {/* Basic Information Section */}
        <Box sx={{ backgroundColor: "#fff", borderRadius: "1vh", p: "1.5vh 2.5vh", mb: "2vh", border: "0.1vh solid #e5e7eb", width: "60vw" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "1vh", mb: "2vh" }}>
            <Box sx={{ width: "3.5vh", height: "3.5vh", borderRadius: "50%", backgroundColor: "#00695c", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.8vh", fontFamily: "Poppins, sans-serif" }}>
              1
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1.8vh", color: "#1a1a1a", fontFamily: "Poppins, sans-serif" }}>
              Basic Information
            </Typography>
          </Box>

          {/* College Name */}
          <Box sx={{
            mb: "2vh", "&.Mui-focused fieldset": {
              borderColor: "#006B66 !important",  // ✅ GREEN
              borderWidth: "0.2vh",
            },
          }}>
            <Text text={<>College Name <span style={{ color: '#b71c1c' }}>*</span></>} variant="body" styles={{ fontSize: "1.5vh", fontWeight: 600, color: "#333", mb: "0.5vh", fontFamily: "Poppins, sans-serif" }} />
            <TextField
              value={newCollege}
              onChange={(e) => setNewCollege(e.target.value)}
              disabled={isViewMode}
              placeholder="e.g. Indian Institute of Technology, Bombay"
              sx={{
                ...categoryStyles.textfield1,
                "&.Mui-focused fieldset": {
                  borderColor: "#006B66 !important",  // ✅ GREEN
                  borderWidth: "0.2vh",
                },
                width: "100%",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: showErrors && !newCollege.trim() ? "#d32f2f" : "#E5E7EB",
                }
              }}
            />
            {showErrors && !newCollege.trim() && (
              <Typography sx={{ color: '#d32f2f', fontSize: '1.2vh', fontFamily: 'Poppins, sans-serif', mt: '0.5vh' }}>
                Please enter this field
              </Typography>
            )}
          </Box>

          {/* Streams */}
          <Box sx={{ mb: "2vh" }}>
            <Text text={<>Streams <span style={{ color: '#b71c1c' }}>*</span></>} variant="body" styles={{ fontSize: "1.5vh", fontWeight: 600, color: "#333", mb: "0.5vh", fontFamily: "Poppins, sans-serif" }} />
            <FormControlComponent sx={{ width: "100%" }} disabled={isViewMode}>
              <Select
                multiple
                open={streamSelectOpen}
                onClose={() => {
                  setStreamSelectOpen(false);
                  setStreamSearchQuery("");
                  if (isAddingStreamInline) {
                    setIsAddingStreamInline(false);
                    setInlineStreamInput("");
                  }
                }}
                onOpen={() => setStreamSelectOpen(true)}
                disabled={isViewMode || !newCollege.trim()}
                value={selectedStreams}
                onChange={(e: SelectChangeEvent<string[]>) => {
                  setSelectedStreams(e.target.value as string[]);
                  setActiveTab(e.target.value[0]);
                }}
                MenuProps={{
                  disableAutoFocusItem: true,
                  PaperProps: {
                    onMouseDown: (e: any) => {
                      e.stopPropagation();
                    },
                    sx: {
                      "&.MuiMenu-paper": {
                        maxHeight: "60vh",
                        display: "flex",
                        flexDirection: "column",
                        width: "35vw",
                        minWidth: "25vw",
                      },
                    },
                  },
                }}
                renderValue={(selected: string[]) =>
                  streamOptions
                    .filter((opt) => selected.includes(opt.id))
                    .map((opt) => opt.name)
                    .join(", ")
                }
                sx={{
                  height: "4.5vh",
                  backgroundColor: isViewMode || !newCollege.trim() ? "#f0f0f0" : "inherit",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: showErrors && selectedStreams.length === 0 ? "#d32f2f" : "rgba(0, 0, 0, 0.23)",
                  }
                }}
              >
                <ListSubheader sx={{ fontSize: "1.5vh", paddingX: "1vh", fontFamily: "Poppins, sans-serif" }}>
                  <TextField
                    size="small"
                    autoFocus
                    placeholder="Search streams..."
                    fullWidth
                    value={streamSearchQuery}
                    onChange={(e) => setStreamSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== "Escape") {
                        e.stopPropagation();
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ ...categoryStyles.textfield1, mt: "0vh" }}
                  />
                </ListSubheader>
                {filteredStreamOptions.map((option) => (
                  <MenuItem
                    key={option.id}
                    value={option.id}
                    sx={{ fontSize: "1.5vh", paddingY: "0.8vh", fontFamily: "Poppins, sans-serif" }}
                  >
                    <Checkbox
                      checked={selectedStreams.includes(option.id)}
                      sx={{ color: globalStyles.colors.primary, "&.Mui-checked": { color: globalStyles.colors.primary } }}
                    />
                    <ListItemText primary={option.name} sx={{ fontSize: "1.5vh", fontFamily: "Poppins, sans-serif" }} />
                  </MenuItem>
                ))}
                <Divider sx={{ my: "1vh" }} />
                <ListSubheader component="div" disableSticky sx={{ paddingY: "1vh" }}>
                  {!isAddingStreamInline ? (
                    <MenuItem
                      onClick={(e: any) => {
                        e.stopPropagation();
                        setIsAddingStreamInline(true);
                      }}
                      sx={{ fontSize: "1.5vh", minHeight: "4vh", fontFamily: "Poppins, sans-serif" }}
                    >
                      <Add sx={{ mr: "1vh", fontSize: "2vh", fontFamily: "Poppins, sans-serif" }} />
                      Add New Stream
                    </MenuItem>
                  ) : (
                    <Box display="flex" flexDirection="column" gap={1} py={1}>
                      <TextField
                        size="small"
                        autoFocus
                        placeholder="New stream"
                        value={inlineStreamInput}
                        onChange={(e) => setInlineStreamInput(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key !== "Escape") {
                            e.stopPropagation();
                          }
                        }}
                        sx={{ ...categoryStyles.textfield1 }}
                      />
                      <Box display="flex" alignItems="center" gap={1}>
                        <CustomButton
                          type="primary"
                          onClick={async () => {
                            const trimmed = inlineStreamInput.trim();
                            if (!trimmed) return;
                            try {
                              const res = await createStream(trimmed);
                              const newStream = { id: res?.id, name: trimmed };
                              setStreamOptions((prev) => [...prev, newStream]);
                              setSelectedStreams((prev) => [...prev, newStream.id]);
                              setInlineStreamInput("");
                              setIsAddingStreamInline(false);
                            } catch (err) {
                              console.error("Stream create failed", err);
                            }
                          }}
                          additionalStyles={{ height: "4vh", p: "0vh 0.8vw", fontSize: "1.8vh", fontFamily: "Poppins, sans-serif" }}
                        >
                          Add
                        </CustomButton>
                        <CustomButton
                          type="secondary"
                          onClick={() => {
                            setIsAddingStreamInline(false);
                            setInlineStreamInput("");
                          }}
                          additionalStyles={{ height: "4vh", p: "0vh 0.8vw", fontSize: "1.8vh", fontFamily: "Poppins, sans-serif" }}
                        >
                          Cancel
                        </CustomButton>
                      </Box>
                    </Box>
                  )}
                </ListSubheader>
              </Select>
            </FormControlComponent>
            {showErrors && selectedStreams.length === 0 && (
              <Typography sx={{ color: '#d32f2f', fontSize: '1.2vh', fontFamily: 'Poppins, sans-serif', mt: '0.5vh' }}>
                Please enter this field
              </Typography>
            )}
          </Box>

          {/* Model */}
          <Box sx={{ mb: "2vh" }}>
            <Text text={<>Avatar <span style={{ color: '#b71c1c' }}>*</span></>} variant="body" styles={{ fontSize: "1.5vh", fontWeight: 600, color: "#333", mb: "0.5vh", fontFamily: "Poppins, sans-serif" }} />
            <FormControlComponent sx={{ width: "100%" }} disabled={isViewMode}>
              <Select
                multiple
                value={Array.isArray(streamSettings[activeTab]?.avatar) ? streamSettings[activeTab]?.avatar : []}
                onChange={(e) => {
                  const newAvatars = typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value;
                  setStreamSettings((prev) => {
                    const updated = { ...prev };
                    selectedStreams.forEach((id) => {
                      updated[id] = { ...updated[id], avatar: newAvatars };
                    });
                    return updated;
                  });
                }}
                sx={{
                  height: "4.5vh",
                  backgroundColor: isViewMode ? "#f0f0f0" : "inherit",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: showErrors && selectedStreams.some(id => !Array.isArray(streamSettings[id]?.avatar) || streamSettings[id]?.avatar.length === 0) ? "#d32f2f" : "rgba(0, 0, 0, 0.23)",
                  }
                }}
                displayEmpty
                renderValue={(selected: string[]) => selected.join(", ")}
              >
                <MenuItem value="" disabled>
                  Select Avatars
                </MenuItem>
                {userModels.map((model) => (
                  <MenuItem key={model} value={model}>
                    <Checkbox checked={Array.isArray(streamSettings[activeTab]?.avatar) && streamSettings[activeTab]?.avatar.includes(model)} />
                    {model}
                  </MenuItem>
                ))}
              </Select>
            </FormControlComponent>
            {showErrors && selectedStreams.some(id => !Array.isArray(streamSettings[id]?.avatar) || streamSettings[id]?.avatar.length === 0) && (
              <Typography sx={{ color: '#d32f2f', fontSize: '1.2vh', fontFamily: 'Poppins, sans-serif', mt: '0.5vh' }}>
                Please enter this field
              </Typography>
            )}
          </Box>

          {/* Interview Type */}
          <Box sx={{ mb: "2vh" }}>
            <Text text="Interview Type" variant="body" styles={{ fontSize: "1.5vh", fontWeight: 600, color: "#333", mb: "1vh", fontFamily: "Poppins, sans-serif" }} />
            <Box sx={{ display: "flex", gap: "2vh", alignItems: "center" }}>
              <Box sx={{ border: interviewType === "audio" ? "0.2vh solid #00695c" : "0.2vh solid #d0d0d0", borderRadius: "0.8vh", p: "0vh", backgroundColor: interviewType === "audio" ? "#f0faf8" : "#fff", display: "flex", alignItems: "center", gap: "1vh", flex: 1, cursor: isViewMode ? "default" : "pointer" }} onClick={() => !isViewMode && setInterviewType("audio")}>
                <Radio checked={interviewType === "audio"} onChange={() => setInterviewType("audio")} disabled={isViewMode} sx={{ color: "#00695c", "&.Mui-checked": { color: "#00695c" } }} />
                <Text text="Audio" variant="body" styles={{ fontSize: "1.5vh", fontWeight: 600, color: "#1a1a1a", fontFamily: "Poppins, sans-serif" }} />
              </Box>
              <Box sx={{ border: interviewType === "video" ? "0.2vh solid #00695c" : "0.2vh solid #d0d0d0", borderRadius: "0.8vh", p: "0vh", backgroundColor: interviewType === "video" ? "#f0faf8" : "#fff", display: "flex", alignItems: "center", gap: "1vh", flex: 1, cursor: isViewMode ? "default" : "pointer" }} onClick={() => !isViewMode && setInterviewType("video")}>
                <Radio checked={interviewType === "video"} onChange={() => setInterviewType("video")} disabled={isViewMode} sx={{ color: "#00695c", "&.Mui-checked": { color: "#00695c" } }} />
                <Text text="Video" variant="body" styles={{ fontSize: "1.5vh", fontWeight: 600, color: "#1a1a1a", fontFamily: "Poppins, sans-serif" }} />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Stream Configuration Section */}
        {selectedStreams.length > 0 && (
          <Box sx={{ backgroundColor: "#fff", borderRadius: "1vh", p: "1.5vh 2.5vh", mb: "2vh", border: "0.1vh solid #e5e7eb", width: "60vw" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "1vh", mb: "3vh" }}>
              <Box sx={{ width: "3.5vh", height: "3.5vh", borderRadius: "50%", backgroundColor: "#004d40", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.8vh", fontFamily: "Poppins, sans-serif" }}>
                2
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1.8vh", color: "#111827", fontFamily: "Poppins, sans-serif" }}>
                Stream Configuration
              </Typography>
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb="3vh"
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "2vh" }}>
                <Box sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  borderRadius: "1vh",
                  padding: "0.5vh",
                  border: "0.15vh solid #E5E7EB",
                  height: "5.5vh"
                }}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      const currentIndex = selectedStreams.indexOf(activeTab);
                      if (currentIndex > 0) {
                        setActiveTab(selectedStreams[currentIndex - 1]);
                      }
                    }}
                    disabled={selectedStreams.indexOf(activeTab) === 0}
                    sx={{ p: "0.5vh", color: "#6B7280", cursor: "pointer" }}
                  >
                    <ArrowBackIosNew sx={{ fontSize: "1.6vh", fontFamily: "Poppins, sans-serif" }} />
                  </IconButton>
                  <Typography sx={{
                    mx: "2vh",
                    fontWeight: 700,
                    fontSize: "1.6vh",
                    color: "#006b66",
                    minWidth: "8vh",
                    textAlign: "center",
                    fontFamily: "Poppins, sans-serif"
                  }}>
                    {streamOptions.find(s => s.id === activeTab)?.name || activeTab}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      const currentIndex = selectedStreams.indexOf(activeTab);
                      if (currentIndex < selectedStreams.length - 1) {
                        setActiveTab(selectedStreams[currentIndex + 1]);
                      }
                    }}
                    disabled={selectedStreams.indexOf(activeTab) === selectedStreams.length - 1}
                    sx={{ p: "0.5vh", color: "#6B7280", cursor: "pointer" }}
                  >
                    <ArrowForwardIos sx={{ fontSize: "1.6vh", fontFamily: "Poppins, sans-serif" }} />
                  </IconButton>
                </Box>
                <Typography sx={{ fontSize: "1.4vh", color: "#9CA3AF", fontWeight: 500, fontFamily: "Poppins, sans-serif" }}>
                  {selectedStreams.indexOf(activeTab) + 1} of {selectedStreams.length}
                </Typography>
              </Box>

              {!isViewMode && (
                <CustomButton
                  type="secondary"
                  disabled={isViewMode}
                  onClick={() => {
                    if (!activeTab) return;
                    const source = streamSettings[activeTab];
                    const updated = selectedStreams.reduce((acc, id) => {
                      acc[id] = { ...source };
                      return acc;
                    }, {} as Record<string, StreamSetting>);
                    setStreamSettings(updated);
                    setSnackbarMessage("Applied to all streams");
                    setSnackbarSeverity("success");
                    setSnackbarOpen(true);
                  }}
                  additionalStyles={{
                    height: "5vh",
                    px: "3vh",
                    fontSize: "1.6vh",
                    fontWeight: 750,
                    borderRadius: "1.2vh",
                    textTransform: "none",
                    border: "0.2vh solid #006b66",
                    color: "#006b66",
                    fontFamily: "Poppins, sans-serif"
                  }}
                >
                  Apply to All Streams
                </CustomButton>
              )}
            </Box>
            {activeTab && (
              <TabContext value={activeTab}>
                {/* Custom Stream Switcher (Replaces TabList) */}

                {selectedStreams.map((streamId) => (
                  <TabPanel
                    key={streamId}
                    value={streamId}
                    sx={{
                      padding: 0,
                      mt: "2vh"
                    }}
                  >
                    <Box>
                      {/* First Row: Question Personalization Scale and Model Behaviour */}
                      <Box display="flex" justifyContent="space-between" gap="3vh" mb="3vh">
                        <Box flex={1}>
                          <Text
                            text={<>Question Complexity <span style={{ color: '#b71c1c' }}>*</span></>}
                            styles={{ fontSize: "1.4vh", fontWeight: 600, color: "#1F2937", mb: "1.5vh", fontFamily: "Poppins, sans-serif" }}
                          />
                          <Box display="flex" gap="1vh" alignItems="center">
                            {["Easy", "Intermediate", "Difficult"].map((label) => (
                              <Box
                                key={label}
                                onClick={() => {
                                  setStreamSettings((prev) => ({
                                    ...prev,
                                    [streamId]: {
                                      ...prev[streamId],
                                      questionScale: label as "Easy" | "Intermediate" | "Difficult",
                                    },
                                  }));
                                }}
                                sx={{
                                  flex: 1,
                                  border: streamSettings[streamId]?.questionScale === label ? "0.2vh solid #006b66" :
                                    (showErrors && !streamSettings[streamId]?.questionScale ? "0.15vh solid #d32f2f" : "0.15vh solid #E5E7EB"),
                                  borderRadius: "1.5vh",
                                  py: "1vh",
                                  px: "1vh",
                                  backgroundColor: streamSettings[streamId]?.questionScale === label ? "#fff" : "#fff",
                                  textAlign: "center",
                                  cursor: isViewMode ? "default" : "pointer",
                                  opacity: isViewMode ? 0.6 : 1,
                                  transition: "all 0.2s",
                                  height: "4vh",
                                  marginTop: "0.5vh",
                                }}
                              >
                                <Text
                                  text={label}
                                  styles={{
                                    fontSize: "1.4vh",
                                    fontWeight: 600,
                                    fontFamily: "Poppins, sans-serif",
                                    color: streamSettings[streamId]?.questionScale === label ? "#006b66" : "#6B7280",
                                  }}
                                />
                              </Box>
                            ))}
                          </Box>
                          {showErrors && !streamSettings[streamId]?.questionScale && (
                            <Typography sx={{ color: '#d32f2f', fontSize: '1.2vh', fontFamily: 'Poppins, sans-serif', mt: '0.5vh' }}>
                              Please enter this field
                            </Typography>
                          )}
                        </Box>

                        <Box flex={1}>
                          <Text
                            text={<>Model Behaviour <span style={{ color: '#b71c1c' }}>*</span></>}
                            styles={{ fontSize: "1.4vh", fontWeight: 600, color: "#333", mb: "1vh", fontFamily: "Poppins, sans-serif" }}
                          />
                          <Box display="flex" gap="1vh" alignItems="center">
                            {["Lenient", "Neutral", "Strict"].map((label) => (
                              <Box
                                key={label}
                                onClick={() => {
                                  setStreamSettings((prev) => ({
                                    ...prev,
                                    [streamId]: {
                                      ...prev[streamId],
                                      modelBehaviour: label as "Lenient" | "Neutral" | "Strict",
                                    },
                                  }));
                                }}
                                sx={{
                                  flex: 1,
                                  border: streamSettings[streamId]?.modelBehaviour === label ? "0.2vh solid #006b66" :
                                    (showErrors && !streamSettings[streamId]?.modelBehaviour ? "0.15vh solid #d32f2f" : "0.15vh solid #E5E7EB"),
                                  borderRadius: "1.5vh",
                                  py: "1vh",
                                  px: "1vh",
                                  backgroundColor: "#fff",
                                  textAlign: "center",
                                  cursor: isViewMode ? "default" : "pointer",
                                  opacity: isViewMode ? 0.6 : 1,
                                  transition: "all 0.2s",
                                  height: "4vh",
                                  marginTop: "0.5vh",
                                }}
                              >
                                <Text
                                  text={label}
                                  styles={{
                                    fontSize: "1.4vh",
                                    fontFamily: "Poppins, sans-serif",
                                    fontWeight: 600,
                                    color: streamSettings[streamId]?.modelBehaviour === label ? "#006b66" : "#6B7280",
                                  }}
                                />
                              </Box>
                            ))}
                          </Box>
                          {showErrors && !streamSettings[streamId]?.modelBehaviour && (
                            <Typography sx={{ color: '#d32f2f', fontSize: '1.2vh', fontFamily: 'Poppins, sans-serif', mt: '0.5vh' }}>
                              Please enter this field
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Second Row: Persona Type and Framework */}
                      <Box display="flex" gap="3vh" mb="3vh">
                        <Box display="flex" flexDirection="column" flex={1}>
                          <Text text={<>Persona Type <span style={{ color: '#b71c1c' }}>*</span></>} styles={{ fontSize: "1.4vh", fontWeight: 600, color: "#1F2937", mb: "1vh", fontFamily: "Poppins, sans-serif" }} />
                          <FormControlComponent disabled={isViewMode} fullWidth>
                            <Select
                              value={streamSettings[streamId]?.personaType ?? ""}
                              onChange={(e) =>
                                setStreamSettings((prev) => ({
                                  ...prev,
                                  [streamId]: {
                                    ...prev[streamId],
                                    personaType: e.target.value,
                                  },
                                }))
                              }
                              sx={{
                                ...categoryStyles.textfield1,
                                "&.Mui-focused fieldset": {
                                  borderColor: "#006B66 !important",  // ✅ GREEN
                                  borderWidth: "0.2vh",
                                },
                                //width: "49vh",
                                //flex: 1,
                                height: "5vh",
                                borderRadius: "1.2vh",
                                backgroundColor: "#fff",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: showErrors && !streamSettings[streamId]?.personaType ? "#d32f2f" : "#E5E7EB",
                                  borderWidth: "0.15vh"
                                },
                              }}
                              displayEmpty
                              renderValue={(selected: unknown) => {
                                if (!selected) return <Box sx={{ color: "#9CA3AF" }}>Select Persona</Box>;
                                return <Box sx={{ fontFamily: "Poppins, sans-serif" }}>{selected as string}</Box>;
                              }}
                            >
                              <MenuItem value="" disabled>
                                Select Persona
                              </MenuItem>
                              {[
                                "Technical",
                                "Business",
                                "Management",
                                "Sales",
                                "Creative",
                                "Technical / Business / Mathematics",
                              ].map((option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControlComponent>
                          {showErrors && !streamSettings[streamId]?.personaType && (
                            <Typography sx={{ color: '#d32f2f', fontSize: '1.2vh', fontFamily: 'Poppins, sans-serif', mt: '0.5vh' }}>
                              Please enter this field
                            </Typography>
                          )}
                        </Box>

                        <Box display={'flex'} flexDirection={'column'} flex={1}>
                          <Text text={<>Framework <span style={{ color: '#b71c1c' }}>*</span></>} styles={{ fontSize: "1.4vh", fontWeight: 600, color: "#1F2937", mb: "1vh", fontFamily: "Poppins, sans-serif" }} />
                          <FormControlComponent disabled={isViewMode} fullWidth>
                            <Select
                              value={streamSettings[streamId]?.framework ?? ""}
                              onChange={(e) => {
                                const newFramework = e.target.value;
                                const updated = { ...streamSettings };
                                selectedStreams.forEach((id) => {
                                  updated[id] = {
                                    ...updated[id],
                                    framework: newFramework,
                                  };
                                });
                                setStreamSettings(updated);
                              }}
                              sx={{
                                ...categoryStyles.textfield1,
                                "&.Mui-focused fieldset": {
                                  borderColor: "#006B66 !important",  // ✅ GREEN
                                  borderWidth: "0.2vh",
                                },
                                // width: "49vh",
                                height: "5vh",
                                borderRadius: "1.2vh",
                                backgroundColor: "#fff",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: showErrors && !streamSettings[streamId]?.framework ? "#d32f2f" : "#E5E7EB",
                                  borderWidth: "0.15vh"
                                },
                              }}
                              displayEmpty
                              renderValue={(selected: unknown) => {
                                if (!selected) return <Box sx={{ color: "#9CA3AF" }}>Select Framework</Box>;
                                return <Box sx={{ fontFamily: "Poppins, sans-serif" }}>{selected as string}</Box>;
                              }}
                            >
                              <MenuItem value="" disabled>
                                Select Framework
                              </MenuItem>
                              {frameworks.frameworks.map((option) => (
                                <MenuItem key={option} value={option} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box sx={{ fontFamily: "Poppins, sans-serif" }}>{option}</Box>
                                  {(option === "CIEG" || option === "DEFAULT") && (
                                    <Tooltip
                                      title={option === "CIEG" ? "Curiosity, Insight, Engagement, Grit" : "Problem Solving, Accountability, Collaboration, Learning Agility, Communication"}
                                      placement="top"
                                      arrow
                                    >
                                      <InfoOutlined sx={{ fontSize: '1.8vh', color: '#9CA3AF' }} />
                                    </Tooltip>
                                  )}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControlComponent>
                          {showErrors && !streamSettings[streamId]?.framework && (
                            <Typography sx={{ color: '#d32f2f', fontSize: '1.2vh', fontFamily: 'Poppins, sans-serif', mt: '0.5vh' }}>
                              Please enter this field
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Duration and Cutoff */}
                      <Box display="flex" gap="3vh" mb="3vh">
                        <Box display="flex" flexDirection="column" flex={1}>
                          <Text text={<>Interview Duration (min) <span style={{ color: '#b71c1c' }}>*</span></>} styles={{ fontSize: "1.4vh", fontWeight: 600, color: "#1F2937", mb: "1vh" }} />
                          <TextField
                            disabled={isViewMode}
                            type="number"
                            //placeholder="30"
                            value={streamSettings[streamId]?.duration ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val !== "" && +val < 0) return;
                              setStreamSettings((prev) => ({
                                ...prev,
                                [streamId]: {
                                  ...prev[streamId],
                                  duration: val === "" ? "" : +val,
                                },
                              }));
                            }}
                            inputProps={{ min: 1 }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                height: "5vh",
                                borderRadius: "1vh",
                                backgroundColor: "#fff",
                                "&.Mui-focused fieldset": {
                                  borderColor: "#006B66",
                                  borderWidth: "0.2vh",
                                },
                                "& fieldset": { borderColor: showErrors && !streamSettings[streamId]?.duration ? "#d32f2f" : "#E5E7EB" },
                              },
                              //width: "49vh"
                              flex: 1
                            }}
                          />
                          {showErrors && !streamSettings[streamId]?.duration && (
                            <Typography sx={{ color: '#d32f2f', fontSize: '1.2vh', fontFamily: 'Poppins, sans-serif', mt: '0.5vh' }}>
                              Please enter this field
                            </Typography>
                          )}
                        </Box>
                        <Box display="flex" flexDirection="column" flex={1}>
                          <Text text={<>Evaluation Cutoff (1-5) <span style={{ color: '#b71c1c' }}>*</span></>} styles={{ fontSize: "1.4vh", fontWeight: 600, color: "#1F2937", mb: "1vh" }} />
                          <TextField
                            disabled={isViewMode}
                            type="number"
                            //placeholder="3"
                            value={streamSettings[streamId]?.cutoff ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val !== "" && (+val < 0 || +val > 5)) return;
                              setStreamSettings((prev) => ({
                                ...prev,
                                [streamId]: {
                                  ...prev[streamId],
                                  cutoff: val === "" ? "" : +val,
                                },
                              }));
                            }}
                            inputProps={{ min: 1, max: 5, step: 0.1 }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                height: "5vh",
                                borderRadius: "1vh",
                                backgroundColor: "#fff",
                                "&.Mui-focused fieldset": {
                                  borderColor: "#006B66",
                                  borderWidth: "0.2vh",
                                },
                                "& fieldset": { borderColor: showErrors && !streamSettings[streamId]?.cutoff ? "#d32f2f" : "#E5E7EB" },
                              },
                              //width: "49vh"
                              flex: 1
                            }}
                          />
                          {showErrors && !streamSettings[streamId]?.cutoff && (
                            <Typography sx={{ color: '#d32f2f', fontSize: '1.2vh', fontFamily: 'Poppins, sans-serif', mt: '0.5vh' }}>
                              Please enter this field
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Box mb="4vh">
                        <Text text="Job Description" styles={{ fontSize: "1.4vh", fontWeight: 600, color: "#1F2937", mb: "1.5vh", fontFamily: "Poppins, sans-serif" }} />
                        <Box
                          onClick={() => {
                            const input = document.getElementById(`jd-input-${streamId}`) as HTMLInputElement | null;
                            input?.click();
                          }}
                          sx={{
                            border: "0.15vh dashed #D1D5DB",
                            borderRadius: "1.2vh",
                            minHeight: "18vh",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#fff",
                            cursor: isViewMode ? "default" : "pointer",
                            transition: "all 0.2s",
                            "&:hover": {
                              borderColor: isViewMode ? "#D1D5DB" : "#006b66",
                              backgroundColor: isViewMode ? "#fff" : "#F9FAFB"
                            }
                          }}
                        >
                          <Box sx={{
                            width: "5vh",
                            height: "5vh",
                            borderRadius: "50%",
                            backgroundColor: "#F3F4F6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: "2vh"
                          }}>
                            <CloudUploadOutlined sx={{ color: "#9CA3AF", fontSize: "2.5vh", fontFamily: "Poppins, sans-serif" }} />
                          </Box>
                          <Typography sx={{ fontSize: "1.6vh", fontWeight: 600, mb: "0.5vh", fontFamily: "Poppins, sans-serif" }}>
                            <span style={{ color: "#006b66" }}>Click to browse</span> or drag & drop job description file here
                          </Typography>
                          <Typography sx={{ fontSize: "1.2vh", color: "#6B7280", fontFamily: "Poppins, sans-serif" }}>
                            PDF, DOC, DOCX • Files missing <span style={{ fontWeight: 600 }}>Name, Email</span> or <span style={{ fontWeight: 600 }}>Mobile</span> will be auto-rejected
                          </Typography>
                          {jdIsUploaded ? (
                            <FileIcon
                              style={{
                                height: "2.2vh",
                              }}
                            />
                          ) : (
                            <UploadIcon style={{ height: "2.2vh" }} />
                          )}
                          <Box>
                            <Text
                              text={
                                jdFile
                                  ? jdFile.name
                                  : jdIsUploaded
                                    ? ""
                                    : "Click to upload document"
                              }
                              styles={{ fontSize: "1.5vh", fontFamily: "Poppins, sans-serif" }}
                            />
                            {jdFile && (
                              <Text
                                text={`${formatFileSize(
                                  jdFile.size
                                )} is uploaded successfully`}
                                styles={{ fontSize: "1vh", fontFamily: "Poppins, sans-serif" }}
                              />
                            )}
                            {jdIsUploaded && (
                              <Text
                                text={`Job Description is uploaded`}
                                styles={{ fontSize: "1.5vh", fontFamily: "Poppins, sans-serif" }}
                              />
                            )}
                          </Box>
                          {jdFile && !isViewMode && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setJDFile(null);
                                setJDisUploaded(false);
                                const input = document.getElementById(
                                  `jd-input-${streamId}`
                                ) as HTMLInputElement | null;
                                if (input) input.value = "";
                              }}
                              sx={{
                                ml: "auto",
                                color: globalStyles.colors.primary,
                              }}
                              aria-label="Delete selected job description"
                            >
                              <DeleteOutline sx={{ fontSize: "2.2vh", fontFamily: "Poppins, sans-serif" }} />
                            </IconButton>
                          )}
                          <input
                            id={`jd-input-${streamId}`}
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            style={{ display: "none" }}
                            disabled={isViewMode}
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null;
                              setJDFile(file);
                              setJDisUploaded(false);
                            }}
                          />
                        </Box>
                      </Box>

                      <Divider sx={{ marginTop: "3vh", marginBottom: "1vh" }} />
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1vh",
                          justifyContent: "space-between",
                          mb: "1vh",
                          height: "100%",
                        }}
                      >
                        <Box flex={1}>
                          <Typography sx={{ fontSize: "1.8vh", fontWeight: 700, mb: "0.5vh", color: "#374151", fontFamily: "Poppins, sans-serif" }}>Categories <span style={{ color: '#b71c1c' }}>*</span></Typography>
                          <Typography sx={{ fontSize: "1.5vh", color: "#6B7280", mb: "2.5vh", fontFamily: "Poppins, sans-serif" }}>
                            Toggle which question categories to include in interviews:
                          </Typography>
                          {showErrors && (!streamSettings[streamId]?.selectedCategories || streamSettings[streamId]?.selectedCategories?.length === 0) && (
                            <Typography sx={{ color: '#d32f2f', fontSize: '1.2vh', fontFamily: 'Poppins, sans-serif', mt: '-2vh', mb: '1vh' }}>
                              Please enter this field
                            </Typography>
                          )}
                        </Box>
                        <Box mt={"0vh"}>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(20vh, 1fr))",
                          gap: "1vh",
                          mb: "3vh",
                        }}
                      >
                        {categories.map((cat) => (
                          <Box
                            key={cat.id}
                            onClick={() => !isViewMode && handleToggleCategory(cat.categoryName)}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              backgroundColor: "#fff",
                              border: streamSettings[streamId]?.selectedCategories?.includes(cat.categoryName) ? "0.15vh solid #006b66" : "0.15vh solid #E5E7EB",
                              borderRadius: "1.2vh",
                              p: "0.8vh 1.5vh",
                              height: "4vh",
                              cursor: isViewMode ? "default" : "pointer",
                              "&:hover": {
                                borderColor: isViewMode ? (streamSettings[streamId]?.selectedCategories?.includes(cat.categoryName) ? "#006b66" : "#E5E7EB") : "#006b66",
                              },
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: "0.8vh" }}>
                              <Checkbox
                                disabled={isViewMode}
                                checked={
                                  streamSettings[streamId]?.selectedCategories?.includes(cat.categoryName) ?? false
                                }
                                onChange={() => {
                                  if (isViewMode) return;
                                  const current = streamSettings[streamId]?.selectedCategories ?? [];
                                  const updated = current.includes(cat.categoryName)
                                    ? current.filter((c) => c !== cat.categoryName)
                                    : [...current, cat.categoryName];

                                  setStreamSettings((prev) => ({
                                    ...prev,
                                    [streamId]: {
                                      ...prev[streamId],
                                      selectedCategories: updated,
                                    },
                                  }));
                                }}
                                sx={{
                                  color: "#D1D5DB",
                                  "&.Mui-checked": {
                                    color: "#006b66",
                                  },
                                }}
                              />
                              <Typography sx={{ fontSize: "1.4vh", fontWeight: 500, color: "#374151", fontFamily: "Poppins, sans-serif" }}>
                                {cat.categoryName}
                              </Typography>
                            </Box>
                            {!initialCategoryIds.has(cat.id) && (
                              <IconButton
                                disabled={isViewMode}
                                size="small"
                                onClick={async () => {
                                  try {
                                    // Remove from categories list
                                    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
                                    // Remove from selected categories if present
                                    const current = streamSettings[streamId]?.selectedCategories ?? [];
                                    if (current.includes(cat.categoryName)) {
                                      const updated = current.filter((c) => c !== cat.categoryName);
                                      setStreamSettings((prev) => ({
                                        ...prev,
                                        [streamId]: {
                                          ...prev[streamId],
                                          selectedCategories: updated,
                                        },
                                      }));
                                    }
                                  } catch (err) {
                                    console.error("Category deletion failed", err);
                                  }
                                }}
                                sx={{
                                  p: "0.2vh",
                                  color: "#E5E7EB",
                                  "&:hover": {
                                    color: "#EF4444",
                                    backgroundColor: "transparent",
                                  },
                                  "&.Mui-disabled": {
                                    color: "#E5E7EB",
                                  },
                                }}
                              >
                                <DeleteOutline sx={{ fontSize: "1.6vh", fontFamily: "Poppins, sans-serif" }} />
                              </IconButton>
                            )}
                          </Box>
                        ))}
                      </Box>

                      <Box sx={{ display: "flex", gap: "2vh", alignItems: "center", mb: "1vh" }}>
                        <TextField
                          disabled={isViewMode}
                          size="small"
                          placeholder="Add custom category..."
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          sx={{
                            flex: 1,
                            "& .MuiOutlinedInput-root": {
                              height: "4vh",
                              borderRadius: "1.2vh",
                              backgroundColor: "#fff",
                              "&.Mui-focused fieldset": {
                                borderColor: "#86161B",
                                borderWidth: "0.2vh",
                              },
                              "& fieldset": { borderColor: "#E5E7EB", borderWidth: "0.15vh" },
                            },
                          }}
                        />
                        <Button
                          disabled={isViewMode}
                          variant="outlined"
                          onClick={async () => {
                            if (!newCategoryName.trim()) return;
                            try {
                              const created = await createCategory(newCategoryName.trim());
                              setCategories((prev) => [...prev, created]);
                              setNewCategoryName("");
                            } catch (err) {
                              console.error("Category creation failed", err);
                            }
                          }}
                          sx={{
                            height: "4vh",
                            px: "4vh",
                            fontSize: "1.6vh",
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: 750,
                            borderRadius: "1.2vh",
                            border: "0.25vh solid #006b66",
                            color: "#006b66",
                            whiteSpace: "nowrap",
                            textTransform: "none",
                            backgroundColor: "#fff",
                            "&:hover": {
                              backgroundColor: "#f0fdfa",
                              borderColor: "#004d40"
                            }
                          }}
                        >
                          <Add sx={{ mr: "1vh", fontSize: "2.4vh", fontFamily: "Poppins, sans-serif" }} />
                          Add New Category
                        </Button>
                      </Box>

                      {/* Badge List for Selected Categories */}
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "1.5vh", mb: "2vh" }}>
                        {streamSettings[streamId]?.selectedCategories?.map((catName) => (
                          <Box
                            key={catName}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "1.5vh",
                              backgroundColor: "#ffffff",
                              border: "0.2vh solid #006b66",
                              borderRadius: "1.2vh",
                              px: "2vh",
                              py: "1vh",
                            }}
                          >
                            <CheckCircle sx={{ color: "#006b66", fontSize: "2.2vh", fontFamily: "Poppins, sans-serif" }} />
                            <Typography sx={{ fontSize: "1.5vh", fontWeight: 750, color: "#006b66", fontFamily: "Poppins, sans-serif" }}>
                              {catName}
                            </Typography>
                            {!isViewMode && (
                              <DeleteOutline
                                sx={{
                                  fontSize: "1.8vh",
                                  fontFamily: "Poppins, sans-serif",
                                  color: "#006b66",
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#004d40",
                                  },
                                }}
                                onClick={() => {
                                  const current = streamSettings[streamId]?.selectedCategories ?? [];
                                  const updated = current.filter((c) => c !== catName);
                                  setStreamSettings((prev) => ({
                                    ...prev,
                                    [streamId]: {
                                      ...prev[streamId],
                                      selectedCategories: updated,
                                    },
                                  }));
                                }}
                              />
                            )}
                          </Box>
                        ))}
                      </Box>

                      {/* Divider Below Categories */}
                      <Divider sx={{ my: "3vh", borderColor: "#E5E7EB" }} />

                      {/* Enable Proctoring */}
                      <Box sx={{ mb: "2vh", display: "flex", alignItems: "center", gap: "1vh" }}>
                        <Checkbox
                          checked={streamSettings[streamId]?.proctoringEnabled ?? true}
                          onChange={(e) => {
                            if (isViewMode) return;
                            setStreamSettings((prev) => ({
                              ...prev,
                              [streamId]: {
                                ...prev[streamId],
                                proctoringEnabled: e.target.checked,
                              },
                            }));
                          }}
                          disabled={isViewMode}
                          sx={{ color: "#00695c", "&.Mui-checked": { color: "#00695c" }, p: 0 }}
                        />
                        <Text text="Enable Proctoring" variant="body" styles={{ fontSize: "1.6vh", fontWeight: 700, color: "#333", fontFamily: "Poppins, sans-serif" }} />
                      </Box>

                      {/* Coding Round, Number of Questions, and Duration Section */}
                      <Box sx={{ mb: "3vh", display: "flex", gap: "3vh", alignItems: "flex-start" }}>
                        {/* Coding Round */}
                        <Box sx={{ flex: 1.4 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: "2vh" }}>
                            <Text text={<>Coding Round : <span style={{ color: '#b71c1c' }}>*</span></>} variant="body" styles={{ fontSize: "1.8vh", fontWeight: 700, color: "#333", whiteSpace: "nowrap", fontFamily: "Poppins, sans-serif" }} />
                            <RadioGroup
                              row
                              value={streamSettings[streamId]?.codingRound ? "yes" : "no"}
                              onChange={(e) => {
                                if (isViewMode) return;
                                setStreamSettings((prev) => ({
                                  ...prev,
                                  [streamId]: {
                                    ...prev[streamId],
                                    codingRound: e.target.value === "yes",
                                  },
                                }));
                              }}
                            >
                              <FormControlLabel
                                value="yes"
                                control={<Radio sx={{ color: "#00695c", "&.Mui-checked": { color: "#00695c" } }} />}
                                label={<Text text="Yes" variant="body" styles={{ fontSize: "1.5vh", fontWeight: 600, color: "#1a1a1a", fontFamily: "Poppins, sans-serif" }} />}
                                disabled={isViewMode}
                              />
                              <FormControlLabel
                                value="no"
                                control={<Radio sx={{ color: "#00695c", "&.Mui-checked": { color: "#00695c" } }} />}
                                label={<Text text="No" variant="body" styles={{ fontSize: "1.5vh", fontWeight: 600, color: "#1a1a1a", fontFamily: "Poppins, sans-serif" }} />}
                                disabled={isViewMode}
                              />
                            </RadioGroup>
                          </Box>
                        </Box>

                        {/* Number of Questions */}
                        <Box sx={{ flex: 1 }}>
                          <Text text={<>Number of Coding Questions {streamSettings[streamId]?.codingRound && <span style={{ color: '#b71c1c' }}>*</span>}</>} variant="body" styles={{ fontSize: "1.5vh", fontFamily: "Poppins, sans-serif", fontWeight: 600, color: streamSettings[streamId]?.codingRound ? "#333" : "#B0B0B0", mb: "1vh", opacity: streamSettings[streamId]?.codingRound ? 1 : 0.6 }} />
                          <TextField
                            value={streamSettings[streamId]?.codingQuestionCount ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val !== "" && parseInt(val) < 0) return;
                              setStreamSettings((prev) => ({
                                ...prev,
                                [streamId]: {
                                  ...prev[streamId],
                                  codingQuestionCount: val === "" ? "" : parseInt(val),
                                },
                              }));
                            }}
                            disabled={isViewMode || !streamSettings[streamId]?.codingRound}
                            type="number"
                            inputProps={{ min: 1 }}
                            sx={{
                              width: "100%",
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "0.8vh",
                                "& fieldset": {
                                  borderColor: showErrors && streamSettings[streamId]?.codingRound && !streamSettings[streamId]?.codingQuestionCount ? "#d32f2f" : "#00695c",
                                },
                                "&:hover fieldset": {
                                  borderColor: "#00695c",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#86161B",
                                  borderWidth: "0.2vh",
                                },
                              },
                              "& .MuiOutlinedInput-input": {
                                fontSize: "1.5vh",
                                padding: "1vh 1.2vh",
                                fontFamily: "Poppins, sans-serif"
                              },
                            }}
                          />
                          {showErrors && streamSettings[streamId]?.codingRound && !streamSettings[streamId]?.codingQuestionCount && (
                            <Typography sx={{ color: '#d32f2f', fontSize: '1.2vh', fontFamily: 'Poppins, sans-serif', mt: '0.5vh' }}>
                              Please enter this field
                            </Typography>
                          )}
                        </Box>

                        {/* Duration */}
                        <Box sx={{ flex: 1 }}>
                          <Text text={<>Duration (min) {streamSettings[streamId]?.codingRound && <span style={{ color: '#b71c1c' }}>*</span>}</>} variant="body" styles={{ fontSize: "1.5vh", fontFamily: "Poppins, sans-serif", fontWeight: 600, color: streamSettings[streamId]?.codingRound ? "#333" : "#B0B0B0", mb: "1vh", opacity: streamSettings[streamId]?.codingRound ? 1 : 0.6 }} />
                          <TextField
                            value={streamSettings[streamId]?.codingTimeLimit ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val !== "" && parseInt(val) < 0) return;
                              setStreamSettings((prev) => ({
                                ...prev,
                                [streamId]: {
                                  ...prev[streamId],
                                  codingTimeLimit: val === "" ? "" : parseInt(val),
                                },
                              }));
                            }}
                            disabled={isViewMode || !streamSettings[streamId]?.codingRound}
                            type="number"
                            inputProps={{ min: 1 }}
                            sx={{
                              width: "100%",
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "0.8vh",
                                "& fieldset": {
                                  borderColor: showErrors && streamSettings[streamId]?.codingRound && !streamSettings[streamId]?.codingTimeLimit ? "#d32f2f" : "#00695c",
                                },
                                "&:hover fieldset": {
                                  borderColor: "#00695c",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#86161B",
                                  borderWidth: "0.2vh",
                                },
                              },
                              "& .MuiOutlinedInput-input": {
                                fontSize: "1.5vh",
                                padding: "1vh 1.2vh",
                                fontFamily: "Poppins, sans-serif"
                              },
                            }}
                          />
                          {showErrors && streamSettings[streamId]?.codingRound && !streamSettings[streamId]?.codingTimeLimit && (
                            <Typography sx={{ color: '#d32f2f', fontSize: '1.2vh', fontFamily: 'Poppins, sans-serif', mt: '0.5vh' }}>
                              Please enter this field
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </TabPanel>
                ))}
              </TabContext>
            )}
          </Box>
        )}

        {/* Submit Buttons Container */}
        <Box sx={{
          backgroundColor: "#fff",
          borderRadius: "1vh",
          p: "2vh 2.5vh",
          mb: "2vh",
          border: "0.1vh solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "60vw",
        }}>
          <Button
            variant="outlined"
            onClick={() => navigate(routes.category)}
            sx={{
              height: "5vh",
              px: "2vh",
              borderRadius: "1.2vh",
              textTransform: "none",
              fontSize: "1.6vh",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              border: "0.2vh solid #E5E7EB",
              color: "#374151",
              cursor: "pointer",
              flexShrink: 0
            }}
          >
            ✕ Cancel
          </Button>

          {!isViewMode && (
            <Box sx={{ display: "flex", alignItems: "center", gap: "2vh" }}>

              <Button
                variant="contained"
                disabled={submitLoading}
                onClick={handleSubmit}
                sx={{
                  height: "5vh",
                  px: "2vh",
                  borderRadius: "1.2vh",
                  textTransform: "none",
                  fontSize: "1.6vh",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  backgroundColor: "#00695c",
                  color: "#fff",
                  boxShadow: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "1vh",
                  flexShrink: 0,
                  "& .MuiSvgIcon-root": { fontSize: "2vh", fontFamily: "Poppins, sans-serif" }
                }}
              >
                <Check />
                {submitLoading ? "Submitting..." : isEditMode ? "Update College" : "Submit College"}
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
      </Snackbar>
    </Box>
  );
}

export default CollegeConfigPage;
