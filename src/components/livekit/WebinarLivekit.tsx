import {
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  useMediaDeviceSelect,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Box, Stack, Typography } from "@mui/material";
import { Room, Track, RoomEvent, LocalTrackPublication } from "livekit-client";
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import WebinarControls from "./webinarControls";
import WebinarConference from "./webinarConference";
import { useCandidateStore } from "../../store/candidateStore";
import { routes } from "../../constants/routes";
import { useNavigate } from "react-router-dom";
import { endInterview } from "../../api/chat-api";
import AlertModal from "./modals/AlertModal";
import { apiClient } from "../../api/interceptor";
import { getSettingsByConversationId } from "../../api/api";
import CodingEditor from "../CodingEditor";
import useCodingRound from "../../hooks/useCodingRound";

// FPS for video frame sending
const TARGET_FPS = 1;

const MyVideoConference = () => {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
      { source: Track.Source.Microphone, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const filteredTracks = tracks.filter(
    (track) => track.source === Track.Source.Camera
  );
  const myVideoTrack = filteredTracks.length > 0 ? [filteredTracks[0]] : [];

  return (
    <GridLayout tracks={myVideoTrack}>
      <>
        <ParticipantTile
          disableSpeakingIndicator
          style={{ borderRadius: "20px", position: "relative", border: "none" }}
        />
        <WebinarControls
          openEndCallDialog={false}
          setOpenEndCallDialog={() => {}}
          controls={{
            chat: false,
            microphone: true,
            camera: true,
            screenShare: false,
            leave: false,
          }}
          style={{
            position: "absolute",
            bottom: 10,
            right: 0,
            left: 0,
            margin: "0 auto",
            width: "fit-content",
            border: "0",
          }}
          inRoom
        />
      </>
    </GridLayout>
  );
};

const WebinarLivekit = ({
  livekitToken,
  livekitUrl,
  roomId,
  externalScreenStream,
}: {
  livekitToken: string;
  livekitUrl: string;
  roomId: string;
  externalScreenStream?: MediaStream;
}) => {
  const [startWebinar, setStartWebinar] = useState(true);
  const [roomConnected, setRoomConnected] = useState(false);
  const [audioInput, setAudioInput] = useState<MediaDeviceInfo[]>();
  const [audioOutput, setAudioOutput] = useState<MediaDeviceInfo[]>();
  const [videoInput, setVideoInput] = useState<MediaDeviceInfo[]>();
  const [audioInputValue, setAudioInputValue] = useState<string>("default");
  const [audioOutputValue, setAudioOutputValue] = useState<string>("default");
  const [videoInputValue, setVideoInputValue] = useState<string>("default");
  const [alert, setAlert] = useState<{ open: boolean; reason?: string }>({ open: false, reason: undefined });
  const [serverWarningsRemaining, setServerWarningsRemaining] = useState(3);
  const [pendingTerminate, setPendingTerminate] = useState(false);
  const [showCodingEditor, setShowCodingEditor] = useState(false);
  const [codingTasks, setCodingTasks] = useState<Array<{id:string;text:string;language:string}>>([]);
  const [codingTimer, setCodingTimer] = useState<number | null>(null); // seconds remaining
  const [submittedTaskIds, setSubmittedTaskIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  // Socket.IO reference
  const socketRef = useRef<WebSocket | null>(null);
  const socketRetryRef = useRef<number>(0);
  const socketPingRef = useRef<NodeJS.Timeout | null>(null);
  // Canvas and context for frame extraction
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Animation frame reference for controlling the frame sending loop
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to endWebinarHandler to avoid stale closures in WS onmessage
  const endWebinarHandlerRef = useRef<(disqualified?: boolean) => void>(() => {});
  // Track if we're currently sending frames
  const isSendingFramesRef = useRef<boolean>(false);
  // Track socket connection status
  const [isConnected, setIsConnected] = useState<boolean>(false);
  // Delay proctoring until the bot actually starts speaking (first TTS chunk)
  const [botHasSpoken, setBotHasSpoken] = useState<boolean>(false);
  // Once proctoring_stop signal is received, prevent any reconnect or frame restart
  const proctoringStoppedRef = useRef<boolean>(false);
  // CV-based proctoring toggle — read from interview settings
  const [cvProctoringEnabled, setCvProctoringEnabled] = useState<boolean>(true);

  // Reconnection timeout handling: if reconnecting lasts longer than this, end interview
  const RECONNECT_TIMEOUT_MS = 30 * 1000; // 30 seconds
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const conversationId = useCandidateStore((state) => state.conversationId);
  const codingRound = useCodingRound();

  // Read proctoringEnabled from interview settings (default true for backward compat)
  useEffect(() => {
    if (!conversationId) return;
    getSettingsByConversationId(conversationId)
      .then((setting: any) => {
        const sv = setting?.settingValue ?? setting ?? {};
        const enabled = sv.proctoringEnabled !== false;
        setCvProctoringEnabled(enabled);
        if (!enabled) {
          console.log("CV-based proctoring disabled for this interview");
        }
      })
      .catch(() => {
        // Default to enabled if settings fetch fails
        setCvProctoringEnabled(true);
      });
  }, [conversationId]);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  const room = useMemo(() => new Room(), []);
  const roomRef = useRef(room);
  const alertOpenRef = useRef(alert.open);
  const gracefulEndRef = useRef(false);

  const { setActiveMediaDevice: activeAudioHandler } = useMediaDeviceSelect({
    room: room,
    kind: "audioinput",
  });
  const { setActiveMediaDevice: activeVideoHandler } = useMediaDeviceSelect({
    room: room,
    kind: "videoinput",
  });

  const { setActiveMediaDevice: activeOutputHandler } = useMediaDeviceSelect({
    room: room,
    kind: "audiooutput",
  });

  // Setup Socket.IO connection
  const setupSocketIO = useCallback(() => {
    if (proctoringStoppedRef.current) return;
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    try {
      // Create WebSocket connection
      const wsUrl = `${process.env.REACT_APP_FER_SOCKET?.replace(
        /^http/,
        "ws"
      )}/${conversationId?.toString()}`;
      const ws = new window.WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connection established");
        setIsConnected(true);
        socketRetryRef.current = 0; // reset backoff on success
        // Start keepalive ping every 20s to prevent idle timeouts (server has 30s timeout)
        if (socketPingRef.current) clearInterval(socketPingRef.current);
        socketPingRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
          }
        }, 20000);
      };

      ws.onclose = (event) => {
        console.log(
          `WebSocket disconnected: code=${event.code}, reason=${event.reason}`
        );
        setIsConnected(false);
        if (socketPingRef.current) { clearInterval(socketPingRef.current); socketPingRef.current = null; }
        // attempt reconnect with simple backoff while room is still connected/reconnecting
        // Use roomRef to avoid stale closure over `room`
        const currentRoom = roomRef.current;
        if (!proctoringStoppedRef.current && currentRoom && (currentRoom.state === "connected" || currentRoom.state === "reconnecting")) {
          const delayMs = Math.min(1000 * Math.pow(2, socketRetryRef.current), 10000);
          socketRetryRef.current += 1;
          setTimeout(() => {
            // only retry if socket hasn't been recreated elsewhere
            if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
              setupSocketIO();
            }
          }, delayMs);
        }
      };

      ws.onerror = (event) => {
        console.error("WebSocket connection error:", event);
        setIsConnected(false);
        // trigger onclose path for retry in some browsers that don't fire close
        try { ws.close(); } catch {}
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const alertData = data.alert_proctoring;
          if (!alertData?.alert) return;

          const penalty = alertData.penalty;

          // Server says terminate — show disqualification alert, then end
          if (penalty?.action === "terminate") {
            setAlert({ open: true, reason: alertData.reason || "You have been disqualified due to repeated violations." });
            setServerWarningsRemaining(0);
            setPendingTerminate(true);
            return;
          }

          // Server says warning or final_warning — show alert modal
          // Use alertOpenRef to avoid stale closure over `alert.open`
          if (
            (penalty?.action === "warning" || penalty?.action === "final_warning") &&
            !alertOpenRef.current
          ) {
            setAlert({ open: true, reason: alertData.reason });
            setServerWarningsRemaining(penalty.strikes_remaining ?? penalty.warnings_remaining ?? 0);
            return;
          }

          // Backward-compatible: plain alert without penalty (e.g. older server)
          if (!penalty && !alertOpenRef.current) {
            setAlert({ open: true, reason: alertData.reason });
          }
        } catch (e) {
          // Not JSON or not a pong
        }
      };
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
    }
  }, [conversationId]);

  // Start sending video frames
  const startSendingFrames = useCallback(() => {
    if (proctoringStoppedRef.current) return;
    if (!roomConnected || isSendingFramesRef.current || !socketRef.current) {
      return;
    }

    // Get the video track from LiveKit
    const videoTrack = room.localParticipant.getTrackPublication(
      Track.Source.Camera
    );

    if (!videoTrack?.track) {
      console.error("No video track available");
      return;
    }

    // Create canvas if it doesn't exist
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = 640; // Set desired resolution
      canvasRef.current.height = 480;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Could not get canvas context");
      return;
    }

    // Get video element from track
    const videoElement = document.createElement("video");
    const mediaStream = videoTrack.track.mediaStream;
    if (mediaStream) {
      videoElement.srcObject = mediaStream;
    }
    videoElement.autoplay = true;
    videoElement.muted = true;

    // Calculate interval based on target FPS
    const frameInterval = 1000 / TARGET_FPS;

    isSendingFramesRef.current = true;

    // Function to capture and send a frame
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

        // Send frame data through WebSocket
        socketRef.current.send(
          JSON.stringify({
            timestamp: Date.now(),
            frame: jpegDataUrl,
          })
        );

        // Schedule next frame
        frameIntervalRef.current = setTimeout(
          captureAndSendFrame,
          frameInterval
        );
      } catch (error) {
        console.error("Error capturing or sending frame:", error);
        isSendingFramesRef.current = false;
      }
    };

    videoElement.onloadedmetadata = () => {
      videoElement.play();
      captureAndSendFrame();
    };
  }, [room, roomConnected, conversationId]);

  const stopSendingFrames = useCallback(() => {
    isSendingFramesRef.current = false;
    if (frameIntervalRef.current) {
      clearTimeout(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (conversationId) {
        endInterview(
          conversationId,
          "Interview finished successfully"
        ).catch(console.error);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [conversationId]);


  // Connect proctoring WS eagerly on mount (don't wait for room) so it's
  // ready by the time LiveKit room connects and frames can start immediately.
  // Skip entirely when CV-based proctoring is disabled.
  useEffect(() => {
    if (conversationId && cvProctoringEnabled) {
      setupSocketIO();
    }

    return () => {
      stopSendingFrames();
      if (socketPingRef.current) { clearInterval(socketPingRef.current); socketPingRef.current = null; }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [conversationId, setupSocketIO, stopSendingFrames]);

  // Listen to LiveKit room reconnection lifecycle and react accordingly
  useEffect(() => {
    if (!room) return;

    const handleReconnecting = () => {
      // pause outgoing frames and keep room instance
      setRoomConnected(false);
      stopSendingFrames();

      // start a timeout; if we don't reconnected within RECONNECT_TIMEOUT_MS, end interview
      if (reconnectTimeoutRef.current) {
        try { clearTimeout(reconnectTimeoutRef.current as any); } catch {}
        reconnectTimeoutRef.current = null;
      }
      reconnectTimeoutRef.current = setTimeout(async () => {
        console.warn("Reconnection timeout exceeded, ending interview and scheduling re-interview");
        // Notify server that interview ended due to connection failure and should be rescheduled
        try {
          if (conversationId) {
            await endInterview(
              conversationId,
              "Interview ended due to prolonged connection loss. Scheduled for re-interview."
            );
          }
        } catch (e) {
          console.error("Failed to call endInterview on reconnect timeout:", e);
        }

        // Clean up and navigate away
        try {
          stopSendingFrames();
          if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
          }
          room?.disconnect();
        } catch (e) {
          console.error("Error during cleanup after reconnect timeout:", e);
        }

        navigate(routes.candidateHome, {
          replace: true,
          state: {
            callEnded: true,
            endTime: new Date().toLocaleTimeString(),
            reason: 'connection_timeout',
          },
        });
      }, RECONNECT_TIMEOUT_MS);
    };

    const handleReconnected = async () => {
      // room is back; mark connected and ensure socket is up
      setRoomConnected(true);
      setupSocketIO();

      // clear any pending reconnect timeout
      if (reconnectTimeoutRef.current) {
        try { clearTimeout(reconnectTimeoutRef.current as any); } catch {}
        reconnectTimeoutRef.current = null;
      }
    };

    const handleDisconnected = () => {
      // full disconnect (e.g., leave). Stop socket and frames.
      setRoomConnected(false);
      stopSendingFrames();
      if (socketRef.current) {
        try { socketRef.current.close(); } catch {}
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        try { clearTimeout(reconnectTimeoutRef.current as any); } catch {}
        reconnectTimeoutRef.current = null;
      }

      (async () => {
        // Only call endInterview for unexpected disconnects — graceful ends
        // (coding submission → bot goodbye → shutdown) are already handled server-side.
        if (!gracefulEndRef.current) {
          try {
            if (conversationId) {
              await endInterview(
                conversationId,
                "Interview ended due to connection lost. Scheduled for re-interview."
              );
            }
          } catch (e) {
            console.error("Failed to call endInterview on disconnect:", e);
          }
        }

        // Brief pause on graceful end so the transition doesn't feel abrupt
        // after the bot's goodbye message finishes playing.
        if (gracefulEndRef.current) {
          await new Promise((r) => setTimeout(r, 3000));
        }

        navigate(routes.candidateHome, {
          replace: true,
          state: {
            callEnded: true,
            endTime: new Date().toLocaleTimeString(),
            reason: gracefulEndRef.current ? 'completed' : 'disconnected',
          },
        });
      })();
    };

    room.on(RoomEvent.Reconnecting, handleReconnecting);
    room.on(RoomEvent.Reconnected, handleReconnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);

    return () => {
      room.off(RoomEvent.Reconnecting, handleReconnecting);
      room.off(RoomEvent.Reconnected, handleReconnected);
      room.off(RoomEvent.Disconnected, handleDisconnected);
    };
  }, [room, setupSocketIO, stopSendingFrames]);

  // Detect first bot TTS — once any remote participant speaks, enable proctoring.
  useEffect(() => {
    if (!room || botHasSpoken) return;

    const handleSpeakers = (speakers: any[]) => {
      const botSpeaking = speakers.some(
        (p) => p.identity !== room.localParticipant.identity,
      );
      if (botSpeaking) {
        console.log("Bot started speaking — enabling proctoring");
        setBotHasSpoken(true);
      }
    };

    room.on(RoomEvent.ActiveSpeakersChanged, handleSpeakers);
    return () => { room.off(RoomEvent.ActiveSpeakersChanged, handleSpeakers); };
  }, [room, botHasSpoken]);

  // Start sending frames when Socket.IO is connected, bot has spoken, and no alert is open
  // Skip entirely when CV-based proctoring is disabled.
  useEffect(() => {
    if (cvProctoringEnabled && isConnected && roomConnected && botHasSpoken && !alert.open) {
      startSendingFrames();
    } else {
      stopSendingFrames();
    }

    return () => {
      stopSendingFrames();
    };
  }, [isConnected, roomConnected, botHasSpoken, alert.open, startSendingFrames, stopSendingFrames]);

  React.useEffect(() => {
    const getMediaDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInput = devices.filter(
          (device) => device.kind === "audioinput"
        );
        const audioOutput = devices.filter(
          (device) => device.kind === "audiooutput"
        );
        const videoInput = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setAudioInput(audioInput);
        setAudioInputValue(audioInput[0].label);
        setAudioOutput(audioOutput);
        setAudioOutputValue(audioOutput[0].label);
        setVideoInput(videoInput);
        setVideoInputValue(videoInput[0].label);
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    getMediaDevices();
  }, []);

  const handleAudioInputChange = (deviceLabel: string) => {
    console.log(deviceLabel);
    activeAudioHandler(
      audioInput?.find((item) => item.label === deviceLabel)?.deviceId!
    );
    setAudioInputValue(deviceLabel);
  };

  const handleAudioOutputChange = (deviceLabel: string) => {
    activeOutputHandler(
      audioOutput?.find((item) => item.label === deviceLabel)?.deviceId!
    );
    setAudioOutputValue(deviceLabel);
  };

  const handleVideoInputChange = (deviceLabel: string) => {
    activeVideoHandler(
      videoInput?.find((item) => item.label === deviceLabel)?.deviceId!
    );
    setVideoInputValue(deviceLabel);
  };

  const endWebinarHandler = async (disqualified: boolean = false) => {
    try {
      // Mark as graceful so handleDisconnected doesn't double-fire endInterview
      gracefulEndRef.current = true;
      stopSendingFrames();
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      room?.disconnect();
      if (conversationId) {
        await endInterview(
          conversationId,
          disqualified ? "Disqualified by proctoring system" : "Interview finished successfully"
        );
      }
      navigate(routes.candidateHome, {
        replace: true,
        state: {
          callEnded: true,
          endTime: new Date().toLocaleTimeString(),
        },
      });
    }
    catch(error){
      console.error("Error ending webinar:", error);
    }
  };

  // Keep refs in sync so WS callbacks avoid stale closures
  useEffect(() => {
    endWebinarHandlerRef.current = endWebinarHandler;
    roomRef.current = room;
    alertOpenRef.current = alert.open;
  });

  // Handler for closing the alert — if terminate was pending, end the interview
  const handleAlertClose = useCallback(() => {
    setAlert({ open: false, reason: undefined });
    if (pendingTerminate) {
      setPendingTerminate(false);
      endWebinarHandlerRef.current(true);
    }
  }, [pendingTerminate]);

  // Handler for code submission — tracks per-task, only closes after ALL tasks submitted
  const handleCodeSubmit = useCallback(async (code: string, taskId: string) => {
    if (!conversationId) {
      console.error('Conversation ID is required for code submission');
      return;
    }

    // Submit code to DB via coding-tasks endpoint
    await apiClient.post(`/communication/coding-tasks/${taskId}/submit`, { code });

    // Track this task as submitted
    const newSubmitted = new Set(submittedTaskIds);
    newSubmitted.add(taskId);
    setSubmittedTaskIds(newSubmitted);

    // Check if ALL tasks are now submitted
    const allSubmitted = codingTasks.every(t => newSubmitted.has(t.id));
    if (allSubmitted) {
      // All tasks submitted — close editor, notify orchestrator to wrap up gracefully
      setShowCodingEditor(false);
      codingRound.deactivateCodingRound();

      // Resume mic upstream so bot closing message is heard
      const micPub = room?.localParticipant.getTrackPublication(Track.Source.Microphone);
      if (micPub) await (micPub as LocalTrackPublication).resumeUpstream();

      // Tell orchestrator to end gracefully — it will say goodbye via TTS,
      // shut down the room. The handleDisconnected listener navigates away.
      gracefulEndRef.current = true;
      if (room) {
        const encoder = new TextEncoder();
        await room.localParticipant.publishData(
          encoder.encode("I have submitted my code for all tasks."),
          { reliable: true, topic: 'code_submission' },
        );
      }
    }
  }, [conversationId, codingRound, codingTasks, room, submittedTaskIds]);

  // Handler for canceling code submission
  const handleCodeCancel = useCallback(async () => {
    setShowCodingEditor(false);
    codingRound.deactivateCodingRound();
    setCodingTasks([]);
    setCodingTimer(null);
    setSubmittedTaskIds(new Set());
    codingEditorActivating.current = false;
    // Resume mic upstream
    const micPub = room?.localParticipant.getTrackPublication(Track.Source.Microphone);
    if (micPub) await (micPub as LocalTrackPublication).resumeUpstream();
  }, [codingRound, room]);

  // handle countdown timer expiry — auto-submit all unsubmitted tasks
  useEffect(() => {
    if (codingTimer === null) return;
    if (codingTimer <= 0) {
      setCodingTimer(null);

      // Auto-submit any unsubmitted tasks with whatever code exists
      const unsubmitted = codingTasks.filter(t => !submittedTaskIds.has(t.id));
      const submitPromises = unsubmitted.map(async (task) => {
        try {
          // Submit empty string if no code written — evaluation agent handles it
          await apiClient.post(`/communication/coding-tasks/${task.id}/submit`, { code: '' });
        } catch (err) {
          console.warn(`[CodingRound] Failed to auto-submit task ${task.id}:`, err);
        }
      });

      Promise.all(submitPromises).then(async () => {
        setShowCodingEditor(false);
        codingRound.deactivateCodingRound();
        // Resume mic upstream so bot closing message is heard
        const micPub = room?.localParticipant.getTrackPublication(Track.Source.Microphone);
        if (micPub) await (micPub as LocalTrackPublication).resumeUpstream();
        // Tell orchestrator to end gracefully
        gracefulEndRef.current = true;
        if (room) {
          const encoder = new TextEncoder();
          room.localParticipant.publishData(
            encoder.encode("Time limit expired. All tasks have been submitted."),
            { reliable: true, topic: 'code_submission' },
          ).catch(console.error);
        }
      });
      return;
    }
    const interval = setInterval(() => {
      setCodingTimer((t) => (t !== null ? t - 1 : t));
    }, 1000);
    return () => clearInterval(interval);
  }, [codingTimer, codingRound, codingTasks, submittedTaskIds, room]);

  // Wait for bot to finish speaking, then resolve.
  // Requires a quiet gap (no speaking for QUIET_GAP ms) after TTS stops,
  // to handle multi-part responses (e.g. intro → tool call → summary).
  // Gives up after 45s total.
  const waitForBotToStopSpeaking = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const POLL_MS = 500;
      const QUIET_GAP_MS = 3000;
      const TIMEOUT_MS = 45000;
      let elapsed = 0;
      let ttsStarted = false;
      let silentSince: number | null = null;

      const check = setInterval(() => {
        elapsed += POLL_MS;
        const botSpeaking = room?.activeSpeakers?.some(
          (p) => p.identity !== room.localParticipant.identity,
        );

        if (botSpeaking) {
          ttsStarted = true;
          silentSince = null; // reset quiet gap
        } else if (ttsStarted && silentSince === null) {
          silentSince = elapsed; // silence just began
        }

        const quietLongEnough = silentSince !== null && (elapsed - silentSince) >= QUIET_GAP_MS;
        if ((ttsStarted && quietLongEnough) || elapsed >= TIMEOUT_MS) {
          clearInterval(check);
          resolve();
        }
      }, POLL_MS);
    });
  }, [room]);

  // Guard ref to prevent duplicate activations (React state is async)
  const codingEditorActivating = useRef(false);
  // Admin-set coding time limit (minutes) received via LiveKit signal
  const codingTimeLimitRef = useRef<number | null>(null);

  // Fetch coding tasks from DB once and activate editor
  const activateCodingEditor = useCallback(async () => {
    if (showCodingEditor || codingEditorActivating.current || !conversationId) return;
    codingEditorActivating.current = true;
    try {
      const res = await apiClient.get(`/communication/coding-tasks/${conversationId}`);
      const tasks = (res.data || []).map((t: any) => ({
        id: t.id,
        text: t.problem_text ?? t.problemText,
        language: t.language,
      }));

      if (tasks.length > 0) {
        setCodingTasks(tasks);
        setShowCodingEditor(true);
        codingRound.activateCodingRound();
        // Pause mic upstream so STT doesn't transcribe during coding
        const micPub = room.localParticipant.getTrackPublication(Track.Source.Microphone);
        if (micPub) await (micPub as LocalTrackPublication).pauseUpstream();
        // Use admin-set time limit from signal
        const adminMinutes = codingTimeLimitRef.current;
        if (adminMinutes && adminMinutes > 0) {
          setCodingTimer(adminMinutes * 60);
        }
      }
    } catch (err) {
      console.error('[CodingRound] Error fetching coding tasks:', err);
      codingEditorActivating.current = false;
    }
  }, [showCodingEditor, conversationId, codingRound]);

  // Listen for coding_signal via LiveKit DataReceived.
  // On signal: wait for bot TTS to finish, then fetch tasks once and open editor.
  useEffect(() => {
    if (!room || !roomConnected || showCodingEditor) return;

    const handleData = async (_payload: Uint8Array, _participant: any, _kind: any, topic?: string) => {
      if (topic !== 'coding_signal') return;
      // Parse admin time limit from signal payload
      try {
        const parsed = JSON.parse(new TextDecoder().decode(_payload));
        if (parsed.codingTimeLimit) {
          codingTimeLimitRef.current = parsed.codingTimeLimit;
        }
      } catch { /* ignore parse errors — fallback to per-task limits */ }
      // Mute mic immediately to stop ambient noise from triggering STT
      // while the bot finishes speaking its summary
      const micPub = room.localParticipant.getTrackPublication(Track.Source.Microphone);
      if (micPub) await (micPub as LocalTrackPublication).pauseUpstream();
      console.log('[CodingRound] Received coding_signal — mic muted, waiting for bot to finish speaking…');
      await waitForBotToStopSpeaking();
      console.log('[CodingRound] Bot stopped speaking — opening editor');
      await activateCodingEditor();
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => { room.off(RoomEvent.DataReceived, handleData); };
  }, [room, roomConnected, showCodingEditor, activateCodingEditor, waitForBotToStopSpeaking]);

  // Listen for proctoring_stop signal — halt frame capture and close proctoring WS
  useEffect(() => {
    if (!room || !roomConnected) return;

    const handleProctoringStop = (_payload: Uint8Array, _participant: any, _kind: any, topic?: string) => {
      if (topic !== 'proctoring_stop') return;
      console.log('[Proctoring] Received proctoring_stop signal — shutting down proctoring');
      proctoringStoppedRef.current = true;
      stopSendingFrames();
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      gracefulEndRef.current = true;
    };

    room.on(RoomEvent.DataReceived, handleProctoringStop);
    return () => { room.off(RoomEvent.DataReceived, handleProctoringStop); };
  }, [room, roomConnected, stopSendingFrames]);

  // NOTE: Evaluation signal listener removed — interview ends after code submission.
  // Evaluation agent and results modal are retained for future use.

  return (
    <>
      <main
        data-lk-theme="default"
        style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "transparent",
          borderRadius: "0.5rem",
        }}
      >
        {/* Video conference — always rendered to keep LiveKit room alive */}
        <Stack direction={"row"} justifyContent={"center"}>
          <Box
            sx={{
              width: startWebinar ? "91vw" : "50vw",
              height: startWebinar ? "65vh" : "50vh",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <LiveKitRoom
              room={room}
              token={livekitToken}
              onConnected={async () => {
                setRoomConnected(true);
                // Force fullscreen when call starts so pre-join bypass (e.g. ESC then join) is closed
                const inFullscreen = !!(document.fullscreenElement ||
                  (document as any).webkitFullscreenElement ||
                  (document as any).mozFullScreenElement ||
                  (document as any).msFullscreenElement);
                if (!inFullscreen) {
                  try {
                    const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void>; mozRequestFullScreen?: () => Promise<void>; msRequestFullscreen?: () => Promise<void> };
                    if (el.requestFullscreen) await el.requestFullscreen();
                    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
                    else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
                    else if (el.msRequestFullscreen) await el.msRequestFullscreen();
                  } catch (e) {
                    console.warn("Could not force fullscreen on connect:", e);
                  }
                }
              }}
              serverUrl={livekitUrl}
              style={{ display: "flex" }}
              video={true}
              audio={{
                noiseSuppression: true,
                echoCancellation: true,
                autoGainControl: true,
              }}
            >
              {!startWebinar ? (
                <MyVideoConference />
              ) : (
                <WebinarConference
                  room={room}
                  endWebinarHandler={endWebinarHandler}
                  codingEditorActive={showCodingEditor}
                  audioInputs={audioInput}
                  audioOutputs={audioOutput}
                  videoInputs={videoInput}
                  audioInputValue={audioInputValue}
                  audioOutputValue={audioOutputValue}
                  videoInputValue={videoInputValue}
                  audioInputHandler={handleAudioInputChange}
                  audioOutputHandler={handleAudioOutputChange}
                  videoInputHandler={handleVideoInputChange}
                />
              )}
            </LiveKitRoom>
          </Box>
        </Stack>

        {/* Fullscreen coding editor modal overlay */}
        {showCodingEditor && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              bgcolor: '#1e1e2e',
              zIndex: 9999,
              p: 1,
            }}
          >
            <CodingEditor
              tasks={codingTasks}
              initialCodes={{}}
              onSubmit={handleCodeSubmit}
              disabled={false}
              timeRemaining={codingTimer}
              title="Coding Challenge"
              submittedTaskIds={submittedTaskIds}
            />
          </Box>
        )}
        {cvProctoringEnabled && (
          <AlertModal
            open={alert.open}
            reason={alert.reason}
            onClose={handleAlertClose}
            attemptsLeft={serverWarningsRemaining}
          />
        )}
      </main>
      <style>{`
        .lk-control-bar {
          border-top: 0px;
        }
        .lk-chat {
          border-radius: 10px;
          margin-top: 8px;
          margin-bottom: 77px;
        }
        .lk-participant-metadata {
          display: none;
        }
        .lk-room-container {
          background-color: transparent !important;
        }
        .lk-focus-toggle-button {
          display: none;
        }
      `}</style>
    </>
  );
};

export default WebinarLivekit;