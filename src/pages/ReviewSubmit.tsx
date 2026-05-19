import {
  Box,
  Typography,
  Button,
  Dialog,
  Tooltip,
  TextField,
  IconButton,
  Paper,
} from "@mui/material";

import {
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  Chip,
  Snackbar,
  Alert
} from "@mui/material";
import { styles } from "../styles/ReviewSubmit.styles";
import { keyframes } from "@mui/system";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import { useState, useEffect, useRef, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../constants/routes";
import "react-quill/dist/quill.snow.css";
import { confirmDialogStyles } from "../styles/confirmDialog.styles";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import "../assets/fonts/Poppins-Regular";
import "../assets/fonts/Poppins-Bold";
import { createAtsJob, submitAtsJob, generateTraitLevels, updateAtsJobcriteria, updateAtsJobquestion } from "../api/api";
import { useDraftsStore } from "../store/draftsStore";
import CheckCircle2 from "../assets/images/CheckCircle2.png";
import UserCircle from "../assets/images/UserCircle.png";
import Briefcase from "../assets/images/Briefcase.png";
import Layout from "../assets/images/Layout.png";
import Icon from "../assets/images/Icon.png";
import Icon2 from "../assets/images/Icon2.png";
import Edit2 from "../assets/images/Edit2.png";
import IconATS from "../assets/images/IconATS.png";
import IconInterview from "../assets/images/IconInterview.png";
import Container from "../assets/images/Container.png";

const sparkleRotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const sparklePulse = keyframes`
  0%   { filter: drop-shadow(0 0 0.2vh rgba(123,63,228,0.4)); }
  50%  { filter: drop-shadow(0 0 0.8vh rgba(123,63,228,0.9)); }
  100% { filter: drop-shadow(0 0 0.2vh rgba(123,63,228,0.4)); }
`;


type ReviewSubmitProps = {
  basicDetails: any;
  evaluationCriteria: any;
  otherDetails: {
    role: "lateral";
    roleCategory: string;
    avatar: string[];
    questionLevel: string;
    duration: string;
    cutoff: string;
    interviewMode: string;
    codingRound?: string;
    numberOfQuestions?: string;
    codingTimeLimit?: string;
    proctoringEnabled?: boolean;
  };
  atsDetails: any;
  onClose: () => void;
  jobId?: string | null;
  criteriaMode?: "manual" | "upload" | null;
  questionnaire?: { text: string; answer?: string }[];
  viewOnly?: boolean;
};

const ReviewSubmit: React.FC<ReviewSubmitProps> = ({
  basicDetails,
  evaluationCriteria,
  otherDetails,
  atsDetails,
  onClose,
  jobId,
  criteriaMode,
  questionnaire = [],
  viewOnly = false,
}) => {

  const navigate = useNavigate();
  const [openConfirm, setOpenConfirm] = useState(false);
  const { id } = useParams();

  // ✅ Check for resumed draft in sessionStorage
  const draftIdFromSession = sessionStorage.getItem("realDraftId");
  const effectiveJobId = jobId || draftIdFromSession;
  const isEditMode = Boolean(effectiveJobId); // ✅ Use jobId or draft ID to determine edit mode

  // Per-section edit state
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Editable copies of data
  const [editBasicDetails, setEditBasicDetails] = useState({
    jobTitle: basicDetails?.jobTitle || "",
    jobDescription: basicDetails?.jobDescription || "",
  });

  const [editCriteria, setEditCriteria] = useState(
    evaluationCriteria?.criteriaList?.map((title: string, index: number) => ({
      title,
      description: evaluationCriteria?.generatedList?.[index] || "",
      isGenerating: false
    })) || []
  );
  const [editOtherDetails, setEditOtherDetails] = useState({
    role: "lateral",
    roleCategory: otherDetails?.roleCategory || "",
    avatar: Array.isArray(otherDetails?.avatar) ? otherDetails.avatar : [],
    questionLevel: otherDetails?.questionLevel || "Medium",
    duration: otherDetails?.duration || "30",
    cutoff: otherDetails?.cutoff || "3",
    interviewMode: otherDetails?.interviewMode || "Avatar",
    codingRound: otherDetails?.codingRound || "No",
    numberOfQuestions: otherDetails?.numberOfQuestions || "1",
    codingTimeLimit: otherDetails?.codingTimeLimit || "15",
    proctoringEnabled: otherDetails?.proctoringEnabled ?? true,
  });

  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Restore custom categories from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("otherDetailsForm");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.customCategories) {
        setCustomCategories(parsed.customCategories);
      }
    }
  }, []);
  
  useEffect(() => {
    if (criteriaMode === 'upload' && editOtherDetails.codingRound !== 'No') {
      setEditOtherDetails(prev => ({ ...prev, codingRound: 'No' }));
    }
  }, [criteriaMode, editOtherDetails.codingRound]);

  const [editAtsDetails, setEditAtsDetails] = useState({
    threshold: atsDetails?.threshold || 70,
    weights: {
      skills_required: Number(atsDetails?.weights_snake?.skills_required ?? atsDetails?.weights?.skills_required ?? atsDetails?.weights?.requiredSkill ?? 30),
      skills_preferred: Number(atsDetails?.weights_snake?.skills_preferred ?? atsDetails?.weights?.skills_preferred ?? atsDetails?.weights?.preferredSkill ?? 15),
      experience_alignment: Number(atsDetails?.weights_snake?.experience_alignment ?? atsDetails?.weights?.experience_alignment ?? atsDetails?.weights?.experienceAlignment ?? 30),
      education_alignment: Number(atsDetails?.weights_snake?.education_alignment ?? atsDetails?.weights?.education_alignment ?? atsDetails?.weights?.educationAlignment ?? 10),
      responsibility_overlap: Number(atsDetails?.weights_snake?.responsibility_overlap ?? atsDetails?.weights?.responsibility_overlap ?? atsDetails?.weights?.responsibilityOverlap ?? 15),
    }
  });

  const [editQuestionnaire, setEditQuestionnaire] = useState(
    questionnaire.map((q) => typeof q === 'string' ? { text: q, answer: '' } : { text: q.text, answer: q.answer || '' })
  );

  const [validationErrors, setValidationErrors] = useState<any>({
    basic: {},
    criteria: {},
    role: {},
    questionnaire: {},
  });

  const [thresholdError, setThresholdError] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleDeleteCategory = (cat: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customCategories.filter(c => c !== cat);
    setCustomCategories(updated);
    if (editOtherDetails.roleCategory === cat) {
      setEditOtherDetails({ ...editOtherDetails, roleCategory: "" });
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName?.trim()) {
      if (!customCategories.includes(newCategoryName?.trim())) {
        const updated = [...customCategories, newCategoryName?.trim()];
        setCustomCategories(updated);
        setEditOtherDetails({ ...editOtherDetails, roleCategory: newCategoryName?.trim() });
        setNewCategoryName("");
      } else {
        setEditOtherDetails({ ...editOtherDetails, roleCategory: newCategoryName?.trim() });
        setNewCategoryName("");
      }
    }
  };

  const getWordCount = (text: string) => {
    return text?.trim() ? text?.trim().split(/\s+/).length : 0;
  };

  const MAX_DESCRIPTION_WORDS = 1000;
  const MAX_CRITERIA_WORDS = 500;
  const MAX_QUESTION_WORDS = 100;

  const handleEditSection = (section: string) => {
    // Before switching, validate the current section if it's being edited
    if (editingSection === 'basic') {
      const descWordCount = getWordCount(editBasicDetails.jobDescription);
      if (descWordCount > MAX_DESCRIPTION_WORDS) {
        setSnackbarMessage(`Please fix the word limit error in the Job Description before switching.`);
        setSnackbarOpen(true);
        return;
      }
    } else if (editingSection === 'criteria') {
      const hasWordLimitExceeded = editCriteria.some((c: any) => getWordCount(c.description) > MAX_CRITERIA_WORDS);
      if (hasWordLimitExceeded) {
        setSnackbarMessage(`Please fix the word limit errors in Evaluation Criteria before switching.`);
        setSnackbarOpen(true);
        return;
      }
    }
    setEditingSection(section);
  };

  const handleCancelEdit = () => {
    setEditBasicDetails({
      jobTitle: basicDetails?.jobTitle || "",
      jobDescription: basicDetails?.jobDescription || "",
    });
    setEditingSection(null);
  };

  const handleBasicDetailsChange = (field: string, value: string) => {
    setEditBasicDetails({ ...editBasicDetails, [field]: value });

    // Clear error if user starts typing
    const isOverLimit = field === 'jobDescription' && getWordCount(value) > MAX_DESCRIPTION_WORDS;
    
    setValidationErrors((prev: any) => ({
      ...prev,
      basic: { 
        ...prev.basic, 
        [field]: false,
        ...(field === 'jobDescription' && { jobDescriptionLimit: isOverLimit })
      }
    }));
  };

  const handleRoleDetailsChange = (field: string, value: any) => {
    setEditOtherDetails({ ...editOtherDetails, [field]: value });

    // Clear error if user starts typing
    if (validationErrors.role?.[field]) {
      setValidationErrors((prev: any) => ({
        ...prev,
        role: { ...prev.role, [field]: false }
      }));
    }
  };

  const handleQuestionnaireChange = (index: number, field: string, value: string) => {
    const updated = [...editQuestionnaire];
    updated[index] = { ...updated[index], [field]: value };
    setEditQuestionnaire(updated);

    // Clear error if user starts typing
    if (validationErrors.questionnaire?.[index]?.[field]) {
      setValidationErrors((prev: any) => ({
        ...prev,
        questionnaire: {
          ...prev.questionnaire,
          [index]: { ...prev.questionnaire[index], [field]: false }
        }
      }));
    }
  };

  const handleEditCriteriaChange = (index: number, field: string, value: string) => {
    const updated = [...editCriteria];
    updated[index] = { ...updated[index], [field]: value };
    setEditCriteria(updated);

    // Clear error if user starts typing
    const isOverLimit = field === 'description' && getWordCount(value) > MAX_CRITERIA_WORDS;

    setValidationErrors((prev: any) => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [index]: { 
          ...prev.criteria[index], 
          [field]: false,
          ...(field === 'description' && { descriptionLimit: isOverLimit })
        }
      }
    }));
  };

  const handleAddCriterion = () => {
    setEditCriteria([...editCriteria, { title: "", description: "", isGenerating: false }]);
  };

  const handleDeleteCriterion = (index: number) => {
    const updated = editCriteria.filter((_: any, i: number) => i !== index);
    setEditCriteria(updated);
  };

  const handleGenerateAI = async (index: number) => {
    const criterion = editCriteria[index];
    if (!criterion || !criterion.title?.trim()) {
      alert("Please enter a criteria title first");
      return;
    }

    const token = sessionStorage.getItem("access_token");
    if (!token) {
      alert("Authentication error - token not found");
      return;
    }

    const jobDescription = editBasicDetails.jobDescription;
    if (!jobDescription || !jobDescription?.trim()) {
      alert("Please ensure the job description is filled first");
      return;
    }

    // Set loading state
    const loadingState = [...editCriteria];
    loadingState[index] = { ...loadingState[index], isGenerating: true };
    setEditCriteria(loadingState);

    try {
      const result = await generateTraitLevels(
        jobDescription,
        criterion.title,
        token
      );

      let generatedText = "";
      if (typeof result === 'string') {
        generatedText = result;
      } else if (result && typeof result === 'object') {
        const skillLevels: string[] = [];
        if (Array.isArray(result.skills) && result.skills.length > 0) {
          for (const skillObj of result.skills) {
            for (const key in skillObj) {
              if (key.match(/^level\d+$/i)) {
                skillLevels.push(`${key}: ${skillObj[key]}`);
              }
            }
          }
        } else {
          for (const key in result) {
            if (key.match(/^level\d+$/i)) {
              skillLevels.push(`${key}: ${result[key]}`);
            }
          }
        }
        generatedText = skillLevels.length > 0 ? skillLevels.join('\n') : JSON.stringify(result, null, 2);
      } else {
        generatedText = String(result);
      }

      const successState = [...editCriteria];
      successState[index] = { ...successState[index], description: generatedText, isGenerating: false };
      setEditCriteria(successState);
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      alert(`Failed to generate description: ${errorMsg}`);
      const errorState = [...editCriteria];
      errorState[index] = { ...errorState[index], isGenerating: false };
      setEditCriteria(errorState);
    }
  };

  const handleSaveEdit = (section: 'basic' | 'criteria' | 'role' | 'ats' | 'questionnaire') => {
    const updatedForm = JSON.parse(sessionStorage.getItem("createJobPostForm") || "{}");

    if ((section as any) === 'basic') {
      const hasTitleError = !editBasicDetails.jobTitle?.trim();
      const hasDescError = !editBasicDetails.jobDescription?.trim();
      const descWordCount = getWordCount(editBasicDetails.jobDescription);
      const hasDescLimitError = descWordCount > MAX_DESCRIPTION_WORDS;

      if (hasTitleError || hasDescError || hasDescLimitError) {
        setValidationErrors((prev: any) => ({
          ...prev,
          basic: {
            jobTitle: hasTitleError,
            jobDescription: hasDescError,
            jobDescriptionLimit: hasDescLimitError
          }
        }));

        if (hasDescLimitError) {
          setSnackbarMessage(`Job description exceeds the ${MAX_DESCRIPTION_WORDS}-word limit.`);
          setSnackbarOpen(true);
        }
        return;
      }

      updatedForm.jobTitle = editBasicDetails.jobTitle;
      updatedForm.jobDescription = editBasicDetails.jobDescription;
    } else if ((section as any) === 'criteria') {
      const errors: any = {};
      let hasGlobalError = false;

      if (editCriteria.length === 0) {
        alert("Please add at least one evaluation criterion.");
        return;
      }

      editCriteria.forEach((c: any, index: number) => {
        const titleError = !c.title?.trim();
        const descError = !c.description?.trim();
        const descLimitError = getWordCount(c.description) > MAX_CRITERIA_WORDS;

        if (titleError || descError || descLimitError) {
          errors[index] = {
            title: titleError,
            description: descError,
            descriptionLimit: descLimitError
          };
          hasGlobalError = true;
        }
      });

      if (hasGlobalError) {
        setValidationErrors((prev: any) => ({ ...prev, criteria: errors }));
        const anyLimitExceeded = Object.values(errors).some((err: any) => err.descriptionLimit);
        if (anyLimitExceeded) {
          setSnackbarMessage(`One or more evaluation criteria exceed the ${MAX_CRITERIA_WORDS}-word limit.`);
          setSnackbarOpen(true);
        }
        return;
      }

      const criteriaForm = JSON.parse(sessionStorage.getItem("evaluationCriteriaForm") || "{}");
      criteriaForm.criteriaList = editCriteria.map((c: any) => c.title);
      criteriaForm.generatedList = editCriteria.map((c: any) => c.description);
      sessionStorage.setItem("evaluationCriteriaForm", JSON.stringify(criteriaForm));
    }
    if ((section as any) === 'role') {
      const catError = !editOtherDetails.roleCategory;
      // Only require avatar if interviewMode is NOT "Audio"
      const avatarError = editOtherDetails.interviewMode !== "Audio" && (!editOtherDetails.avatar || editOtherDetails.avatar.length === 0);
      const durationError = !editOtherDetails.duration?.trim();
      const cutoffError = !editOtherDetails.cutoff?.trim();
      const numberOfQuestionsError = editOtherDetails.codingRound === 'Yes' && !editOtherDetails.numberOfQuestions?.trim();
      const codingTimeLimitError = editOtherDetails.codingRound === 'Yes' && !editOtherDetails.codingTimeLimit?.trim();

      if (catError || avatarError || durationError || cutoffError || numberOfQuestionsError || codingTimeLimitError) {
        setValidationErrors((prev: any) => ({
          ...prev,
          role: {
            roleCategory: catError,
            avatar: avatarError,
            duration: durationError,
            cutoff: cutoffError,
            numberOfQuestions: numberOfQuestionsError,
            codingTimeLimit: codingTimeLimitError,
          }
        }));
        return;
      }
      const otherDetailsForm = JSON.parse(sessionStorage.getItem("otherDetailsForm") || "{}" );
      otherDetailsForm.roleCategory = editOtherDetails.roleCategory;
      otherDetailsForm.avatar = editOtherDetails.avatar;
      otherDetailsForm.questionLevel = editOtherDetails.questionLevel;
      otherDetailsForm.duration = editOtherDetails.duration;
      otherDetailsForm.cutoff = editOtherDetails.cutoff;
      otherDetailsForm.interviewMode = editOtherDetails.interviewMode;
      otherDetailsForm.codingRound = editOtherDetails.codingRound;
      otherDetailsForm.numberOfQuestions = editOtherDetails.numberOfQuestions;
      otherDetailsForm.codingTimeLimit = editOtherDetails.codingTimeLimit;
      otherDetailsForm.proctoringEnabled = editOtherDetails.proctoringEnabled;
      otherDetailsForm.customCategories = customCategories;
      sessionStorage.setItem("otherDetailsForm", JSON.stringify(otherDetailsForm));
    } else if ((section as any) === 'ats') {
      const atsForm = JSON.parse(sessionStorage.getItem("atsDetailsForm") || "{}");
      atsForm.threshold = editAtsDetails.threshold;
      atsForm.weights = {
        requiredSkill: editAtsDetails.weights.skills_required,
        preferredSkill: editAtsDetails.weights.skills_preferred,
        experienceAlignment: editAtsDetails.weights.experience_alignment,
        educationAlignment: editAtsDetails.weights.education_alignment,
        responsibilityOverlap: editAtsDetails.weights.responsibility_overlap,
      };
      sessionStorage.setItem("atsDetailsForm", JSON.stringify(atsForm));
    } else if ((section as any) === 'questionnaire') {
      if (editQuestionnaire.length === 0) {
        alert("Please add at least one question.");
        return;
      }

      const errors: any = {};
      let hasGlobalError = false;

      editQuestionnaire.forEach((q: any, index: number) => {
        const textError = !q.text?.trim();
        const answerError = !q.answer?.trim();
        if (textError || answerError) {
          errors[index] = { text: textError, answer: answerError };
          hasGlobalError = true;
        }
      });

      if (hasGlobalError) {
        setValidationErrors((prev: any) => ({ ...prev, questionnaire: errors }));
        return;
      }

      sessionStorage.setItem("questionnaireForm", JSON.stringify(editQuestionnaire));
    }

    setValidationErrors({ basic: {}, criteria: {}, role: {}, questionnaire: {} });
    sessionStorage.setItem("createJobPostForm", JSON.stringify(updatedForm));
    setEditingSection(null);
  };

  const handleDownloadJobDetails = () => {
    try {
      const doc = new jsPDF();
      let yPosition = 20;
      const lineHeight = 7;
      const pageHeight = 297; // A4 page height in mm
      const pageWidth = 210; // A4 page width in mm
      const margin = 15;
      const maxWidth = pageWidth - 2 * margin;

      // Helper function to wrap text
      const wrapText = (text: string, maxW: number) => {
        return doc.splitTextToSize(text, maxW);
      };

      // Helper function to add a section
      const addSection = (title: string, content: string | any) => {
        // Add title
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0); // Black color
        doc.setFont('Poppins-Bold', 'normal');
        doc.text(title, margin, yPosition);
        yPosition += lineHeight + 3;

        // Add content
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Poppins-Regular', 'normal');

        if (typeof content === 'string') {
          const wrappedText = wrapText(content, maxWidth);
          wrappedText.forEach((line: string) => {
            if (yPosition > pageHeight - 20) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, margin, yPosition);
            yPosition += lineHeight;
          });
        } else if (Array.isArray(content)) {
          content.forEach((item: any) => {
            if (yPosition > pageHeight - 20) {
              doc.addPage();
              yPosition = 20;
            }
            const text = typeof item === 'string' ? item : (item.text || JSON.stringify(item));
            const wrappedLines = wrapText(`• ${text}`, maxWidth - 5);
            wrappedLines.forEach((line: string, idx: number) => {
              if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
              }
              doc.text(line, margin + (idx === 0 ? 0 : 2), yPosition);
              yPosition += lineHeight;
            });
          });
        }
        yPosition += 5;
      };

      // Add header
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.setFont('Poppins-Bold', 'normal');
      doc.text('Job Details Review', margin, yPosition);
      yPosition += lineHeight + 8;

      // Add job title
      addSection('Job Title', editBasicDetails.jobTitle || 'N/A');

      // Add description
      addSection('Job Description', editBasicDetails.jobDescription || 'N/A');


      // Add role
      addSection('Role', editOtherDetails.role || 'N/A');

      // Add interview mode
      addSection('Interview Mode', editOtherDetails.interviewMode || 'N/A');

      // Add duration
      addSection('Interview Duration', editOtherDetails.duration || 'N/A');

      // Add cutoff
      addSection('Cutoff Score', editOtherDetails.cutoff || 'N/A');

      // Add question difficulty
      addSection('Question Difficulty', editOtherDetails.questionLevel || 'N/A');

      // Add coding round details
      addSection('Coding Round', editOtherDetails.codingRound || 'No');
      if (editOtherDetails.codingRound === 'Yes') {
        addSection('Number of Coding Questions', editOtherDetails.numberOfQuestions || 'N/A');
        addSection('Coding Duration (mins)', editOtherDetails.codingTimeLimit || 'N/A');
      }

      // Add ATS Configuration
      yPosition += 3;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont('Poppins-Bold', 'normal');
      doc.text('ATS Configuration', margin, yPosition);
      yPosition += lineHeight + 3;

      // Decision Threshold
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('Poppins-Regular', 'normal');
      doc.text(`Decision Threshold: ${editAtsDetails?.threshold || 'N/A'}%`, margin, yPosition);
      yPosition += lineHeight + 3;

      // Parameter Weights
      doc.setFont('Poppins-Bold', 'normal');
      doc.text('Parameter Weights:', margin, yPosition);
      yPosition += lineHeight;

      doc.setFont('Poppins-Regular', 'normal');
      const weightLabels = [
        { label: 'Required Skills', key: 'skills_required' },
        { label: 'Preferred Skills', key: 'skills_preferred' },
        { label: 'Experience', key: 'experience_alignment' },
        { label: 'Education', key: 'education_alignment' },
        { label: 'Responsibility', key: 'responsibility_overlap' },
      ];

      weightLabels.forEach((item) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        const weight = (editAtsDetails?.weights as any)?.[item.key] || 0;
        doc.text(`• ${item.label}: ${weight}%`, margin + 5, yPosition);
        yPosition += lineHeight;
      });

      yPosition += 5;
      
      if (editCriteria && editCriteria.length > 0) {
        yPosition += 3;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Poppins-Bold', 'normal');
        doc.text('Evaluation Criteria', margin, yPosition);
        yPosition += lineHeight + 3;

        editCriteria.forEach((c: any, idx: number) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          doc.setFont('Poppins-Bold', 'normal');
          const titleText = `${idx + 1}. ${c.title || 'N/A'}`;
          const wrappedTitle = wrapText(titleText, maxWidth);
          wrappedTitle.forEach((line: string) => {
            if (yPosition > pageHeight - 40) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, margin, yPosition);
            yPosition += lineHeight;
          });

          if (c.description) {
            yPosition += 1;
            doc.setFont('Poppins-Regular', 'normal');
            doc.setTextColor(55, 65, 81); // Slate gray
            const wrappedDesc = wrapText(c.description, maxWidth - 5);
            wrappedDesc.forEach((line: string) => {
              if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 20;
              }
              doc.text(line, margin + 5, yPosition);
              yPosition += lineHeight;
            });
          }
          yPosition += 4;
        });
      }

      yPosition += 5;

      if (editQuestionnaire && editQuestionnaire.length > 0) {
        yPosition += 3;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Poppins-Bold', 'normal');
        doc.text('Questionnaire', margin, yPosition);
        yPosition += lineHeight + 3;

        editQuestionnaire.forEach((q: any, idx: number) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          doc.setFont('Poppins-Bold', 'normal');
          const questionText = `Q${idx + 1}: ${q.text || q}`;
          const wrappedQuestion = wrapText(questionText, maxWidth);
          wrappedQuestion.forEach((line: string) => {
            if (yPosition > pageHeight - 40) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, margin, yPosition);
            yPosition += lineHeight;
          });

          if (q.answer) {
            yPosition += 2;
            doc.setFont('Poppins-Regular', 'normal');
            doc.setTextColor(107, 114, 128); // Gray
            const answerText = `Answer: ${q.answer}`;
            const wrappedAnswer = wrapText(answerText, maxWidth);
            wrappedAnswer.forEach((line: string) => {
              if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 20;
              }
              doc.text(line, margin, yPosition);
              yPosition += lineHeight;
            });
          }
          yPosition += 5;
        });
      }

      // Save PDF
      const fileName = `Job_Details_${editBasicDetails.jobTitle?.replace(/\s+/g, '_') || 'Export'}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download job details');
    }
  };


  const renderRoleDetails = () => {
    const isEditing = editingSection === 'role';

    return (
      <Box sx={styles.sectionCard}>
        <Box sx={styles.sectionHeader}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.5vh' }}>
            <Box sx={styles.sectionIconBox}>
              <img src={IconInterview} alt="" style={{ height: "1.6vh", width: "auto" }} />
            </Box>
            <Box sx={styles.sectionTitleBox}>
              <Typography sx={styles.sectionTitle}>Interview Settings</Typography>
              <Typography sx={styles.sectionSubtitle}>Type, category, difficulty & interview mode</Typography>
            </Box>
          </Box>

          {isEditing ? (
            <Box sx={styles.editButtonContainer}>
              <Button
                sx={styles.cancelButton}
                onClick={() => setEditingSection(null)}
                startIcon={<CloseIcon sx={{ fontSize: '1.8vh',width:"2vh",height:"2vh" }} />}
              >
                Cancel
              </Button>
              <Button
                sx={styles.saveButton}
                onClick={() => handleSaveEdit('role')}
                startIcon={<CheckIcon sx={{ fontSize: '1.8vh',width:"2vh",height:"2vh" }} />}
              >
                Save
              </Button>
            </Box>
          ) : (
            !viewOnly && (
              <Button
                sx={styles.sectionEditBtn}
                startIcon={<img src={Edit2} alt="" style={{ height: "1.6vh", width: "auto" }} />}
                onClick={() => handleEditSection('role')}
              >
                Edit
              </Button>
            )
          )}
        </Box>

        <Box sx={styles.sectionDivider} />

        {isEditing ? (
          <Box sx={styles.inputGroup}>
            <Box>
              <Typography sx={styles.inputLabel}>ROLE</Typography>
              <Box sx={styles.radioGroup}>
                {['Lateral'].map((type) => (
                  <Box
                    key={type}
                    sx={styles.radioItem}
                    onClick={() => setEditOtherDetails({ ...editOtherDetails, role: type.toLowerCase() })}
                  >
                    <Box sx={styles.radioCircle} className={editOtherDetails.role === type.toLowerCase() ? 'selected' : ''} />
                    <Typography sx={styles.radioLabel}>{type}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={styles.gridContainer}>
              <Box sx={styles.gridItem}>
                <Typography sx={styles.inputLabel}>CATEGORY <span style={{ color: '#dc2626' }}>*</span></Typography>
                <FormControl
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "4.5vh",
                      fontSize: "1.4vh",
                      fontFamily: "Poppins, sans-serif",
                      ...(validationErrors.role?.roleCategory && { "& .MuiOutlinedInput-notchedOutline": { borderColor: '#900B09', borderWidth: '0.2vh' } })
                    }
                  }}
                >
                  <Select
                    value={editOtherDetails.roleCategory}
                    onChange={(e) => handleRoleDetailsChange('roleCategory', e.target.value)}
                    displayEmpty
                    renderValue={(value) => (value ? value : <Typography sx={{ color: "#B0B0B0", fontSize: "1.4vh", fontFamily: "Poppins, sans-serif" }}>Select Category</Typography>)}
                    MenuProps={{
                      anchorOrigin: { vertical: "bottom", horizontal: "left" },
                      transformOrigin: { vertical: "top", horizontal: "left" },
                      PaperProps: {
                        sx: {
                          ...styles.dropdownMenu,
                          position: "relative",
                          overflow: "hidden",
                          minWidth: "35vw",
                        },
                      },
                      MenuListProps: {
                        sx: {
                          maxHeight: "25vh",
                          overflowY: "auto",
                          scrollbarWidth: "thin",
                          position: "relative",
                          "& ::-webkit-scrollbar": {
                            width: "0.6vh",
                          },
                          "& ::-webkit-scrollbar-track": {
                            background: "transparent",
                          },
                          "& ::-webkit-scrollbar-thumb": {
                            background: "#ccc",
                            borderRadius: "0.3vh",
                          },
                        }
                      },
                      autoFocus: false,
                    }}
                    sx={{ fontSize: "1.4vh", fontFamily: "Poppins, sans-serif" }}
                  >
                    {["TDS 1", "TDS 2", "TDS 3", "TDS 4", "AL","Finance" ,"HR"].map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                    {customCategories.map((cat) => (
                      <MenuItem
                        key={cat}
                        value={cat}
                        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                      >
                        {cat}
                        <Box
                          component="span"
                          onClick={(e) => handleDeleteCategory(cat, e)}
                          sx={styles.deleteMenuItem}
                        >
                          ✕
                        </Box>
                      </MenuItem>
                    ))}
                    {/* Fixed Add Category Input via Sticky Positioning */}
                    <MenuItem
                      disabled
                      sx={{
                        position: "sticky",
                        bottom: 0,
                        backgroundColor: "white",
                        zIndex: 10,
                        padding: 0,
                        cursor: "default",
                        "&.Mui-disabled": { opacity: 1 },
                        borderTop: "0.15vh solid #eee",
                        "&:hover": { backgroundColor: "white !important" },
                      }}
                    >
                      <Box
                        sx={{ ...styles.addCategoryContainer, borderTop: "none", width: "100%", pointerEvents: "auto" }}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <input
                          placeholder="Add Category"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCategory();
                            }
                          }}
                          style={{
                            flex: 1,
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "1.4vh",
                            padding: "0.8vh 1vh",
                            border: "0.15vh solid #e0e0e0",
                            borderRadius: "0.4vh",
                            outline: "none",
                          }}
                        />
                        <Typography
                          onClick={handleAddCategory}
                          sx={styles.addCategoryBtn}
                        >
                          Add
                        </Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
                {validationErrors.role?.roleCategory && (
                  <Typography sx={{ fontSize: '1.4vh', color: '#900B09', marginTop: '0.4vh', fontFamily: 'Poppins, sans-serif' }}>
                    Please select a category
                  </Typography>
                )}
              </Box>
              <Box sx={styles.gridItem}>
                <Typography sx={styles.inputLabel}>
                  AVATAR {editOtherDetails.interviewMode !== "Audio" && <span style={{ color: '#dc2626' }}>*</span>}
                </Typography>
                <FormControl fullWidth disabled={editOtherDetails.interviewMode === "Audio"}>
                  <Select
                    multiple
                    value={editOtherDetails.avatar}
                    displayEmpty
                    onChange={(e) => {
                      const value = e.target.value as string[];
                      handleRoleDetailsChange('avatar', value);
                    }}
                    renderValue={(selected) =>
                      (selected as string[]).length > 0
                        ? `${(selected as string[]).length} Selected`
                        : <Typography sx={{ color: "#B0B0B0", fontSize: "1.4vh", fontFamily: "Poppins, sans-serif" }}>Select Avatar</Typography>
                    }
                    sx={{
                      fontSize: "1.4vh",
                      height: "4.5vh",
                      borderRadius: "0.6vh",
                      opacity: editOtherDetails.interviewMode === "Audio" ? 0.5 : 1,
                      ...(validationErrors.role?.avatar && { "& .MuiOutlinedInput-notchedOutline": { borderColor: '#900B09', borderWidth: '0.2vh' } })
                    }}
                  >
                    {[
                      "Male Interview Agent",
                      "Hacker",
                      "Musigma Interview Agent",
                      "Professional Interview Agent",
                    ].map((option) => (
                      <MenuItem key={option} value={option}>
                        <Checkbox checked={editOtherDetails.avatar.includes(option)} />
                        <ListItemText primary={option} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.8vh', marginTop: '1vh', width: '100%' }}>
                  {editOtherDetails.avatar.map((avatar) => (
                    <Chip
                      key={avatar}
                      label={avatar}
                      onDelete={() => {
                        const updatedAvatars = editOtherDetails.avatar.filter(a => a !== avatar);
                        handleRoleDetailsChange('avatar', updatedAvatars);
                      }}
                      sx={{
                        fontSize: '1.3vh',
                        height: '3vh',
                        backgroundColor: '#e8e8e8',
                        borderRadius: '0.6vh',
                        padding: '0.4vh 0.8vh'
                      }}
                    />
                  ))}
                </Box>
                {validationErrors.role?.avatar && (
                  <Typography sx={{ fontSize: '1.4vh', color: '#900B09', marginTop: '0.4vh', fontFamily: 'Poppins, sans-serif' }}>
                    {editOtherDetails.interviewMode === "Audio"
                      ? "Avatar is not required for Audio mode"
                      : "Please select at least one avatar"}
                  </Typography>
                )}
                {editOtherDetails.interviewMode === "Audio" && (
                  <Typography sx={{ fontSize: '1.3vh', color: '#6B7280', marginTop: '0.4vh', fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}>
                    Not applicable for Audio mode
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={styles.gridContainer}>
              <Box sx={styles.gridItem}>
                <Typography sx={styles.inputLabel}>INTERVIEW DURATION (min) <span style={{ color: '#dc2626' }}>*</span></Typography>
                <input
                  type="text"
                  style={{
                    ...(styles.textInput as any),
                    ...(validationErrors.role?.duration && { border: '2px solid #900B09' })
                  }}
                  value={editOtherDetails.duration}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                      setEditOtherDetails({ ...editOtherDetails, duration: val });
                    }
                  }}
                  placeholder="Minutes"
                />
                {validationErrors.role?.duration && (
                  <Typography sx={{ fontSize: '1.4vh', color: '#900B09', marginTop: '0.4vh', fontFamily: 'Poppins, sans-serif' }}>
                    Interview duration is required
                  </Typography>
                )}
              </Box>
              <Box sx={styles.gridItem}>
                <Typography sx={styles.inputLabel}> EVALUATION CUT-OFF (1-5) <span style={{ color: '#dc2626' }}>*</span></Typography>
                <input
                  type="text"
                  style={{
                    ...(styles.textInput as any),
                    ...(validationErrors.role?.cutoff && { border: '2px solid #900B09' })
                  }}
                  value={editOtherDetails.cutoff}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                      setEditOtherDetails({ ...editOtherDetails, cutoff: val });
                    }
                  }}
                  placeholder="Score"
                />
                {validationErrors.role?.cutoff && (
                  <Typography sx={{ fontSize: '1.4vh', color: '#900B09', marginTop: '0.4vh', fontFamily: 'Poppins, sans-serif' }}>
                    Evaluation Cutoff is required
                  </Typography>
                )}
              </Box>
            </Box>

            <Box>
              <Typography sx={styles.inputLabel}>QUESTION DIFFICULTY</Typography>
              <Box sx={styles.radioGroup}>
                {['Easy', 'Medium', 'Hard'].map((level) => (
                  <Box
                    key={level}
                    sx={styles.radioItem}
                    onClick={() => setEditOtherDetails({ ...editOtherDetails, questionLevel: level })}
                  >
                    <Box sx={styles.radioCircle} className={editOtherDetails.questionLevel === level ? 'selected' : ''} />
                    <Typography sx={styles.radioLabel}>{level}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography sx={styles.inputLabel}>INTERVIEW MODE</Typography>
              <Box sx={styles.radioGroup}>
                {['Avatar', 'Audio'].map((mode) => (
                  <Box
                    key={mode}
                    sx={styles.radioItem}
                    onClick={() => setEditOtherDetails({ ...editOtherDetails, interviewMode: mode })}
                  >
                    <Box sx={styles.radioCircle} className={editOtherDetails.interviewMode === mode ? 'selected' : ''} />
                    <Typography sx={styles.radioLabel}>{mode}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography sx={styles.inputLabel}>ENABLE PROCTORING</Typography>
              <Box sx={styles.radioGroup}>
                {['Yes', 'No'].map((option) => (
                  <Box
                    key={option}
                    sx={styles.radioItem}
                    onClick={() => setEditOtherDetails({ ...editOtherDetails, proctoringEnabled: option === 'Yes' })}
                  >
                    <Box sx={styles.radioCircle} className={((editOtherDetails.proctoringEnabled ?? true) === (option === 'Yes')) ? 'selected' : ''} />
                    <Typography sx={styles.radioLabel}>{option}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box>
              <Typography sx={styles.inputLabel}>CODING ROUND</Typography>
              {criteriaMode === 'upload' ? (
                <Typography sx={{ fontSize: '1.2vh', color: '#6B7280', marginTop: '0.4vh', fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}>
                  Coding round is disabled for static questionnaire mode
                </Typography>
              ) : (
                <Box sx={styles.radioGroup}>
                  {['Yes', 'No'].map((option) => (
                    <Box
                      key={option}
                      sx={styles.radioItem}
                      onClick={() => setEditOtherDetails({ ...editOtherDetails, codingRound: option })}
                    >
                      <Box sx={styles.radioCircle} className={editOtherDetails.codingRound === option ? 'selected' : ''} />
                      <Typography sx={styles.radioLabel}>{option}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {editOtherDetails.codingRound === 'Yes' && (
              <Box sx={styles.gridContainer}>
                <Box sx={styles.gridItem}>
                  <Typography sx={styles.inputLabel}>NO. OF QUESTIONS <span style={{ color: '#dc2626' }}>*</span></Typography>
                  <input
                    type="text"
                    style={{
                      ...(styles.textInput as any),
                      ...(validationErrors.role?.numberOfQuestions && { border: '2px solid #900B09' })
                    }}
                    value={editOtherDetails.numberOfQuestions}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        setEditOtherDetails({ ...editOtherDetails, numberOfQuestions: val });
                      }
                    }}
                    placeholder="Count"
                  />
                  {validationErrors.role?.numberOfQuestions && (
                    <Typography sx={{ fontSize: '1.4vh', color: '#900B09', marginTop: '0.4vh', fontFamily: 'Poppins, sans-serif' }}>
                      Number of questions is required
                    </Typography>
                  )}
                </Box>
                <Box sx={styles.gridItem}>
                  <Typography sx={styles.inputLabel}>CODING DURATION (MINS) <span style={{ color: '#dc2626' }}>*</span></Typography>
                  <input
                    type="text"
                    style={{
                      ...(styles.textInput as any),
                      ...(validationErrors.role?.codingTimeLimit && { border: '2px solid #900B09' })
                    }}
                    value={editOtherDetails.codingTimeLimit}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        setEditOtherDetails({ ...editOtherDetails, codingTimeLimit: val });
                      }
                    }}
                    placeholder="Minutes"
                  />
                  {validationErrors.role?.codingTimeLimit && (
                    <Typography sx={{ fontSize: '1.4vh', color: '#900B09', marginTop: '0.4vh', fontFamily: 'Poppins, sans-serif' }}>
                      Coding duration is required
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <>
            <Box sx={styles.gridContainer}>
              <Box sx={styles.gridItem}>
                <Typography sx={styles.gridItemLabel}>Role</Typography>
                <Typography sx={styles.gridItemValue}>{editOtherDetails.role}</Typography>
              </Box>
              <Box sx={styles.gridItem}>
                <Typography sx={styles.gridItemLabel}>Category</Typography>
                <Typography sx={styles.gridItemValue}>{editOtherDetails.roleCategory}</Typography>
              </Box>
              {editOtherDetails.interviewMode !== "Audio" && (
                <Box sx={styles.gridItem}>
                  <Typography sx={styles.gridItemLabel}>Avatar</Typography>
                  <Typography sx={styles.gridItemValue}>
                    {Array.isArray(editOtherDetails.avatar) && editOtherDetails.avatar.length > 0
                      ? editOtherDetails.avatar.join(", ")
                      : "None"}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={styles.gridContainer}>
              <Box sx={styles.gridItem}>
                <Typography sx={styles.gridItemLabel}>Interview Duration (min)</Typography>
                <Typography sx={styles.gridItemValue}>{editOtherDetails.duration} Minutes</Typography>
              </Box>
              <Box sx={styles.gridItem}>
                <Typography sx={styles.gridItemLabel}>Evaluation Cut-Off (1-5)</Typography>
                <Typography sx={styles.gridItemValue}>{editOtherDetails.cutoff}</Typography>
              </Box>
              <Box sx={styles.gridItem}>
                <Typography sx={styles.gridItemLabel}>Interview Mode</Typography>
                <Typography sx={styles.gridItemValue}>
                  {editOtherDetails.interviewMode === "Avatar" ? "Avatar Based Interview" : editOtherDetails.interviewMode}
                </Typography>
              </Box>
              <Box sx={styles.gridItem}>
                <Typography sx={styles.gridItemLabel}>Enable Proctoring</Typography>
                <Typography sx={styles.gridItemValue}>{(editOtherDetails.proctoringEnabled ?? true) ? 'Yes' : 'No'}</Typography>
              </Box>
            </Box>

            <Box sx={styles.gridContainer}>
              <Box sx={styles.gridItem}>
                <Typography sx={styles.gridItemLabel}>Question Difficulty</Typography>
                <Typography sx={styles.gridItemValue}>{editOtherDetails.questionLevel}</Typography>
              </Box>
              <Box sx={styles.gridItem}>
                <Typography sx={styles.gridItemLabel}>Coding Round</Typography>
                <Typography sx={styles.gridItemValue}>{editOtherDetails.codingRound}</Typography>
              </Box>
              {editOtherDetails.codingRound === "Yes" && (
                <>
                  <Box sx={styles.gridItem}>
                    <Typography sx={styles.gridItemLabel}>No. of Questions</Typography>
                    <Typography sx={styles.gridItemValue}>{editOtherDetails.numberOfQuestions}</Typography>
                  </Box>
                </>
              )}
            </Box>

            {editOtherDetails.codingRound === "Yes" && (
              <Box sx={styles.gridContainer}>
                <Box sx={styles.gridItem}>
                  <Typography sx={styles.gridItemLabel}>Coding Duration</Typography>
                  <Typography sx={styles.gridItemValue}>{editOtherDetails.codingTimeLimit} Minutes</Typography>
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    );
  };

  const renderAtsConfiguration = () => {
    const isEditing = editingSection === 'ats';
    const weightsSum = Object.values(editAtsDetails.weights).reduce((a: number, b) => a + (b as number), 0);
    const isValid = weightsSum === 100;

    const handleWeightChange = (key: string, delta: number) => {
      const currentVal = (editAtsDetails.weights as any)[key] || 1;
      const newVal = Math.max(1, currentVal + delta);
      setEditAtsDetails({
        ...editAtsDetails,
        weights: {
          ...editAtsDetails.weights,
          [key]: newVal
        }
      });
    };

    return (
      <Box sx={styles.sectionCard}>
        <Box sx={styles.sectionHeader}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.5vh' }}>
            <Box sx={styles.sectionIconBox}>
              <img src={IconATS} alt="" style={{ height: "1.6vh", width: "auto" }} />
            </Box>
            <Box sx={styles.sectionTitleBox}>
              <Typography sx={styles.sectionTitle}>ATS Configuration</Typography>
              <Typography sx={styles.sectionSubtitle}>Decision threshold and parameter weights</Typography>
            </Box>
          </Box>

          {isEditing ? (
            <Box sx={styles.editButtonContainer}>
              <Button
                sx={styles.cancelButton}
                onClick={() => setEditingSection(null)}
                startIcon={<CloseIcon sx={{ fontSize: '1.8vh' }} />}
              >
                Cancel
              </Button>
              <Button
                sx={styles.saveButton}
                onClick={() => handleSaveEdit('ats')}
                disabled={!isValid}
                startIcon={<CheckIcon sx={{ fontSize: '1.8vh', width: "2vh", height: "2vh" }} />}
              >
                Save
              </Button>
            </Box>
          ) : (
            !viewOnly && (
              <Button
                sx={styles.sectionEditBtn}
                startIcon={<img src={Edit2} alt="" style={{ height: "1.6vh", width: "auto" }} />}
                onClick={() => handleEditSection('ats')}
              >
                Edit
              </Button>
            )
          )}
        </Box>

        <Box sx={styles.sectionDivider} />

        {isEditing ? (
          <Box>
            <Box sx={{ marginBottom: '4vh' }}>
              <Typography sx={styles.inputLabel}>DECISION THRESHOLD (%)</Typography>
              <Box sx={styles.sliderContainer}>
                <Box sx={styles.sliderTrack}>
                  <Box sx={{ ...styles.sliderFill, width: `${editAtsDetails.threshold}%` }} />
                  <Box
                    sx={{ ...styles.sliderThumb, left: `${editAtsDetails.threshold}%` }}
                    onMouseDown={(e) => {
                      const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                      const moveHandler = (moveEvent: MouseEvent) => {
                        const val = Math.round(((moveEvent.clientX - rect.left) / rect.width) * 100);
                        if (val < 40) {
                          setThresholdError("Minimum threshold is 40%");
                        } else if (val <= 100) {
                          setThresholdError("");
                          setEditAtsDetails(prev => ({ ...prev, threshold: val }));
                        }
                      };
                      const upHandler = () => {
                        document.removeEventListener('mousemove', moveHandler);
                        document.removeEventListener('mouseup', upHandler);
                      };
                      document.addEventListener('mousemove', moveHandler);
                      document.addEventListener('mouseup', upHandler);
                    }}
                  />
                  <Typography sx={{ ...styles.sliderValueLabel, left: `${editAtsDetails.threshold}%` }}>
                    {editAtsDetails.threshold}
                  </Typography>
                </Box>
              </Box>
              {thresholdError && (
                <Typography sx={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  {thresholdError}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={styles.inputLabel}>PARAMETER WEIGHTS</Typography>
              <Box sx={{
                ...styles.sumBadge,
                backgroundColor: isValid ? "#ecfdf5" : "#fef2f2",
                color: isValid ? "#059669" : "#dc2626"
              }}>
                Sum: {weightsSum}/100
              </Box>
            </Box>

            <Box sx={styles.atsWeightGrid}>
              {[
                { label: 'Required Skills', key: 'skills_required' },
                { label: 'Preferred Skills', key: 'skills_preferred' },
                { label: 'Experience', key: 'experience_alignment' },
                { label: 'Education', key: 'education_alignment' },
                { label: 'Responsibility', key: 'responsibility_overlap' },
              ].map((item) => (
                <Box sx={styles.atsWeightEditCard} key={item.key}>
                  <Typography sx={styles.weightTitle}>{item.label}</Typography>
                  <Box sx={styles.stepperContainer}>
                    <Box sx={styles.stepperBtn} onClick={() => handleWeightChange(item.key, -1)}>−</Box>
                    <TextField
                      type="number"
                      value={(editAtsDetails.weights as any)[item.key]}
                      onChange={(e) => {
                        const newVal = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
                        setEditAtsDetails({
                          ...editAtsDetails,
                          weights: {
                            ...editAtsDetails.weights,
                            [item.key]: newVal
                          }
                        });
                      }}
                      inputProps={{ min: 1, max: 100 }}
                      sx={{
                        width: '4.5vh',
                        '& .MuiOutlinedInput-root': {
                          height: '3.5vh',
                          fontSize: '1.3vh',
                          '& input': {
                            textAlign: 'center',
                            padding: '0.5vh'
                          },
                          '& fieldset': { borderColor: '#e5e7eb' },
                          '&:hover fieldset': { borderColor: '#d1d5db' },
                          '&.Mui-focused fieldset': { borderColor: '#006b66' },
                        }
                      }}
                    />
                    <Box sx={styles.stepperBtn} onClick={() => handleWeightChange(item.key, 1)}>+</Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={styles.progressLabel}>
              <Typography sx={styles.progressLabelText}>Decision Threshold</Typography>
              <Typography sx={styles.progressValue}>{editAtsDetails.threshold}%</Typography>
            </Box>
            <Box sx={styles.progressBar}>
              <Box sx={{ ...styles.progressFill, width: `${editAtsDetails.threshold}%` }} />
            </Box>

            <Typography sx={{ ...styles.label, marginBottom: "1.5vh" }}>PARAMETER WEIGHTS</Typography>
            <Box sx={styles.weightGrid}>
              {[
                { label: 'Required Skills', key: 'skills_required' },
                { label: 'Preferred Skills', key: 'skills_preferred' },
                { label: 'Experience', key: 'experience_alignment' },
                { label: 'Education', key: 'education_alignment' },
                { label: 'Responsibility', key: 'responsibility_overlap' },
              ].map((item) => (
                <Box sx={styles.weightItem} key={item.key}>
                  <Typography sx={styles.weightValue}>{(editAtsDetails.weights as any)[item.key]}</Typography>
                  <Typography sx={styles.weightLabel}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    );
  };

  const renderEvaluationCriteria = () => {
    const isEditing = editingSection === 'criteria';

    return (
      <Box sx={styles.sectionCard}>
        <Box sx={styles.sectionHeader}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.5vh' }}>
            <Box sx={styles.sectionIconBox}>
              <img src={Icon2} alt="" style={{ height: "1.6vh", width: "auto" }} />
            </Box>
            <Box sx={styles.sectionTitleBox}>
              <Typography sx={styles.sectionTitle}>Focus of Evaluation</Typography>
              <Typography sx={styles.sectionSubtitle}>{editCriteria.length} criteria defined</Typography>
            </Box>
          </Box>

          {isEditing ? (
            <Box sx={styles.editButtonContainer}>
              <Button
                sx={styles.cancelButton}
                onClick={() => setEditingSection(null)}
                startIcon={<CloseIcon sx={{ fontSize: '1.8vh', width: "2vh", height: "2vh" }} />}
              >
                Cancel
              </Button>
              <Button
                sx={styles.saveButton}
                onClick={() => handleSaveEdit('criteria')}
                startIcon={<CheckIcon sx={{ fontSize: '1.8vh', width: "2vh", height: "2vh" }} />}
              >
                Save
              </Button>
            </Box>
          ) : (
            !viewOnly && (
              <Button
                sx={styles.sectionEditBtn}
                startIcon={<img src={Edit2} alt="" style={{ height: "1.6vh", width: "auto" }} />}
                onClick={() => handleEditSection('criteria')}
              >
                Edit
              </Button>
            )
          )}
        </Box>

        <Box sx={styles.sectionDivider} />

        {isEditing ? (
          <Box>
            {editCriteria.map((item: any, index: number) => (
              <Box sx={styles.criterionEditCard} key={index}>
                <Box sx={styles.criterionHeader}>
                  <Box sx={styles.criterionLabel}>
                    <Box sx={styles.criterionCircle}>{index + 1}</Box>
                    CRITERION {index + 1}
                  </Box>
                  <Button sx={styles.deleteIconBtn} onClick={() => handleDeleteCriterion(index)}>
                    <DeleteOutlineIcon sx={{ fontSize: "2.2vh" }} />
                  </Button>
                </Box>

                <input
                  style={{
                    ...styles.textInput as any,
                    ...(validationErrors.criteria?.[index]?.title && { borderColor: '#900B09', borderWidth: '0.2vh' })
                  }}
                  value={item.title}
                  placeholder="Criterion Title"
                  onChange={(e) => handleEditCriteriaChange(index, 'title', e.target.value)}
                />
                {validationErrors.criteria?.[index]?.title && (
                  <Typography sx={{ fontSize: '1.4vh', color: '#900B09', marginTop: '0.4vh', fontFamily: 'Poppins, sans-serif' }}>
                    Please enter this field
                  </Typography>
                )}

                <Box>
                  <Box sx={styles.inputLabelRow} style={{ marginBottom: '1vh' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '1vh' }}>
                      <Typography sx={styles.inputLabel}>DESCRIPTION</Typography>
                      <Typography sx={styles.charCount}>
                        ({getWordCount(item.description)} / {MAX_CRITERIA_WORDS} words)
                      </Typography>
                    </Box>
                    {getWordCount(item.description) > MAX_CRITERIA_WORDS && (
                      <Typography sx={{ fontSize: '1.2vh', color: '#900B09', fontFamily: 'Poppins, sans-serif' }}>
                        Word limit exceeded
                      </Typography>
                    )}
                    <Button
                      sx={styles.aiGenerateBtn}
                      onClick={() => handleGenerateAI(index)}
                      disabled={item.isGenerating}
                      startIcon={
                        <AutoAwesomeIcon
                          sx={{
                            fontSize: "1.6vh",
                            height:"2vh",width:"2vh",
                            animation: item.isGenerating
                              ? `${sparkleRotate} 1.8s linear infinite, ${sparklePulse} 1.6s ease-in-out infinite`
                              : "none",
                          }}
                        />
                      }
                    >
                      {item.isGenerating ? "Generating..." : "Generate with AI"}
                    </Button>
                  </Box>
                  <textarea
                    style={{
                      ...styles.textArea as any,
                      minHeight: '10vh',
                      ...((validationErrors.criteria?.[index]?.description || validationErrors.criteria?.[index]?.descriptionLimit) && { borderColor: '#900B09', borderWidth: '0.2vh' })
                    }}
                    value={item.description}
                    placeholder="Criterion Description"
                    onChange={(e) => handleEditCriteriaChange(index, 'description', e.target.value)}
                  />
                  {validationErrors.criteria?.[index]?.description && (
                    <Typography sx={{ fontSize: '1.4vh', color: '#900B09', marginTop: '0.4vh', fontFamily: 'Poppins, sans-serif' }}>
                      Please enter this field
                    </Typography>
                  )}
                  {validationErrors.criteria?.[index]?.descriptionLimit && (
                    <Typography sx={{ fontSize: '1.4vh', color: '#900B09', marginTop: '0.4vh', fontFamily: 'Poppins, sans-serif' }}>
                      Word limit exceeded
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}

            <Button sx={styles.addCriterionBtn} onClick={handleAddCriterion} startIcon={<AddIcon sx={{ fontSize: '2vh' }} />}>
              Add Criterion
            </Button>
          </Box>
        ) : (
          <Box sx={styles.criteriaList}>
            {editCriteria.map((item: any, index: number) => (
              <Box sx={styles.criteriaItem} key={index}>
                <Typography sx={styles.criteriaNumber}>{index + 1}</Typography>
                <Box sx={styles.criteriaContent}>
                  <Typography sx={styles.criteriaTitle}>{item.title}</Typography>
                  <Typography sx={styles.criteriaDescription}>{item.description}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  const renderBasicDetails = () => {
    const isEditing = editingSection === 'basic';

    return (
      <Box sx={styles.sectionCard}>
        <Box sx={styles.sectionHeader}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.5vh' }}>
            <Box sx={styles.sectionIconBox}>
              <img src={Icon} alt="" style={{ height: "1.6vh", width: "auto" }} />
            </Box>
            <Box sx={styles.sectionTitleBox}>

              <Typography sx={styles.sectionTitle}>Basic Details</Typography>
              <Typography sx={styles.sectionSubtitle}>Job title and description</Typography>
            </Box>
          </Box>

          {isEditing ? (
            <Box sx={styles.editButtonContainer}>
              <Button
                sx={styles.cancelButton}
                onClick={handleCancelEdit}
                startIcon={<CloseIcon sx={{ fontSize: '1.8vh' }} />}
              >
                Cancel
              </Button>
              <Button
                sx={styles.saveButton}
                onClick={() => handleSaveEdit('basic')}
                startIcon={<CheckIcon sx={{ fontSize: '1.8vh', width: "2vh", height: "2vh" }} />}
              >
                Save
              </Button>
            </Box>
          ) : (
            !viewOnly && (
              <Button
                sx={styles.sectionEditBtn}
                startIcon={<img src={Edit2} alt="" style={{ height: "1.6vh", width: "auto" }} />}
                onClick={() => handleEditSection('basic')}
              >
                Edit
              </Button>
            )
          )}
        </Box>

        <Box sx={styles.sectionDivider} />

        {isEditing ? (
          <Box sx={styles.inputGroup}>
            <Box sx={styles.detailRow}>
              <Box sx={styles.inputLabelRow}>
                <Typography sx={styles.inputLabel}>
                  JOB TITLE <span style={{ color: '#dc2626' }}>*</span>
                </Typography>
              </Box>
              <input
                style={{
                  ...styles.textInput as any,
                  ...(validationErrors.basic?.jobTitle && { borderColor: '#900B09', borderWidth: '0.2vh' })
                }}
                value={editBasicDetails.jobTitle}
                onChange={(e) => handleBasicDetailsChange('jobTitle', e.target.value)}
              />
              {validationErrors.basic?.jobTitle && (
                <Typography sx={{ fontSize: '1.4vh', color: '#900B09', marginTop: '0.4vh', fontFamily: 'Poppins, sans-serif' }}>
                  Please enter this field
                </Typography>
              )}
            </Box>

            <Box sx={styles.detailRow}>
              <Box sx={styles.inputLabelRow}>
                <Typography sx={styles.inputLabel}>
                  JOB DESCRIPTION <span style={{ color: '#dc2626' }}>*</span>
                </Typography>
                <Typography sx={{
                  ...styles.charCount,
                  color: getWordCount(editBasicDetails.jobDescription) > MAX_DESCRIPTION_WORDS ? '#900B09' : '#888'
                }}>
                  {getWordCount(editBasicDetails.jobDescription)} / {MAX_DESCRIPTION_WORDS} words
                </Typography>
              </Box>
              <textarea
                style={{
                  ...styles.textArea as any,
                  ...((validationErrors.basic?.jobDescription || validationErrors.basic?.jobDescriptionLimit) && { borderColor: '#900B09', borderWidth: '0.2vh' })
                }}
                value={editBasicDetails.jobDescription}
                onChange={(e) => handleBasicDetailsChange('jobDescription', e.target.value)}
              />
              {validationErrors.basic?.jobDescription && (
                <Typography sx={{ fontSize: '1.4vh', color: '#900B09', marginTop: '0.4vh', fontFamily: 'Poppins, sans-serif' }}>
                  Please enter this field
                </Typography>
              )}
              {validationErrors.basic?.jobDescriptionLimit && (
                <Typography sx={{ fontSize: '1.4vh', color: '#900B09', marginTop: '0.4vh', fontFamily: 'Poppins, sans-serif' }}>
                  Word limit exceeded
                </Typography>
              )}
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={styles.detailRow}>
              <Typography sx={styles.label}>JOB TITLE</Typography>
              <Typography sx={styles.value}>{editBasicDetails.jobTitle}</Typography>
            </Box>

            <Box sx={styles.detailRow}>
              <Typography sx={styles.label}>DESCRIPTION</Typography>
              <Typography sx={styles.value}>{editBasicDetails.jobDescription}</Typography>
            </Box>
          </>
        )}
      </Box>
    );
  };

  const handleConfirmPublish = async () => {
    try {
      let basic, ats, other, criteriaData, mode;

      // ✅ EDIT MODE - Use state variables
      if (jobId && isEditMode) {
        basic = editBasicDetails;
        ats = editAtsDetails;
        other = editOtherDetails;
        criteriaData = { criteriaList: editCriteria?.map((c: any) => c.title), generatedList: editCriteria?.map((c: any) => c.description) };
        mode = criteriaMode;
      }
      // ✅ CREATE MODE - Use sessionStorage
      else {
        basic = JSON.parse(sessionStorage.getItem("createJobPostForm") || "{}");
        ats = JSON.parse(sessionStorage.getItem("atsDetailsForm") || "{}");
        other = JSON.parse(sessionStorage.getItem("otherDetailsForm") || "{}");
        criteriaData = JSON.parse(sessionStorage.getItem("evaluationCriteriaForm") || "{}");
        mode = sessionStorage.getItem("criteriaMode");
      }

      console.log("🔍 DEBUG handleConfirmPublish - mode value:", {
        mode,
        isEditMode,
        jobId,
        criteriaMode,
        allModes: [mode, criteriaMode]
      });

      if (!basic.jobTitle || !basic.jobDescription) {
        alert("Job details missing");
        return;
      }

      // ✅ Global Word Limit Validation before Publish
      const jdWordCount = getWordCount(basic.jobDescription);
      if (jdWordCount > MAX_DESCRIPTION_WORDS) {
        setSnackbarMessage(`Job description exceeds the ${MAX_DESCRIPTION_WORDS}-word limit.`);
        setSnackbarOpen(true);
        return;
      }

      const hasCriteriaLimitError = editCriteria?.some((c: any) => getWordCount(c.description) > MAX_CRITERIA_WORDS);
      if (hasCriteriaLimitError) {
        setSnackbarMessage(`One or more evaluation criteria exceed the ${MAX_CRITERIA_WORDS}-word limit.`);
        setSnackbarOpen(true);
        return;
      }

      // ✅ Validate role category and avatar based on interview mode
      if (!other.roleCategory) {
        alert("Role Category is required");
        return;
      }

      // ✅ Only require avatar if interviewMode is NOT "Audio"
      if (other.interviewMode !== "Audio" && (!other.avatar || other.avatar.length === 0)) {
        alert("Avatar is required for Avatar-based interviews");
        return;
      }

      // ✅ If ATS data is empty, use default values
      if (!ats.weights && !ats.weights_snake) {
        // Set default ATS configuration if not already filled
        ats = {
          threshold: 70,
          weights_snake: {
            skills_required: 10,
            skills_preferred: 15,
            experience_alignment: 15,
            education_alignment: 30,
            responsibility_overlap: 30
          }
        };
      }

      // Use snake_case weights if available (from new ATS form saves), otherwise use weights from state
      const sourceWeights = ats.weights_snake || editAtsDetails.weights;
      const threshold = Number(ats.threshold ?? editAtsDetails.threshold);

      const weights = {
        skills_required: Number(sourceWeights?.skills_required ?? editAtsDetails.weights?.skills_required ?? 30),
        skills_preferred: Number(sourceWeights?.skills_preferred ?? editAtsDetails.weights?.skills_preferred ?? 15),
        education_alignment: Number(sourceWeights?.education_alignment ?? editAtsDetails.weights?.education_alignment ?? 10),
        experience_alignment: Number(sourceWeights?.experience_alignment ?? editAtsDetails.weights?.experience_alignment ?? 30),
        responsibility_overlap: Number(sourceWeights?.responsibility_overlap ?? editAtsDetails.weights?.responsibility_overlap ?? 15),
      };

      const selectedAvatar = Array.isArray(other.avatar)
        ? other.avatar[0]
        : other.avatar;

      const avatarOptions = Array.isArray(other.avatar)
        ? other.avatar
        : selectedAvatar
          ? [selectedAvatar]
          : [];

      // ✅ If Interview Mode is Audio, set avatar to null and avatarOptions to empty
      const isAudioMode = other.interviewMode === "Audio";

      const interviewSetting = {
        role: other.role || "Lateral",
        category: other.roleCategory || "",
        duration: Number(other.duration),
        questionPersonalizer: other.questionLevel,
        interviewMode:
          other.interviewMode === "Avatar"
            ? "Avatar Based Interview"
            : "Audio",
        avatar: isAudioMode ? null : (selectedAvatar || ""),
        avatarOptions: isAudioMode ? null : avatarOptions,
        cutOff: Number(other.cutoff || 3),
        codingRound: other.codingRound,
        numberOfQuestions: other.codingRound === "No" ? undefined : Number(other.numberOfQuestions),
        codingTimeLimit: other.codingRound === "No" ? undefined : Number(other.codingTimeLimit),
        proctoringEnabled: other.proctoringEnabled ?? true,
      };

      console.log(" Final payload being sent:", {
        title: basic.jobTitle,
        description: basic.jobDescription,
        threshold,
        weights,
        interviewSetting,
        criteriaMode: isEditMode ? criteriaMode : mode,
      });

      let response;

      // ✅ EDIT MODE - Update existing job
      if (effectiveJobId && isEditMode) {
        console.log("📝 EDIT MODE - Updating job:", { effectiveJobId, criteriaMode, basic, ats, other });
        if (criteriaMode === "upload") {
          // Update question-based job
          const questionsData = editQuestionnaire || [];

          const questions = questionsData.map((q: any) => ({
            question: typeof q === 'string' ? q : (q.text || q.question || ""),
            answer: typeof q === 'string' ? "" : (q.answer || ""),
          }));

          const token = sessionStorage.getItem("access_token") || "";

          response = await updateAtsJobquestion(
            token,
            effectiveJobId,
            basic.jobTitle,
            basic.jobDescription,
            threshold,
            weights,
            interviewSetting,
            questions,
            "active"  // ✅ Publish as active when creating from ReviewSubmit
          );

          console.log("✅ Question-based job updated:", response);
        } else if (criteriaMode === "manual") {
          // Update criteria-based job
          const criteria = editCriteria?.map((crit: any) => ({
            criteriaTitle: crit.title,
            criteriaDescription: {
              level1: crit.description?.split(".")[0]?.trim() || "",
              level2: crit.description?.split(".")[1]?.trim() || "",
              level3: crit.description?.split(".")[2]?.trim() || "",
              level4: crit.description?.split(".")[3]?.trim() || "",
              level5: crit.description?.split(".")[4]?.trim() || "",
            },
          })) || [];

          const token = sessionStorage.getItem("access_token") || "";

          response = await updateAtsJobcriteria(
            token,
            effectiveJobId,
            basic.jobTitle,
            basic.jobDescription,
            threshold,
            weights,
            interviewSetting,
            [],
            criteria,
            "active"  // ✅ Publish as active when creating from ReviewSubmit
          );

          console.log("✅ Criteria-based job updated:", response);
        }

        // ✅ Clear draft from sessionStorage after successful update
        if (response) {
          console.log("✅ Draft successfully updated. Clearing from session storage.");
          const STORAGE_KEYS = [
            "createJobPostForm",
            "evaluationCriteriaForm",
            "otherDetailsForm",
            "atsDetailsForm",
            "criteriaMode",
            "questionnaireForm",
            "realDraftId",
            "tempDraftId",
            "currentActiveStep"
          ];
          STORAGE_KEYS.forEach(key => sessionStorage.removeItem(key));
        }
      }
      // ✅ CREATE MODE - Create new job
      else {
        console.log("✨ CREATE MODE - Creating new job:", { mode, basic, ats, other, weights });
        // Upload Mode
        if (mode === "upload") {
          const questionsData =
            JSON.parse(sessionStorage.getItem("questionnaireForm") || "[]") || [];

          // Transform to question-answer pairs format
          const questions = questionsData.map((q: any) => ({
            question: typeof q === 'string' ? q : (q.text || q.question || ""),
            answer: typeof q === 'string' ? "" : (q.answer || ""),
          }));

          const token = sessionStorage.getItem("access_token") || "";

          response = await submitAtsJob(
            token,
            editBasicDetails.jobTitle,
            editBasicDetails.jobDescription,
            threshold,
            weights,
            interviewSetting,
            questions
          );
        }

        // ✅ Criteria Mode
        else {
          const criteria = editCriteria?.map((crit: any) => {
            const description = crit.description || "";
            // Split description by periods to distribute across levels
            const descParts = description
              .split(".")
              .map((part: string) => part?.trim())
              .filter((part: string) => part.length > 0);

            return {
              criteriaTitle: crit.title,
              criteriaDescription: {
                level1: descParts[0] || "",
                level2: descParts[1] || "",
                level3: descParts[2] || "",
                level4: descParts[3] || "",
                level5: descParts[4] || "",
              },
            };
          }) || [];

          // ✅ Determine jobType based on criteriaMode: "manual" or "framework"
          // Handle all possible mode values explicitly
          let determinedJobType = "manual"; // default
          if (mode === "framework") {
            determinedJobType = "framework";
          } else if (mode === "manual") {
            determinedJobType = "manual";
          } else {
            // Fallback for any unexpected mode value
            console.warn(`⚠️ Unexpected mode value: "${mode}", defaulting to "manual"`);
            determinedJobType = "manual";
          }

          console.log("🔍 Determined jobType:", { mode, determinedJobType });

          response = await createAtsJob(
            editBasicDetails.jobTitle,
            editBasicDetails.jobDescription,
            threshold,
            weights,
            interviewSetting,
            criteria,
            undefined,  // frameworks parameter
            determinedJobType  // jobType parameter
          );
        }

        console.log("✅ Job created:", response);
        console.log("Response status:", response ? "Success" : "Failed/Null");
      }

      // ✅ Close popup and navigate after successful API call (both create and edit modes)
      if (response) {
        console.log("✅ Operation completed successfully. Closing popup and navigating to createJob...");
        const { setDirty } = useDraftsStore.getState();
        setDirty(false);
        setOpenConfirm(false);
        setTimeout(() => {
          onClose();
          navigate(routes.createJob);
        }, 500);
      } else {
        console.error("❌ No response from API - response is null/undefined");
        alert("Failed to create job - no response from server");
        setOpenConfirm(false); // ✅ Just close confirmation dialog if no response
      }

    } catch (error) {
      console.error("Publish failed:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      alert(`Failed to create job: ${errorMsg}`);
      setOpenConfirm(false);
    }
  };


  const renderAsBulletsFromFullStop = (text: string) => {
    if (!text) return "-";

    const lines = text
      .split(".")
      .map((line) => line?.trim())
      .filter((line) => line.length > 0);

    return (
      <ul style={{ margin: "0.4vh 0", paddingLeft: "1.3vh", lineHeight: 1.6 }}>
        {lines.map((line, index) => (
          <li key={index}>
            <Typography component="span" sx={styles.value}>
              {line}.
            </Typography>
          </li>
        ))}
      </ul>
    );
  };



  return (
    <Box sx={styles.container}>
      {/* NEW HEADER SECTION WITH PREMIUM GRADIENT BACKGROUND */}
      <Box sx={styles.headerSection}>
        <Box sx={styles.headerContent}>
          <Box sx={styles.headerBadge}>
            <Box
              component="img"
              src={CheckCircle2}
              alt="check icon"
              sx={{ width: "1.6vh", height: "1.6vh" }}
            />

            <Typography
              component="span"
              sx={{ fontSize: "inherit", fontWeight: "inherit" }}
            >
              REVIEW & CREATE
            </Typography>
          </Box>

          <Typography sx={styles.headerTitle}>
            {editBasicDetails.jobTitle || "Job Title"}
          </Typography>

          <Box sx={styles.headerTags}>
            <Box sx={styles.headerTag}>
              <img src={Layout} alt="Framework-Based" style={{ height: "1.6vh", width: "auto" }} />
              <Typography sx={{ fontSize: "inherit", fontWeight: "inherit" }}>Framework-Based</Typography>
            </Box>
            <Box sx={styles.headerTag}>
              <img src={UserCircle} alt="Lateral" style={{ height: "1.6vh", width: "auto" }} />
              <Typography sx={{ fontSize: "inherit", fontWeight: "inherit" }}>Lateral</Typography>
            </Box>
            <Box sx={styles.headerTag}>
              <img src={Briefcase} alt="Tech" style={{ height: "1.6vh", width: "auto" }} />
              <Typography sx={{ fontSize: "inherit", fontWeight: "inherit" }}>Tech</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={styles.headerModeContainer}>
          <Typography sx={styles.headerModeLabel}>INTERVIEW MODE</Typography>
          <Typography sx={styles.headerMode}>
            {editOtherDetails.interviewMode || "Voice"}
          </Typography>
        </Box>
      </Box>

      {/* SCROLLABLE CONTENT */}
      <Box sx={styles.content}>
        {renderBasicDetails()}

        {/* QUESTIONNAIRE SECTION */}
        {criteriaMode === "upload" && (
          <Box sx={styles.sectionCard}>
            <Box sx={styles.sectionHeader}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.5vh' }}>
                <Box sx={styles.sectionIconBox}>
                  <AssignmentIcon sx={{ fontSize: "2.2vh" }} />
                </Box>
                <Box sx={styles.sectionTitleBox}>
                  <Typography sx={styles.sectionTitle}>Questionnaire</Typography>
                  <Typography sx={styles.sectionSubtitle}>{editQuestionnaire.length} question{editQuestionnaire.length !== 1 ? 's' : ''} uploaded</Typography>
                </Box>
              </Box>

              {editingSection === 'questionnaire' ? (
                <Box sx={styles.editButtonContainer}>
                  <Button
                    sx={styles.cancelButton}
                    onClick={() => {
                      setEditQuestionnaire(
                        questionnaire.map((q) => typeof q === 'string' ? { text: q, answer: '' } : { text: q.text, answer: q.answer || '' })
                      );
                      setEditingSection(null);
                    }}
                    startIcon={<CloseIcon sx={{ fontSize: '1.8vh' }} />}
                  >
                    Cancel
                  </Button>
                  <Button
                    sx={styles.saveButton}
                    onClick={() => handleSaveEdit('questionnaire')}
                    startIcon={<CheckIcon sx={{ fontSize: '1.8vh',width:"2vh",height:"2vh"}} />}
                  >
                    Save
                  </Button>
                </Box>
              ) : (
                !viewOnly && (
                  <Button
                    sx={styles.sectionEditBtn}
                    startIcon={<img src={Edit2} alt="" style={{ height: "1.6vh", width: "auto" }} />}
                    onClick={() => handleEditSection('questionnaire')}
                  >
                    Edit
                  </Button>
                )
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.2vh' }}>
              {editQuestionnaire.map((questionObj, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.8vh',
                    padding: '1.5vh',
                    border: '0.1vh solid #e5e7eb',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '1.2vh' }}>
                    <Box
                      sx={{
                        width: '2.8vh',
                        height: '2.8vh',
                        borderRadius: '50%',
                        backgroundColor: '#048b7a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '1.2vh',
                        mt: '0.2vh',
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {editingSection === 'questionnaire' ? (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '0.5vh' }}>
                            <Typography sx={{ fontSize: '1.2vh', fontWeight: 600, color: '#048b7a' }}>Question:</Typography>
                            <Typography sx={{ fontSize: '1.2vh', color: '#888' }}>
                              {getWordCount(questionObj.text)} / {MAX_QUESTION_WORDS} words
                            </Typography>
                          </Box>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={questionObj.text}
                            onChange={(e) => handleQuestionnaireChange(index, 'text', e.target.value)}
                            variant="outlined"
                            sx={{
                              mb: '1vh',
                              "& .MuiOutlinedInput-root": {
                                fontSize: "1.3vh",
                                borderRadius: "0.6vh",
                                backgroundColor: "#fff",
                                "& fieldset": {
                                  borderColor: validationErrors.questionnaire?.[index]?.text ? "#900B09" : "#e5e7eb",
                                  borderWidth: validationErrors.questionnaire?.[index]?.text ? "0.2vh" : "0.1vh"
                                },
                                "&:hover fieldset": { borderColor: validationErrors.questionnaire?.[index]?.text ? "#900B09" : "#d1d5db" },
                                "&.Mui-focused fieldset": { borderColor: "#006b66", borderWidth: "0.1vh" },
                              },
                            }}
                          />
                          {validationErrors.questionnaire?.[index]?.text && (
                            <Typography sx={{ fontSize: '1.4vh', color: '#900B09', marginTop: '0.4vh', fontFamily: 'Poppins, sans-serif' }}>
                              Please enter the question
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '0.5vh' }}>
                            <Typography sx={{ fontSize: '1.2vh', fontWeight: 600, color: '#048b7a' }}>Answer:</Typography>
                            <Typography sx={{ fontSize: '1.2vh', color: '#888' }}>
                              {getWordCount(questionObj.answer)} words
                            </Typography>
                          </Box>
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            maxRows={8}
                            value={questionObj.answer}
                            onChange={(e) => handleQuestionnaireChange(index, 'answer', e.target.value)}
                            variant="outlined"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                fontSize: "1.3vh",
                                borderRadius: "0.6vh",
                                backgroundColor: "#fff",
                                overflow: "auto",
                                resize: "vertical",
                                "& fieldset": {
                                  borderColor: validationErrors.questionnaire?.[index]?.answer ? "#900B09" : "#e5e7eb",
                                  borderWidth: validationErrors.questionnaire?.[index]?.answer ? "0.2vh" : "0.1vh"
                                },
                                "&:hover fieldset": { borderColor: validationErrors.questionnaire?.[index]?.answer ? "#900B09" : "#d1d5db" },
                                "&.Mui-focused fieldset": { borderColor: "#006b66", borderWidth: "0.1vh" },
                              },
                              "& .MuiInputBase-inputMultiline": {
                                overflowY: "auto",
                              },
                            }}
                          />
                          {validationErrors.questionnaire?.[index]?.answer && (
                            <Typography sx={{ fontSize: '1.4vh', color: '#900B09', marginTop: '0.4vh', fontFamily: 'Poppins, sans-serif' }}>
                              Please enter the answer
                            </Typography>
                          )}
                        </>
                      ) : (
                        <>
                          <Typography sx={{ fontSize: '1.2vh', fontWeight: 600, color: '#048b7a', mb: '0.3vh' }}>Question:</Typography>
                          <Typography sx={{ fontSize: '1.3vh', fontWeight: 500, color: '#1a1a1a', wordBreak: 'break-word', mb: questionObj.answer ? '0.8vh' : 0 }}>
                            {questionObj.text}
                          </Typography>
                          {questionObj.answer && (
                            <>
                              <Typography sx={{ fontSize: '1.2vh', fontWeight: 600, color: '#048b7a', mb: '0.3vh' }}>Answer:</Typography>
                              <Typography sx={{ fontSize: '1.3vh', fontWeight: 400, color: '#4b5563', wordBreak: 'break-word' }}>
                                {questionObj.answer}
                              </Typography>
                            </>
                          )}
                        </>
                      )}
                    </Box>
                    {editingSection === 'questionnaire' && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          const updated = editQuestionnaire.filter((_, i) => i !== index);
                          setEditQuestionnaire(updated);
                        }}
                        sx={{ color: '#900B09', padding: '0.5vh', flexShrink: 0, '&:hover': { backgroundColor: 'rgba(144,11,9,0.1)' } }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: '1.8vh' }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              ))}
              {editingSection === 'questionnaire' && (
                <Button
                  startIcon={<AddIcon sx={{ fontSize: '1.6vh' }} />}
                  onClick={() => setEditQuestionnaire([...editQuestionnaire, { text: '', answer: '' }])}
                  sx={{
                    textTransform: 'none',
                    fontSize: '1.3vh',
                    fontWeight: 600,
                    color: '#048b7a',
                    border: '0.1vh dashed #048b7a',
                    borderRadius: '0.8vh',
                    padding: '1vh',
                    '&:hover': { backgroundColor: 'rgba(4,139,122,0.05)' },
                  }}
                >
                  Add Question
                </Button>
              )}
            </Box>
          </Box>
        )}

        {/* EVALUATION CRITERIA SECTION */}
        {criteriaMode !== "upload" && renderEvaluationCriteria()}

        {/* ROLE DETAILS SECTION */}
        {renderRoleDetails()}

        {/* ATS CONFIGURATION SECTION */}
        {renderAtsConfiguration()}

        {/* WARNING BANNER */}
        {!viewOnly && (
          <Box sx={styles.warningBanner}>
            <img src={Container} alt="" style={{ height: "1.6vh", width: "auto" }} />
            <Box sx={styles.warningContent}>
              <Typography sx={styles.warningTitle}>Review carefully before creating</Typography>
              <Typography sx={styles.warningText}>
                Once the job post is published, interview invitations will go live. You can edit most details after publishing from the Job Details page.
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* FOOTER */}
      <Box sx={{ ...styles.footer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          sx={styles.backButton}
          onClick={onClose}
        >
          Back
        </Button>

        <Box sx={{ display: 'flex', gap: '1.2vh' }}>
          {!viewOnly && (
            <Button
              sx={{
                ...styles.createButton,
                backgroundColor: editingSection ? '#d1d5db' : (styles.createButton.backgroundColor || '#006b66'),
                color: editingSection ? '#9ca3af' : (styles.createButton.color || '#fff'),
                opacity: editingSection ? 0.8 : 1,
                cursor: editingSection ? 'not-allowed' : 'pointer',
                "&:hover": {
                  backgroundColor: editingSection ? '#d1d5db' : undefined,
                }
              }}
              onClick={() => setOpenConfirm(true)}
              disabled={!!editingSection}
            >
              Create Job
            </Button>
          )}
          {viewOnly && (
            <Button
              sx={{
                ...styles.createButton,
                height: "3vh",
                backgroundColor: styles.createButton.backgroundColor || '#006b66',
                color: styles.createButton.color || '#fff',
                '&:hover': {
                  backgroundColor: '#005553'
                }
              }}
              startIcon={<DownloadIcon />}
              onClick={handleDownloadJobDetails}
            >
              Download Job Details
            </Button>
          )}
        </Box>
      </Box>

      {/* CONFIRMATION DIALOG */}
      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        maxWidth="xs"
        PaperProps={{
          sx: confirmDialogStyles.dialogPaper,
        }}
      >
        <Box sx={confirmDialogStyles.body}>
          <Typography sx={confirmDialogStyles.contentText}>
            Are you sure you want to create the job?
          </Typography>

          <Box sx={confirmDialogStyles.buttonContainer}>
            <Button
              variant="outlined"
              sx={confirmDialogStyles.cancelButton}
              onClick={() => setOpenConfirm(false)}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              sx={confirmDialogStyles.publishButton}
              onClick={handleConfirmPublish}
            >
              Create
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="error"
          sx={{ width: "100%", fontSize: "1.4vh", fontFamily: "Poppins, sans-serif" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default ReviewSubmit;
