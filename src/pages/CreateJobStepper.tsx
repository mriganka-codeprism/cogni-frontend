import { Box, Typography, Button, Dialog, Divider, Snackbar, Alert } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../constants/routes";
//import Sidenav from "./Sidenav";
import { styles } from "../styles/CreateJobStepper.styles";
import CreateJobPost from "./CreateJobPost";
import FrameworkDetails from "./FrameworkDetails";
import EvaluationCriteria from "./EvaluationCriteria";
import OtherDetails from "./OtherDetails";
import ATSDetails from "./ATSDetails";
import ReviewSubmit from "./ReviewSubmit";
import QuestionnaireUpload from "./QuestionnaireUpload";
import CriteriaChoiceModal from "../components/CriteriaChoiceModal/CriteriaChoiceModal";
import { submitAtsJobDraft, updateAtsJobcriteria, updateAtsJobquestion } from "../api/api";
import HomeIcon from '@mui/icons-material/Home';
import LeaveJobCreationModal from "../components/LeaveJobCreationModal";
import { useDraftsStore } from "../store/draftsStore";
import { clearCreateJobPostSession } from "../utils/clearCreateJobPostSession";



const STEP_LABELS = [
  "Basic Details",
  // "Personality Traits",
  "Focus of Evaluation",
  "Interview Settings",
  "ATS Configuration"
];

const STEP_LABELS_WITH_UPLOAD = [
  "Basic Details",
  "Questionnaire",
  "Interview Settings",
  "ATS Configuration"
];

const STORAGE_KEYS = {
  basic: "createJobPostForm",
  evaluation: "evaluationCriteriaForm",
  other: "otherDetailsForm",
  ats: "atsDetailsForm",
  criteriaMode: "criteriaMode", // "manual" or "upload"
  questionnaire: "questionnaireForm",
  draftId: "currentDraftId",
  activeStep: "currentActiveStep",
};

