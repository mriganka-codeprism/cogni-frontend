import { isWeb } from "@livekit/components-core";
import { Room, RoomEvent, Track } from "livekit-client";
import * as React from "react";
import {
  ConnectionStateToast,
  GridLayout,
  LayoutContextProvider,
  ParticipantTile,
  RoomAudioRenderer,
  MessageFormatter,
  useTracks,
  useCreateLayoutContext,
  useVoiceAssistant,
  useTrackRefContext,
} from "@livekit/components-react";
import { PulseVisualizer } from "./PulseVisualizer";
import WebinarControls from "./webinarControls";
import { TranscriptionTile } from "./TranscriptionTile";
import { InterviewStartingModal } from "./modals/InterviewStartingModal";
import FullscreenWarningModal from "./modals/FullscreenWarningModal";
import CustomDialog from "../customDialog";
import EndCountdownDialog from "./modals/EndCountdownDialog";
import { useCandidateStore } from "../../store/candidateStore";
import { getSettingsByConversationId, postClientViolations } from "../../api/api";

export interface VideoConferenceProps
  extends React.HTMLAttributes<HTMLDivElement> {
  chatMessageFormatter?: MessageFormatter;
  SettingsComponent?: React.ComponentType;
  endWebinarHandler: (disqualified?: boolean) => void;
  audioInputs?: MediaDeviceInfo[];
  audioOutputs?: MediaDeviceInfo[];
  videoInputs?: MediaDeviceInfo[];
  audioInputValue?: string;
  audioOutputValue?: string;
  videoInputValue?: string;
  audioInputHandler?: (value: string) => void;
  audioOutputHandler?: (value: string) => void;
  videoInputHandler?: (value: string) => void;
  room: Room;
  codingEditorActive?: boolean;
}

export default function WebinarConference({ ...props }: VideoConferenceProps) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div></div>;

  return <WebinarConferencee {...props} />;
}

