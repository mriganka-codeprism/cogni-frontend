import React, { useEffect, useState } from "react";

import { ReactComponent as AlertHeaderIcon } from "../../../assets/images/alert_header.svg";
import { ReactComponent as AlertEyeIcon } from "../../../assets/images/alert_eye.svg";
import { ReactComponent as AlertButtonIcon } from "../../../assets/images/alert_button.svg";

// Function to get theme styles based on alert count
const getThemeStyles = (count: number) => {
  switch (count) {
    case 3:
      return {
        backdrop: "rgba(0,0,0,0.18)",
        content: "#fff",
        header: "#F9DEDC",
        headerText: "#B3261E",
        bodyBg: "#fff",
        text: "#222",
        actionBox: "#F3F3F3",
        actionText: "#444",
        infoText: "#666",
        progressBg: "#F3F3F3",
        progressBar: "#B3261E",
        progressText: "#B3261E",
        button: "#B3261E",
        buttonHover: "#a11d18",
        buttonText: "#fff",
        countColor: "#B3261E",
      };
    case 2:
      return {
        backdrop: "rgba(0,0,0,0.25)",
        content: "#fef2f2",
        header: "#fecaca",
        headerText: "#B3261E",
        // bodyBg: "#fef2f2",
        bodyBg: "#fff",
        text: "#222",
        actionBox: "#fee2e2",
        actionText: "#444",
        // infoText: "#4b5563",
        infoText: "#666",
        progressBg: "#fee2e2",
        progressBar: "#dc2626",
        progressText: "#B3261E",
        button: "#dc2626",
        buttonHover: "#b91c1c",
        buttonText: "#fff",
        countColor: "#B3261E",
      };
    case 1:
      return {
        backdrop: "rgba(0,0,0,0.4)",
        content: "#ef4444",
        header: "#dc2626",
        headerText: "#fff",
        // bodyBg: "#ef4444",
        bodyBg: "#fff",
        text: "#222",
        actionBox: "#dc2626",
        actionText: "#fff",
        // infoText: "#fef2f2",
        infoText: "#666",
        progressBg: "#F3F3F3",
        progressBar: "#b91c1c",
        progressText: "#B3261E",
        button: "#b91c1c",
        buttonHover: "#991b1b",
        buttonText: "#fff",
        countColor: "#B3261E",
      };
    case 0:
      return {
        backdrop: "rgba(0,0,0,0.6)",
        content: "#7f1d1d",
        header: "#450a0a",
        headerText: "#fff",
        // bodyBg: "#7f1d1d",
        bodyBg: "#fff",
        text: "#222",
        actionBox: "#450a0a",
        actionText: "#fff",
        // infoText: "#fecaca",
        infoText: "#666",
        progressBg: "#F3F3F3",
        progressBar: "#991b1b",
        progressText: "#B3261E",
        button: "#450a0a",
        buttonHover: "#7f1d1d",
        buttonText: "#fff",
        countColor: "#B3261E",
      };
    default:
      return {
        backdrop: "rgba(0,0,0,0.18)",
        content: "#fff",
        header: "#F9DEDC",
        headerText: "#B3261E",
        bodyBg: "#fff",
        text: "#222",
        actionBox: "#F3F3F3",
        actionText: "#444",
        infoText: "#666",
        progressBg: "#F3F3F3",
        progressBar: "#B3261E",
        progressText: "#B3261E",
        button: "#B3261E",
        buttonHover: "#a11d18",
        buttonText: "#fff",
        countColor: "#B3261E",
      };
  }
};

interface AlertModalProps {
  open: boolean;
  onClose?: () => void;
  autoCloseSeconds?: number;
  reason?: string;
  attemptsLeft: number;
}

