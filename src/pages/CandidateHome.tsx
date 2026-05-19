import React, { useEffect, useRef, useState } from "react";
import Text from "../components/textComponent";
import { homeStyle } from "../styles/home.styles";
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Modal,
  Snackbar,
  Alert,
  Autocomplete,
  Button,
} from "@mui/material";
import CustomButton from "../components/button";
import CustomDialog from "../components/customDialog";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useSearchParams } from "react-router-dom";
import { routes } from "../constants/routes";
import { useLocation } from "react-router-dom";
import { CheckCircleOutline, ErrorOutline, InfoOutlined } from "@mui/icons-material";
import { Rating } from "@mui/material";
import CallEndIcon from "@mui/icons-material/CallEnd";
import bg from "../assets/images/homebackground.png";
import muSigmaLogo from "../assets/images/musigma_logo_white 3.svg";
import { globalStyles } from "../config";
import {
  getCallDuration,
  submitUserFeedback,
  uploadResume,
  getResumeUsers,
  getApprovedJobCandidates,
  getStreamById,
  uploadPPT,
  uploadPPTwithUser,
  getResumePreviewUrl,
  getAllConversation,
  validateInviteToken,
} from "../api/api";
import { getConversationId } from "../api/chat-api";
import { useCandidateStore } from "../store/candidateStore";
import { FormControlComponent } from "../components/formControl";
import MicrophoneTest from "../components/MicrophoneTest";
import SpeakerTest from "../components/SpeakerTest";

interface ApiError {
  message: string;
}

interface CandidateOption {
  id: string;
  email: string;
  profile: {
    firstName?: string;
    lastName?: string;
    uploadedFileName?: string | null;
  };
}

interface ApprovedJobCandidateResponse {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_type: string;
  status: string;
  mailTriggered: boolean;
  job_id: string;
}

const EMPTY_CANDIDATE_PROFILE: CandidateOption["profile"] = {
  firstName: "",
  lastName: "",
  uploadedFileName: null,
};

const NO_MATCH_OPTION: CandidateOption = {
  id: "__no_match__",
  email: "__no_match__",
  profile: EMPTY_CANDIDATE_PROFILE,
};

const NOT_LISTED_OPTION: CandidateOption = {
  id: "__not_listed__",
  email: "__not_listed__",
  profile: EMPTY_CANDIDATE_PROFILE,
};

const TARGET_FPS = 1;

const mapApprovedJobCandidates = (
  approvedCandidates: ApprovedJobCandidateResponse[] = []
): CandidateOption[] =>
  approvedCandidates.map((candidate) => ({
    id: candidate.user_id,
    email: candidate.email,
    profile: {
      firstName: candidate.first_name,
      lastName: candidate.last_name,
      uploadedFileName: null,
    },
  }));

