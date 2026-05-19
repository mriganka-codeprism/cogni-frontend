import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../constants/routes";

export const useRedirectOnReload = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // If the page was reloaded, sessionStorage will be completely empty
    const hasAnySessionData =
      sessionStorage.getItem("createJobPostForm") ||
      sessionStorage.getItem("evaluationCriteriaForm") ||
      sessionStorage.getItem("otherDetailsForm") ||
      sessionStorage.getItem("atsDetailsForm");

    if (!hasAnySessionData) {
      // Set flag to signal page reset needed
      localStorage.setItem("forceCreateJobPostReset", "true");
      navigate(routes.createJobPost, { replace: true });
    }
  }, []);
};