const AlertModal: React.FC<AlertModalProps> = ({
  open,
  onClose,
  autoCloseSeconds = 5,
  reason,
  attemptsLeft,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(autoCloseSeconds);

  useEffect(() => {
    if (!open) return;
    setSecondsLeft(autoCloseSeconds);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onClose) onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, autoCloseSeconds, onClose]);

  if (!open) return null;

  // Progress bar width (percent)
  const progress = ((autoCloseSeconds - secondsLeft) / autoCloseSeconds) * 100;

  const theme = getThemeStyles(attemptsLeft);

  return (
    <div className="alert-modal-backdrop">
      <div className="alert-modal-content">
        <div className="alert-modal-header">
          <span className="alert-modal-icon" aria-label="alert">
            <AlertHeaderIcon className="w-6 h-6" />
          </span>
          <div className="alert-modal-title">Interview Monitoring Alert</div>
        </div>
        <div className="alert-modal-body">
          <div className="alert-modal-message">
            <span
              role="img"
              aria-label="monitor"
              style={{
                marginRight: 8,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <AlertEyeIcon className="w-5 h-5" />
            </span>
            {reason}
          </div>
          <div className="alert-modal-action-box">
            <div className="alert-modal-action-title">Required Action:</div>
            <ul>
              <li>Do not switch your tab while giving interview</li>
              <li>Do not move out of the camera view</li>
              <li>Avoid using other devices or applications</li>
            </ul>
          </div>
          <div className="alert-modal-info">
            {attemptsLeft > 0 ? (
              <>
                You have got{" "}
                <b style={{ color: theme.countColor, fontSize: "1.2rem" }}>
                  {attemptsLeft}
                </b>{" "}
                attempts left before you are defaulted from the interview.
              </>
            ) : (
              <b style={{ color: theme.countColor, fontSize: "1.1rem" }}>
                Your interview is being terminated due to repeated violations.
              </b>
            )}
          </div>
          <div className="alert-modal-progress-label">{attemptsLeft > 0 ? "Auto-closing in:" : "Ending session in:"}</div>
          <div className="alert-modal-progress-bar">
            <div
              className="alert-modal-progress-bar-inner"
              style={{ width: `${progress}%` }}
            />
            <span className="alert-modal-progress-time">{secondsLeft}s</span>
          </div>
          {attemptsLeft > 0 && (
            <button className="alert-modal-button" onClick={onClose} autoFocus>
              <span
                style={{
                  marginRight: 8,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <AlertButtonIcon className="w-5 h-5" />
              </span>
              I Understand
            </button>
          )}
        </div>
      </div>
      <style>{`
        .alert-modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: ${theme.backdrop};
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
        }
        .alert-modal-content {
          background: ${theme.content};
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          width: 820px;
          max-width: 95vw;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: background 0.3s ease;
        }
        .alert-modal-header {
          background: ${theme.header};
          padding: 20px 24px 10px 24px;
          display: flex;
          align-items: center;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
          transition: background 0.3s ease;
        }
        .alert-modal-icon {
          margin-right: 8px;
          color: ${theme.headerText};
        }
        .alert-modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: ${theme.headerText};
          margin-bottom: 2px;
          transition: color 0.3s ease;
        }
        .alert-modal-subtitle {
          font-size: 1rem;
          color: ${theme.headerText};
          font-weight: 500;
        }
        .alert-modal-body {
          padding: 18px 24px 24px 24px;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          background: ${theme.bodyBg};
          transition: background 0.3s ease;
        }
        .alert-modal-message {
          display: flex;
          align-items: center;
          font-size: 1.08rem;
          color: ${theme.text};
          margin-bottom: 18px;
          transition: color 0.3s ease;
        }
        .alert-modal-action-box {
          background: ${theme.actionBox};
          border-radius: 8px;
          padding: 14px 18px 10px 18px;
          margin-bottom: 18px;
          transition: background 0.3s ease;
        }
        .alert-modal-action-title {
          font-weight: 600;
          font-size: 1rem;
          margin-bottom: 8px;
          color: ${theme.actionText};
          transition: color 0.3s ease;
        }
        .alert-modal-action-box ul {
          margin: 0;
          padding-left: 18px;
          font-size: 0.98rem;
          color: ${theme.actionText};
          transition: color 0.3s ease;
        }
        .alert-modal-action-box li {
          margin-bottom: 4px;
        }
        .alert-modal-info {
          font-size: 0.98rem;
          color: ${theme.infoText};
          margin-bottom: 18px;
          transition: color 0.3s ease;
        }
        .alert-modal-progress-label {
          font-size: 0.97rem;
          color: ${theme.progressText};
          margin-bottom: 4px;
          transition: color 0.3s ease;
        }
        .alert-modal-progress-bar {
          position: relative;
          height: 8px;
          background: ${theme.progressBg};
          border-radius: 4px;
          margin-bottom: 24px;
          overflow: hidden;
          transition: background 0.3s ease;
        }
        .alert-modal-progress-bar-inner {
          background: ${theme.progressBar};
          height: 100%;
          transition: width 0.3s linear, background 0.3s ease;
        }
        .alert-modal-progress-time {
          position: absolute;
          right: 8px;
          top: -22px;
          font-size: 0.97rem;
          color: ${theme.progressText};
          font-weight: 500;
          transition: color 0.3s ease;
        }
        .alert-modal-button {
          background: ${theme.button};
          color: ${theme.buttonText};
          border: none;
          border-radius: 8px;
          padding: 12px 28px;
          font-size: 1.08rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: background 0.18s ease;
        }
        .alert-modal-button:hover {
          background: ${theme.buttonHover};
        }
      `}</style>
    </div>
  );
};

export default React.memo(
  AlertModal,
  (prevProps, nextProps) => prevProps.open === nextProps.open
);
