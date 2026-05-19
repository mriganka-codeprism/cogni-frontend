import React from "react";
import { Box, Button, Divider, Typography } from "@mui/material";
import { CallStatus, logoConfig, statusColors } from "../constants/screensData";
import { callStyles } from "../styles/call.styles";
import Text from "../components/textComponent";
import EmotionCard from "../components/EmotionCard";
import { transcriptionStyles } from "../styles/transcription.styles";
import { Schedule } from "@mui/icons-material";
import {
  getAlertFrames,
  getConversationMessages,
  getEmotionEvents,
  getPlaybackSync,
  getRecordingUrl,
  getAllInterviews,
} from "../api/api";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import CustomDialog from "../components/customDialog";
import { useState } from "react";
import "../App.css";
import SuspiciousFrameModal from "../components/livekit/modals/SuspiciousFrameModal";
import { PulseVisualizer } from "../components/livekit/PulseVisualizer";

type EmotionEventsData = {
  emotionArray: Array<{
    frame_number: number;
    bbox: number[];
    timestamp: number;
    videoTime: number;
    emotions?: any;
    name?: string;
    gender?: string;
  }>;
  alertFrames: Array<{
    alert_frame: string;
    videoTime: number;
    reason?: string;
  }>;
};

const formatEmotionEventsData = (
  proctoringResults: any[] = [],
  sessionStartTime?: number
): EmotionEventsData => {
  if (!proctoringResults || !Array.isArray(proctoringResults))
    return { emotionArray: [], alertFrames: [] };

  let startTime = sessionStartTime;
  if (!startTime && proctoringResults.length > 0) {
    startTime = Math.min(
      ...proctoringResults
        .filter((result) => result.timestamp)
        .map((result) => result.timestamp)
    );
  }

  const { emotionArray, alertFrames } = proctoringResults.reduce(
    (
      acc: {
        emotionArray: EmotionEventsData["emotionArray"];
        alertFrames: EmotionEventsData["alertFrames"];
      },
      result: any
    ) => {
      const videoRelativeTime = startTime ? result.timestamp - startTime : 0;
      if (result.alert_frame) {
        acc.alertFrames.push({
          alert_frame: result.alert_frame,
          videoTime: videoRelativeTime / 1000,
          reason: result.alert_proctoring?.reason,
        });
      }
      const emotionsArr = result.detections?.emotions || [];
      emotionsArr.forEach((emotionObj: any) => {
        acc.emotionArray.push({
          frame_number: -1,
          bbox: emotionObj.box ?? [],
          timestamp: result.timestamp,
          videoTime: videoRelativeTime / 1000,
          emotions: emotionObj.emotions,
          name: emotionObj.name,
          gender: result.detections?.gender_age?.gender,
        });
      });
      return acc;
    },
    { emotionArray: [], alertFrames: [] }
  );

  return {
    emotionArray,
    alertFrames,
  };
};

type TranscriptMessage = {
  id: string;
  from: string;
  text: string;
  createdAt: string;
  timestamp: number;
  relativeTime: number;
  recordingIndex: number | null;
  recordingSegmentId: string | null;
};

