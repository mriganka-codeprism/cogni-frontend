import React, { useState, useEffect } from "react";
import { Box, Typography, Button, IconButton, InputBase, CircularProgress, Dialog } from "@mui/material";
import {
    Bookmark as BookmarkIcon,
    BookmarkBorder as BookmarkBorderIcon,
    Add as AddIcon,
    DeleteOutline as DeleteOutlineIcon,
    Search as SearchIcon,
    History as HistoryIcon,
    ChevronRight as ChevronRightIcon,
    DescriptionOutlined as DescriptionOutlinedIcon,
    ArrowBackIosNew as ArrowBackIosNewIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { routes } from "../constants/routes";
import { savedDraftsStyles } from "../styles/SavedDrafts.styles";
import { useDraftsStore, Draft } from "../store/draftsStore";
import saveddrafticon from "../assets/images/saveddrafticon.png";
import Layoutsavedraft from "../assets/images/Layoutsavedraft.png";
import Trash2 from "../assets/images/Trash2.png";
import Clock from "../assets/images/Clock.png";
import { getAtsJobs, deleteAtsJob } from "../api/api";
import dayjs from "dayjs";

const SavedDrafts = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { drafts, removeDraft } = useDraftsStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [apiDrafts, setApiDrafts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [draftToDelete, setDraftToDelete] = useState<{ id: string; title: string } | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // ✅ Function to fetch drafts from API
    const fetchDrafts = async () => {
        setLoading(true);
        try {
            const response = await getAtsJobs();
            console.log(" Raw API response for drafts:", response);

            // ✅ Support multiple backend formats
            const jobsList = response?.jobs || response?.data || (Array.isArray(response) ? response : []);

            // ✅ Filter only draft jobs (status === "draft")
            const draftJobs = jobsList.filter((job: any) => {
                const status = (job.status || "").toLowerCase();
                console.log(` Job: ${job.title}, Status: ${job.status}, Full job:`, job);
                return status === "draft";
            });

            console.log(" Fetched draft jobs:", draftJobs);
            setApiDrafts(draftJobs);
        } catch (err) {
            console.error(" Error fetching drafts:", err);
            setApiDrafts([]);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch draft jobs from API on mount
    useEffect(() => {
        fetchDrafts();
    }, []);

    const handleCreateNew = () => {
        // Clear session storage to ensure a fresh start
        const STORAGE_KEYS = [
            "createJobPostForm",
            "evaluationCriteriaForm",
            "otherDetailsForm",
            "atsDetailsForm",
            "criteriaMode",
            "questionnaireForm",
            "realDraftId",
            "tempDraftId",
            "currentActiveStep",
            "resumedDraftMode"
        ];
        STORAGE_KEYS.forEach(key => sessionStorage.removeItem(key));
        sessionStorage.removeItem("questionnaireFiles");

        navigate(routes.createJobPost);
    };

    const handleDeleteClick = (draftId: string, draftTitle: string) => {
        setDraftToDelete({ id: draftId, title: draftTitle });
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!draftToDelete) return;

        try {
            console.log(`🗑️ Deleting draft: ${draftToDelete.title} (ID: ${draftToDelete.id})`);
            await deleteAtsJob(draftToDelete.id);

            // ✅ Update UI instantly after delete
            setApiDrafts((prevDrafts) =>
                prevDrafts.filter((draft) => draft.job_id !== draftToDelete.id && draft.id !== draftToDelete.id)
            );

            console.log(` Draft deleted successfully: ${draftToDelete.title}`);
        } catch (error) {
            console.error(` Failed to delete draft: ${draftToDelete.title}`, error);
        } finally {
            setDeleteDialogOpen(false);
            setDraftToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setDraftToDelete(null);
    };

    // ✅ Handle resuming draft from API response
    const handleResumeDraft = (draftJob: any) => {
        if (!draftJob) return;

        console.log(" Resuming draft from API response:", draftJob);

        // ✅ 1. Store basic details (CreateJobPost expects jobTitle, jobDescription)
        const basicDetails = {
            jobTitle: draftJob.title || "",
            jobDescription: draftJob.description || "",
            fileName: "",
            fileData: "",
        };
        console.log(" Storing basic details:", basicDetails);
        sessionStorage.setItem("createJobPostForm", JSON.stringify(basicDetails));

        // ✅ 2. Store other details (OtherDetails expects specific field names)
        const interview = draftJob.interview_setting || draftJob.interviewSetting || {};
        const avatars = Array.isArray(interview.avatar) ? interview.avatar : (interview.avatar ? [interview.avatar] : interview.avatarOptions || []);
        const otherDetails = {
            roleCategory: interview.category || draftJob.category || "",
            avatar: avatars,
            questionLevel: interview.questionPersonalizer || "Medium",
            duration: String(interview.duration || 30),
            cutoff: String(interview.cutOff || interview.cutoff || 3),
            interviewMode: avatars.length > 0 ? "Avatar" : (interview.interviewMode === "Avatar Based Interview" ? "Avatar" : (interview.interviewMode || "Audio")),
            codingRound: interview.codingRound || "No",
            numberOfQuestions: String(interview.numberOfQuestions || 1),
            codingTimeLimit: String(interview.codingTimeLimit || 15),
            proctoringEnabled: interview.proctoringEnabled ?? true,
        };
        console.log(" Storing other details:", otherDetails);
        sessionStorage.setItem("otherDetailsForm", JSON.stringify(otherDetails));

        // ✅ 3. Store ATS details but mark as "fresh resume" so it doesn't auto-complete
        const atsSettings = draftJob.ats_settings || draftJob.atsSettings || draftJob;
        const apiWeights = atsSettings.parameter_weights || atsSettings.parameterWeights || {};

        // Map API weight field names to component expected names with fallbacks
        const weights = {
            requiredSkill: Number(apiWeights.skills_required || apiWeights.requiredSkill || 10),
            preferredSkill: Number(apiWeights.skills_preferred || apiWeights.preferredSkill || 15),
            educationAlignment: Number(apiWeights.education_alignment || apiWeights.educationAlignment || 30),
            experienceAlignment: Number(apiWeights.experience_alignment || apiWeights.experienceAlignment || 15),
            responsibilityOverlap: Number(apiWeights.responsibility_overlap || apiWeights.responsibilityOverlap || 30),
        };

        // Default weights for comparison
        const defaults = {
            requiredSkill: 10,
            educationAlignment: 30,
            preferredSkill: 15,
            responsibilityOverlap: 30,
            experienceAlignment: 15,
        };

        const isWeightsDefault =
            weights.requiredSkill === defaults.requiredSkill &&
            weights.preferredSkill === defaults.preferredSkill &&
            weights.educationAlignment === defaults.educationAlignment &&
            weights.experienceAlignment === defaults.experienceAlignment &&
            weights.responsibilityOverlap === defaults.responsibilityOverlap;

        // Recover from legacy drafts saved with all ones due to previous bug
        // (Sum of 5 is invalid anyway)
        const isAllOnes = Object.values(weights).every(v => v === 1);
        if (isAllOnes) {
            Object.assign(weights, defaults);
        }

        const apiThreshold = atsSettings.threshold ?? draftJob.threshold;
        const finalThreshold = (apiThreshold !== undefined && apiThreshold !== null) ? Number(apiThreshold) : 70;

        const atsDetails = {
            threshold: finalThreshold,
            allowThresholdEdit: finalThreshold !== 70,
            useCustomWeights: !isWeightsDefault && !isAllOnes,
            weights: weights,
        };
        console.log(" Storing ATS details:", atsDetails);
        sessionStorage.setItem("atsDetailsForm", JSON.stringify(atsDetails));

        // ✅ Mark as fresh draft resume so isStepCompletelyFilled knows not to count ATS as complete
        // ✅ This flag gets removed when user actually modifies ATS values
        sessionStorage.setItem("atsDetailsFormFreshResume", "true");

        // ✅ 4. Store evaluation criteria or questionnaire based on job type
        // ✅ Use jobType field directly if available, otherwise fallback to content detection
        const jobTypeValue = draftJob.jobType;
        let determinedMode = "manual"; // default

        if (jobTypeValue === "upload") {
            determinedMode = "upload";
        } else if (jobTypeValue === "framework") {
            determinedMode = "framework";
        } else if (jobTypeValue === "manual") {
            determinedMode = "manual";
        } else {
            // Fallback: detect based on content
            const predefinedQuestionsAlias = draftJob.predefined_questions || draftJob.predefinedQuestions;
            if (predefinedQuestionsAlias && predefinedQuestionsAlias.length > 0) {
                determinedMode = "upload";
            } else if (draftJob.criteria && draftJob.criteria.length > 0) {
                determinedMode = draftJob.frameworks ? "framework" : "manual";
            }
        }

        console.log(` Resume draft "${draftJob.title}" - Detected mode: ${determinedMode} (jobType: "${jobTypeValue}")`);

        // Now handle data storage based on determined mode
        const predefinedQuestionsAlias = draftJob.predefined_questions || draftJob.predefinedQuestions;
        if (determinedMode === "upload" && predefinedQuestionsAlias && predefinedQuestionsAlias.length > 0) {
            // ✅ Handle both nested format [{questions: [...]}] and flat format [...]
            const questionArray = Array.isArray(predefinedQuestionsAlias[0]?.questions)
                ? predefinedQuestionsAlias[0].questions
                : predefinedQuestionsAlias;

            // ✅ Transform API format {question, answer} to component format {text, answer}
            const transformedQuestions = questionArray.map((q: any) => ({
                text: q.question || q.text || (typeof q === "string" ? q : ""),
                answer: q.answer || "",
            }));

            console.log(" Storing questionnaire (upload mode):", transformedQuestions);
            sessionStorage.setItem("questionnaireForm", JSON.stringify(transformedQuestions));
            // ✅ Directly set criteriaMode so it's restored when CreateJobStepper loads
            sessionStorage.setItem("criteriaMode", "upload");
            sessionStorage.removeItem("resumedDraftMode");
        } else if ((determinedMode === "manual" || determinedMode === "framework") && draftJob.criteria && draftJob.criteria.length > 0) {
            // API format: [{ criteriaTitle, criteriaDescription: { level1, level2, ... } }]
            // Expected format: { criteriaList: [...titles], generatedList: [...descriptions] }

            const criteriaList = draftJob.criteria.map((c: any) => c.criteriaTitle || c.title || "");
            const generatedList = draftJob.criteria.map((c: any) => {
                const desc = c.criteriaDescription || c.description || {};

                // Join level descriptions with dots/periods
                if (typeof desc === 'object' && !Array.isArray(desc)) {
                    const levels = Object.keys(desc)
                        .filter(key => key.startsWith('level'))
                        .sort()
                        .map(key => desc[key])
                        .filter((val: any) => val && val.trim())
                        .join(". ");
                    return levels;
                }

                return typeof desc === 'string' ? desc : "";
            });

            const transformedCriteria = {
                criteriaList,
                generatedList,
            };

            console.log(" Storing criteria (manual/framework mode):", transformedCriteria);
            sessionStorage.setItem("evaluationCriteriaForm", JSON.stringify(transformedCriteria));
            // ✅ Directly set criteriaMode so it's restored when CreateJobStepper loads
            sessionStorage.setItem("criteriaMode", "manual");
            sessionStorage.removeItem("resumedDraftMode");
        } else {
            // ✅ No criteria or questions found - DON'T set criteriaMode so modal shows to user
            console.log(" No criteria/questions found - will show criteria choice modal on resume");
            sessionStorage.removeItem("criteriaMode");
            sessionStorage.removeItem("resumedDraftMode");
        }

        // ✅ 5. Store draft ID to track this draft
        const draftId = draftJob.job_id || draftJob.id || "";
        console.log(" Storing draft ID:", draftId);
        sessionStorage.setItem("realDraftId", draftId);  // Store as real backend ID for update mode
        sessionStorage.removeItem("tempDraftId"); // Clear any temp ID

        // ✅ 6. Always start from step 0 - let the user navigate through steps
        sessionStorage.setItem("currentActiveStep", "0");

        console.log("✅ All draft data stored to sessionStorage. Navigating to CreateJobStepper...");
        navigate(routes.createJobPost);
    };

    const filteredDrafts = apiDrafts.filter((draft: any) =>
        (draft.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box sx={savedDraftsStyles.root}>
            {/* Header Section */}
            <Box sx={savedDraftsStyles.header}>
                <Box sx={savedDraftsStyles.headerLeft}>
                    <IconButton onClick={() => navigate(routes.createJob)} sx={savedDraftsStyles.backButton}>
                        <ArrowBackIosNewIcon sx={savedDraftsStyles.backIcon} />
                    </IconButton>
                    <Box sx={savedDraftsStyles.iconBox}>
                        <img src={saveddrafticon} alt="" style={{ height: "2.3vh", width: "2.3vh" }} />
                    </Box>
                    <Box>
                        <Typography sx={savedDraftsStyles.title}>Saved Drafts</Typography>
                        <Typography sx={savedDraftsStyles.subtitle}>{apiDrafts.length} drafts saved</Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={savedDraftsStyles.createButton}
                    onClick={handleCreateNew}
                >
                    Create New
                </Button>
            </Box>

            {/* Search Bar */}
            {apiDrafts.length > 0 && (
                <Box sx={savedDraftsStyles.searchContainer}>
                    <Box sx={savedDraftsStyles.searchInput}>
                        <SearchIcon sx={{ color: "#aaa", fontSize: "2.2vh" }} />
                        <InputBase
                            placeholder="Search drafts by title..."
                            fullWidth
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ fontSize: "1.6vh" }}
                        />
                    </Box>
                </Box>
            )}

            {/* Main Content Area */}
            <Box sx={savedDraftsStyles.content}>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "40vh", width: "100%" }}>
                        <CircularProgress sx={{ color: "#006b66" }} />
                    </Box>
                ) : apiDrafts.length === 0 ? (
                    <Box sx={savedDraftsStyles.emptyState}>
                        <Box sx={savedDraftsStyles.emptyIconBox}>
                            <BookmarkBorderIcon sx={{ fontSize: "6vh", color: "#ccc" }} />
                        </Box>
                        <Typography sx={savedDraftsStyles.emptyTitle}>No Drafts Yet</Typography>
                        <Typography sx={savedDraftsStyles.emptySubtitle}>
                            When you leave a job post without publishing, you'll be prompted to save it as a draft here.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={savedDraftsStyles.gridContainer}>
                        {filteredDrafts.map((draft: any) => {
                            const interview = draft.interview_setting || draft.interviewSetting || {};
                            // Fetch progress from interview_setting - API returns it there after PUT saves
                            const progressValue = interview.progress !== undefined ? interview.progress : 50;
                            // Fetch stoppedAt from interview_setting - API returns it there after PUT saves
                            const stoppedAtValue = interview.stoppedAt || "Draft";

                            return (
                                <Box key={draft.job_id || draft.id} sx={savedDraftsStyles.draftCard}>
                                    <Box sx={{ display: "flex", gap: "1.8vh", alignItems: "flex-start", width: "100%" }}>
                                        <Box sx={savedDraftsStyles.cardIconBox}>
                                            <img src={Layoutsavedraft} alt="" style={{ height: "2vh", width: "2vh" }} />
                                        </Box>
                                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "1vh" }}>
                                            <Typography sx={savedDraftsStyles.cardTitle}>
                                                {draft.title || "Untitled Job Post"}
                                            </Typography>
                                            <Box sx={savedDraftsStyles.tagContainer}>
                                                <Box sx={savedDraftsStyles.tag}>
                                                    {(() => {
                                                        console.log("🔍 Draft type detection for:", draft.title, {
                                                            jobType: draft.jobType,
                                                            predefinedQuestions: draft.predefinedQuestions,
                                                            predefinedQuestionsLength: draft.predefinedQuestions?.length,
                                                            frameworks: draft.frameworks,
                                                            criteria: draft.criteria,
                                                            frameworksLength: draft.frameworks?.length,
                                                            criteriaLength: draft.criteria?.length,
                                                            allKeys: Object.keys(draft)
                                                        });

                                                        // Check jobType first
                                                        if (draft.jobType === "upload") {
                                                            console.log(` "${draft.title}" is Question-Based (jobType=upload)`);
                                                            return "Question-Based";
                                                        } else if (draft.jobType === "manual" || draft.jobType === "framework") {
                                                            console.log(` "${draft.title}" is Framework-Based (jobType=${draft.jobType})`);
                                                            return "Framework-Based";
                                                        }

                                                        // Fallback: Check predefinedQuestions (upload mode indicator)
                                                        const hasQuestions = draft.predefinedQuestions && draft.predefinedQuestions.length > 0;
                                                        if (hasQuestions) {
                                                            console.log(` "${draft.title}" is Question-Based (has predefinedQuestions)`);
                                                            return "Question-Based";
                                                        }

                                                        // Fallback: Check frameworks/criteria (manual/framework mode indicator)
                                                        const hasFrameworks = draft.frameworks && draft.frameworks.length > 0;
                                                        const hasCriteria = draft.criteria && draft.criteria.length > 0;

                                                        if (hasFrameworks) {
                                                            console.log(` "${draft.title}" is Framework-Based (has frameworks)`);
                                                            return "Framework-Based";
                                                        }

                                                        if (hasCriteria) {
                                                            console.log(` "${draft.title}" is Framework-Based (has criteria)`);
                                                            return "Framework-Based";
                                                        }

                                                        console.log(` "${draft.title}" - Cannot determine type, returning Not Specified`);
                                                        return "Not Specified";
                                                    })()}
                                                </Box>
                                                <Box sx={savedDraftsStyles.tag}>
                                                    {interview.role || draft.role || "Lateral"}
                                                </Box>
                                            </Box>

                                            <Box sx={savedDraftsStyles.progressSection}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: "0.5vh", width: "100%" }}>
                                                    <Box sx={savedDraftsStyles.progressBarContainer}>
                                                        <Box sx={savedDraftsStyles.progressBar(progressValue)} />
                                                    </Box>
                                                    <Typography sx={savedDraftsStyles.progressPercent}>
                                                        {progressValue}%
                                                    </Typography>
                                                </Box>
                                                <Box sx={savedDraftsStyles.progressMetadata}>
                                                    <Box sx={savedDraftsStyles.savedAtContainer}>
                                                        <img src={Clock} alt="" style={{ height: "1.6vh", width: "1.6vh" }} />
                                                        <Typography sx={savedDraftsStyles.savedAt}>
                                                            Saved {draft.createdOn ? dayjs(draft.createdOn).format("MM/DD/YYYY") : "Recently"}
                                                        </Typography>
                                                    </Box>
                                                    <Typography sx={savedDraftsStyles.stoppedAt}>
                                                        Saved at: <span style={savedDraftsStyles.stoppedAtHighlight as React.CSSProperties}>{stoppedAtValue}</span>
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: "flex", gap: "1vh", alignItems: "center", marginTop: "0vh", justifyContent: "center", marginLeft: "3.4vh" }}>
                                        <Button
                                            variant="contained"
                                            sx={savedDraftsStyles.continueBtn}
                                            onClick={() => handleResumeDraft(draft)}
                                        >
                                            Continue
                                        </Button>
                                        <IconButton
                                            size="small"
                                            sx={savedDraftsStyles.deleteBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(draft.job_id || draft.id, draft.title || "Untitled");
                                            }}
                                        >
                                            <img src={Trash2} alt="" style={{ height: "2.2vh", width: "2.2vh" }} />
                                        </IconButton>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Box>

            {/* DELETE CONFIRMATION DIALOG */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        borderRadius: "1vh",
                        overflow: "hidden",
                        maxWidth: "35vw",
                    },
                }}
            >
                <Box
                    sx={{
                        background: "linear-gradient(108deg, #004d40 0%, #00605a 45%, #004d40 100%)",
                        color: "#fff",
                        padding: "2vh 3vh",
                        fontSize: "1.8vh",
                        fontWeight: 600,
                    }}
                >
                    Delete Draft
                </Box>
                <Box sx={{ padding: "3vh" }}>
                    <Typography sx={{ color: "#333", fontSize: "1.5vh", marginBottom: "3vh" }}>
                        Are you sure you want to delete this draft? This action cannot be undone.
                    </Typography>
                    <Box sx={{ display: "flex", gap: "1.5vh", justifyContent: "flex-end" }}>
                        <Button
                            onClick={handleCancelDelete}
                            variant="outlined"
                            sx={{
                                color: "#006b66",
                                borderColor: "#006b66",
                                borderRadius: "0.5vh",
                                textTransform: "none",
                                fontSize: "1.5vh",
                                fontWeight: 500,
                                padding: "0.5vh 2vh",
                                "&:hover": {
                                    borderColor: "#004d40",
                                    backgroundColor: "rgba(0,107,102,0.05)",
                                },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmDelete}
                            variant="contained"
                            sx={{
                                backgroundColor: "#006b66",
                                color: "#fff",
                                borderRadius: "0.5vh",
                                textTransform: "none",
                                fontSize: "1.5vh",
                                fontWeight: 500,
                                padding: "0.5vh 2vh",
                                "&:hover": {
                                    backgroundColor: "#006b66",
                                },
                            }}
                        >
                            Confirm
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        </Box>
    );
};

export default SavedDrafts;