function WebinarConferencee({
  chatMessageFormatter,
  SettingsComponent,
  endWebinarHandler,
  room,
  codingEditorActive = false,
  ...props
}: VideoConferenceProps) {

  const [openEndCallDialog, setOpenEndCallDialog] = React.useState(false);
  const [showModal, setShowModal] = React.useState(true);
  const [showTabWarningDialog, setShowTabWarningDialog] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'avatar' | 'pulse'>('avatar');
  const [showFullscreenWarning, setShowFullscreenWarning] = React.useState(false);
  const [showEndCountdown, setShowEndCountdown] = React.useState(false);

  const tabSwitchCount = React.useRef(0);
  const tabHiddenTimestamp = React.useRef<number | null>(null);
  const isDisqualified = React.useRef(false);
  const fullscreenExitCount = React.useRef(0);
  const fullscreenEntryLogged = React.useRef(false);
  /** When true, fullscreenchange should not count exit or show warning (we exited programmatically). */
  const skipFullscreenExitPenaltyRef = React.useRef(false);
  /** When true, we called room.disconnect(); Disconnected event should not trigger natural-end flow. */
  const weInitiatedDisconnectRef = React.useRef(false);

  const voiceAssistant = useVoiceAssistant();

  const tracks = useTracks(
    [
      {
        source: Track.Source.Camera,
        withPlaceholder: true,
      },
      {
        source: Track.Source.ScreenShare,
        withPlaceholder: false,
        participant: "local",
      },
    ],
    { updateOnlyOn: [RoomEvent.LocalTrackPublished], onlySubscribed: false }
  );

  React.useEffect(() => {
    if (
      room &&
      voiceAssistant.state === "speaking"
    ) {
      setShowModal(false);
    }
  }, [voiceAssistant.state]);

  /* New Logic: Determine view mode from interview settings */
  const conversationId = useCandidateStore((state) => state.conversationId);
  const reportTabSwitchViolation = (reason: string) => {
    if (!conversationId) return;
    void postClientViolations(conversationId, [
      {
        violation_type: "tab_switch",
        reason,
        occurred_at: new Date().toISOString(),
        severity: "high",
      },
    ]);
  };

  React.useEffect(() => {
    if (conversationId) {
      getSettingsByConversationId(conversationId)
        .then((setting: any) => {
          const interviewType = setting
          console.log("WebinarConference: Found interviewType:", interviewType);

          if (interviewType === "Audio Based") {
            console.log("WebinarConference: Setting viewMode to pulse");
            setViewMode('pulse');
          } else {
            // Default to 'avatar' for "Video Based" or if undefined
            console.log("WebinarConference: Setting viewMode to avatar (default)");
            setViewMode('avatar');
          }
        })
        .catch((err) => {
          console.error("Failed to load interview settings", err);
          setViewMode('avatar');
        });
    }
  }, [conversationId]);

  const isInFullscreenForExit = () =>
    !!(document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement);

  const exitFullscreenMode = async () => {
    try {
      if (!isInFullscreenForExit()) return;
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      console.log('%c🔚 EXIT FULL SCREEN - Exiting full screen mode', 'color: #8b5cf6; font-weight: bold; font-size: 12px;');
    } catch (err) {
      console.error('Error exiting full screen:', err);
    }
  };

  // Fullscreen exit/entry detection (vendor-agnostic so Safari and other browsers behave correctly)
  React.useEffect(() => {
    const isInFullscreen = () =>
      !!(document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement);

    const handleFullscreenChange = () => {
      if (!isInFullscreen()) {
        if (skipFullscreenExitPenaltyRef.current) {
          skipFullscreenExitPenaltyRef.current = false;
          return;
        }
        fullscreenExitCount.current += 1;
        console.log(`%c⚠️ FULLSCREEN EXIT DETECTED`, 'color: #dc2626; font-weight: bold; font-size: 14px;');
        console.log(`Exit Count: ${fullscreenExitCount.current}`);

        // Persist violation to backend (fire-and-forget)
        if (conversationId) {
          postClientViolations(conversationId, [{
            violation_type: 'fullscreen_exit',
            reason: fullscreenExitCount.current >= 2
              ? 'Disqualified: exceeded fullscreen exit limit'
              : 'Candidate exited fullscreen',
            occurred_at: new Date().toISOString(),
            severity: 'high',
          }]);
        }

        if (fullscreenExitCount.current === 1) {
          console.log('%c⚠️ FIRST FULLSCREEN EXIT - SHOWING WARNING MODAL', 'color: #f59e0b; font-weight: bold; font-size: 12px;');
          setShowFullscreenWarning(true);
          setShowModal(false);
        } else if (fullscreenExitCount.current >= 2) {
          console.log('%c🚨 SECOND FULLSCREEN EXIT - DISCONNECTING INTERVIEW', 'color: #dc2626; font-weight: bold; font-size: 14px;');
          isDisqualified.current = true;
          setShowFullscreenWarning(false);
          setShowModal(false);
          endWebinarHandler(true);
        }
      } else {
        if (!fullscreenEntryLogged.current) {
          console.log('%c🎯 FULLSCREEN ENTRY - Interview session locked to fullscreen mode', 'color: #10b981; font-weight: bold; font-size: 14px;');
          console.log('%c⏰ Exit tracking ENABLED - Any unauthorized exit will be recorded', 'color: #8b5cf6; font-weight: bold; font-size: 12px;');
          fullscreenEntryLogged.current = true;
        } else {
          console.log('%c✅ FULLSCREEN ACTIVE', 'color: #10b981; font-weight: bold;');
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, [room]);

  // Natural end: server/avatar ended the call → exit fullscreen and show countdown (no fullscreen warning)
  React.useEffect(() => {
    const handleDisconnected = () => {
      if (weInitiatedDisconnectRef.current) return;
      skipFullscreenExitPenaltyRef.current = true;
      weInitiatedDisconnectRef.current = true;
      exitFullscreenMode();
      setShowEndCountdown(true);
    };
    room.on(RoomEvent.Disconnected, handleDisconnected);
    return () => {
      room.off(RoomEvent.Disconnected, handleDisconnected);
    };
  }, [room]);

  // ============ NOTIFICATION SUPPRESSION ============
  // Suppress browser notifications during fullscreen interview (no notifications while in call)
  React.useEffect(() => {
    const originalRequestPermission =
      typeof Notification !== 'undefined' ? (Notification as any).requestPermission : null;
    if (typeof Notification !== 'undefined') {
      (Notification as any).requestPermission = async function () {
        console.log('%c🔕 BLOCKING: Notification permission denied during interview', 'color: #dc2626; font-weight: bold;');
        return 'denied';
      };
    }

    const style = document.createElement('style');
    style.setAttribute('data-interview-notification-suppress', 'true');
    style.textContent = `
      ::-webkit-notification, notification, .notification, .notification-container, .notification-banner { display: none !important; }
      [role="alert"] { z-index: -9999 !important; }
    `;
    document.head.appendChild(style);

    const onSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'notification' || event.data?.type === 'push') {
        console.warn('%c🔕 BLOCKING: Service Worker notification intercepted during interview', 'color: #dc2626; font-weight: bold;');
        event.stopImmediatePropagation();
      }
    };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', onSwMessage);
    }
    console.log('%c🔕 NOTIFICATIONS SUPPRESSED - All notification channels blocked for interview security', 'color: #8b5cf6; font-weight: bold;');

    return () => {
      if (document.head.contains(style)) document.head.removeChild(style);
      if (originalRequestPermission && typeof Notification !== 'undefined') {
        (Notification as any).requestPermission = originalRequestPermission;
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', onSwMessage);
      }
    };
  }, []);

  // ============ ESC KEY BLOCKING DURING INTERVIEW ============
  // Block ESC whenever in fullscreen (standard + vendor) so Safari and other browsers cannot exit via ESC
  React.useEffect(() => {
    const isInFullscreen = () =>
      !!(document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement);

    const handleEscapeKey = (event: KeyboardEvent) => {
      if ((event.key !== 'Escape' && event.keyCode !== 27) || !isInFullscreen()) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      console.warn('%c🔐 ESC KEY BLOCKED - Cannot exit fullscreen during interview', 'color: #dc2626; font-weight: bold;');
    };

    document.addEventListener('keydown', handleEscapeKey, true);
    return () => document.removeEventListener('keydown', handleEscapeKey, true);
  }, []);

  // Handler to return to fullscreen after warning
  const handleReturnToFullscreen = async () => {
    try {
      setShowFullscreenWarning(false);
      const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void>; mozRequestFullScreen?: () => Promise<void>; msRequestFullscreen?: () => Promise<void> };
      if (el.requestFullscreen) {
        console.log('%c🔄 User clicked "Return to Fullscreen" button', 'color: #3b82f6; font-weight: bold;');
        await el.requestFullscreen();
        console.log('%c✅ Successfully returned to fullscreen', 'color: #10b981; font-weight: bold;');
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
        console.log('%c✅ Successfully returned to fullscreen (webkit)', 'color: #10b981; font-weight: bold;');
      } else if (el.mozRequestFullScreen) {
        await el.mozRequestFullScreen();
        console.log('%c✅ Successfully returned to fullscreen (moz)', 'color: #10b981; font-weight: bold;');
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
        console.log('%c✅ Successfully returned to fullscreen (ms)', 'color: #10b981; font-weight: bold;');
      }
    } catch (error) {
      console.error("❌ Failed to return to fullscreen:", error);
    }
  };

  // React.useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     console.log("document.visibilityState", document.visibilityState);
  //     if (document.visibilityState === "hidden") {
  //       tabSwitchCount.current += 1;
  //       tabHiddenTimestamp.current = Date.now();
  //       if (tabSwitchCount.current === 2) {
  //         handleEndCall();
  //         return;
  //       }
  //     } else if (document.visibilityState === "visible") {
  // During coding editor, Monaco iframe steals window focus on click, so
  // window blur/focus fires falsely. Use document.visibilitychange instead
  // because it only fires on real tab switches / window minimise.
  React.useEffect(() => {
    if (codingEditorActive) {
      const handleVisibility = () => {
        if (showModal || showTabWarningDialog) return;

        if (document.visibilityState === "hidden") {
          tabSwitchCount.current += 1;
          tabHiddenTimestamp.current = Date.now();
          reportTabSwitchViolation("Candidate switched tab/window");

          if (tabSwitchCount.current === 2) {
            reportTabSwitchViolation("Disqualified: exceeded tab switch limit");
            isDisqualified.current = true;
            setOpenEndCallDialog(false);
            endWebinarHandler(true);
          }
        } else if (document.visibilityState === "visible") {
          if (tabHiddenTimestamp.current) {
            const diffSeconds = (Date.now() - tabHiddenTimestamp.current) / 1000;
            if (diffSeconds > 10) {
              reportTabSwitchViolation("Disqualified: exceeded tab switch limit");
              isDisqualified.current = true;
              setOpenEndCallDialog(false);
              endWebinarHandler(true);
              return;
            }
            tabHiddenTimestamp.current = null;
          }

          if (tabSwitchCount.current === 1) {
            setShowTabWarningDialog(true);
          }
        }
      };

      document.addEventListener("visibilitychange", handleVisibility);
      return () => {
        document.removeEventListener("visibilitychange", handleVisibility);
      };
    }

    const handleWindowBlur = () => {
      if (showModal || showTabWarningDialog) return;

      tabSwitchCount.current += 1;
      tabHiddenTimestamp.current = Date.now();
      reportTabSwitchViolation("Candidate switched tab/window");
      console.log(`⚠️ Tab switch detected. Count: ${tabSwitchCount.current}`);

      if (tabSwitchCount.current === 1) {
        console.log("⚠️ FIRST TAB SWITCH WARNING - Showing tab switch warning dialog");
      } else if (tabSwitchCount.current === 2) {
        console.log("🚨 SECOND TAB SWITCH - DISCONNECTING INTERVIEW");
        reportTabSwitchViolation("Disqualified: exceeded tab switch limit");
        isDisqualified.current = true;
        setShowModal(false);
        skipFullscreenExitPenaltyRef.current = true;
        exitFullscreenMode();
        endWebinarHandler(true);
        return;
      }
    };

    const handleWindowFocus = () => {
      if (tabHiddenTimestamp.current) {
        const diffSeconds = (Date.now() - tabHiddenTimestamp.current) / 1000;
        console.log(`⏱️ Tab was hidden for ${diffSeconds.toFixed(2)} seconds`);

        if (diffSeconds > 10) {
          console.log("🚨 USER WAS AWAY FOR >10 SECONDS - DISCONNECTING INTERVIEW");
          reportTabSwitchViolation("Disqualified: exceeded tab switch limit");
          isDisqualified.current = true;
          setShowModal(false);
          skipFullscreenExitPenaltyRef.current = true;
          exitFullscreenMode();
          endWebinarHandler(true);
          return;
        }
        tabHiddenTimestamp.current = null;
      }

      if (tabSwitchCount.current === 1) {
        console.log("⚠️ Showing tab warning dialog on return");
        setShowTabWarningDialog(true);
      }
    };

    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [showModal, showTabWarningDialog, room, codingEditorActive, conversationId]);

  // React.useEffect(() => {
  //   const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  //     // Avoid prompting while initial modal/warning is shown
  //     if (showModal || showTabWarningDialog) return;
  //     event.preventDefault();
  //     // Most browsers ignore custom text but setting returnValue triggers the prompt
  //     event.returnValue = "Your interview will end if you refresh this page.";
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);
  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, [showModal, showTabWarningDialog]);

  const localTracks = React.useMemo(
    () => tracks.filter((t) => t.source !== Track.Source.ScreenShare),
    [tracks]
  );

  const mainRef = React.useRef<HTMLDivElement>(null);

  const layoutContext = useCreateLayoutContext();

  const [settingsModalOpen, setSettingsModalOpen] = React.useState(false);
  const [showParticipants, setShowParticipants] = React.useState(false);

  return (
    <>
      <CustomDialog
        open={showTabWarningDialog}
        title="Warning"
        primaryText="OK"
        handleClose={() => setShowTabWarningDialog(false)}
        onPrimaryClick={() => {
          setShowTabWarningDialog(false);
        }}
      >
        Your interview will be closed if you move away from this window.
      </CustomDialog>
      <FullscreenWarningModal
        open={showFullscreenWarning}
        onReturnToFullscreen={handleReturnToFullscreen}
      />
      {showEndCountdown && (
        <EndCountdownDialog
          endWebinarHandler={() => endWebinarHandler(isDisqualified.current)}
        />
      )}
      <div
        className="lk-video-conference"
        {...props}
        ref={mainRef}
        style={{
          width: "70%",
        }}
      >
        {isWeb() && (
          <LayoutContextProvider
            value={layoutContext}
          >
            <div
              className="lk-video-conference-inner"
              style={{ position: "relative" }}
            >

              <div className="lk-grid-layout-wrapper">
                <GridLayout tracks={localTracks} style={{ paddingTop: 0 }}>
                  <CustomTile viewMode={viewMode} voiceAssistantAudio={voiceAssistant.audioTrack} />
                </GridLayout>
              </div>
              <WebinarControls
                controls={{
                  chat: false,
                  settings: false,
                  people: false,
                  recording: false,
                }}
                settingsFn={() => setSettingsModalOpen(!settingsModalOpen)}
                participantsFn={() => setShowParticipants(!showParticipants)}
                endWebinarHandler={() => {
                  setOpenEndCallDialog(false);
                  skipFullscreenExitPenaltyRef.current = true;
                  weInitiatedDisconnectRef.current = true;
                  room.disconnect();
                  exitFullscreenMode();
                  setShowEndCountdown(true);
                }}
                openEndCallDialog={openEndCallDialog}
                setOpenEndCallDialog={setOpenEndCallDialog}
                inRoom
              />
            </div>
          </LayoutContextProvider>
        )}
        <InterviewStartingModal open={showModal} />
        <RoomAudioRenderer />
        <ConnectionStateToast />
      </div>
      <TranscriptionTile agentAudioTrack={voiceAssistant.audioTrack} />
    </>
  );
}

function CustomTile({ viewMode, voiceAssistantAudio }: { viewMode: 'avatar' | 'pulse', voiceAssistantAudio?: any }) {
  const trackContext = useTrackRefContext();
  const isLocal = trackContext.participant.isLocal;

  if (!isLocal && viewMode === 'pulse') {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <PulseVisualizer audioTrack={voiceAssistantAudio?.publication?.track} />
      </div>
    )
  }

  return <ParticipantTile disableSpeakingIndicator />;
}

