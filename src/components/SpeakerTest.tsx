import React, { useEffect, useRef, useState, useCallback } from "react";
import { Box, Typography, Button, Chip, Tooltip } from "@mui/material";
import { CheckCircleOutline, ErrorOutline, VolumeUpOutlined, Refresh, InfoOutlined } from "@mui/icons-material";

interface SpeakerTestProps {
    onPass: () => void;
    onFail: () => void;
    isEnabled?: boolean;
}

function SpeakerWaveform({ active, isCompleted = false, isStarted = false, height = 24 }: { active: boolean; isCompleted?: boolean; isStarted?: boolean; height?: number }) {
    // Using the exact sequence extracted from the user's reference image
    const pattern = [0.9, 0.6, 0.2, 0.6, 0.9];
    const bars = 65;
    const barWidth = 2.5;
    const gap = 3.5;
    const totalWidth = bars * (barWidth + gap);

    const playTimeRef = useRef<number>(0);
    const stateRef = useRef({ isStarted, isCompleted });
    const [, force] = useState(0);

    useEffect(() => {
        stateRef.current = { isStarted, isCompleted };
    }, [isStarted, isCompleted]);

    useEffect(() => {
        let raf = 0;
        const loop = () => {
            if (stateRef.current.isStarted && !stateRef.current.isCompleted) {
                playTimeRef.current += 1;
            }
            force((x) => (x + 1) % 100000);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    const effectiveT = playTimeRef.current;

    const fill = "#0B6B63";
    const bg = "#FCFCFC";
    const border = "rgba(139, 139, 139, 0.15)";
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    return (
        <Box
            sx={{
                width: "100%",
                border: `1px solid ${border}`,
                background: bg,
                borderRadius: "16px",
                padding: "8px 16px",
                display: "flex",
                alignItems: "center"
            }}
        >
            <svg width="100%" height={height} viewBox={`0 0 ${totalWidth} ${height}`} preserveAspectRatio="none">
                {Array.from({ length: bars }).map((_, i) => {

                    const baseAmp = pattern[i % pattern.length];

                    // Small variation baseline like before
                    const base =
                        0.15 +
                        0.05 * Math.sin((effectiveT / 12) + i * 0.6) +
                        0.02 * Math.sin((effectiveT / 18) + i * 1.1);

                    // When active, move (reduced speed by increasing divisor from 3 to 10)
                    const motion = active
                        ? (0.4 + 0.6 * Math.sin((effectiveT / 10) + i * 0.5))
                        : 0;

                    const amp = active
                        ? clamp(base + baseAmp * motion * 0.9, 0.1, 1.0)
                        : clamp(base, 0.1, 0.3);

                    let barH = Math.max(amp * height, barWidth);
                    if (barH < barWidth + 1) barH = barWidth;

                    const x = i * (barWidth + gap);
                    const y = (height - barH) / 2;

                    return (
                        <rect
                            key={i}
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barH}
                            rx={barWidth / 2}
                            fill={isCompleted || !isStarted ? "#D1D5DB" : fill}
                            opacity={1} // use color instead of opacity for dimming
                        />
                    );
                })}
            </svg>
        </Box>
    );
}

const SpeakerTest: React.FC<SpeakerTestProps> = ({ onPass, onFail, isEnabled = true }) => {
    const [status, setStatus] = useState<"idle" | "playing" | "asking" | "pass" | "fail">("idle");
    const [isStarted, setIsStarted] = useState<boolean>(false);

    const safeTimeoutRef = useRef<number | null>(null);

    const playVoice = useCallback(() => {
        setStatus("playing");

        const utterance = new SpeechSynthesisUtterance("Hello there... Can you hear me?");
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
            (v) => v.lang.includes("en") && (v.name.includes("Female") || v.name.includes("Google US English"))
        );
        if (preferredVoice) utterance.voice = preferredVoice;

        if (safeTimeoutRef.current) window.clearTimeout(safeTimeoutRef.current);
        safeTimeoutRef.current = window.setTimeout(() => {
            setStatus("asking");
        }, 3500);

        utterance.onend = () => {
            if (safeTimeoutRef.current) window.clearTimeout(safeTimeoutRef.current);
            safeTimeoutRef.current = null;
            setStatus("asking");
        };

        window.speechSynthesis.cancel(); // cancel any previous queued utterances
        window.speechSynthesis.speak(utterance);
    }, []);

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            if (safeTimeoutRef.current) window.clearTimeout(safeTimeoutRef.current);
            safeTimeoutRef.current = null;
        };
    }, []);

    const handleYes = () => {
        setStatus("pass");
        onPass();
    };

    const handleNo = () => {
        setStatus("fail");
        onFail();
    };

    const handleRetry = () => {
        setStatus("idle");
        playVoice();
    };

    const handleManualStart = () => {
        setIsStarted(true);
        playVoice();
    };

    return (
        <Box sx={{ width: "100%", opacity: isEnabled ? 1 : 0.4, pointerEvents: isEnabled ? "auto" : "none" }}>
            {/* Header row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <VolumeUpOutlined sx={{ color: "#6B7280", fontSize: 18 }} />
                <Typography sx={{ fontWeight: 400, color: "#4B5563", fontSize: 14 }}>Speaker Test</Typography>

                {status === "fail" && (
                    <Tooltip
                        title={
                            <Box sx={{ py: 0.5, pl: 1, pr: 7 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: 12, mb: 1, color: "#0B6B63" }}>Troubleshooting Tips:</Typography>
                                <Box component="ul" sx={{ m: 0, pl: 2, fontSize: 10, color: "#111827", display: "flex", flexDirection: "column", gap: 0.3 }}>
                                    <li>Unmute system volume</li>
                                    <li>Check output device</li>
                                    <li>Increase volume</li>
                                    <li>Disconnect headphones</li>
                                </Box>
                            </Box>
                        }
                        arrow
                        placement="top"
                        componentsProps={{
                            tooltip: {
                                sx: {
                                    bgcolor: "#FFFFFF",
                                    borderRadius: "6px",
                                    border: "1px solid rgba(139, 139, 139, 0.30)",
                                    boxShadow: "1px 1px 15px 0 rgba(139, 139, 139, 0.09)",
                                }
                            },
                            arrow: {
                                sx: {
                                    color: "#FFFFFF",
                                    "&::before": {
                                        border: "1px solid rgba(139, 139, 139, 0.30)",
                                    }
                                }
                            }
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                            <InfoOutlined sx={{ color: "#B42318", fontSize: 16 }} />
                            <Typography sx={{ color: "#B42318", fontSize: 12, fontWeight: 500, ml: 0.3 }}>Info</Typography>
                        </Box>
                    </Tooltip>
                )}
            </Box>

            {/* Visualizer */}
            <SpeakerWaveform
                active={status === "playing"}
                isCompleted={status === "asking" || status === "pass" || status === "fail"}
                isStarted={isStarted}
            />

            {/* Actions */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5, height: "24px" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    {!isStarted ? (
                        <Button
                            variant="text"
                            onClick={handleManualStart}
                            endIcon={<Typography component="span" sx={{ fontSize: 14 }}>&gt;</Typography>}
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: 13,
                                color: "#0B6B63",
                                p: 0,
                                "&:hover": { bgcolor: "transparent" },
                                "&:hover .hover-underline": { textDecoration: "underline" },
                            }}
                        >
                            <span className="hover-underline">Start Speaker Test</span>
                        </Button>
                    ) : status === "playing" ? (
                        <Typography sx={{ color: "#0B6B63", fontWeight: 600, fontSize: 12 }}>
                            Playing...
                        </Typography>
                    ) : status === "fail" || status === "asking" ? (
                        <Button
                            variant="text"
                            onClick={handleRetry}
                            endIcon={<Typography component="span" sx={{ fontSize: 14 }}>&gt;</Typography>}
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: 13,
                                color: "#0B6B63",
                                p: 0,
                                "&:hover": { bgcolor: "transparent" },
                                "&:hover .hover-underline": { textDecoration: "underline" },
                            }}
                        >
                            <span className="hover-underline">Try again</span>
                        </Button>
                    ) : (
                        <Box />
                    )}
                </Box>
                <Box>
                    {status === "pass" && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <CheckCircleOutline sx={{ color: "#0B6B63", fontSize: 16 }} />
                            <Typography sx={{ color: "#0B6B63", fontWeight: 700, fontSize: 12 }}>
                                Verified
                            </Typography>
                        </Box>
                    )}
                    {status === "fail" && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <ErrorOutline sx={{ color: "#B42318", fontSize: 16 }} />
                            <Typography sx={{ color: "#B42318", fontWeight: 700, fontSize: 12 }}>
                                Verification Failed
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Asking */}
            {status === "asking" && (
                <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#1F2937" }}>
                        Did you hear the voice
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={handleYes}
                        sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            bgcolor: "#0B6B63",
                            color: "#fff",
                            borderRadius: 999,
                            px: 2,
                            py: 0.3,
                            minWidth: 60,
                            fontSize: 12,
                            "&:hover": { bgcolor: "#08534E" },
                        }}
                    >
                        YES
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={handleNo}
                        sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            color: "#0B6B63",
                            borderColor: "#0B6B63",
                            borderRadius: 999,
                            px: 2,
                            py: 0.3,
                            minWidth: 60,
                            fontSize: 12,
                            "&:hover": { borderColor: "#08534E", color: "#08534E" },
                        }}
                    >
                        NO
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default SpeakerTest;