// ✅ Validation function to check if all fields on a step are complete
const isStepCompletelyFilled = (stepIndex: number, criteriaMode: "manual" | "upload" | null): boolean => {
  if (!criteriaMode) return false; // No mode selected yet
  
  const isManual = criteriaMode === "manual";

  // Step 0: Basic Details
  if (stepIndex === 0) {
    const basicData = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.basic) || "{}");
    return !!(basicData.jobTitle?.trim() && basicData.jobDescription?.trim());
  }

  // Manual Mode (4 steps)
  if (isManual) {
    // Step 1: Evaluation Criteria
    if (stepIndex === 1) {
      const criteriaData = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.evaluation) || "{}");
      const criteriaList = criteriaData.criteriaList || [];
      const generatedList = criteriaData.generatedList || [];
      return (
        Array.isArray(criteriaList) &&
        criteriaList.length > 0 &&
        criteriaList.every((c: any) => c?.trim()) &&
        Array.isArray(generatedList) &&
        generatedList.length === criteriaList.length &&
        generatedList.every((g: any) => g?.trim())
      );
    }

    // Step 2: Interview Settings (Other Details)
    if (stepIndex === 2) {
      const otherData = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.other) || "{}");
      // ✅ Data exists means user or resume has filled it - this is enough for accessibility
      // Detailed validation will happen when user tries to submit/publish
      const hasData = !!(
        otherData.roleCategory?.trim() ||
        (Array.isArray(otherData.avatar) && otherData.avatar.length > 0)
      );
      if (hasData) return true;
      
      // ✅ Strict validation only applies if we have complete data
      // Avatar only required if NOT Audio mode
      const avatarRequired = otherData.interviewMode !== "Audio";
      return !!(
        otherData.roleCategory?.trim() &&
        (avatarRequired ? (Array.isArray(otherData.avatar) && otherData.avatar.length > 0) : true)
      );
    }

    // Step 3: ATS Configuration
    if (stepIndex === 3) {
      const atsData = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.ats) || "{}");
      const weights = atsData.weights_snake || atsData.weights || {};
      const weightValues = Object.values(weights).map((w: any) => Number(w) || 0);
      const weightsSum = weightValues.reduce((a: number, b: number) => a + b, 0);
      
      // ✅ If data exists in sessionStorage (resumed draft or previously filled), consider it for accessibility
      const hasAnyData = !!(atsData.threshold || Object.keys(weights).length > 0);
      
      // ✅ Check if threshold has been modified from default (70)
      const defaultThreshold = 70;
      const thresholdModified = atsData.threshold && atsData.threshold !== defaultThreshold;
      
      // ✅ Default weights for comparison
      const defaultWeights = {
        requiredSkill: 10,
        preferredSkill: 15,
        experienceAlignment: 15,
        educationAlignment: 30,
        responsibilityOverlap: 30,
      };
      
      // ✅ Check if weights differ from defaults (user has modified them)
      const snakeCaseWeights = {
        skills_required: weights.requiredSkill,
        skills_preferred: weights.preferredSkill,
        experience_alignment: weights.experienceAlignment,
        education_alignment: weights.educationAlignment,
        responsibility_overlap: weights.responsibilityOverlap,
      };
      
      const hasNonDefaultWeights = (
        (weights.requiredSkill || snakeCaseWeights.skills_required) !== defaultWeights.requiredSkill ||
        (weights.preferredSkill || snakeCaseWeights.skills_preferred) !== defaultWeights.preferredSkill ||
        (weights.experienceAlignment || snakeCaseWeights.experience_alignment) !== defaultWeights.experienceAlignment ||
        (weights.educationAlignment || snakeCaseWeights.education_alignment) !== defaultWeights.educationAlignment ||
        (weights.responsibilityOverlap || snakeCaseWeights.responsibility_overlap) !== defaultWeights.responsibilityOverlap
      );
      
      // ✅ If user modified threshold OR weights, they've worked on this step - mark as complete
      if (thresholdModified || hasNonDefaultWeights) {
        return weightsSum === 100; // Weights must sum to 100 for valid submission
      }
      
      // ✅ If any data exists but fresh resume flag is set and threshold not modified, might not be complete
      const isFreshResume = !!sessionStorage.getItem("atsDetailsFormFreshResume");
      if (isFreshResume && hasAnyData) {
        return false; // Not complete on fresh draft resume with unmodified data
      }
      
      // ✅ For resumed drafts with data (threshold or weights), consider as complete and allow access
      if (hasAnyData && !isFreshResume) {
        return true; // Has data from previous work, allow access
      }
      
      // ✅ Strict validation for new jobs or when no data exists
      return !!(
        atsData.threshold &&
        weights &&
        Object.keys(weights).length >= 5 &&
        weightsSum === 100
      );
    }
  }

  // Upload Mode (4 steps)
  if (!isManual) {
    // Step 1: Questionnaire
    if (stepIndex === 1) {
      const questionnaireData = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.questionnaire) || "[]");
      return (
        Array.isArray(questionnaireData) &&
        questionnaireData.length > 0 &&
        questionnaireData.every((q: any) => {
          const questionText = typeof q === 'string' ? q : (q.text || q.question || "");
          return questionText?.trim();
        })
      );
    }

    // Step 2: Interview Settings (Other Details)
    if (stepIndex === 2) {
      const otherData = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.other) || "{}");
      // ✅ Data exists means user or resume has filled it - this is enough for accessibility
      const hasData = !!(
        otherData.roleCategory?.trim() ||
        (Array.isArray(otherData.avatar) && otherData.avatar.length > 0)
      );
      if (hasData) return true;
      
      // ✅ Strict validation only applies if we have complete data
      // Avatar only required if NOT Audio mode
      const avatarRequired = otherData.interviewMode !== "Audio";
      return !!(
        otherData.roleCategory?.trim() &&
        (avatarRequired ? (Array.isArray(otherData.avatar) && otherData.avatar.length > 0) : true)
      );
    }

    // Step 3: ATS Configuration
    if (stepIndex === 3) {
      const atsData = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.ats) || "{}");
      const weights = atsData.weights_snake || atsData.weights || {};
      const weightValues = Object.values(weights).map((w: any) => Number(w) || 0);
      const weightsSum = weightValues.reduce((a: number, b: number) => a + b, 0);
      
      // ✅ If data exists in sessionStorage (resumed draft or previously filled), consider it for accessibility
      const hasAnyData = !!(atsData.threshold || Object.keys(weights).length > 0);
      
      // ✅ Check if threshold has been modified from default (70)
      const defaultThreshold = 70;
      const thresholdModified = atsData.threshold && atsData.threshold !== defaultThreshold;
      
      // ✅ Default weights for comparison
      const defaultWeights = {
        requiredSkill: 10,
        preferredSkill: 15,
        experienceAlignment: 15,
        educationAlignment: 30,
        responsibilityOverlap: 30,
      };
      
      // ✅ Check if weights differ from defaults (user has modified them)
      const snakeCaseWeights = {
        skills_required: weights.requiredSkill,
        skills_preferred: weights.preferredSkill,
        experience_alignment: weights.experienceAlignment,
        education_alignment: weights.educationAlignment,
        responsibility_overlap: weights.responsibilityOverlap,
      };
      
      const hasNonDefaultWeights = (
        (weights.requiredSkill || snakeCaseWeights.skills_required) !== defaultWeights.requiredSkill ||
        (weights.preferredSkill || snakeCaseWeights.skills_preferred) !== defaultWeights.preferredSkill ||
        (weights.experienceAlignment || snakeCaseWeights.experience_alignment) !== defaultWeights.experienceAlignment ||
        (weights.educationAlignment || snakeCaseWeights.education_alignment) !== defaultWeights.educationAlignment ||
        (weights.responsibilityOverlap || snakeCaseWeights.responsibility_overlap) !== defaultWeights.responsibilityOverlap
      );
      
      // ✅ If user modified threshold OR weights, mark as complete
      if (thresholdModified || hasNonDefaultWeights) {
        return weightsSum === 100;
      }
      
      // ✅ If any data exists but fresh resume flag is set and threshold not modified, don't count as complete yet
      const isFreshResume = !!sessionStorage.getItem("atsDetailsFormFreshResume");
      if (isFreshResume && hasAnyData) {
        return false; // Not complete on fresh draft resume with unmodified data
      }
      
      // ✅ For resumed drafts with data, consider as complete and allow access
      if (hasAnyData && !isFreshResume) {
        return true; // Has data from previous work, allow access
      }
      
      // ✅ Strict validation for new jobs or when no data exists
      return !!(
        atsData.threshold &&
        weights &&
        Object.keys(weights).length >= 5 &&
        weightsSum === 100
      );
    }
  }

  return false;
};

