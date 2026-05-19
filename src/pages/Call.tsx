import React from "react";
import { Box, Typography } from "@mui/material";
import { callStyles } from "../styles/call.styles";
import { useLocation, useNavigate } from "react-router-dom";
import { getLivekitToken } from "../api/chat-api";
import WebinarLivekit from "../components/livekit/WebinarLivekit";
import { useCandidateStore } from "../store/candidateStore";
import { routes } from "../constants/routes";

function Call() {
  const videoBoxRef = React.useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { meetingId?: string; userId?: string } | null;
  const meetingId = state?.meetingId ?? "";
  const userId = state?.userId ?? "";

  const [livekitToken, setLivekitToken] = React.useState<string>("");
  const [livekitUrl, setLivekitUrl] = React.useState<string>("");
  const [tokenError, setTokenError] = React.useState<string | null>(null);
  const screenStream = useCandidateStore((state) => state.screenStream);
  const conversationId = useCandidateStore((state) => state.conversationId);

  React.useEffect(() => {
    if (!meetingId || !userId || !conversationId) {
      setTokenError("Invalid session. Please start the interview from the candidate page.");
      return;
    }
    getLivekitToken(userId, meetingId, conversationId)
      .then((response) => {
        setLivekitToken(response.grantedToken ?? "");
        setLivekitUrl(response.url ?? "");
        setTokenError(null);
      })
      .catch((error: any) => {
        console.error("Error getting LiveKit token:", error);
        setTokenError("Could not connect. Please try again from the candidate page.");
      });
  }, [meetingId, userId, conversationId]);

  if (tokenError) {
    return (
      <Box sx={callStyles.box2}>
        <Box sx={{ textAlign: "center", py: 4, px: 2 }}>
          <Typography color="error" sx={{ mb: 2 }}>{tokenError}</Typography>
          <Typography variant="body2" component="button" onClick={() => navigate(routes.candidateHome)} sx={{ textDecoration: "underline", cursor: "pointer" }}>
            Return to interview page
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!livekitToken) {
    return (
      <Box sx={callStyles.box2}>
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="text.secondary">Connecting...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={callStyles.box2}>
      <Box sx={callStyles.box1}>
        <Box
          sx={{
            height: "85vh",
            margin: "auto",
            // width: "90%",
            ...callStyles.box4,
          }}
          ref={videoBoxRef}
        >
        
          <WebinarLivekit
            livekitToken={livekitToken}
            livekitUrl={livekitUrl}
            roomId={meetingId}
            externalScreenStream={screenStream || undefined}
          />

        </Box>
      </Box>

      {/* Left Panel */}

      {/* Inline Styles */}
      <style>
        {`
          @keyframes eq-pulse {
            0%   { transform: scaleY(1); }
            50%  { transform: scaleY(1.5); }
            100% { transform: scaleY(1); }
          }
        `}
      </style>
    </Box>
  );
}

export default Call;
