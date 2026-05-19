import { Track } from "livekit-client";
import * as React from "react";
import { supportsScreenSharing } from "@livekit/components-core";
import {
  ChatToggle,
  DisconnectButton,
  TrackToggle,
  useLocalParticipantPermissions,
  useMaybeLayoutContext,
  usePersistentUserChoices,
} from "@livekit/components-react";
import {
  Button,
  DialogActions,
  DialogContent,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FeedbackIcon from "@mui/icons-material/Feedback";
import SettingsIcon from "@mui/icons-material/Settings";
import { homeStyle } from "../../styles/home.styles";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ConfirmationDialog from "../confirmationDialog";
import CustomButton from "../button";
import { routes } from "../../constants/routes";
import { useNavigate } from "react-router-dom";
import { globalStyles } from "../../config";

export type ControlBarControls = {
  microphone?: boolean;
  camera?: boolean;
  chat?: boolean;
  screenShare?: boolean;
  leave?: boolean;
  settings?: boolean;
  people?: boolean;
  recording?: boolean;
};

/** @public */
export interface ControlBarProps extends React.HTMLAttributes<HTMLDivElement> {
  onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
  variation?: "minimal" | "verbose" | "textOnly";
  controls?: ControlBarControls;
  saveUserChoices?: boolean;
  style?: React.CSSProperties;
  settingsFn?: () => void;
  inRoom?: boolean;
  participantsFn?: () => void;
  endWebinarHandler?: (disqualified?: boolean) => void;
  openEndCallDialog: boolean;
  setOpenEndCallDialog: (open: boolean) => void;
}

export default function WebinarControls({ ...props }: ControlBarProps) {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return <WebinarControlss {...props} />;
}
function WebinarControlss({
  variation,
  controls,
  saveUserChoices = true,
  onDeviceError,
  inRoom,
  participantsFn,
  endWebinarHandler,
  openEndCallDialog,
  setOpenEndCallDialog,
  ...props
}: ControlBarProps) {
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [isScreenShareEnabled, setIsScreenShareEnabled] = React.useState(false);
  const [isMicOpen, setIsMicOpen] = React.useState(false);
  const [showPeople, setShowPeople] = React.useState(false);
  const [recording, setRecording] = React.useState(false);
  const navigate = useNavigate();


  React.useEffect(() => {
    if (inRoom) {
      setIsMicOpen(true);
      setIsCameraOpen(true);
    }
  }, [inRoom]);

  const layoutContext = useMaybeLayoutContext();
  React.useEffect(() => {
    if (layoutContext?.widget.state?.showChat !== undefined) {
      setIsChatOpen(layoutContext?.widget.state?.showChat);
    }
  }, [layoutContext?.widget.state?.showChat]);
  const isTooLittleSpace = useMediaQuery(
    `(max-width: ${isChatOpen ? 1000 : 760}px)`
  );

  const defaultVariation = isTooLittleSpace ? "minimal" : "verbose";
  variation ??= defaultVariation;

  const visibleControls = { leave: true, ...controls };

  const localPermissions = useLocalParticipantPermissions();

  if (!localPermissions) {
    visibleControls.camera = false;
    visibleControls.chat = false;
    visibleControls.microphone = false;
    visibleControls.screenShare = false;
  } else {
    visibleControls.camera ??= localPermissions.canPublish;
    visibleControls.microphone ??= localPermissions.canPublish;
    // visibleControls.screenShare ??= localPermissions.canPublish;
    visibleControls.screenShare ??= false;
    visibleControls.chat ??= localPermissions.canPublishData && controls?.chat;
  }

  const browserSupportsScreenSharing = supportsScreenSharing();

  const onScreenShareChange = React.useCallback(
    (enabled: boolean) => {
      setIsScreenShareEnabled(enabled);
    },
    [setIsScreenShareEnabled]
  );

  function mergeProps(...props: object[]): object {
    return Object.assign({}, ...props);
  }

  const htmlProps = mergeProps({ className: "lk-control-bar" }, props);

  const {
    saveAudioInputEnabled,
    saveVideoInputEnabled,
    saveAudioInputDeviceId,
    saveVideoInputDeviceId,
  } = usePersistentUserChoices({ preventSave: !saveUserChoices });

  const microphoneOnChange = React.useCallback(
    (enabled: boolean, isUserInitiated: boolean) => {
      if (isUserInitiated) {
        saveAudioInputEnabled(enabled);
        setIsMicOpen(enabled);
      }
    },
    [saveAudioInputEnabled]
  );

  const cameraOnChange = React.useCallback(
    (enabled: boolean, isUserInitiated: boolean) => {
      if (isUserInitiated) {
        saveVideoInputEnabled(enabled);
        setIsCameraOpen(enabled);
      }
    },
    [saveVideoInputEnabled]
  );

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const controlSettingsHandler = () => {
    setAnchorEl(null);
    props.settingsFn?.();
  };

  const participantsHandler = () => {
    setShowPeople(!showPeople);
    participantsFn?.();
  };

  const theme = useTheme();

  return (
    <div
      {...htmlProps}
      style={{
        ...props.style,
      }}
    >
      {visibleControls.microphone && (
        <div className="lk-button-group">
          <TrackToggle
            style={{
              border: "none",
              backgroundColor: "transparent",
              padding: "0px",
            }}
            source={Track.Source.Microphone}
            showIcon={false}
            onChange={microphoneOnChange}
            onDeviceError={(error) =>
              onDeviceError?.({ source: Track.Source.Microphone, error })
            }
          >
            <IconButton
              sx={{
                bgcolor: isMicOpen
                  ? theme.palette.primary.dark
                  : theme.palette.error.dark,
                padding: "15px",
                "&:hover": {
                  bgcolor: isMicOpen
                    ? theme.palette.primary.light
                    : theme.palette.error.light,
                },
                marginRight: "5px",
              }}
            >
              {isMicOpen ? <MicIcon sx={homeStyle.icon} /> : <MicOffIcon sx={homeStyle.icon} />}
            </IconButton>
          </TrackToggle>
        </div>
      )}
      {visibleControls.camera && (
        <div className="lk-button-group">
          <TrackToggle
            style={{
              border: "none",
              backgroundColor: "transparent",
              padding: "0px",
            }}
            source={Track.Source.Camera}
            showIcon={false}
            onChange={cameraOnChange}
            onDeviceError={(error) =>
              onDeviceError?.({ source: Track.Source.Camera, error })
            }
          >
            <IconButton
              sx={{
                bgcolor: isCameraOpen
                  ? theme.palette.primary.dark
                  : theme.palette.error.dark,
                padding: "15px",
                "&:hover": {
                  bgcolor: isCameraOpen
                    ? theme.palette.primary.light
                    : theme.palette.error.light,
                },
                marginRight: "5px",
              }}
            >
              {isCameraOpen ? <VideocamIcon sx={homeStyle.icon} /> : <VideocamOffIcon sx={homeStyle.icon} />}
            </IconButton>
          </TrackToggle>
        </div>
      )}
      {visibleControls.screenShare && browserSupportsScreenSharing && (
        <TrackToggle
          source={Track.Source.ScreenShare}
          captureOptions={{ audio: true, selfBrowserSurface: "include" }}
          showIcon={false}
          onChange={onScreenShareChange}
          onDeviceError={(error) =>
            onDeviceError?.({ source: Track.Source.ScreenShare, error })
          }
          style={{
            border: "none",
            backgroundColor: "transparent",
            padding: "0px",
          }}
        >
          <IconButton
            sx={{
              bgcolor: isScreenShareEnabled
                ? theme.palette.primary.main
                : theme.palette.primary.light,
              padding: "15px",
              "&:hover": {
                bgcolor: isScreenShareEnabled
                  ? theme.palette.primary.light
                  : theme.palette.primary.main,
              },
              marginRight: "5px",
            }}
          >
            {/* <Image
              style={{ width: "28px", height: "28px" }}
              src={
                isScreenShareEnabled
                  ? commonIcons.webinarScreenShareLightIcon
                  : commonIcons.webinarScreenShareIcon
              }
              alt=""
            /> */}
          </IconButton>
        </TrackToggle>
      )}
      {visibleControls.recording && (
        <IconButton
          sx={{
            backgroundColor: recording
              ? theme.palette.error.light
              : theme.palette.primary.light,
            borderRadius: "50%",
            padding: "15px",
            "&:hover": {
              bgcolor: recording
                ? theme.palette.error.light
                : theme.palette.primary.main,
            },
            marginRight: "5px",
          }}
          onClick={() => setRecording(!recording)}
        >
          {/* <Image
            style={{ width: "28px", height: "28px" }}
            src={
              recording
                ? commonIcons.webinarRecordLightIcon
                : commonIcons.webinarRecordIcon
            }
            alt=""
          /> */}
        </IconButton>
      )}
      {visibleControls.chat && (
        <ChatToggle
          style={{
            border: "none",
            backgroundColor: "transparent",
            padding: "0px",
          }}
        >
          <IconButton
            sx={{
              bgcolor: isChatOpen
                ? theme.palette.primary.main
                : theme.palette.primary.light,
              padding: "15px",
              "&:hover": {
                bgcolor: isChatOpen
                  ? theme.palette.primary.light
                  : theme.palette.primary.main,
              },
              marginRight: "5px",
            }}
          >
            {/* <Image
              style={{ width: "28px", height: "28px" }}
              src={
                isChatOpen
                  ? commonIcons.webinarChatLightIcon
                  : commonIcons.webinarChatIcon
              }
              alt=""
            /> */}
          </IconButton>
        </ChatToggle>
      )}
      {visibleControls.people && (
        <IconButton
          sx={{
            backgroundColor: showPeople
              ? theme.palette.primary.main
              : theme.palette.primary.light,
            borderRadius: "50%",
            padding: "18px",
            "&:hover": {
              bgcolor: showPeople
                ? theme.palette.primary.light
                : theme.palette.primary.main,
            },
            marginRight: "5px",
          }}
          onClick={participantsHandler}
        >
          {/* <Image
            style={{ width: "24px", height: "24px" }}
            src={
              showPeople
                ? commonIcons.webinarPeopleLightIcon
                : commonIcons.webinarPeopleIcon
            }
            alt=""
          /> */}
        </IconButton>
      )}

      {visibleControls.settings && (
        <IconButton
          sx={{
            backgroundColor: open
              ? theme.palette.primary.main
              : theme.palette.primary.light,
            borderRadius: "50%",
            padding: "15px",
            "&:hover": {
              bgcolor: open
                ? theme.palette.primary.light
                : theme.palette.primary.main,
            },
            marginRight: "5px",
          }}
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          {/* <Image
            style={{ width: "28px", height: "28px" }}
            src={
              open
                ? commonIcons.webinarMoreLightIcon
                : commonIcons.webinarMoreIcon
            }
            alt=""
          /> */}
        </IconButton>
      )}
      {visibleControls.leave && (
        <IconButton
          sx={{
            bgcolor: theme.palette.error.dark,
            padding: "15px",
            "&:hover": {
              bgcolor: theme.palette.error.light,
            },
            marginRight: "5px",
          }}
          onClick={() => setOpenEndCallDialog(true)}
        >
          <CallEndIcon sx={homeStyle.icon} />
        </IconButton>
      )}

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        sx={{
          "& .MuiPaper-root": {
            backdropFilter: "blur(12px)",
            borderRadius: "1rem",
            p: 1,
          },
        }}
      >
        <MenuItem
          onClick={handleClose}
          sx={{
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
          }}
        >
          <FeedbackIcon fontSize="small" /> Report a problem
        </MenuItem>
        <MenuItem
          onClick={controlSettingsHandler}
          sx={{
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
          }}
        >
          <SettingsIcon fontSize="small" /> Settings
        </MenuItem>
      </Menu>
      <ConfirmationDialog
        title="Are you sure you want to leave the interview?"
        open={openEndCallDialog}
        onClose={() => setOpenEndCallDialog(false)}
        cancelText={null}
      >
        <DialogContent sx={{ padding: "5px 30px" }}>
          <ul style={{ paddingLeft: "1.2em", margin: 0 }}>
            <li>Leaving the interview will end the current session</li>
            <li>Your responses so far will be saved and submitted</li>
            <li>
              If you leave now, you won't be able to rejoin this interview
            </li>
            <li>Click "Stay" to continue or "Leave" to end the session.</li>
          </ul>
        </DialogContent>

        <DialogActions
          sx={{
            padding: "1vh 2vh",
            justifyContent: "flex-end",
            gap: "1vh",
          }}
        >
          <CustomButton
            text="Stay"
            type="secondary"
            onClick={() => setOpenEndCallDialog(false)}
            additionalStyles={{
              height: "3.5vh",
              fontSize: "1.7vh",
              borderColor: "#006B66",
              color: "#006B66"
            }}
          />
          <CustomButton
            text="Leave"
            type="primary"
            onClick={endWebinarHandler}
            additionalStyles={{
              height: "3.5vh",
              fontSize: "1.7vh",
              backgroundColor: "#006B66",
              color: "#FFFFFF"
            }}
          />
        </DialogActions>
      </ConfirmationDialog>
    </div>
  );
}