const CreateJobStepper = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [openReview, setOpenReview] = useState(false);
  
  // ✅ Initialize criteriaMode from sessionStorage first (for resumed drafts)
  const [criteriaMode, setCriteriaMode] = useState<"manual" | "upload" | null>(
    () => {
      const saved = sessionStorage.getItem(STORAGE_KEYS.criteriaMode) as "manual" | "upload" | null;
      return saved || null;
    }
  );
  
  // ✅ Modal is controlled by handleSaveAndContinue, initialize to false
  const [showCriteriaChoice, setShowCriteriaChoice] = useState(false);
  
  const [clearTriggers, setClearTriggers] = useState<Record<number, number>>({
    0: 0,
    1: 0,
    2: 0,
    3: 0
  });

  // ✅ Detect page reload and clear all data if reloaded
  useEffect(() => {
    const handleReload = () => {
      clearCreateJobPostSession();
    };

    window.addEventListener("beforeunload", handleReload);

    return () => {
      window.removeEventListener("beforeunload", handleReload);
    };
  }, []);

  // ✅ Restore active step on mount (for resumed drafts or page reloads)
  useEffect(() => {
    const savedStep = sessionStorage.getItem(STORAGE_KEYS.activeStep);
    if (savedStep) {
      setActiveStep(parseInt(savedStep, 10));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.activeStep, activeStep.toString());
  }, [activeStep]);

  const saveATSRef = useRef<(() => Promise<boolean>) | null>(null);

  const [showReview, setShowReview] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const { addDraft } = useDraftsStore();

  const handleBackToHome = () => {
    const hasData = !!sessionStorage.getItem(STORAGE_KEYS.basic) || !!sessionStorage.getItem(STORAGE_KEYS.evaluation);
    if (hasData) {
      setShowLeaveModal(true);
    } else {
      navigate(routes.createJob);
    }
  };

  const handleLeaveConfirm = async (action: "save" | "delete") => {
    console.log(`🚀 handleLeaveConfirm started with action: ${action}`);
    const { setDirty } = useDraftsStore.getState();
    
    if (action === "save") {
      let data: any;
      try {
        data = getReviewData();
        console.log("📦 Data retrieved for saving:", data);
      } catch (err) {
        console.error("❌ Failed to get review data from sessionStorage:", err);
        data = { basicDetails: {}, evaluationCriteria: { criteriaList: [], generatedList: [] }, atsDetails: {}, otherDetails: {} };
      }

      const labels = criteriaMode === "upload" ? STEP_LABELS_WITH_UPLOAD : STEP_LABELS;
      const progress = Math.round(((activeStep + 1) / labels.length) * 100);

      const realDraftIdFromSession = sessionStorage.getItem("realDraftId");
      let tempDraftIdFromSession = sessionStorage.getItem("tempDraftId");

      if (!realDraftIdFromSession && !tempDraftIdFromSession) {
        tempDraftIdFromSession = Date.now().toString();
        sessionStorage.setItem("tempDraftId", tempDraftIdFromSession);
      }

      const draftId = realDraftIdFromSession || tempDraftIdFromSession;
      console.log(`📝 Draft ID being used: ${draftId}`);

      try {
        const token = sessionStorage.getItem("access_token") || "";
        const weights = {
          skills_required: Number(data.atsDetails?.weights?.requiredSkill || 10),
          skills_preferred: Number(data.atsDetails?.weights?.preferredSkill || 15),
          education_alignment: Number(data.atsDetails?.weights?.educationAlignment || 30),
          experience_alignment: Number(data.atsDetails?.weights?.experienceAlignment || 15),
          responsibility_overlap: Number(data.atsDetails?.weights?.responsibilityOverlap || 30),
        };

        const selectedAvatar = Array.isArray(data.otherDetails?.avatar)
          ? data.otherDetails.avatar[0]
          : data.otherDetails?.avatar;

        const avatarOptions = Array.isArray(data.otherDetails?.avatar)
          ? data.otherDetails.avatar
          : selectedAvatar
            ? [selectedAvatar]
            : [];

        const isAudioMode = data.otherDetails?.interviewMode === "Audio";

        const interviewSetting = {
          role: data.otherDetails?.role || "Lateral",
          category: data.otherDetails?.roleCategory || "",
          duration: Number(data.otherDetails?.duration || 30),
          questionPersonalizer: data.otherDetails?.questionLevel || "",
          interviewMode: data.otherDetails?.interviewMode === "Avatar" ? "Avatar Based Interview" : "Audio",
          avatar: isAudioMode ? null : (selectedAvatar || ""),
          avatarOptions: isAudioMode ? null : avatarOptions,
          cutOff: Number(data.otherDetails?.cutoff || 3),
          codingRound: data.otherDetails?.codingRound || "No",
          numberOfQuestions: data.otherDetails?.codingRound === "No" ? undefined : Number(data.otherDetails?.numberOfQuestions || 1),
          codingTimeLimit: data.otherDetails?.codingRound === "No" ? undefined : Number(data.otherDetails?.codingTimeLimit || 15),
          proctoringEnabled: data.otherDetails?.proctoringEnabled ?? true,
          progress: progress,
          stoppedAt: labels[activeStep] || "Draft",
        };

        let criteria: any = [];
        let questions: any = [];

        if (criteriaMode === "upload") {
          const qData = sessionStorage.getItem("questionnaireForm");
          const questionnaireData = qData ? JSON.parse(qData) : [];
          questions = questionnaireData.map((q: any) => ({
            question: typeof q === 'string' ? q : (q.text || q.question || ""),
            answer: typeof q === 'string' ? null : (q.answer || null),
          }));
        } else {
          criteria = data.evaluationCriteria?.criteriaList?.map((title: string, index: number) => {
            const description = data.evaluationCriteria?.generatedList?.[index] || "";
            const descParts = description.split(".").map((part: string) => part.trim()).filter((part: string) => part.length > 0);
            return {
              criteriaTitle: title || "",
              criteriaDescription: {
                level1: descParts[0] || "",
                level2: descParts[1] || "",
                level3: descParts[2] || "",
                level4: descParts[3] || "",
                level5: descParts[4] || "",
              },
            };
          }) || [];
        }

        const backendCriteria = criteriaMode === "upload" ? null : (criteria || []);

        // ✅ SAVE TO LOCAL STORE FIRST (IMMEDIATE)
        const finalDraftId = sessionStorage.getItem("realDraftId") || draftId!;
        
        // ✅ Include criteriaMode in the draft data so it can be restored
        const draftData = {
          ...data,
          criteriaMode: criteriaMode || "manual" // Always include the selected criteria mode in draft
        };
        
        addDraft({
          id: finalDraftId,
          title: data.basicDetails?.jobTitle || "Untitled Job",
          description: data.basicDetails?.jobDescription || "",
          savedAt: new Date().toISOString(),
          progress: progress,
          stoppedAt: labels[activeStep] || "Draft",
          activeStep: activeStep,
          tags: [criteriaMode === "upload" ? "Questionnaire-Based" : "Framework-Based", "Lateral"],
          data: draftData,
        });

        // ✅ FIRE API CALL (BACKGROUND)
        console.log("📡 Starting background API call...");
        (async () => {
          try {
            if (realDraftIdFromSession) {
              if (criteriaMode === "upload") {
                await updateAtsJobquestion(token, realDraftIdFromSession, data.basicDetails?.jobTitle || "", data.basicDetails?.jobDescription || "", Number(data.atsDetails?.threshold ?? 70), weights, interviewSetting, questions, "draft", "upload");
              } else {
                await updateAtsJobcriteria(token, realDraftIdFromSession, data.basicDetails?.jobTitle || "", data.basicDetails?.jobDescription || "", Number(data.atsDetails?.threshold ?? 70), weights, interviewSetting, [], backendCriteria, "draft", "manual");
              }
            } else {
              const apiResponse = await submitAtsJobDraft(token, data.basicDetails?.jobTitle, data.basicDetails?.jobDescription, Number(data.atsDetails?.threshold || 70), weights, interviewSetting, questions, [], backendCriteria, undefined, criteriaMode || undefined);
              const newDraftId = apiResponse?.id || apiResponse?.job_id;
              if (newDraftId) {
                sessionStorage.setItem("realDraftId", newDraftId);
              }
            }
            console.log("✅ Background API call finished successfully");
          } catch (apiError) {
            console.error("❌ Background API call failed:", apiError);
          }
        })();

        // ✅ NAVIGATE IMMEDIATELY
        console.log("🚀 Navigating to /saved-drafts (IMMEDIATE)");
        setShowLeaveModal(false);
        setDirty(false);
        
        setTimeout(() => {
          navigate(routes.savedDrafts);
          
          setTimeout(() => {
            const keysToKeep = ["access_token", "refresh_token", "user_role", "user_name"];
            const currentKeys = Object.keys(sessionStorage);
            currentKeys.forEach(key => {
              if (!keysToKeep.includes(key) && !key.startsWith("msal.")) {
                sessionStorage.removeItem(key);
              }
            });
            sessionStorage.removeItem("resumedDraftMode");
            sessionStorage.removeItem("realDraftId");
            sessionStorage.removeItem("tempDraftId");
            sessionStorage.removeItem("currentActiveStep");
          }, 500);
        }, 50);

      } catch (error: any) {
        console.error("❌ Failed to initiate save:", error);
        setShowLeaveModal(false);
        setDirty(false);
        navigate(routes.savedDrafts);
      }
    } else {
      // Exit Editing (Discard)
      setShowLeaveModal(false);
      const existingDraftId = sessionStorage.getItem("realDraftId");
      if (existingDraftId) {
        useDraftsStore.getState().removeDraft(existingDraftId);
      }
      setDirty(false);
      
      const draftCleanupKeys = ["createJobPostForm", "evaluationCriteriaForm", "otherDetailsForm", "atsDetailsForm", "criteriaMode", "questionnaireForm", "questionnaireFiles", "currentDraftId", "realDraftId", "tempDraftId", "currentActiveStep", "resumedDraftMode"];
      draftCleanupKeys.forEach(key => sessionStorage.removeItem(key));
      
      navigate(routes.createJob);
    }
  };

  // Clear questionnaire data on mount (reload/new visit)
  useEffect(() => {
    if (!sessionStorage.getItem("realDraftId")) {
      sessionStorage.removeItem(STORAGE_KEYS.questionnaire);
      sessionStorage.removeItem("questionnaireFiles");
    }
  }, []);



  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("Please enter all required fields");
  const [validationTrigger, setValidationTrigger] = useState(0);


  const handleCloseReview = () => setOpenReview(false);

  const handleEnterCriteria = () => {
    // ✅ Always clear ATS when switching to/confirming manual mode (fresh evaluation of weights)
    sessionStorage.removeItem(STORAGE_KEYS.ats);
    sessionStorage.removeItem("atsDetailsFormFreshResume"); // Also clear the fresh resume flag
    
    // ✅ Only clear steps 1+ if there's no existing data (fresh start, not resuming)
    const hasExistingData = !!sessionStorage.getItem("frameworkDetailsForm") || 
                           !!sessionStorage.getItem(STORAGE_KEYS.evaluation) ||
                           !!sessionStorage.getItem(STORAGE_KEYS.other);
    
    // If no existing data, clear questionnaire for clean start
    if (!hasExistingData) {
      sessionStorage.removeItem("frameworkDetailsForm");
      sessionStorage.removeItem(STORAGE_KEYS.evaluation);
      sessionStorage.removeItem(STORAGE_KEYS.other);
      sessionStorage.removeItem(STORAGE_KEYS.questionnaire);
    }
    
    setCriteriaMode("manual");
    sessionStorage.setItem(STORAGE_KEYS.criteriaMode, "manual");
    setShowCriteriaChoice(false);
    setActiveStep(1); // Go to FrameworkDetails
  };

  const handleUploadQuestionnaire = () => {
    // ✅ Always clear ATS when switching to/confirming upload mode (fresh evaluation of weights)
    sessionStorage.removeItem(STORAGE_KEYS.ats);
    sessionStorage.removeItem("atsDetailsFormFreshResume"); // Also clear the fresh resume flag
    
    // ✅ Only clear steps 1+ if there's no existing data (fresh start, not resuming)
    const hasExistingData = !!sessionStorage.getItem(STORAGE_KEYS.questionnaire) ||
                           !!sessionStorage.getItem(STORAGE_KEYS.other);
    
    // If no existing data, clear to ensure clean start
    if (!hasExistingData) {
      sessionStorage.removeItem("frameworkDetailsForm");
      sessionStorage.removeItem(STORAGE_KEYS.evaluation);
      sessionStorage.removeItem(STORAGE_KEYS.other);
      sessionStorage.removeItem(STORAGE_KEYS.questionnaire);
    }
    
    setCriteriaMode("upload");
    sessionStorage.setItem(STORAGE_KEYS.criteriaMode, "upload");
    setShowCriteriaChoice(false);
    setActiveStep(1); // Go to QuestionnaireUpload (step 1 in upload mode)
  };

  const handleClearAll = () => {
    // remove storage for current step based on mode
    if (activeStep === 0) {
      sessionStorage.removeItem(STORAGE_KEYS.basic);
    } else if (criteriaMode === "manual") {
      // Manual Mode Steps: 0:Basic, 1:Evaluation, 2:Other, 3:ATS
      switch (activeStep) {
        case 1: sessionStorage.removeItem(STORAGE_KEYS.evaluation); break;
        case 2: sessionStorage.removeItem(STORAGE_KEYS.other); break;
        case 3: sessionStorage.removeItem(STORAGE_KEYS.ats); break;
      }
    } else if (criteriaMode === "upload") {
      // Upload Mode Steps: 0:Basic, 1:Questionnaire, 2:Other, 3:ATS
      switch (activeStep) {
        case 1:
          sessionStorage.removeItem(STORAGE_KEYS.questionnaire);
          sessionStorage.removeItem("questionnaireFiles");
          break;
        case 2: sessionStorage.removeItem(STORAGE_KEYS.other); break;
        case 3: sessionStorage.removeItem(STORAGE_KEYS.ats); break;
      }
    }

    // reset the form UI
    setClearTriggers(prev => ({
      ...prev,
      [activeStep]: (prev[activeStep] || 0) + 1
    }));
  };

  // const handleClearAll = () => {
  //   if (activeStep === 0) {
  //     sessionStorage.removeItem(STORAGE_KEYS.basic);
  //   }
  //   if (activeStep === 2) {
  //     sessionStorage.removeItem(STORAGE_KEYS.evaluation);
  //   }
  //   if (activeStep === 3) {
  //     sessionStorage.removeItem(STORAGE_KEYS.other);
  //   }

  //   setClearTriggers(prev => ({
  //     ...prev,
  //     [activeStep]: prev[activeStep] + 1
  //   }));
  // };


  const handleBack = () => {
    if (activeStep > 0) setActiveStep((s) => s - 1);
  };

  const validateCurrentStep = async () => {

    // Step 0 validation (Job Details) - Same for both modes
    if (activeStep === 0) {
      const savedBasic = sessionStorage.getItem(STORAGE_KEYS.basic);
      if (!savedBasic) {
        setSnackbarOpen(true);
        setValidationTrigger(v => v + 1);
        return false;
      }

      const parsed = JSON.parse(savedBasic);
      const title = parsed.jobTitle?.trim() || "";
      const description = parsed.jobDescription?.trim() || "";

      // Regex for at least one alphanumeric character
      const hasAlphanumeric = /[a-zA-Z0-9]/;

      if (!title || !description) {
        setSnackbarMessage("Please enter all required fields");
        setSnackbarOpen(true);
        setValidationTrigger(v => v + 1);
        return false;
      }

      if (!hasAlphanumeric.test(title)) {
        setSnackbarMessage("Please enter a valid job title");
        setSnackbarOpen(true);
        setValidationTrigger(v => v + 1);
        return false;
      }

      if (!hasAlphanumeric.test(description)) {
        setSnackbarMessage("Please enter a valid job description");
        setSnackbarOpen(true);
        setValidationTrigger(v => v + 1);
        return false;
      }

      // ✅ Word count validation (Limit: 1000 words)
      const wordCount = description.trim() ? description.trim().split(/\s+/).length : 0;
      if (wordCount > 1000) {
        setSnackbarMessage("Word limit exceeded. Please shorten your job description.");
        setSnackbarOpen(true);
        setValidationTrigger(v => v + 1);
        return false;
      }

      // ✅ Don't check criteriaMode here - let handleSaveAndContinue handle modal
      return true;
    }

    // MANUAL MODE: Step 1 (FrameworkDetails) and Step 2 (EvaluationCriteria)
    if (criteriaMode === "manual") {
      // Step 1 validation (Evaluation Criteria) - Manual mode only
      if (activeStep === 1) {
        const savedEval = sessionStorage.getItem(STORAGE_KEYS.evaluation);
        if (!savedEval) {
          setSnackbarMessage("Please enter all required fields");
          setSnackbarOpen(true);
          setValidationTrigger(v => v + 1);
          return false;
        }

        const parsed = JSON.parse(savedEval);
        const valid =
          parsed.criteriaList?.length > 0 &&
          parsed.criteriaList.every((title: string, i: number) =>
            title?.trim() && parsed.generatedList[i]?.trim()
          );

        if (!valid) {
          setSnackbarMessage("Please fill in all criteria title and description fields");
          setSnackbarOpen(true);
          setValidationTrigger(v => v + 1);
          return false;
        }

        // ✅ Word count validation (Limit: 500 words per description)
        const hasWordLimitExceeded = (parsed.generatedList || []).some((desc: string) => {
          const wordCount = desc.trim() ? desc.trim().split(/\s+/).length : 0;
          return wordCount > 500;
        });

        if (hasWordLimitExceeded) {
          setSnackbarMessage("One or more evaluation criteria exceed the 500-word limit.");
          setSnackbarOpen(true);
          setValidationTrigger(v => v + 1);
          return false;
        }
      }

      // Step 2 validation (Interview Settings) - Manual mode
      if (activeStep === 2) {
        const formData = sessionStorage.getItem(STORAGE_KEYS.other);

        if (!formData) {
          setSnackbarOpen(true);
          setValidationTrigger(v => v + 1);
          return false;
        }

        const parsed = JSON.parse(formData);

        // Helper function to validate numeric values
        const isValidNumber = (value: string): boolean => {
          if (!value?.trim()) return false;
          const num = Number(value);
          return !isNaN(num) && num > 0;
        };

        // Check if numeric fields have invalid values (entered but not valid numbers)
        const hasInvalidNumbers =
          (parsed.duration?.trim() && !isValidNumber(parsed.duration)) ||
          (parsed.cutoff?.trim() && !isValidNumber(parsed.cutoff)) ||
          (parsed.codingRound === "Yes" && parsed.numberOfQuestions?.trim() && !isValidNumber(parsed.numberOfQuestions)) ||
          (parsed.codingRound === "Yes" && parsed.codingTimeLimit?.trim() && !isValidNumber(parsed.codingTimeLimit));

        const valid =
          parsed.roleCategory &&
          (parsed.interviewMode === "Audio" || parsed.avatar?.length > 0) &&
          parsed.questionLevel &&
          parsed.duration &&
          parsed.cutoff &&
          parsed.interviewMode &&
          isValidNumber(parsed.duration) &&
          isValidNumber(parsed.cutoff) &&
          (parsed.codingRound === "No" || (isValidNumber(parsed.numberOfQuestions) && isValidNumber(parsed.codingTimeLimit)));

        if (!valid) {
          setSnackbarMessage(hasInvalidNumbers ? "Please enter valid numbers" : "Please enter all required fields");
          setSnackbarOpen(true);
          setValidationTrigger(v => v + 1);
          return false;
        }
      }

      // Step 3 validation (ATS) - Manual mode
      if (activeStep === 3) {
        if (!saveATSRef.current) {
          return false;
        }
        const success = await saveATSRef.current();

        if (!success) return;
      }
    }

    // UPLOAD MODE: Step 1 (QuestionnaireUpload) and Step 2 (OtherDetails)
    if (criteriaMode === "upload") {
      // Step 1 validation (Questionnaire Upload) - Upload mode only
      if (activeStep === 1) {
        const savedQuestions = sessionStorage.getItem(STORAGE_KEYS.questionnaire);
        const questions = savedQuestions ? JSON.parse(savedQuestions) : [];

        if (questions.length < 5) {
          setSnackbarMessage("Please enter at least 5 questions");
          setSnackbarOpen(true);
          setValidationTrigger(v => v + 1);
          return false;
        }
      }

      // Step 2 validation (Interview Settings) - Upload mode
      if (activeStep === 2) {
        const formData = sessionStorage.getItem(STORAGE_KEYS.other);

        if (!formData) {
          setSnackbarOpen(true);
          setValidationTrigger(v => v + 1);
          return;
        }

        const parsed = JSON.parse(formData);

        // Helper function to validate numeric values
        const isValidNumber = (value: string): boolean => {
          if (!value?.trim()) return false;
          const num = Number(value);
          return !isNaN(num) && num > 0;
        };

        // Check if numeric fields have invalid values (entered but not valid numbers)
        const hasInvalidNumbers =
          (parsed.duration?.trim() && !isValidNumber(parsed.duration)) ||
          (parsed.cutoff?.trim() && !isValidNumber(parsed.cutoff)) ||
          (parsed.codingRound === "Yes" && parsed.numberOfQuestions?.trim() && !isValidNumber(parsed.numberOfQuestions)) ||
          (parsed.codingRound === "Yes" && parsed.codingTimeLimit?.trim() && !isValidNumber(parsed.codingTimeLimit));

        const valid =
          parsed.roleCategory &&
          (parsed.interviewMode === "Audio" || parsed.avatar?.length > 0) &&
          parsed.questionLevel &&
          parsed.duration &&
          parsed.cutoff &&
          parsed.interviewMode &&
          isValidNumber(parsed.duration) &&
          isValidNumber(parsed.cutoff) &&
          (parsed.codingRound === "No" || (isValidNumber(parsed.numberOfQuestions) && isValidNumber(parsed.codingTimeLimit)));

        if (!valid) {
          setSnackbarMessage(hasInvalidNumbers ? "Please enter valid numbers" : "Please enter all required fields");
          setSnackbarOpen(true);
          setValidationTrigger(v => v + 1);
          return false;
        }
      }

      // Step 3 validation (ATS) - Upload mode
      if (activeStep === 3) {
        if (!saveATSRef.current) {
          return false;
        }
        const success = await saveATSRef.current();

        if (!success) return;
      }
    }

    return true;
  };

  const handleSaveAndContinue = async () => {
    // ✅ Special check for step 0: if form is valid but criteriaMode not selected, show modal
    if (activeStep === 0 && !criteriaMode) {
      const isValid = await validateCurrentStep();
      if (!isValid) return; // Form is invalid, stop here
      // Form is valid, show modal to select criteria mode
      setShowCriteriaChoice(true);
      setValidationTrigger(0);
      return;
    }

    const isValid = await validateCurrentStep();
    if (!isValid) return;

    // Reset validation trigger after successful validation
    setValidationTrigger(0);

    const currentSteps = criteriaMode === "upload" ? STEP_LABELS_WITH_UPLOAD : STEP_LABELS;
    if (activeStep < currentSteps.length - 1) {
      setActiveStep((s) => s + 1);
    } else {
      setOpenReview(true);
    }
  };

  const getReviewData = () => {
    const savedBasic = sessionStorage.getItem(STORAGE_KEYS.basic);
    const savedEval = sessionStorage.getItem(STORAGE_KEYS.evaluation);
    const savedOther = sessionStorage.getItem(STORAGE_KEYS.other);
    const savedATS = sessionStorage.getItem(STORAGE_KEYS.ats);
    const savedMode = sessionStorage.getItem(STORAGE_KEYS.criteriaMode) as "manual" | "upload" | null;
    const savedQuestions = sessionStorage.getItem(STORAGE_KEYS.questionnaire);

    const basicDetails = savedBasic ? JSON.parse(savedBasic) : null;
    const evaluationCriteria = savedEval ? JSON.parse(savedEval) : null;
    const otherData = savedOther ? JSON.parse(savedOther) : null;
    const questionnaireData = savedQuestions ? JSON.parse(savedQuestions) : [];

    const otherDetails = otherData
      ? {
        role: "lateral" as const,
        roleCategory: otherData.roleCategory || "",
        avatar: Array.isArray(otherData.avatar) ? otherData.avatar : [],
        questionLevel: otherData.questionLevel || "",
        duration: otherData.duration || "30",
        cutoff: otherData.cutoff || "3",
        interviewMode: otherData.interviewMode || "",
        codingRound: otherData.codingRound || "No",
        numberOfQuestions: otherData.numberOfQuestions || "1",
        codingTimeLimit: otherData.codingTimeLimit || "15",
        proctoringEnabled: otherData.proctoringEnabled ?? true,
      }
      : {
        role: "lateral" as const,
        roleCategory: "",
        avatar: [],
        questionLevel: "",
        duration: "30",
        cutoff: "3",
        interviewMode: "",
        codingRound: "No",
        numberOfQuestions: "1",
        codingTimeLimit: "15",
        proctoringEnabled: true,
      };

    const atsDetails = savedATS ? JSON.parse(savedATS) : {};

    return {
      basicDetails,
      evaluationCriteria,
      otherDetails,
      atsDetails,
      criteriaMode: savedMode,
      questionnaire: questionnaireData,
    };
  };


  const {
    basicDetails,
    evaluationCriteria,
    otherDetails,
    atsDetails,
    criteriaMode: reviewCriteriaMode,
    questionnaire: reviewQuestionnaire
  } = getReviewData();

  return (
    <Box sx={{ display: "flex", height: "92vh", flexDirection: "column", background: "#f8f8f8" }}>
      <Box sx={styles.backHomeContainer}>
        <Box sx={styles.backText} onClick={handleBackToHome}>
          <HomeIcon sx={{ fontSize: "2.2vh", width: "2vh", height: "2vh" }} />
          <Typography sx={{ color: "inherit",fontSize:"2vh", fontWeight: "inherit", cursor: "pointer" }}>
            Back to home
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, padding: "0vh", overflowY: "hidden" }}>
        <Box sx={styles.root}>

          <Typography sx={styles.title}>Create Job Post</Typography>
          <Typography sx={styles.subtitle}>
            Complete the steps below to set up your job post
          </Typography>

          {/* Stepper */}
          <Box sx={styles.stepContainer}>
            <Box sx={styles.stepRow}>
              {(criteriaMode === "upload" ? STEP_LABELS_WITH_UPLOAD : STEP_LABELS).map((label, index) => {
                // ✅ Use comprehensive validation function instead of just checking sessionStorage key existence
                const isFilled = isStepCompletelyFilled(index, criteriaMode);

                const isAccessible = !criteriaMode ? (index === 0) : (index <= activeStep || isFilled);

                return (
                  <Box key={index} sx={styles.stepColumn}>
                    <Box
                      onClick={async () => {
                        if (!isAccessible) return;
                        // Prevent navigation if criteriaMode is not selected and trying to move past step 0
                        if (!criteriaMode && index > 0) return;
                        if (index > activeStep) {
                          const isValid = await validateCurrentStep();
                          if (!isValid) return;
                        }
                        setActiveStep(index);
                      }}
                      sx={{
                        ...(index === activeStep
                          ? styles.activeStep
                          : index < activeStep || isFilled
                            ? styles.completedStep
                            : styles.step),
                        cursor: isAccessible ? "pointer" : "default",
                      }}
                    >
                      {index < activeStep || (isFilled && index !== activeStep) ? "✓" : String(index + 1).padStart(2, "0")}
                    </Box>
                    {index !== (criteriaMode === "upload" ? STEP_LABELS_WITH_UPLOAD : STEP_LABELS).length - 1 && (
                      <Box
                        sx={
                          index < activeStep || isFilled ? styles.solidLine : styles.dashedLine
                        }
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
            <Box sx={styles.labelRow}>
              {(criteriaMode === "upload" ? STEP_LABELS_WITH_UPLOAD : STEP_LABELS).map((label, index) => {
                // ✅ Use comprehensive validation function instead of just checking sessionStorage key
                const isFilled = isStepCompletelyFilled(index, criteriaMode);

                const isAccessible = !criteriaMode ? (index === 0) : (index <= activeStep || isFilled);

                return (
                  <Box
                    key={index}
                    sx={{
                      ...styles.labelColumn,
                      cursor: isAccessible ? "pointer" : "default",
                    }}
                    onClick={async () => {
                      if (!isAccessible) return;
                      // Prevent navigation if criteriaMode is not selected and trying to move past step 0
                      if (!criteriaMode && index > 0) return;
                      if (index > activeStep) {
                        const isValid = await validateCurrentStep();
                        if (!isValid) return;
                      }
                      setActiveStep(index);
                    }}
                  >
                    <Typography
                      sx={
                        index === activeStep || isFilled ? styles.stepTextActive : styles.stepText
                      }
                    >
                      {label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Step content */}

          {activeStep === 0 && (
            <CreateJobPost
              embedded
              // onValidationChange={setStepValid}
              clearTrigger={clearTriggers[0]}
              validationTrigger={validationTrigger}
            />
          )}

          {/* {activeStep === 1 && criteriaMode === "manual" && (
            <FrameworkDetails
              embedded
              clearTrigger={clearTriggers[1]}
            />
          )} */}

          {activeStep === 1 && criteriaMode === "upload" && (
            <QuestionnaireUpload
              embedded
              clearTrigger={clearTriggers[1]}
            />
          )}

          {activeStep === 1 && criteriaMode === "manual" && (
            <EvaluationCriteria
              embedded
              // onValidationChange={setStepValid}
              clearTrigger={clearTriggers[1]}
              validationTrigger={validationTrigger}
            />
          )}

          {activeStep === 2 && criteriaMode === "upload" && (
            <OtherDetails
              embedded
              clearTrigger={clearTriggers[2]}
              validationTrigger={validationTrigger}
            />
          )}

          {activeStep === 2 && criteriaMode === "manual" && (
            <OtherDetails
              embedded
              //  onValidationChange={setStepValid}
              clearTrigger={clearTriggers[2]}
              validationTrigger={validationTrigger}
            />
          )}

          {activeStep === 3 && criteriaMode === "upload" && (
            <ATSDetails
              embedded
              clearTrigger={clearTriggers[3]}
              onSave={(fn) => { saveATSRef.current = fn; }}
            />
          )}

          {activeStep === 3 && criteriaMode === "manual" && (
            <ATSDetails
              embedded
              //  onValidationChange={setStepValid}
              clearTrigger={clearTriggers[3]}
              onSave={(fn) => { saveATSRef.current = fn; }}
            />
          )}

        </Box>
      </Box>

      {/* ✅ FIXED FOOTER */}
      <Box
        sx={{
          borderTop: "0.3vh solid #e0e0e0",
          backgroundColor: "#fff",
          padding: "1.5vh 2vw",
          display: "flex",
          justifyContent:
            activeStep === 0 ? "flex-end" : "space-between",
          alignItems: "center",
        }}
      >
        {activeStep > 0 && (
          <Button sx={styles.backButton} onClick={handleBack}>
            Back
          </Button>
        )}

        <Box sx={{ display: "flex", gap: "1vw" }}>
          <Button sx={styles.clearallbutton} onClick={handleClearAll}>
            Clear All
          </Button>

          <Button sx={styles.saveButton} onClick={handleSaveAndContinue}>
            {activeStep === (criteriaMode === "upload" ? STEP_LABELS_WITH_UPLOAD : STEP_LABELS).length - 1
              ? "Save & Review"
              : "Save & Continue"}
          </Button>
        </Box>
      </Box>


      <Dialog
        open={openReview}
        onClose={handleCloseReview}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: "49vw",
            height: "79vh",
            borderRadius: "1vh",
            overflow: "hidden",
          },
        }}
      >
        <ReviewSubmit
          basicDetails={basicDetails}
          evaluationCriteria={evaluationCriteria}
          otherDetails={otherDetails}
          atsDetails={atsDetails}
          onClose={handleCloseReview}
          criteriaMode={reviewCriteriaMode}
          questionnaire={reviewQuestionnaire}
        />
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        //autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ mt: "8vh" }}
      >
        <Alert severity="error" onClose={() => setSnackbarOpen(false)}
          sx={{
            borderRadius: "0.6vh",
            fontSize: "1.5vh",
            lineHeight: "2vh",
            padding: "1vh 2.5vh",
            fontFamily: "Poppins, sans-serif",
            alignItems: "center",

            /* icon size */
            "& .MuiSvgIcon-root": {
              fontSize: "2vh",
              height: "2vh",
              width: "2vh",
            },
            "& .MuiAlert-icon": {
              marginRight: "1.3vh",
              padding: "0.8vh 0",
              fontSize: "2.4vh",
              opacity: 0.9,
              display: "flex",
              alignItems: "center",
            },
            "& .MuiAlert-message": {
              padding: "0vh",
              overflow: "hidden",
            },
            "&.css-14gw9up-MuiSnackbar-root": {
              top: "2.5vh",
            },
            "&.css-rgppqo-MuiAlert-action": {
              padding: " 0.4vh 0 0 1.6vh",
            },
            "&.css-38cjb0-MuiButtonBase-root-MuiIconButton-root": {
              padding: "0.5vh",
              fontSize: "1.5vh",
            },
            "& .MuiIconButton-root": {
              padding: "0.5vh",
            },

            /* CLOSE ICON */
            "& .MuiIconButton-root .MuiSvgIcon-root": {
              fontSize: "1.8vh",
            },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Criteria Choice Modal */}
      <CriteriaChoiceModal
        open={showCriteriaChoice}
        onClose={() => setShowCriteriaChoice(false)}
        onEnterCriteria={handleEnterCriteria}
        onUploadQuestionnaire={handleUploadQuestionnaire}
      />

      <LeaveJobCreationModal
        open={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={handleLeaveConfirm}
      />

    </Box>
  );
};

export default CreateJobStepper;