const formatTimeLabel = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(safeSeconds / 60)}:${Math.floor(safeSeconds % 60)
    .toString()
    .padStart(2, "0")}`;
};

const formatMessagesWithRelativeTime = (
  messages: any[] = [],
  recordingStartedAt: string | null = null
) => {
  if (!messages || !Array.isArray(messages) || messages.length === 0) return [];

  // Prefer recording start so relativeTime matches video currentTime (video t=0 = recording start)
  const startTime = recordingStartedAt
    ? new Date(recordingStartedAt).getTime()
    : Math.min(
      ...messages
        .filter((msg) => msg.createdAt)
        .map((msg) => new Date(msg.createdAt).getTime())
    );

  return messages.map((msg) => {
    const timestamp = new Date(msg.createdAt).getTime();
    const relativeTimeSeconds = (timestamp - startTime) / 1000;
    const adjustedRelativeTime =
      msg.senderType === "ai_bot"
        ? relativeTimeSeconds
        : relativeTimeSeconds - 2;

    return {
      id: msg.id,
      from: msg.senderType === "ai_bot" ? "bot" : "candidate",
      text: msg.content || "",
      createdAt: msg.createdAt,
      timestamp,
      relativeTime: Math.max(0, adjustedRelativeTime),
      recordingIndex: null,
      recordingSegmentId: null,
    };
  });
};

const formatMessagesWithPlaybackSync = (
  messages: any[] = [],
  recordingSegments: any[] = []
): TranscriptMessage[] => {
  if (!Array.isArray(messages) || messages.length === 0) return [];

  const segmentIndexById = new Map(
    recordingSegments.map((segment, index) => [segment.id, index])
  );

  return messages.map((msg) => { 
    const timestamp = new Date(msg.createdAt).getTime();
    const rawPlaybackOffsetSeconds =
      typeof msg.playbackOffsetMs === "number"
        ? Math.max(0, msg.playbackOffsetMs / 1000)
        : 0;
    const adjustedPlaybackOffsetSeconds =
      msg.senderType === "ai_bot"
        ? rawPlaybackOffsetSeconds
        : rawPlaybackOffsetSeconds - 2;

    return {
      id: msg.id,
      from: msg.senderType === "ai_bot" ? "bot" : "candidate",
      text: msg.content || "",
      createdAt: msg.createdAt,
      timestamp,
      relativeTime: Math.max(0, adjustedPlaybackOffsetSeconds),
      recordingIndex:
        typeof msg.recordingSegmentId === "string"
          ? (segmentIndexById.get(msg.recordingSegmentId) ?? null)
          : null,
      recordingSegmentId: msg.recordingSegmentId ?? null,
    };
  });
};

function RecordingView() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const recordingObjectUrlsRef = React.useRef<string[]>([]);
  const lastSavedPositionSecondRef = React.useRef<number>(-1);
  const lastScrolledMessageIndexRef = React.useRef<number>(-1);
  const lastEmotionFrameKeyRef = React.useRef<string | null>(null);
  const pendingSeekRef = React.useRef<{
    recordingIndex: number;
    relativeTime: number;
    messageId: string;
  } | null>(null);
  const messageContainerRef = React.useRef<HTMLDivElement | null>(null);
  const messageRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());
  const [callDuration, setCallDuration] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<TranscriptMessage[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [recordingUrl, setRecordingUrl] = React.useState<string | null>(null);
  const [recordingUrls, setRecordingUrls] = React.useState<string[]>([]);
  const [activeRecordingIndex, setActiveRecordingIndex] = React.useState(0);
  const [recordingLoading, setRecordingLoading] = React.useState(false);
  const [recordingError, setRecordingError] = React.useState<string | null>(
    null
  );
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [formattedFramesData, setFormattedFramesData] = React.useState<
    EmotionEventsData["emotionArray"]
  >([]);
  const [alertFrames, setAlertFrames] = useState<
    { base64: string; timeframe: number; reason: string }[]
  >([]);
  const [suspiciousModal, setSuspiciousModal] = useState<{
    open: boolean;
    image: string;
    reason: string;
    timestamp: number;
    current?: number;
    total?: number;
  }>({ open: false, image: "", reason: "", timestamp: 0 });

  const [transcriptionInfo, setTranscriptionInfo] = React.useState<
    | {
      id: string;
      userId?: string;
      roomName?: string;
      candidateName: string;
      collegeName: string;
      interviewDate: string;
      endedAt?: string;
      interviewType?: string;
      jobId?: string;
      jobTitle?: string;
    }
    | null
  >(null);

  const [detectedEmotions, setDetectedEmotions] = React.useState({
    Angry: 0,
    Disgust: 0,
    Fear: 0,
    Happy: 0,
    Sad: 0,
    Surprise: 0,
    Neutral: 0,
  });

  const [detectedGender, setDetectedGender] = React.useState<string | null>(
    null
  );

  const [activeMessageId, setActiveMessageId] = React.useState<string | null>(
    null
  );

  const clearRecordingObjectUrls = React.useCallback(() => {
    recordingObjectUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    recordingObjectUrlsRef.current = [];
  }, []);

  const syncEmotionState = React.useCallback(
    (currentVideoTime: number) => {
      if (formattedFramesData.length === 0) return;

      let left = 0;
      let right = formattedFramesData.length - 1;
      let insertionIndex = 0;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (formattedFramesData[mid].videoTime < currentVideoTime) {
          left = mid + 1;
          insertionIndex = left;
        } else {
          insertionIndex = mid;
          right = mid - 1;
        }
      }

      const prevFrame =
        insertionIndex > 0 ? formattedFramesData[insertionIndex - 1] : null;
      const nextFrame =
        insertionIndex < formattedFramesData.length
          ? formattedFramesData[insertionIndex]
          : null;

      const closestFrame =
        !prevFrame ? nextFrame : !nextFrame ? prevFrame :
          Math.abs(prevFrame.videoTime - currentVideoTime) <=
            Math.abs(nextFrame.videoTime - currentVideoTime)
            ? prevFrame
            : nextFrame;

      if (!closestFrame?.emotions) return;

      const frameKey = `${closestFrame.timestamp}-${closestFrame.name || ""}-${closestFrame.gender || ""}`;
      if (lastEmotionFrameKeyRef.current === frameKey) return;
      lastEmotionFrameKeyRef.current = frameKey;

      setDetectedEmotions({
        Angry: Number((closestFrame.emotions.angry * 100).toFixed(1)) || 0,
        Disgust: Number((closestFrame.emotions.disgust * 100).toFixed(1)) || 0,
        Fear: Number((closestFrame.emotions.fear * 100).toFixed(1)) || 0,
        Happy: Number((closestFrame.emotions.happy * 100).toFixed(1)) || 0,
        Sad: Number((closestFrame.emotions.sad * 100).toFixed(1)) || 0,
        Surprise: Number((closestFrame.emotions.surprise * 100).toFixed(1)) || 0,
        Neutral: Number((closestFrame.emotions.neutral * 100).toFixed(1)) || 0,
      });
      setDetectedGender(closestFrame.gender || "");
    },
    [formattedFramesData]
  );

  // On unmount of the transcription detail page, record that we left from detail
  React.useEffect(() => {
    return () => {
      try {
        sessionStorage.setItem("adminhome_lastLeftView", "detail");
        // Also save the current video position for resuming later
        if (videoRef.current) {
          const conversationId = searchParams.get("conversation");
          if (conversationId) {
            sessionStorage.setItem(
              `adminhome_videoPosition_${conversationId}`,
              String(videoRef.current.currentTime)
            );
          }
        }
      } catch (e) {
        /* ignore */
      }
    };
  }, [searchParams]);

  // Restore video position when page loads
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const conversationId = searchParams.get("conversation");
    if (!conversationId) return;

    const storageKey = `adminhome_videoPosition_${conversationId}`;

    const restorePosition = () => {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const pos = parseFloat(saved);
        if (!isNaN(pos)) {
          video.currentTime = pos;
        }
      }
    };

    const savePosition = () => {
      const currentSecond = Math.floor(video.currentTime || 0);
      if (currentSecond === lastSavedPositionSecondRef.current) return;
      lastSavedPositionSecondRef.current = currentSecond;
      sessionStorage.setItem(storageKey, String(video.currentTime || 0));
    };

    video.addEventListener("loadedmetadata", restorePosition);
    video.addEventListener("timeupdate", savePosition);
    video.addEventListener("pause", savePosition);
    video.addEventListener("ended", savePosition);

    return () => {
      video.removeEventListener("loadedmetadata", restorePosition);
      video.removeEventListener("timeupdate", savePosition);
      video.removeEventListener("pause", savePosition);
      video.removeEventListener("ended", savePosition);
    };
  }, [searchParams]);

  const fetchConversationMessages = async (
    conversationId: string,
    signal?: AbortSignal
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getConversationMessages(conversationId, signal);
      setCallDuration(response?.callDuration?.formatted);
      const transformedMessages = formatMessagesWithRelativeTime(
        response?.messages || []
      ).filter((msg: TranscriptMessage) => msg.text.trim() !== "");

      setMessages(transformedMessages);
    } catch (err: any) {
      setError(err.message || "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordingUrl = async (
    params: { conversationId?: string; roomName?: string },
    signal?: AbortSignal
  ) => {
    setRecordingLoading(true);
    setRecordingError(null);
    setRecordingUrls([]);
    setActiveRecordingIndex(0);
    setRecordingUrl(null);
    try {
      const response = await getRecordingUrl(params, signal);
      clearRecordingObjectUrls();

      const nextRecordingUrls =
        response.recordings?.map((recording) => recording.url) ||
        response.urls ||
        (response.url ? [response.url] : []);

      recordingObjectUrlsRef.current =
        response.recordings
          ?.filter((recording) => recording.isObjectUrl)
          .map((recording) => recording.url) || [];

      setRecordingUrls(nextRecordingUrls);
      setActiveRecordingIndex(0);
      setRecordingUrl(nextRecordingUrls[0] || response.url || null);

      const conversationId =
        params.conversationId ||
        transcriptionInfo?.id ||
        location.state?.transcription?.id;
      if (conversationId) {
        fetchEmotionEvents(conversationId, signal);
      }
    } catch (err: any) {
      clearRecordingObjectUrls();
      setErrorModalOpen(true);
      setRecordingUrls([]);
      setActiveRecordingIndex(0);
      setRecordingUrl(null);
      setRecordingError(err.message || "Failed to load recording");
    } finally {
      setRecordingLoading(false);
    }
  };

  const fetchPlaybackSyncData = async (
    conversationId: string,
    signal?: AbortSignal
  ) => {
    setLoading(true);
    setRecordingLoading(true);
    setError(null);
    setRecordingError(null);
    setRecordingUrls([]);
    setActiveRecordingIndex(0);
    setRecordingUrl(null);

    try {
      const response = await getPlaybackSync(conversationId, signal);
      clearRecordingObjectUrls();

      const playbackSegments = Array.isArray(response?.recordingSegments)
        ? response.recordingSegments
        : [];
      if (playbackSegments.length === 0) {
        clearRecordingObjectUrls();
        return false;
      }

      const nextRecordingUrls = playbackSegments
        .map((segment: any) => segment.localUrl || segment.playbackUrl)
        .filter((url: unknown): url is string => typeof url === "string" && url.trim().length > 0);
      if (nextRecordingUrls.length === 0) {
        clearRecordingObjectUrls();
        return false;
      }

      recordingObjectUrlsRef.current = playbackSegments
        .filter((segment: any) => segment.isObjectUrl && segment.localUrl)
        .map((segment: any) => segment.localUrl);

      setCallDuration(response?.callDuration?.formatted || null);
      setRecordingUrls(nextRecordingUrls);
      setActiveRecordingIndex(0);
      setRecordingUrl(nextRecordingUrls[0] || null);

      const transformedMessages = formatMessagesWithPlaybackSync(
        response?.messages || [],
        playbackSegments
      ).filter((msg: TranscriptMessage) => msg.text.trim() !== "");

      setMessages(transformedMessages);
      fetchEmotionEvents(conversationId, signal);
      return true;
    } catch (err) {
      clearRecordingObjectUrls();
      return false;
    } finally {
      setLoading(false);
      setRecordingLoading(false);
    }
  };

  const fetchEmotionEvents = async (
    conversationId: string,
    signal?: AbortSignal
  ) => {
    try {
      const response = await getEmotionEvents(conversationId, signal);
      if (response && response.proctoring_results) {
        const formattedFrames = formatEmotionEventsData(
          response.proctoring_results,
          response.session_start_time
        );
        lastEmotionFrameKeyRef.current = null;
        setFormattedFramesData(formattedFrames.emotionArray);
        if (formattedFrames.alertFrames.length > 0) {
          const framesArray: {
            base64: string;
            timeframe: number;
            reason: string;
          }[] = [];
          for (const alertFrame of formattedFrames.alertFrames) {
            const alertFrameResponse = await getAlertFrames(
              alertFrame.alert_frame,
              signal
            );
            if (alertFrameResponse) {
              framesArray.push({
                base64: `data:image/jpeg;base64,${alertFrameResponse}`,
                timeframe: alertFrame.videoTime,
                reason: alertFrame.reason || "",
              });
            }
          }
          setAlertFrames(framesArray);
        }
      }
    } catch (err: any) { }
  };

  React.useEffect(() => {
    const init = async () => {
      // Query param will always have conversation
      const conversationIdParam = searchParams.get("conversation");
      if (!conversationIdParam) return;

      // Pre-populate from navigation state if available for faster UI
      if (location.state?.transcription) {
        setTranscriptionInfo(location.state.transcription);
        return
      }

      try {
        const res: any = await getAllInterviews(
          { search: conversationIdParam } as any,
          undefined
        );
        const item = Array.isArray(res?.data)
          ? res.data.find(
            (x: any) => String(x?.conversation_id) === String(conversationIdParam)
          ) || res.data[0]
          : null;
        if (item) {
          const info = {
            id: String(item.conversation_id),
            userId: item.user_id ? String(item.user_id) : undefined,
            roomName: item.roomName ? String(item.roomName) : undefined,
            candidateName:
              `${item.profile_firstName ?? ""} ${item.profile_lastName ?? ""}`.trim() ||
              "Candidate",
            collegeName: String(item.college_name || "N/A"),
            interviewDate:
              item.conversation_endedAt ||
              item.conversation_startedAt ||
              new Date().toISOString(),
            endedAt: item.conversation_endedAt || undefined,
            interviewType: item.interview_type || item.interviewType || undefined,
            jobId: item.conversation_jobId || item.job_id || undefined,
            jobTitle: item.job_title || undefined,
          } as const;
          setTranscriptionInfo(info as any);
        }
      } catch {
        // Keep whatever info we already had from state
      }
    };
    init();

    return () => {

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute("src");
        videoRef.current.load();
      }
      lastScrolledMessageIndexRef.current = -1;
      lastEmotionFrameKeyRef.current = null;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      clearRecordingObjectUrls();
    };
  }, [clearRecordingObjectUrls]);

  React.useEffect(() => {
    if (!transcriptionInfo) return;
    // Abort previous controller if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const loadTranscriptionData = async () => {
      let usedPlaybackSync = false;

      if (transcriptionInfo.id) {
        usedPlaybackSync = await fetchPlaybackSyncData(
          transcriptionInfo.id,
          signal
        );
      }

      if (!usedPlaybackSync) {
        if (transcriptionInfo.id || transcriptionInfo.roomName) {
          fetchRecordingUrl(
            {
              conversationId: transcriptionInfo.id,
              roomName: transcriptionInfo.roomName,
            },
            signal
          );
        }
        if (transcriptionInfo.id) {
          fetchConversationMessages(transcriptionInfo.id, signal);
        }
      }
    };

    loadTranscriptionData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [transcriptionInfo]);

  React.useEffect(() => {
    const nextRecordingUrl = recordingUrls[activeRecordingIndex] || null;
    lastScrolledMessageIndexRef.current = -1;
    setRecordingUrl(nextRecordingUrl);
  }, [activeRecordingIndex, recordingUrls]);

  const visibleMessages = React.useMemo(() => {
    if (recordingUrls.length <= 1) {
      return messages;
    }

    const hasSegmentScopedMessages = messages.some(
      (message) => typeof message.recordingIndex === "number"
    );

    if (!hasSegmentScopedMessages) {
      return messages;
    }

    return messages.filter(
      (message) => message.recordingIndex === activeRecordingIndex
    );
  }, [activeRecordingIndex, messages, recordingUrls.length]);

  React.useEffect(() => {
    const pendingSeek = pendingSeekRef.current;
    const video = videoRef.current;

    if (!pendingSeek || !video || pendingSeek.recordingIndex !== activeRecordingIndex) {
      return;
    }

    const applyPendingSeek = () => {
      video.currentTime = pendingSeek.relativeTime;
      video
        .play()
        .catch((err) => console.error("Error playing video:", err));
      pendingSeekRef.current = null;
    };

    if (video.readyState >= 1) {
      applyPendingSeek();
      return;
    }

    video.addEventListener("loadedmetadata", applyPendingSeek, { once: true });
    return () => {
      video.removeEventListener("loadedmetadata", applyPendingSeek);
    };
  }, [activeRecordingIndex, recordingUrl]);

  React.useEffect(() => {
    messageRefs.current.clear();
    lastScrolledMessageIndexRef.current = -1;
  }, [visibleMessages]);

  React.useEffect(() => {
    if (
      activeMessageId &&
      !visibleMessages.some((message) => message.id === activeMessageId)
    ) {
      setActiveMessageId(null);
    }
  }, [activeMessageId, visibleMessages]);

  React.useEffect(() => {
    if (formattedFramesData.length === 0) {
      lastEmotionFrameKeyRef.current = null;
      setDetectedGender(null);
      setDetectedEmotions({
        Angry: 0,
        Disgust: 0,
        Fear: 0,
        Happy: 0,
        Sad: 0,
        Surprise: 0,
        Neutral: 0,
      });
      return;
    }

    const currentVideoTime = videoRef.current?.currentTime || 0;
    syncEmotionState(currentVideoTime);
  }, [formattedFramesData, syncEmotionState]);

  const scrollToMessageAtTime = React.useCallback((currentVideoTime: number) => {
    if (messages.length === 0 || !messageContainerRef.current) return;

    const relevantMessages = messages
      .map((message, index) => ({ message, index }))
      .filter(
        ({ message }) =>
          message.recordingIndex === null ||
          message.recordingIndex === activeRecordingIndex
      );

    if (relevantMessages.length === 0) return;

    let left = 0;
    let right = relevantMessages.length - 1;
    let targetIndex = -1;

    // First pass: binary search to narrow down the range
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (relevantMessages[mid].message.relativeTime <= currentVideoTime) {
        targetIndex = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    if (targetIndex < 0) return;

    const targetEntry = relevantMessages[targetIndex];

    // Skip if we already scrolled to this message
    if (targetEntry.index === lastScrolledMessageIndexRef.current) return;
    lastScrolledMessageIndexRef.current = targetEntry.index;

    const targetMessage = targetEntry.message;
    setActiveMessageId(targetMessage.id);

    const messageElement = messageRefs.current.get(targetMessage.id);

    if (messageElement && messageContainerRef.current) {
      messageElement.scrollIntoView({
        behavior: "auto",
        block: "center",
      });
    }
  }, [activeRecordingIndex, messages]);

  const handleTimeUpdate = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (visibleMessages.length > 0) {
      scrollToMessageAtTime(video.currentTime);
    }
    syncEmotionState(video.currentTime);
  }, [scrollToMessageAtTime, syncEmotionState, visibleMessages.length]);

  React.useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const syncCurrentEmotionFrame = () => {
      syncEmotionState(video.currentTime);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", syncCurrentEmotionFrame);
    video.addEventListener("seeked", syncCurrentEmotionFrame);
    video.addEventListener("play", syncCurrentEmotionFrame);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", syncCurrentEmotionFrame);
      video.removeEventListener("seeked", syncCurrentEmotionFrame);
      video.removeEventListener("play", syncCurrentEmotionFrame);
    };
  }, [handleTimeUpdate, syncEmotionState]);

  const seekToMessageTime = (message: TranscriptMessage) => {
    const targetRecordingIndex = message.recordingIndex ?? activeRecordingIndex;
    const targetRelativeTime = Math.max(0, message.relativeTime || 0);

    if (activeMessageId !== message.id) {
      setActiveMessageId(message.id);
    }

    lastScrolledMessageIndexRef.current = -1;

    if (targetRecordingIndex !== activeRecordingIndex) {
      pendingSeekRef.current = {
        recordingIndex: targetRecordingIndex,
        relativeTime: targetRelativeTime,
        messageId: message.id,
      };
      setActiveRecordingIndex(targetRecordingIndex);
      return;
    }

    if (videoRef.current) {
      videoRef.current.currentTime = targetRelativeTime;
      videoRef.current
        .play()
        .catch((err) => console.error("Error playing video:", err));
    }
  };

  const recordingDialogMessage = React.useMemo(() => {
    const endedAt = transcriptionInfo?.endedAt;
    let showProcessing = false;
    if (endedAt) {
      const endedAtDate = dayjs(endedAt);
      const now = dayjs();
      const diffMinutes = now.diff(endedAtDate, "minute");
      showProcessing = diffMinutes < 3;
    }
    if (showProcessing) {
      return (
        <Typography variant="body1">
          Recording is currently being processed. Please try again in a few
          minutes.
        </Typography>
      );
    } else {
      return (
        <Typography variant="body1">
          The Recording for the current conversation is not available.
        </Typography>
      );
    }
  }, [transcriptionInfo?.endedAt]);

  return (
    <Box sx={{ height: "100%" }}>
      <Box
        sx={{
          ...transcriptionStyles.box3,
          // minWidth: undefined,
          // flex: undefined,
          display: "flex",
          gap: "2vh",
          height: "100%",
        }}
      >
        {/* Left Panel */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            width: "55vw",
          }}
        >
          {/* Interview Summary Row */}
          {/* <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={"1vh"}
          >
            <Box display="flex" gap={"2vh"} alignItems="center">
              <Text variant="body" styles={{ fontSize: "1.9vh" }}>
                Conversation ID: {location.state?.transcription?.id}
              </Text>

              <Box sx={adminHomeStyles.box2}>
                <Box
                  sx={{
                    ...adminHomeStyles.statusBox,
                    border: `0.35vh solid ${
                      statusColors[data.call_status]?.borderColor
                    }`,
                    backgroundColor: statusColors[data.call_status],
                  }}
                ></Box>

                <Text
                  text={data.call_status.replaceAll("_", " ").toLowerCase()}
                  color="light"
                  variant="body"
                  styles={adminHomeStyles.surveystatustext}
                />
              </Box>
            </Box>
          </Box> */}

          {/* Name, College, Date/Duration */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={"2vh"}
          >
            <Box>
              <Text variant="body" styles={transcriptionStyles.name}>
                Name: {transcriptionInfo?.candidateName?.toLowerCase()}
              </Text>
              <Text variant="body" styles={transcriptionStyles.name}>
                {transcriptionInfo?.jobId
                  ? `Job Title: ${transcriptionInfo?.jobTitle || "N/A"}`
                  : `College Name: ${transcriptionInfo?.collegeName?.toLowerCase()}`}
              </Text>
            </Box>
            <Box>
              <Text variant="body" styles={transcriptionStyles.name}>
                Interview Date:{" "}
                {dayjs(transcriptionInfo?.interviewDate).format(
                  "DD MMM, YYYY"
                )}
              </Text>
              <Box display="flex" gap={"1vh"} alignItems="center" mt={"1vh"}>
                <Schedule sx={transcriptionStyles.Schedule} />
                <Text variant="body" styles={{ fontSize: "1.9vh" }}>
                  Duration: {callDuration}
                </Text>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              ...transcriptionStyles.box2,
              position: "relative", // Make sure this is a positioned container
              flex: 1,
            }}
          >
            {recordingUrls.length > 1 && (
              <Box
                sx={{
                  position: "absolute",
                  top: "1vh",
                  left: "1vh",
                  display: "flex",
                  gap: "1vh",
                  zIndex: 12,
                  flexWrap: "wrap",
                }}
              >
                {recordingUrls.map((_, index) => (
                  <Button
                    key={index}
                    variant={activeRecordingIndex === index ? "contained" : "outlined"}
                    size="small"
                    onClick={() => setActiveRecordingIndex(index)}
                    sx={{
                      minWidth: "unset",
                      padding: "0.6vh 1.2vh",
                      backgroundColor:
                        activeRecordingIndex === index ? "#16395B" : "rgba(255,255,255,0.92)",
                      color: activeRecordingIndex === index ? "#fff" : "#16395B",
                      borderColor: "#16395B",
                      "&:hover": {
                        backgroundColor:
                          activeRecordingIndex === index ? "#102a42" : "rgba(255,255,255,1)",
                        borderColor: "#16395B",
                      },
                    }}
                  >
                    Recording {index + 1}
                  </Button>
                ))}
              </Box>
            )}
            {transcriptionInfo?.interviewType === "Audio Based" ? (
              <Box sx={{ display: "flex", flexDirection: "row", width: "100%", height: "100%", gap: "1vh" }}>
                <Box sx={{ flex: 1, position: "relative", width: "50%", height: "100%" }}>
                  <video
                    ref={videoRef}
                    src={recordingUrl || undefined}
                    controls
                    controlsList="nodownload"
                    disablePictureInPicture
                    muted
                    crossOrigin="anonymous"
                    preload="metadata"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "1vh",
                      objectFit: "cover",
                      objectPosition: "left center",
                      fontSize: "2vh",
                      backgroundColor: "#000",
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1, position: "relative", width: "50%", height: "100%", overflow: "hidden", borderRadius: "1vh" }}>
                  <PulseVisualizer mediaElement={videoRef.current as any} mode="auto" />
                </Box>
              </Box>
            ) : (
              <video
                ref={videoRef}
                src={recordingUrl || undefined}
                controls
                controlsList="nodownload"
                disablePictureInPicture
                muted
                crossOrigin="anonymous"
                preload="metadata"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "1vh",
                  objectFit: "cover",
                  fontSize: "2vh",
                }}
              />
            )}
            {recordingLoading && (
              <Box
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "rgba(0,0,0,0.7)",
                  padding: "1.9vh 2.2vh",
                  borderRadius: "1vh",
                  color: "white",
                  fontSize: "2vh",
                  zIndex: 10,
                }}
              >
                Loading video...
              </Box>
            )}
            {recordingError && (
              <Box
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "rgba(0,0,0,0.7)",
                  padding: "1.9vh 2.2vh",
                  borderRadius: "1vh",
                  color: "white",
                  fontSize: "2vh",
                  zIndex: 10,
                }}
              >
                {recordingError}
              </Box>
            )}
            <canvas
              ref={canvasRef}
              style={{
                display: "block",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 11, // above video, below draggable box
                pointerEvents: "none", // Allow clicks to pass through to video controls
              }}
            />
          </Box>
          <Box
            sx={{
              display: alertFrames.length > 0 ? "flex" : "none",
              overflowX: "auto",
              marginTop: "1vh",
              alignItems: "center",
            }}
          >
            <Typography
              variant="body1"
              sx={{ fontSize: "1.9vh", marginRight: "3vh" }}
            >
              Suspicious Frames:
            </Typography>
            {alertFrames.map((frame, index) => (
              <img
                key={index}
                src={frame.base64}
                alt={`Thumbnail ${index + 1}`}
                className="alert-frame-img"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = frame.timeframe;
                    videoRef.current.pause();
                  }
                  setSuspiciousModal({
                    open: true,
                    image: frame.base64,
                    reason: frame.reason,
                    timestamp: frame.timeframe,
                    current: index + 1,
                    total: alertFrames.length,
                  });
                }}
              />
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            marginTop: "-1vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              backgroundColor: "#f5f5f5",
              padding: "2vh",
              borderRadius: "1vh",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              scrollbarWidth: "none",
              marginBottom: "2vh",
              flex: 1,
              width: "30vw",
            }}
          >
            <Button
              variant="contained"
              fullWidth
              sx={callStyles.transcriptButton}
            >
              Conversation Transcript
            </Button>
            <Divider sx={callStyles.divider} />
            <Box
              sx={{
                marginTop: "2vh",
                overflowY: "auto",
                scrollbarWidth: "none",
              }}
              ref={messageContainerRef}
            >
              {loading ? (
                <Box sx={{ textAlign: "center", padding: "2vh" }}>
                  <Text
                    variant="body"
                    color="text.secondary"
                    styles={transcriptionStyles.name}
                  >
                    Loading conversation...
                  </Text>
                </Box>
              ) : error ? (
                <Box sx={{ textAlign: "center", padding: "2vh" }}>
                  <Text
                    variant="body"
                    color="error"
                    styles={{ ...transcriptionStyles.name, color: "red" }}
                  >
                    {error}
                  </Text>
                </Box>
              ) : visibleMessages.length === 0 ? (
                <Box sx={{ textAlign: "center", padding: "2vh" }}>
                  <Text
                    variant="body"
                    color="text.secondary"
                    styles={transcriptionStyles.name}
                  >
                    No messages found for this recording
                  </Text>
                </Box>
              ) : (
                visibleMessages.map((msg, i) => (
                  <Box
                    key={i}
                    ref={(el: HTMLDivElement | null) => {
                      if (el) messageRefs.current.set(msg.id, el);
                    }}
                    onClick={() => {
                      if (recordingError) return;
                      seekToMessageTime(msg);
                    }}
                    sx={{
                      display: "flex",
                      justifyContent:
                        msg.from === "candidate" ? "flex-end" : "flex-start",
                      marginBottom: "3vh",
                      cursor: recordingError ? "default" : "pointer",
                      pointerEvents: recordingError ? "none" : undefined,
                      padding: "1vh",
                      backgroundColor:
                        activeMessageId === msg.id
                          ? "rgba(255, 255, 0, 0.2)"
                          : "transparent",
                      transition: "background-color 0.3s",
                      "&:hover": {
                        backgroundColor:
                          activeMessageId === msg.id
                            ? "rgba(255, 255, 0, 0.3)"
                            : "rgba(0, 0, 0, 0.05)",
                        borderRadius: "1vh",
                      },
                    }}
                  >
                    {msg.from === "bot" ? (
                      <Box
                        sx={{
                          display: "flex",
                          gap: "1vh",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src={logoConfig.bot}
                          alt="AI Bot"
                          style={{
                            width: "4vh",
                            height: "4vh",
                            borderRadius: "50%",
                          }}
                        />
                        <Box>
                          <Text variant="body" styles={callStyles.youText}>
                            AI Bot
                            <span
                              style={{
                                fontSize: "1.25vh",
                                color: "#666",
                                marginLeft: "1vh",
                              }}
                            >
                              {formatTimeLabel(msg.relativeTime)}
                            </span>
                          </Text>
                          <Box
                            sx={{
                              backgroundColor: "#4a5767",
                              padding: "1vh",
                              borderRadius: "1vh",
                              marginTop: "0.5vh",
                              maxWidth: "20vw",
                            }}
                          >
                            <Text variant="body" styles={callStyles.botText}>
                              {msg.text}
                            </Text>
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: "right" }}>
                        <Text variant="body" styles={callStyles.youText}>
                          Candidate
                          <span
                            style={{
                              fontSize: "1.25vh",
                              color: "#666",
                              marginLeft: "1vh",
                            }}
                          >
                            {formatTimeLabel(msg.relativeTime)}
                          </span>
                        </Text>
                        <Box
                          sx={{
                            backgroundColor: "#feeced",
                            padding: "1vh",
                            borderRadius: "1vh",
                            marginTop: "0.5vh",
                            maxWidth: "20vw",
                          }}
                        >
                          <Text variant="body" styles={callStyles.youText}>
                            {msg.text}
                          </Text>
                        </Box>
                      </Box>
                    )}
                  </Box>
                ))
              )}
            </Box>
          </Box>
          <EmotionCard
            name={transcriptionInfo?.candidateName || "Candidate"}
            gender={detectedGender || ""}
            width="30vw"
            emotions={detectedEmotions}
            formattedFramesData={formattedFramesData}
          />
        </Box>
      </Box>

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
      <CustomDialog
        open={errorModalOpen}
        handleClose={() => {
          setErrorModalOpen(false);
          // navigate(-1);
        }}
        title="Recording Not Available"
      >
        {recordingDialogMessage}
      </CustomDialog>
      <SuspiciousFrameModal
        open={suspiciousModal.open}
        image={suspiciousModal.image}
        reason={suspiciousModal.reason}
        timestamp={suspiciousModal.timestamp}
        current={suspiciousModal.current || 0}
        total={suspiciousModal.total || 0}
        onClose={() => {
          setSuspiciousModal({ ...suspiciousModal, open: false });
          if (videoRef.current) {
            videoRef.current
              .play()
              .catch(() => { });
          }
        }}
      />
    </Box>
  );
}

export default RecordingView;
