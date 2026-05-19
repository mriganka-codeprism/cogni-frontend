import styles from "./SuspiciousFrameModal.module.css";

// SVG imports
import HeaderSVG from "../../../assets/images/Header.svg";
import ClockSVG from "../../../assets/images/clock.svg";
import FileSVG from "../../../assets/images/file.svg";

interface SuspiciousFrameModalProps {
  open: boolean;
  image: string;
  reason: string;
  timestamp: number;
  onClose: () => void;
  current: number;
  total: number;
}

export default function SuspiciousFrameModal({
  open,
  image,
  reason,
  timestamp,
  onClose,
  current,
  total,
}: SuspiciousFrameModalProps) {
  if (!open) return null;
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <img src={HeaderSVG} alt="Header" className={styles.icon} />
            <div>
              <div className={styles.title}>Proctoring Alert Review</div>
              <div className={styles.subtitle}>{reason}</div>
            </div>
          </div>

          {/* Screenshot Section */}
          <div className={styles.screenshotSection}>
            <div className={styles.screenshotWrapper}>
              <img
                src={image}
                alt="Alert Screenshot"
                className={styles.screenshot}
              />
            </div>
          </div>

          {/* Alert Details */}
          <div className={styles.alertDetailsTitle}>Alert Details</div>
          <div className={styles.detailsSection}>
            <div className={styles.detailsColumn}>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Reason:</div>
                <div className={styles.detailValue}>{reason}</div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Timestamp:</div>
                <div className={styles.detailValue}>
                  {timestamp?.toFixed(2)}s
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Duration:</div>
                <div className={styles.detailValue}>5s</div>
              </div>
              {/* You can add more details here if needed */}
            </div>
          </div>

          <div className={styles.infoBox}>
            <img src={FileSVG} alt="Type" className={styles.detailIcon} />
            Final evaluation decisions can be made in the Interview Assessment
            tab.
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <div className={styles.footerLeft}>
              <img
                src={ClockSVG}
                alt="Timestamp"
                className={styles.detailIcon}
              />
              <span>{`Alert ${current} of ${total}`}</span>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
