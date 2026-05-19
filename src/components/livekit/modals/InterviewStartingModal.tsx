import React from "react";

/** Teal/green palette for this modal only (avoid maroon global primary). */
const MODAL_ACCENT = "#006b66";
const MODAL_CHECK_BG = "#006b66";
const MODAL_PENDING_RING = "#006b66";
const MODAL_PENDING_INNER = "#ffffff";

interface ChecklistItem {
  label: string;
  checked?: boolean;
}

interface InterviewStartingModalProps {
  open: boolean;
  checklist?: ChecklistItem[];
  className?: string;
}

const defaultChecklist: ChecklistItem[] = [
  { label: "Camera and microphone are working", checked: true },
  { label: "No background noise" },
  { label: "Connection is stable" },
];

const tips = [
  "💡 Take a deep breath and relax. You're well-prepared for this!",
  "👁️ Look directly at the camera when speaking, not at the screen.",
  "😊 A genuine smile can make a great first impression.",
  "🎯 Remember to showcase your unique skills and experiences.",
  "⭐ Be yourself - authenticity is your greatest asset.",
];

export const InterviewStartingModal: React.FC<InterviewStartingModalProps> = ({
  open,
  checklist = defaultChecklist,
  className = "",
}) => {
  const [tipIndex, setTipIndex] = React.useState(0);
  const [animate, setAnimate] = React.useState(false);
  const [showChecklist, setShowChecklist] = React.useState(true);
  const [localChecklist, setLocalChecklist] = React.useState<ChecklistItem[]>([
    ...defaultChecklist,
  ]);

  React.useEffect(() => {
    if (open) {
      setLocalChecklist([
        { ...defaultChecklist[0], checked: true },
        { ...defaultChecklist[1], checked: false },
        { ...defaultChecklist[2], checked: false },
      ]);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const timers: NodeJS.Timeout[] = [];
    timers.push(
      setTimeout(() => {
        setLocalChecklist((prev) => [
          prev[0],
          { ...prev[1], checked: true },
          prev[2],
        ]);
      }, 3000)
    );
    timers.push(
      setTimeout(() => {
        setLocalChecklist((prev) => [
          prev[0],
          prev[1],
          { ...prev[2], checked: true },
        ]);
      }, 6000)
    );
    timers.push(
      setTimeout(() => {
        setShowChecklist(false);
      }, 7000)
    );
    return () => timers.forEach(clearTimeout);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    setAnimate(true);
    const timeout = setTimeout(() => setAnimate(false), 400);
    return () => clearTimeout(timeout);
  }, [tipIndex, open]);

  if (!open) return null;
  return (
    <div className={`interview-modal-backdrop ${className}`}>
      <div className="interview-modal-content">
        <div className="interview-modal-header">
          Interview Starting Soon
          <div className="interview-modal-subheader">
            Please wait while we connect you with your interviewer
          </div>
        </div>
        <div className="interview-modal-body">
          <div className="interview-modal-connecting">
            <span className="interview-modal-dot" aria-label="loading" />
            <span className="interview-modal-connecting-text">
              Connecting to interviewer
            </span>
          </div>
          <div className="interview-modal-tip">
            <span className={animate ? "slide-up" : ""}>{tips[tipIndex]}</span>
          </div>
          {showChecklist && (
            <div className="interview-modal-checklist">
              <div className="interview-modal-checklist-title">
                <span role="img" aria-label="note">
                  📝
                </span>
                Pre-interview Checklist
              </div>
              <ul>
                {localChecklist.map((item, idx) => (
                  <li
                    key={idx}
                    className={item.checked ? "checked" : ""}
                  >
                    <span
                      className={item.checked ? "checkmark-circle" : "circle"}
                    >
                      {item.checked ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden
                        >
                          <circle cx="10" cy="10" r="10" fill={MODAL_CHECK_BG} />
                          <path
                            d="M6 10.5L9 13.5L14 8.5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <span className="interview-modal-checklist-label">{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .interview-modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(255,255,255,0.8);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          box-sizing: border-box;
        }
        .interview-modal-content {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          padding-bottom: 24px;
          width: 100%;
          max-width: min(512px, calc(100vw - 32px));
          display: flex;
          flex-direction: column;
          align-items: stretch;
          box-sizing: border-box;
          overflow: hidden;
        }
        .interview-modal-connecting-text {
          font-size: clamp(0.95rem, 2.2vw, 1.15rem);
          font-weight: 700;
          color: #111827;
          line-height: 1.3;
        }
        .interview-modal-header {
          font-size: clamp(1.25rem, 3.5vw, 1.75rem);
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.02em;
          background: ${MODAL_ACCENT};
          width: 100%;
          text-align: center;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
          padding: 20px 16px 8px 16px;
          margin: 0;
          box-sizing: border-box;
        }
        .interview-modal-body {
          width: 100%;
          max-width: 100%;
          padding: 0 20px 8px 20px;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          box-sizing: border-box;
        }
        .interview-modal-subheader {
          color: #ffffff;
          font-size: clamp(0.8125rem, 2vw, 1rem);
          font-weight: 400;
          margin: 10px 0 20px 0;
          text-align: center;
          line-height: 1.45;
          max-width: 100%;
          padding: 0 8px;
          box-sizing: border-box;
        }
        .interview-modal-connecting {
          display: flex;
          align-items: center;
          font-size: clamp(0.95rem, 2.2vw, 1.05rem);
          font-weight: 500;
          margin-bottom: 16px;
          margin-top: 16px;
          min-width: 0;
        }
        .interview-modal-dot {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          display: inline-block;
          border-radius: 50%;
          border: 3px solid #e5e7eb;
          border-top: 3px solid ${MODAL_ACCENT};
          animation: spin 0.8s linear infinite;
          margin-right: 12px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .interview-modal-tip {
          box-sizing: border-box;
          background: #f9fafc;
          color: #4b5563;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: clamp(0.875rem, 2vw, 0.98rem);
          text-align: center;
          min-height: 52px;
          width: 100%;
          max-width: 100%;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: none;
          border-left: 4px solid ${MODAL_ACCENT};
          line-height: 1.45;
          word-wrap: break-word;
          overflow-wrap: anywhere;
        }
        .interview-modal-tip .slide-up {
          animation: slideUpFade 0.4s cubic-bezier(0.4,0,0.2,1);
          display: inline-block;
        }
        @keyframes slideUpFade {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .interview-modal-checklist {
          background: #f0fdf9;
          border: 1px solid #d1fae5;
          border-radius: 12px;
          padding: 16px 14px 12px 14px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        .interview-modal-checklist-title {
          font-weight: 600;
          font-size: clamp(0.95rem, 2.2vw, 1.1rem);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
          color: #064e3b;
          flex-wrap: wrap;
        }
        .interview-modal-checklist ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .interview-modal-checklist li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: clamp(0.875rem, 2vw, 1rem);
          color: #4b5563;
          margin-bottom: 10px;
          min-width: 0;
        }
        .interview-modal-checklist li:last-child {
          margin-bottom: 0;
        }
        .interview-modal-checklist li.checked {
          color: ${MODAL_ACCENT};
          font-weight: 600;
        }
        .interview-modal-checklist-label {
          flex: 1;
          min-width: 0;
          line-height: 1.45;
          word-wrap: break-word;
          overflow-wrap: break-word;
          padding-top: 2px;
        }
        .checkmark {
          display: none;
        }
        .circle {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          min-width: 24px;
          min-height: 24px;
          border-radius: 50%;
          background: ${MODAL_PENDING_INNER};
          color: ${MODAL_PENDING_RING};
          border: 2px solid ${MODAL_PENDING_RING};
          font-weight: 700;
          font-size: 0.75rem;
          box-sizing: border-box;
        }
        .checkmark-circle {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          min-width: 24px;
          min-height: 24px;
          border-radius: 50%;
          background: transparent;
          margin: 0;
          box-sizing: border-box;
        }
        .checkmark-circle svg {
          display: block;
        }
      `}</style>
    </div>
  );
};

export default InterviewStartingModal;

