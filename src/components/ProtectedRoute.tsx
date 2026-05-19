import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { routes } from "../constants/routes";
import Unauthorized from "../pages/Unauthorized";

const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: JSX.Element;
  requiredRole?: "admin" | null;
}) => {
  const location = useLocation();
  const user = sessionStorage.getItem("access_token");

  // Validate specific route formats (e.g., transcription requires a UUID conversation param)
  if (location.pathname === routes.transcription) {
    if (!user) {
      return (
        <Navigate
          to={{ pathname: "/login" }}
          replace
          state={{ from: location }}
        />
      );
    }
    const params = new URLSearchParams(location.search);
    const conversationId = params.get("conversation");
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (!conversationId || !uuidRegex.test(conversationId)) {
      return <Unauthorized />;
    }
  }

  if (requiredRole && !user) {
    return <Unauthorized />;
  }

  return children;
};

export default ProtectedRoute;