function CandidateHome() {
  const meetingId = useRef<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSendingFramesRef = useRef<boolean>(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isProceeding, setIsProceeding] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showCameraScreen, setShowCameraScreen] = React.useState(false);
  const [callEndedTime, setCallEndedTime] = useState<string>("");
  const [searchParams] = useSearchParams();
  const collegeId = searchParams.get("collegeId") || "";
  const streamId = searchParams.get("streamId") || "";
  const jobId = searchParams.get("jobId") || "";
  const expiryParam = searchParams.get("expiry");
  const inviteToken = searchParams.get("token") || "";
  const [isLinkValid, setIsLinkValid] = useState<boolean>(true);
  const [isLinkExpired, setIsLinkExpired] = useState<boolean>(false);
  const [isTokenUsed, setIsTokenUsed] = useState<boolean>(false);
  const [isTokenFlow, setIsTokenFlow] = useState<boolean>(false);
  const [tokenJobId, setTokenJobId] = useState<string>("");
  const [tokenValidating, setTokenValidating] = useState<boolean>(!!searchParams.get("token"));

  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [showInterviewSummary, setShowInterviewSummary] = React.useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error" as "error" | "success" | "info" | "warning",
  });
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const [micPermission, setMicPermission] = useState<boolean>(false);
  const [micTestPassed, setMicTestPassed] = useState<boolean>(false);
  const [speakerTestPassed, setSpeakerTestPassed] = useState<boolean>(false);
  const [isScreenShared, setIsScreenShared] = useState<boolean>(false);
  const [isFullscreenRequested, setIsFullscreenRequested] = useState<boolean>(false);
  const [isActuallyInFullscreen, setIsActuallyInFullscreen] = useState<boolean>(false);
  const [fullscreenExitAttempts, setFullscreenExitAttempts] = useState<number>(0);
  const [showScreenSharingError, setShowScreenSharingError] =
    useState<boolean>(false);
  const [screenSharingErrorMessage, setScreenSharingErrorMessage] =
    useState<string>("");

  const [interviewRating, setInterviewRating] = useState<number | null>(0);
  const [feedbackComment, setFeedbackComment] = useState<string>("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const backgroundImage = bg;
  const [isNameNotListed, setIsNameNotListed] = useState(false);
  const [stream, setStream] = useState<string>("");

  const setScreenStream = useCandidateStore((state) => state.setScreenStream);
  const screenStream = useCandidateStore((state) => state.screenStream);
  const setVideoStream = useCandidateStore((state) => state.setVideoStream);
  const videoStream = useCandidateStore((state) => state.videoStream);
  const setAudioStream = useCandidateStore((state) => state.setAudioStream);
  const audioStream = useCandidateStore((state) => state.audioStream);
  const setUserId = useCandidateStore((state) => state.setUserId);
  const userId = useCandidateStore((state) => state.userId);

  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);

  // Resume preview state
  const [resumePreviewOpen, setResumePreviewOpen] = useState(false);
  const [resumePreviewLoading, setResumePreviewLoading] = useState(false);
  const selectedResumeFile = useRef<string | null>(null);
  const resumePreviewUrl = useRef<string | null>(null);
  const resumeContentType = useRef<string | null>(null);

  const setConversationId = useCandidateStore((state) => state.setConversationId);
  const conversationId = useCandidateStore((state) => state.conversationId);
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [isSingleFaceDetected, setIsSingleFaceDetected] = useState<boolean>(false);

  const isFormValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    email.trim() !== "" &&
    (isTokenFlow ? true : isNameNotListed ? file !== null : true) &&
    isChecked;

  useEffect(() => {
    const fetchCandidates = async () => {
      if (inviteToken) return; // Token flow identifies the candidate — no dropdown needed
      try {
        if (jobId) {
          const approvedCandidates = await getApprovedJobCandidates(jobId);
          setCandidates(mapApprovedJobCandidates(approvedCandidates));
          return;
        }

        if (!collegeId || !streamId) {
          setCandidates([]);
          return;
        }

        const users = await getResumeUsers(collegeId, streamId);
        setCandidates(users ?? []);
      } catch (err) {
        console.error("Error fetching candidates:", err);
      }
    };

    if (!showInterviewSummary && !location.state?.callEnded && (jobId || (collegeId && streamId))) {
      fetchCandidates();
    }
  }, [collegeId, streamId, showInterviewSummary, location.state?.callEnded, jobId]);

  useEffect(() => {
    if (!streamId || jobId) return;

    const fetchStream = async () => {
      try {
        const stream = await getStreamById(streamId);
        setStream(stream?.[0]?.name ?? "");
      } catch (err) {
        console.error("Error fetching stream:", err);
      }
    };

    fetchStream();
  }, [streamId, jobId]);

  React.useEffect(() => {
    const fetchCallEndTime = async () => {
      try {
        const result = await getCallDuration(conversationId!);
        if (result?.formatted) {
          setCallEndedTime(result.formatted);
        }
      } catch (err) {
        console.error("Failed to fetch call duration:", err);
      }
    };

    if (location.state?.callEnded) {
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
        setScreenStream(null);
      }

      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
        setVideoStream(null);
      }

      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
        setAudioStream(null);
      }

      setShowInterviewSummary(true);
      setShowCameraScreen(true);
      fetchCallEndTime();

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Validate invite token (new per-candidate token flow)
  useEffect(() => {
    if (!inviteToken || location.state?.callEnded) return;

    const validate = async () => {
      try {
        const result = await validateInviteToken(inviteToken);
        setFirstName(result.firstName || "");
        setLastName(result.lastName || "");
        setEmail(result.email || "");
        setUserId(result.userId);
        setTokenJobId(result.jobId || "");
        setIsTokenFlow(true);
        setIsLinkValid(true);
        // Check for active conversations
        try {
          const convos = await getAllConversation(result.userId);
          if (convos?.length > 0 && convos[convos.length - 1]?.status === "active") {
            setConversationId(convos[convos.length - 1]?.id);
          }
        } catch { }
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || "";
        if (msg.includes("expired")) {
          setIsLinkExpired(true);
        } else if (msg.includes("already been used")) {
          setIsTokenUsed(true);
        } else {
          setIsLinkValid(false);
        }
      } finally {
        setTokenValidating(false);
      }
    };
    validate();
  }, [inviteToken]);

  // Check link validity and expiry (legacy college/stream flow only)
  useEffect(() => {
    if (location.state?.callEnded) return;
    if (inviteToken) return; // Token flow handles its own validation

    if (!expiryParam) {
      setIsLinkValid(false);
      return;
    }

    const expiryTime = parseInt(expiryParam, 10);
    const currentTime = Date.now();

    if (isNaN(expiryTime) || currentTime > expiryTime) {
      setIsLinkExpired(true);
    }
  }, [expiryParam, inviteToken, location.state?.callEnded]);

  // Helper: detect if document is currently in fullscreen (standard + vendor)
  const getActuallyInFullscreen = () =>
    !!(document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement);

  // ============ FULLSCREEN & ESC KEY BLOCKING ============
  // Track actual fullscreen state and block ESC key to prevent bypass (capture phase so we run before browser exits fullscreen)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const inFullscreen = getActuallyInFullscreen();
      console.log(`%c🎯 Fullscreen Changed - In Fullscreen: ${inFullscreen}`, inFullscreen ? 'color: #10b981; font-weight: bold;' : 'color: #dc2626; font-weight: bold;');
      setIsActuallyInFullscreen(inFullscreen);
      if (!inFullscreen && isScreenShared) {
        console.warn('%c⚠️ FULLSCREEN EXIT DETECTED DURING SETUP - User attempted to bypass fullscreen requirement', 'color: #dc2626; font-weight: bold;');
        setFullscreenExitAttempts((prev) => prev + 1);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' && event.keyCode !== 27) return;
      const inFullscreen = getActuallyInFullscreen();
      if (inFullscreen) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        console.warn('%c🔐 ESC KEY BLOCKED - Cannot exit fullscreen during interview setup', 'color: #dc2626; font-weight: bold;');
        showMessage("Cannot exit fullscreen during interview setup. Please press the 'Join Interview' button.", "warning");
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isScreenShared]);

  // Warn user if they exited fullscreen too many times
  useEffect(() => {
    if (fullscreenExitAttempts > 1 && isScreenShared) {
      console.error('%c🚨 MULTIPLE FULLSCREEN EXIT ATTEMPTS DETECTED', 'color: #dc2626; font-weight: bold;');
      showMessage(
        "Multiple fullscreen exit attempts detected. You must stay in fullscreen to join the interview.",
        "error"
      );
    }
  }, [fullscreenExitAttempts]);

  // ============ NOTIFICATION SUPPRESSION (PRE-JOIN) ============
  // Suppress notifications as soon as candidate is in interview flow (screen shared or fullscreen) so they don't appear during or after join
  useEffect(() => {
    if (!isScreenShared && !isFullscreenRequested) return;

    const originalRequestPermission =
      typeof Notification !== "undefined"
        ? (Notification as any).requestPermission
        : null;
    if (typeof Notification !== "undefined") {
      (Notification as any).requestPermission = async function () {
        console.log(
          "%c🔕 BLOCKING: Notification permission denied during interview setup",
          "color: #dc2626; font-weight: bold;"
        );
        return "denied";
      };
    }
    const style = document.createElement("style");
    style.setAttribute("data-interview-notification-suppress", "true");
    style.textContent = `
      .notification, .notification-container, [role="alert"].notification { display: none !important; }
    `;
    document.head.appendChild(style);

    const onSwMessage = (event: MessageEvent) => {
      if (event.data?.type === "notification") {
        event.stopImmediatePropagation();
      }
    };
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", onSwMessage);
    }

    return () => {
      if (document.head.contains(style)) document.head.removeChild(style);
      if (originalRequestPermission && typeof Notification !== "undefined") {
        (Notification as any).requestPermission = originalRequestPermission;
      }
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", onSwMessage);
      }
    };
  }, [isScreenShared, isFullscreenRequested]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const showMessage = (message: string, severity: "error" | "success" | "info" | "warning" = "error") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0] || null;
    if (!uploadedFile) return;

    const validMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (!validMimeTypes.includes(uploadedFile.type)) {
      showMessage("Please upload a valid PDF, DOC, DOCX, PPT, or PPTX file.");
      return;
    }

    const fileSizeMB = uploadedFile.size / (1024 * 1024);
    if (fileSizeMB > 1024) {
      showMessage("File size must be less than 1GB.");
      return;
    }

    if (uploadedFile.type === validMimeTypes[3] || uploadedFile.type === validMimeTypes[4]) {
      if (firstName === "" || lastName === "" || email === "") {
        showMessage("Please enter your name and email to upload PPT.");
        return;
      }
    }

    setFile(uploadedFile);
    setUploadStatus("uploading");

    try {
      if (isNameNotListed) {
        if (
          collegeId === "d564473d-de73-424e-b30e-876361d0331a" ||
          collegeId === "f41573b1-17ee-403b-8d45-72668df6ded1"
        ) {
          const response = await uploadPPTwithUser(uploadedFile, firstName, lastName, email, collegeId, streamId);
          setUserId(response?.userId);
        } else {
          const response = await uploadResume(uploadedFile, collegeId, streamId);
          const resumeData = response?.profile?.additionalInfo?.resume;
          setUserId(response?.id);
          if (response?.profile) {
            const { firstName, lastName } = response.profile;
            if (firstName) setFirstName(firstName);
            if (lastName) setLastName(lastName);
          }

          if (resumeData) {
            if (resumeData.email) setEmail(resumeData.email);
          }
        }
      } else {
        if (userId) {
          await uploadPPT(uploadedFile, userId);
        }
      }
      setUploadStatus("success");
      showMessage(isNameNotListed ? "Resume uploaded successfully!" : "Document uploaded successfully!", "success");
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setFile(null);
      const apiError = error as ApiError;
      showMessage(apiError?.message || "An error occurred", "error");
    }
  };

  const MAX_FILE_SIZE_MB = 1024;

  const validateAndSetFile = (uploadedFile: File | null) => {
    if (!uploadedFile) return;

    const fileSizeMB = uploadedFile.size / (1024 * 1024);

    const validMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (!validMimeTypes.includes(uploadedFile.type)) {
      showMessage("Please upload a valid file type: PDF, DOC, DOCX, PPT, PPTX.");
      return;
    }

    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      showMessage("File size must be less than 1GB.");
      return;
    }

    setFile(uploadedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    validateAndSetFile(droppedFile);
  };

  // Check if permissions are already granted when component mounts
  useEffect(() => {
    if (location.state?.callEnded) return;

    const checkInitialPermissions = async () => {
      if (!showCameraScreen) return;

      try {
        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setCameraPermission(true);
          setVideoStream(videoStream);

          if (videoRef.current) {
            videoRef.current.srcObject = videoStream;
            videoRef.current.play();
          }

          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMicPermission(true);
          setAudioStream(audioStream);
        } catch (error) {
          console.error("Error checking media permissions:", error);
        }
      } catch (error) {
        console.error("Error during initial permission check:", error);
      }
    };

    checkInitialPermissions();
  }, [showCameraScreen, setVideoStream, setAudioStream, location.state]);

  // Function to stop video feed
  const stopVideoFeed = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Setup permission change listeners using Permissions API
  useEffect(() => {
    let cameraPermissionObserver: PermissionStatus | null = null;
    let microphonePermissionObserver: PermissionStatus | null = null;

    const setupPermissionObservers = async () => {
      try {
        if (navigator.permissions) {
          const cameraStatus = await navigator.permissions.query({
            name: "camera" as PermissionName,
          });
          cameraPermissionObserver = cameraStatus;

          cameraStatus.addEventListener("change", () => {
            if (cameraStatus.state !== "granted") {
              setCameraPermission(false);
              stopVideoFeed();
            }
          });

          const micStatus = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });
          microphonePermissionObserver = micStatus;

          micStatus.addEventListener("change", () => {
            if (micStatus.state === "granted") {
              setMicPermission(true);
            } else {
              setMicPermission(false);
            }
          });
        }
      } catch (err) {
        console.error("Error setting up permission observers:", err);
      }
    };

    setupPermissionObservers();

    return () => {
      if (cameraPermissionObserver) {
        cameraPermissionObserver.removeEventListener("change", () => { });
      }
      if (microphonePermissionObserver) {
        microphonePermissionObserver.removeEventListener("change", () => { });
      }
      stopVideoFeed();
    };
  }, []);

  const candidateOptions: CandidateOption[] = jobId
    ? candidates
    : [...candidates, NOT_LISTED_OPTION];

  const requestFullscreen = async () => {
    try {
      console.log('%c🎯 Requesting fullscreen permission', 'color: #3b82f6; font-weight: bold;');
      const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void>; mozRequestFullScreen?: () => Promise<void>; msRequestFullscreen?: () => Promise<void> };
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();
      else throw new Error('Fullscreen not supported');

      setTimeout(() => {
        const inFullscreen = getActuallyInFullscreen();
        if (inFullscreen) {
          console.log('%c✅ Fullscreen permission granted - Interview session locked to fullscreen mode', 'color: #10b981; font-weight: bold;');
          console.log('%c⏰ Exit tracking ENABLED - Any unauthorized exit will be recorded', 'color: #8b5cf6; font-weight: bold;');
          setIsFullscreenRequested(true);
          setIsActuallyInFullscreen(true);
          setFullscreenExitAttempts(0);
        } else {
          console.error('%c❌ Fullscreen request failed - Not actually in fullscreen', 'color: #dc2626; font-weight: bold;');
          setScreenSharingErrorMessage("Fullscreen mode failed to activate. Please try again.");
          setShowScreenSharingError(true);
        }
      }, 500);
      return true;
    } catch (error: any) {
      console.error("❌ Fullscreen request failed:", error);
      setIsFullscreenRequested(false);
      setIsActuallyInFullscreen(false);

      if (error.name === "NotAllowedError") {
        setScreenSharingErrorMessage(
          "Fullscreen permission was denied. You must enable fullscreen mode to join the interview."
        );
      } else {
        setScreenSharingErrorMessage(
          "Unable to enter fullscreen mode. Please try again."
        );
      }
      setShowScreenSharingError(true);
      return false;
    }
  };

  const requestScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
          displaySurface: "monitor",
        } as MediaTrackConstraints,
        audio: false,
      });

      const videoTrack = screenStream.getVideoTracks()[0];

      if (videoTrack) {
        const settings = videoTrack.getSettings();

        if ((settings as any).displaySurface !== "monitor") {
          setScreenSharingErrorMessage(
            "You must share your entire screen (monitor), not just a window or tab. This is required for proctoring purposes."
          );
          setShowScreenSharingError(true);

          videoTrack.stop();
          return null;
        }

        setScreenStream(screenStream);
        setIsScreenShared(true);

        videoTrack.addEventListener(
          "ended",
          () => {
            setIsScreenShared(false);
            setScreenStream(null);
          },
          { once: true }
        );

        return screenStream;
      }

      return null;
    } catch (error: any) {
      console.error("Error sharing screen:", error);
      if (error.name === "NotAllowedError") {
        setScreenSharingErrorMessage(
          "Screen sharing permission was denied. You must allow screen sharing to join the interview."
        );
        setShowScreenSharingError(true);
      }
      return null;
    }
  };

  const handleButtonClick = async () => {
    // Final sync check — guard against stale React state
    const syncInFullscreen = getActuallyInFullscreen();
    if (!syncInFullscreen) {
      showMessage(
        "Fullscreen mode was lost. Please re-enable fullscreen to join.",
        "error"
      );
      setIsActuallyInFullscreen(false);
      return;
    }

    console.log('%c✅ ALL SECURITY CHECKS PASSED - Joining interview', 'color: #10b981; font-weight: bold;');
    sessionStorage.setItem("hasJoinedInterview", "true");
    navigate(routes.call, {
      state: {
        meetingId: meetingId.current,
        userId: userId,
      },
    });
  };

  const setupSocketIO = React.useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return;
    }
    try {
      const wsUrl = `${process.env.REACT_APP_FER_SOCKET?.replace(/^http/, "ws")}/${conversationId?.toString()}`;
      const ws = new window.WebSocket(wsUrl);
      socketRef.current = ws;
      ws.onopen = () => setIsSocketConnected(true);
      ws.onclose = () => setIsSocketConnected(false);
      ws.onerror = () => setIsSocketConnected(false);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.detections?.face?.count === 1) setIsSingleFaceDetected(true);
          else setIsSingleFaceDetected(false);
        } catch (e) {
          // ignore
        }
      };
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
    }
  }, [conversationId]);

  const startSendingFrames = React.useCallback(
    (videoElement: HTMLVideoElement) => {
      if (!isSocketConnected || !socketRef.current) return;

      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
        canvasRef.current.width = 640;
        canvasRef.current.height = 480;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      isSendingFramesRef.current = true;

      const frameInterval = 1000 / TARGET_FPS;

      const captureAndSendFrame = () => {
        if (
          !isSendingFramesRef.current ||
          !socketRef.current ||
          socketRef.current.readyState !== WebSocket.OPEN
        ) {
          return;
        }

        try {
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];

          socketRef.current.send(
            JSON.stringify({
              timestamp: Date.now(),
              frame: jpegDataUrl,
              isPreInterviewVerification: true,
            })
          );

          frameIntervalRef.current = setTimeout(captureAndSendFrame, frameInterval);
        } catch (error) {
          console.error("Error capturing or sending frame:", error);
          isSendingFramesRef.current = false;
        }
      };

      captureAndSendFrame();
    },
    [isSocketConnected]
  );

  const stopSendingFrames = React.useCallback(() => {
    isSendingFramesRef.current = false;
    if (frameIntervalRef.current) {
      clearTimeout(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (conversationId && cameraPermission) {
      setupSocketIO();
    }
    return () => {
      stopSendingFrames();
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [conversationId, cameraPermission, setupSocketIO]);

  useEffect(() => {
    if (isSocketConnected) {
      startSendingFrames(videoRef.current!);
    } else {
      stopSendingFrames();
    }

    return () => {
      stopSendingFrames();
    };
  }, [isSocketConnected, startSendingFrames, stopSendingFrames]);

  // Show loading while token is being validated
  if (tokenValidating) {
    return (
      <Box sx={{ height: "86vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  // If link is invalid, expired, or token already used — show error
  if (!isLinkValid || isLinkExpired || isTokenUsed) {
    return (
      <Box
        sx={{
          height: "86vh",
          width: "auto",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          borderRadius: "1vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          scrollbarWidth: "none",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            backgroundColor: "white",
            padding: "4vh",
            borderRadius: "2vh",
            boxShadow: "0 0.5vh 2vh rgba(0,0,0,0.1)",
            textAlign: "center",
            maxWidth: "60%",
          }}
        >
          <ErrorOutline sx={{ fontSize: "8vh", color: "red", mb: "2vh" }} />
          <Typography variant="h4" sx={{ mb: "2vh", fontWeight: "bold", fontSize: "4vh" }}>
            {isTokenUsed ? "Link Already Used" : isLinkExpired ? "Link Has Expired" : "Invalid Link"}
          </Typography>
          <Typography variant="body1" sx={{ mb: "3vh", fontSize: "2vh" }}>
            {isTokenUsed
              ? "This interview link has already been used. If you need a new link, please contact your administrator."
              : isLinkExpired
              ? "The interview link you're trying to access has expired. Please contact your administrator for a new link."
              : "The link you're trying to access is invalid. Please make sure you have the correct URL."}
          </Typography>
          <CustomButton type="secondary" onClick={() => navigate(routes.login)}>
            Go to Login
          </CustomButton>
        </Box>
      </Box>
    );
  }

  // ---------- NEW UI HELPERS ----------
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  const joinEnabled =
    cameraPermission &&
    micPermission &&
    micTestPassed &&
    speakerTestPassed &&
    isScreenShared &&
    isActuallyInFullscreen;

  const enableScreenShareEnabled =
    cameraPermission && micPermission && micTestPassed && speakerTestPassed && !isScreenShared;

  // ---------- RENDER ----------
  return (
    <>
      {showCameraScreen ? (
        <Box
          sx={{
            minHeight: "86vh",
            height: showInterviewSummary ? "auto" : "86vh",
            overflow: showInterviewSummary ? "auto" : "hidden",
            width: "100%",
            alignItems: "center",
            px: { xs: 2, md: 4 },
            pt: 2,
            pb: 4,
          }}
        >
          {showInterviewSummary ? (
            // Keep existing summary UI unchanged
            <Box sx={homeStyle.box2}>
              <Box sx={homeStyle.box3}>
                <CallEndIcon sx={homeStyle.CallEndIcon} />
                <Typography variant="h6" gutterBottom sx={homeStyle.callText}>
                  Call Ended : {callEndedTime || "N/A"}
                </Typography>
              </Box>
              <Typography sx={homeStyle.thankyouText}>
                Thank you for participating in the interview.
              </Typography>
              <Typography sx={{ marginBottom: "2vh", width: "60%" }}>
                Your interview session has been successfully recorded and submitted.
                <br />
                The results will be shared with your college shortly.
              </Typography>
              <Typography sx={{ marginBottom: "2vh" }}>
                Best of luck for your future endeavours!
              </Typography>
              <Typography variant="body1" sx={homeStyle.ratingText}>
                How was the interview process?
              </Typography>
              <Box sx={{ mt: "1vh", mb: "2vh" }}>
                <Rating
                  name="interview-rating"
                  value={interviewRating}
                  disabled={feedbackSubmitted}
                  onChange={(_: any, newValue: number | null) => setInterviewRating(newValue)}
                  size="large"
                  sx={{
                    color: globalStyles.colors.primary,
                    cursor: feedbackSubmitted ? "not-allowed" : "pointer",
                  }}
                />
              </Box>

              <TextField
                multiline
                required
                minRows={2}
                disabled={feedbackSubmitted}
                fullWidth
                variant="outlined"
                placeholder="Share your feedback here..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                sx={{
                  width: "80%",
                  mb: "2vh",
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: globalStyles.colors.primary,
                    borderWidth: "0.2vh",
                  },
                  "& .Mui-disabled": { cursor: "not-allowed" },
                }}
              />

              <CustomButton
                type="secondary"
                disabled={feedbackSubmitted}
                additionalStyles={{ marginTop: "2vh", marginRight: "2vh" }}
                onClick={async () => {
                  try {
                    if (interviewRating !== null && feedbackComment.trim()) {
                      await submitUserFeedback({
                        userId: userId,
                        conversationId: conversationId!,
                        rating: interviewRating,
                        comments: feedbackComment.trim(),
                      });
                      setFeedbackSubmitted(true);
                      showMessage("Feedback submitted successfully!", "success");
                    } else {
                      showMessage("Please provide both rating and feedback comment", "warning");
                    }
                  } catch (err) {
                    console.error("Error submitting feedback:", err);
                    showMessage("Failed to submit feedback. Please try again.", "error");
                  }
                }}
              >
                {feedbackSubmitted ? "Feedback Submitted" : "Submit Feedback"}
              </CustomButton>

              <CustomButton
                type="secondary"
                additionalStyles={{ marginTop: "2vh" }}
                onClick={async () => {
                  try {
                    if (!feedbackSubmitted && interviewRating !== null && feedbackComment.trim()) {
                      await submitUserFeedback({
                        userId: userId,
                        conversationId: conversationId!,
                        rating: interviewRating,
                        comments: feedbackComment.trim(),
                      });
                      setFeedbackSubmitted(true);
                      setUserId(null);
                    }
                  } catch (err) {
                    console.error("Error submitting feedback:", err);
                  }

                  setShowInterviewSummary(false);
                  window.history.replaceState({}, document.title);
                  navigate(routes.login);
                }}
              >
                Dismiss
              </CustomButton>
            </Box>
          ) : (
            <>
              {/* Top Center Header (logo + text + date) */}
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Box sx={{ margin: "0 auto 10px", display: "flex", justifyContent: "center" }}>
                  <img src={muSigmaLogo} alt="Mu Sigma" style={{ height: "64px", objectFit: "contain" }} />
                </Box>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151", mt: 0.5 }}>
                  {formattedDate}
                </Typography>
              </Box>
              {/* Two cards layout */}
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 1330,
                  margin: "0 auto",
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  justifyContent: "center",
                  gap: 3,
                  alignItems: "center",
                }}
              >
                {/* Left: Camera preview card (no camera-on pill, no integrated webcam row) */}
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 653,
                    height: 397,
                    borderRadius: "6px",
                    border: "1px solid #DEDEDE",
                    background: "#FCFCFC",
                    boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.10), 0 1px 4px -1px rgba(0, 0, 0, 0.10)",
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ width: "100%", height: "100%", background: "#F3F4F6", position: "relative" }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />

                    {/* Camera & Microphone Permission Modal (keep behavior same) */}
                    <Modal
                      open={
                        showCameraScreen &&
                        !cameraPermission &&
                        !micPermission &&
                        (isScreenShared || isProceeding)
                      }
                      aria-labelledby="permission-modal"
                      aria-describedby="permission-description"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: "white",
                          borderRadius: "2vh",
                          boxShadow: 24,
                          p: "4vh",
                          maxWidth: 400,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="h6" id="permission-modal" sx={{ mb: "2vh" }}>
                          Camera & Microphone Access Required
                        </Typography>
                        <Typography variant="body1" id="permission-description">
                          You must allow camera & microphone access to join the interview. Please reload the page after the permission is granted.
                        </Typography>
                        <Box sx={{ mt: "4vh", display: "flex", justifyContent: "center" }}>
                          <CustomButton type="secondary" text="Reload Page" onClick={() => window.location.reload()} />
                        </Box>
                      </Box>
                    </Modal>
                  </Box>
                </Box>

                {/* Right: System Check card */}
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 653,
                    minHeight: 397,
                    borderRadius: "6px",
                    border: "1px solid #DEDEDE",
                    background: "#FCFCFC",
                    boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.10), 0 1px 4px -1px rgba(0, 0, 0, 0.10)",
                    px: 4,
                    py: 3,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#111827", mb: 2 }}>
                    System Check
                  </Typography>

                  {/* Microphone */}
                  {cameraPermission && micPermission && (
                    <Box sx={{ mb: 2 }}>
                      <MicrophoneTest
                        audioStream={audioStream}
                        permissionGranted={micPermission}
                        onPass={() => setMicTestPassed(true)}
                        onFail={() => setMicTestPassed(false)}
                      />
                    </Box>
                  )}

                  {/* Speaker */}
                  <Box sx={{ mb: 2 }}>
                    <SpeakerTest
                      isEnabled={micTestPassed}
                      onPass={() => setSpeakerTestPassed(true)}
                      onFail={() => setSpeakerTestPassed(false)}
                    />
                  </Box>

                  {/* Enable Screen Share checkbox */}
                  <Box sx={{ mt: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isScreenShared}
                          onChange={(e) => {
                            if (e.target.checked && !isScreenShared) requestScreenShare();
                          }}
                          disabled={!enableScreenShareEnabled && !isScreenShared}
                          size="small"
                          sx={{
                            color: enableScreenShareEnabled ? "#000000" : "#D1D5DB",
                            padding: "4px 8px",
                            "&.Mui-checked": {
                              color: "#0B6B63",
                            },
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ color: isScreenShared ? "#0B6B63" : (enableScreenShareEnabled ? "#000000" : "#9CA3AF"), fontSize: 13, fontWeight: enableScreenShareEnabled ? 700 : 500 }}>
                          Enable Screen Share
                        </Typography>
                      }
                    />

                    {/* helper text */}
                    {!isScreenShared && (
                      <Typography sx={{ mt: 0, fontSize: 11, color: enableScreenShareEnabled ? "#000000" : "#9CA3AF", ml: 3.5, lineHeight: 1.2 }}>
                        For proctoring purposes, you must share your entire screen before joining.
                      </Typography>
                    )}

                  {/* Enable Fullscreen checkbox */}
                  <Box sx={{ mt: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isActuallyInFullscreen}
                          onChange={(e) => {
                            if (e.target.checked && !isActuallyInFullscreen) requestFullscreen();
                          }}
                          disabled={!isScreenShared || isActuallyInFullscreen}
                          size="small"
                          sx={{
                            color: isScreenShared ? "#000000" : "#D1D5DB",
                            padding: "4px 8px",
                            "&.Mui-checked": {
                              color: "#0B6B63",
                            },
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ color: isActuallyInFullscreen ? "#0B6B63" : (isScreenShared ? "#000000" : "#9CA3AF"), fontSize: 13, fontWeight: isScreenShared ? 700 : 500 }}>
                          Enable Fullscreen
                        </Typography>
                      }
                    />
                    {!isActuallyInFullscreen && (
                      <Typography sx={{ mt: 0, fontSize: 11, color: isScreenShared ? "#000000" : "#9CA3AF", ml: 3.5, lineHeight: 1.2 }}>
                        Fullscreen mode is required for proctoring during the interview.
                      </Typography>
                    )}
                  </Box>
                  </Box>
                </Box>
              </Box>
              {/* Bottom-right Join Interview button */}
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 1330,
                  margin: "0 auto",
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 2,
                }}
              >
                <Button
                  variant="contained"
                  disabled={!joinEnabled}
                  onClick={handleButtonClick}
                  sx={{
                    textTransform: "none",
                    fontWeight: 900,
                    bgcolor: "#0B6B63",
                    color: "#fff",
                    borderRadius: 2,
                    px: 3,
                    py: 1.2,
                    "&:hover": { bgcolor: "#08534E" },
                    "&.Mui-disabled": {
                      bgcolor: "#E5E7EB",
                      color: "#9CA3AF",
                    },
                  }}
                >
                  Join Interview
                </Button>
              </Box>
            </>
          )}
        </Box>
      ) : (
        <Box sx={homeStyle.landingWrapper}>
          <Box sx={homeStyle.mainCard}>
            {/* Header Section */}
            <Box sx={homeStyle.headerBox}>
              <Typography sx={homeStyle.welcomeText}>
                Welcome to the <Box component="span" sx={homeStyle.muTeal}>mu</Box><Box component="span" sx={homeStyle.cognitronRed}>Cognitron!</Box>
              </Typography>
              <Typography sx={homeStyle.subtitleText}>
                Your Smart Interview Assistant
              </Typography>
            </Box>

            {/* Two Column Container */}
            <Box sx={homeStyle.twoColumnContainer}>
              {/* Left Column: Form Section */}
              <Box sx={homeStyle.leftCard}>
                <Typography sx={homeStyle.sectionTitle}>
                  Candidate Information
                </Typography>

                {/* Candidate Name Dropdown (hidden in token flow) */}
                {isTokenFlow ? (
                <Box alignItems={'center'}>
                  <Typography sx={homeStyle.inputLabel}>Candidate Name</Typography>
                  <TextField
                    value={`${firstName} ${lastName}`.trim()}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    fullWidth
                    sx={{
                      ...homeStyle.textfield,
                      "& .MuiOutlinedInput-root": { borderRadius: "1vh", backgroundColor: "#f9fafb" },
                    }}
                  />
                </Box>
                ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "1.5vh",
                    flexWrap: { xs: "wrap", md: "nowrap" },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: { xs: "100%", md: 0 } }}>
                    <Typography sx={homeStyle.inputLabel}>
                      Candidate Name {!jobId && <Box component="span" sx={homeStyle.requiredAsterisk}>*</Box>}
                    </Typography>
                    <Autocomplete
                      options={candidateOptions}
                      getOptionLabel={(option) => {
                        if (option.email === "__no_match__") return "No matching candidates";
                        if (option.email === "__not_listed__") return "My name is not listed";
                        const hasName = option.profile?.firstName && option.profile?.lastName;
                        return hasName
                          ? `${option.profile.firstName} ${option.profile.lastName} (${option.email})`
                          : option.email;
                      }}
                      value={candidateOptions.find((c) => c.email === email)}
                      onChange={async (_, selectedCandidate) => {
                        if (!selectedCandidate || selectedCandidate.email === "__no_match__") return;

                        if (selectedCandidate.email === "__not_listed__") {
                          setIsNameNotListed(true);
                          setFirstName("");
                          setLastName("");
                          setEmail("");
                        } else {
                          const { profile, email, id } = selectedCandidate;
                          setFirstName(profile?.firstName || "");
                          setLastName(profile?.lastName || "");
                          setEmail(email);
                          setUserId(id);
                          setIsNameNotListed(false);
                          selectedResumeFile.current = profile?.uploadedFileName || null;
                          try {
                            const response = await getAllConversation(id);
                            if (response?.length > 0 && response[response.length - 1]?.status === "active") {
                              setConversationId(response[response.length - 1]?.id);
                            } else {
                              setConversationId(null);
                            }
                          } catch (e) {
                            console.error("Failed to fetch conversations for user:", e);
                          }
                        }
                      }}
                      sx={homeStyle.textfield}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Search candidate"
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "1vh",
                              "& fieldset": { borderColor: "#D1D5DB" },
                              "&:hover fieldset": { borderColor: "#9ca3af" },
                              "&.Mui-focused fieldset": {
                                borderColor: "#006B66",
                              },
                            },
                          }}
                        />
                      )}
                      renderOption={(props, option) => {
                        if (option.email === "__no_match__") {
                          return (
                            <li {...props} style={{ pointerEvents: "none", fontStyle: "italic", color: "#888", padding: "1vh" }}>
                              No matching candidates
                            </li>
                          );
                        }
                        if (option.email === "__not_listed__") {
                          return (
                            <li {...props} style={{ fontWeight: 500, color: "#000", padding: "1vh" }}>
                              My name is not listed
                            </li>
                          );
                        }
                        const hasName = option.profile?.firstName && option.profile?.lastName;
                        const label = hasName
                          ? `${option.profile.firstName} ${option.profile.lastName} (${option.email})`
                          : option.email;

                        return (
                          <li {...props} style={{ padding: "1vh" }}>
                            {label}
                          </li>
                        );
                      }}
                      isOptionEqualToValue={(option, value) => option.email === value.email}
                      disableClearable
                      filterOptions={(options, { inputValue }) => {
                        const filtered = options.filter((option) => {
                          if (option.email === "__not_listed__") return false;
                          const label = `${option.profile?.firstName || ""} ${option.profile?.lastName || ""} ${option.email}`.toLowerCase();
                          return label.includes(inputValue.toLowerCase());
                        });

                        if (filtered.length === 0) {
                          return jobId ? [NO_MATCH_OPTION] : [NO_MATCH_OPTION, NOT_LISTED_OPTION];
                        }

                        return jobId ? filtered : [...filtered, NOT_LISTED_OPTION];
                      }}
                    />
                  </Box>

                  {/* Resume Preview/View Button (if available) */}
                  {selectedResumeFile.current && !isNameNotListed && !isTokenFlow && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: { xs: "flex-end", md: "flex-start" },
                      width: { xs: "100%", md: "auto" },
                      flexShrink: 0,
                    }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ color: "#006B66", textTransform: "none", fontWeight: 600, whiteSpace: "nowrap" }}
                      disabled={resumePreviewLoading}
                      onClick={async () => {
                        try {
                          setResumePreviewLoading(true);
                          const result = await getResumePreviewUrl(selectedResumeFile.current as string);
                          if (!result) return;
                          resumePreviewUrl.current = result.url;
                          resumeContentType.current = result.contentType;
                          setResumePreviewOpen(true);
                        } catch (e) {
                          showMessage("Failed to load resume preview", "error");
                        } finally {
                          setResumePreviewLoading(false);
                        }
                      }}
                    >
                      {resumePreviewLoading ? "Loading..." : "Preview Resume"}
                    </Button>
                  </Box>
                  )}
                </Box>
                )}

                {/* Freshers only: Resume Upload Section (hidden in token flow) */}
                {!jobId && !isTokenFlow && (
                  <Box>
                    <Typography sx={homeStyle.inputLabel}>
                      Upload Resume <Box component="span" sx={homeStyle.requiredAsterisk}>*</Box>
                    </Typography>
                    {file && (isNameNotListed || email !== "") ? (
                      <Box
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        sx={{
                          border: "1.5px dashed #D1D5DB",
                          borderRadius: "1.5vh",
                          padding: "2vh",
                          textAlign: "center",
                          backgroundColor: isDragging ? "#f0fdf4" : "#f9fafb",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          minHeight: "12vh",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: "1vh", mb: "1vh" }}>
                          {uploadStatus === "uploading" ? (
                            <CircularProgress size={20} />
                          ) : uploadStatus === "success" ? (
                            <CheckCircleOutline sx={{ color: "#10b981", fontSize: "2.5vh" }} />
                          ) : uploadStatus === "error" ? (
                            <CloseIcon sx={{ color: "#ef4444", fontSize: "2.5vh" }} />
                          ) : null}
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {file.name}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          onClick={() => setFile(null)}
                          sx={{ color: "#ef4444", textTransform: 'none' }}
                        >
                          Remove
                        </Button>
                      </Box>
                    ) : (
                      <Box
                        onDragOver={isNameNotListed || email !== "" ? handleDragOver : undefined}
                        onDragLeave={isNameNotListed || email !== "" ? handleDragLeave : undefined}
                        onDrop={isNameNotListed || email !== "" ? handleDrop : undefined}
                        sx={{
                          border: "1.5px dashed #D1D5DB",
                          borderRadius: "1.5vh",
                          padding: "3vh",
                          textAlign: "center",
                          backgroundColor: "#ffffff",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          minHeight: "12vh",
                          width:"38.7vw",
                          cursor: isNameNotListed || email !== "" ? "pointer" : "default",
                          opacity: isNameNotListed || email !== "" ? 1 : 0.6,
                        }}
                        onClick={() => {
                          if (isNameNotListed || email !== "") {
                            document.getElementById("resume-upload")?.click();
                          }
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "#4b5563" }}>
                          Drag and drop your resume here or <Box component="span" sx={{ color: "#006B66", fontWeight: 700 }}>browse</Box>
                        </Typography>
                        <input
                          id="resume-upload"
                          hidden
                          accept=".pdf,.doc,.docx"
                          type="file"
                          onChange={handleFileChange}
                        />
                        <Typography variant="caption" sx={{ mt: 1, color: "#9ca3af" }}>
                          Accepted formats: PDF, DOC, DOCX (Max: 10MB)
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Name Fields Row */}
                <Box sx={{ display: 'flex', gap: '2vh' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={homeStyle.inputLabel}>
                      First Name <Box component="span" sx={homeStyle.requiredAsterisk}>*</Box>
                    </Typography>
                    <TextField
                      placeholder="Enter first name"
                      required
                      variant="outlined"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      InputProps={{ readOnly: isTokenFlow }}
                      fullWidth
                      sx={homeStyle.textfield}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={homeStyle.inputLabel}>
                      Last Name <Box component="span" sx={homeStyle.requiredAsterisk}>*</Box>
                    </Typography>
                    <TextField
                      placeholder="Enter last name"
                      required
                      variant="outlined"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      InputProps={{ readOnly: isTokenFlow }}
                      fullWidth
                      sx={homeStyle.textfield}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: '2vh' }}>
                  {/* Email Field */}
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={homeStyle.inputLabel}>
                      Email Address <Box component="span" sx={homeStyle.requiredAsterisk}>*</Box>
                    </Typography>
                    <TextField
                      placeholder="Enter email address"
                      required
                      variant="outlined"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      InputProps={{ readOnly: isTokenFlow }}
                      fullWidth
                      sx={homeStyle.textfield}
                    />
                  </Box>

                  {/* Stream Field (for Freshers) */}
                  {!jobId && stream && (
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={homeStyle.inputLabel}>
                        Stream
                      </Typography>
                      <TextField
                        value={stream}
                        disabled
                        variant="outlined"
                        fullWidth
                        sx={homeStyle.textfield}
                      />
                    </Box>
                  )}
                </Box>
                {/* Consent and Button Wrapper */}
                <Box sx={{ mt: '4vh', display: 'flex', flexDirection: 'column', gap: '3vh' }}>
                  <Box sx={homeStyle.consentBox}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isChecked}
                          onChange={handleCheckboxChange}
                          sx={{
                            color: "#D1D5DB",
                            p: 0,
                            "&.Mui-checked": { color: "#006B66" },
                          }}
                        />
                      }
                      label={
                        <Typography sx={homeStyle.consentText}>
                          I agree to the terms and conditions and privacy policy. I consent to the recording and processing of my interview for evaluation purposes.
                        </Typography>
                      }
                      sx={{ alignItems: "flex-start", mx: 0 }}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    disabled={!isFormValid || isProceeding}
                    onClick={async () => {
                      setIsProceeding(true);
                      try {
                        if (!userId) {
                          showMessage("User ID not found. Please select a candidate.", "error");
                          return;
                        }
                        const conversationResponse = await getConversationId(
                          userId,
                          conversationId ?? undefined,
                          jobId || tokenJobId || undefined,
                          inviteToken || undefined,
                        );
                        setConversationId(conversationResponse?.id);
                        meetingId.current = conversationResponse?.roomInfo?.name;
                        setShowCameraScreen(true);
                      } catch (error) {
                        const apiError = error as ApiError;
                        showMessage(apiError?.message || "An error occurred", "error");
                      } finally {
                        setIsProceeding(false);
                      }
                    }}
                    sx={homeStyle.proceedButton}
                    fullWidth
                  >
                    {isProceeding ? "Proceeding..." : "Proceed to Interview"}
                  </Button>
                </Box>
              </Box>

              {/* Right Column: General Instructions */}
              <Box sx={homeStyle.rightCard}>
                <Box sx={homeStyle.instructionHeader}>
                  <Box sx={{ backgroundColor: '#e0f2f1', borderRadius: '50%', p: '0.8vh', display: 'flex' }}>
                    <InfoOutlined sx={{ color: '#006B66', fontSize: '2.5vh' }} />
                  </Box>
                  <Typography sx={homeStyle.instructionTitle}>
                    General Instructions
                  </Typography>
                </Box>

                <Box sx={homeStyle.instructionList}>
                  {[
                    "Think aloud during problem solving – both logic and communication are assessed",
                    "Follow-up questions may be triggered by your previous answers – stay consistent",
                    "Do not interrupt the bot or talk over questions – wait for the bot to finish",
                    "Ensure camera and microphone are enabled and screen is shared",
                    "Maintain stable internet connection (avoid mobile hotspots)",
                    "Sit in a quiet, well-lit space with no background noise",
                    "Do not refresh the page, switch tabs, or use external help",
                    "Look directly at the camera and speak clearly",
                    "Close unnecessary apps and notifications",
                    "Use headphones to avoid echo or audio feedback"
                  ].map((text, idx) => (
                    <Box key={idx} sx={homeStyle.instructionItem}>
                      <CheckCircleOutline sx={homeStyle.checkIcon} />
                      <Typography sx={homeStyle.instructionText}>{text}</Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={homeStyle.importantBox}>
                  <InfoOutlined sx={{ color: '#006B66', fontSize: '2.2vh' }} />
                  <Typography sx={homeStyle.importantText}>
                    <Box component="span" sx={{ fontWeight: 800 }}>Important:</Box> This interview is AI-powered and recorded for evaluation purposes.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Screen Sharing Error Dialog */}
      <Modal
        open={showScreenSharingError}
        onClose={() => setShowScreenSharingError(false)}
        aria-labelledby="screen-sharing-error-title"
        aria-describedby="screen-sharing-error-description"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: "2vh",
            boxShadow: 24,
            p: "4vh",
            maxWidth: 500,
          }}
        >
          <Typography id="screen-sharing-error-title" variant="h6" color="error.main" sx={{ mb: "2vh" }}>
            Screen Sharing Error
          </Typography>
          <Typography id="screen-sharing-error-description" variant="body1" sx={{ mb: "3vh" }}>
            {screenSharingErrorMessage}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <CustomButton type="secondary" text="Cancel" onClick={() => setShowScreenSharingError(false)} />
            <CustomButton
              type="primary"
              text="Try Again"
              onClick={() => {
                setShowScreenSharingError(false);
                setTimeout(() => requestScreenShare(), 500);
              }}
            />
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Resume Preview Dialog */}
      <CustomDialog
        open={resumePreviewOpen}
        title="Resume Preview"
        handleClose={() => {
          setResumePreviewOpen(false);
          setTimeout(() => {
            if (resumePreviewUrl.current) {
              URL.revokeObjectURL(resumePreviewUrl.current);
              resumePreviewUrl.current = null;
            }
          }, 200);
        }}
      >
        {resumePreviewUrl.current && resumeContentType.current === "application/pdf" ? (
          <Box sx={{ height: "70vh" }}>
            <iframe
              src={resumePreviewUrl.current}
              title="Resume Preview"
              style={{ width: "100%", height: "100%", border: 0 }}
            />
          </Box>
        ) : (
          <Typography variant="body2">
            Preview is available for PDF files only. The resume will open in a new tab or download automatically.
            {resumePreviewUrl.current && (
              <>
                {" "}
                <a href={resumePreviewUrl.current} target="_blank" rel="noreferrer">
                  Open resume
                </a>
              </>
            )}
          </Typography>
        )}
      </CustomDialog>
    </>
  );
}

export default CandidateHome;
