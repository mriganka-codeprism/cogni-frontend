// src/utils/clearCreateJobPostSession.ts
export const clearCreateJobPostSession = () => {
  sessionStorage.removeItem("createJobPostForm");
  sessionStorage.removeItem("evaluationCriteriaForm");
  sessionStorage.removeItem("otherDetailsForm");
  sessionStorage.removeItem("atsDetailsForm");
  sessionStorage.removeItem("criteriaMode");
  sessionStorage.removeItem("questionnaireForm");
  sessionStorage.removeItem("currentDraftId");
  sessionStorage.removeItem("currentActiveStep");
  sessionStorage.removeItem("resumedDraftMode");
  sessionStorage.removeItem("realDraftId");
  sessionStorage.removeItem("tempDraftId");
  sessionStorage.removeItem("questionnaireFiles");
};
