import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Box, Typography, Button, Chip, Tooltip } from "@mui/material";
import { CheckCircleOutline, ErrorOutline, MicOutlined, Refresh, InfoOutlined } from "@mui/icons-material";
import { globalStyles } from "../config";

interface MicrophoneTestProps {
    audioStream: MediaStream | null;
    onPass: () => void;
    onFail: () => void;
    permissionGranted: boolean;
}

type MicStatus = "idle" | "listening" | "detected" | "pass" | "fail";

function WaveformBars({
    active,
    intensity,
    isCompleted = false,
    isStarted = false,
    height = 24, // slightly taller for better pills
}: {
    active: boolean;
    intensity: number; // 0..1
    isCompleted?: boolean;
    isStarted?: boolean;
    height?: number;
}) {
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

    const fill = "#0B6B63"; // exact color from image
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

                    // When active, bars bounce based on the pattern and intensity
                    const motion = active
                        ? (0.4 + 0.6 * Math.sin((effectiveT / 10) + i * 0.5))
                        : 0;

                    const amp = active
                        ? clamp(base + baseAmp * motion * clamp(intensity, 0.3, 1), 0.1, 1.0)
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

const MicrophoneTest: React.FC<MicrophoneTestProps> = ({
    audioStream,
    onPass,
    onFail,
    permissionGranted,
}) => {
    const [status, setStatus] = useState<MicStatus>("idle");
    const [timeLeft, setTimeLeft] = useState<number>(10);
    const [audioLevel, setAudioLevel] = useState<number>(0);
    const [isStarted, setIsStarted] = useState<boolean>(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const consecutiveSpeechFrames = useRef<number>(0);
    const isAnalyzingRef = useRef<boolean>(false);

    // VAD Thresholds (keep same behavior)
    const SPEAKING_THRESHOLD = 0.06;
    const FRAMES_TO_PASS = 5;

    const cleanupAudio = useCallback(() => {
        isAnalyzingRef.current = false;

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current as any);
            timerRef.current = null;
        }

        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }

        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
            audioContextRef.current.close().catch(console.error);
            audioContextRef.current = null;
        }

        analyserRef.current = null;
    }, []);

    const handleVoiceDetected = useCallback(() => {
        setStatus("detected");
        cleanupAudio();

        setTimeout(() => {
            setStatus("pass");
            onPass();
        }, 1500);
    }, [cleanupAudio, onPass]);

    const handleFail = useCallback(() => {
        setStatus("fail");
        cleanupAudio();
        onFail();
    }, [cleanupAudio, onFail]);

    const startListening = useCallback(() => {
        if (!audioStream || !permissionGranted) return;

        setStatus("listening");
        setTimeLeft(10);
        setAudioLevel(0);
        consecutiveSpeechFrames.current = 0;
        isAnalyzingRef.current = true;

        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass();
            audioContextRef.current = audioContext;

            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            analyserRef.current = analyser;

            const source = audioContext.createMediaStreamSource(audioStream);
            source.connect(analyser);
            sourceRef.current = source;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const analyze = () => {
                if (!isAnalyzingRef.current) return;

                analyser.getByteTimeDomainData(dataArray);

                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const x = (dataArray[i] - 128) / 128.0;
                    sum += x * x;
                }
                const rms = Math.sqrt(sum / bufferLength);
                setAudioLevel(rms);

                if (rms > SPEAKING_THRESHOLD) {
                    consecutiveSpeechFrames.current += 1;
                } else {
                    consecutiveSpeechFrames.current = 0;
                }

                if (consecutiveSpeechFrames.current >= FRAMES_TO_PASS) {
                    handleVoiceDetected();
                    return;
                }

                animationFrameRef.current = requestAnimationFrame(analyze);
            };

            analyze();

            if (timerRef.current) clearInterval(timerRef.current as any);
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 0.1) {
                        clearInterval(timerRef.current as any);
                        timerRef.current = null;
                        handleFail();
                        return 0;
                    }
                    return prev - 0.1;
                });
            }, 100);
        } catch (error) {
            console.error("Error initializing audio analysis:", error);
            handleFail();
        }
    }, [audioStream, permissionGranted, handleVoiceDetected, handleFail]);

    useEffect(() => {
        if (permissionGranted && audioStream && status === "idle" && isStarted) {
            startListening();
        }

        return () => {
            cleanupAudio();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioStream, permissionGranted, isStarted]);

    const handleRetry = () => {
        if (timerRef.current) clearInterval(timerRef.current as any);
        startListening();
    };

    const handleManualStart = () => setIsStarted(true);

    const isVoiceActive = useMemo(() => {
        // “active” visual: when rms suggests voice or when detected/pass
        if (status === "detected" || status === "pass") return true;
        return status === "listening" && audioLevel > SPEAKING_THRESHOLD;
    }, [status, audioLevel]);

    // Normalize intensity from audioLevel (kept simple)
    const intensity = useMemo(() => {
        const v = (audioLevel - SPEAKING_THRESHOLD) / 0.2; // rough scale
        return Math.max(0, Math.min(1, v));
    }, [audioLevel]);

    if (!permissionGranted) return null;

    return (
        <Box sx={{ width: "100%" }}>
            {/* Header row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <MicOutlined sx={{ color: "#6B7280", fontSize: 18 }} />
                <Typography sx={{ fontWeight: 400, color: "#4B5563", fontSize: 14 }}>Microphone Test</Typography>

                {status === "fail" && (
                    <Tooltip
                        title={
                            <Box sx={{ py: 0.5, pl: 1, pr: 7 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: 12, mb: 1, color: "#0B6B63" }}>Troubleshooting Tips:</Typography>
                                <Box component="ul" sx={{ m: 0, pl: 2, fontSize: 10, color: "#111827", display: "flex", flexDirection: "column", gap: 0.3 }}>
                                    <li>Check mic input</li>
                                    <li>Disable bluetooth device</li>
                                    <li>Unmute mic</li>
                                    <li>Reload page</li>
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

                {status === "listening" && (
                    <Typography sx={{ color: "#0B6B63", fontWeight: 600, fontSize: 11, ml: "auto" }}>
                        {Math.ceil(timeLeft)}s
                    </Typography>
                )}
            </Box>

            {/* Visualizer */}
            <WaveformBars active={isVoiceActive} intensity={intensity} isCompleted={status === "pass" || status === "fail"} isStarted={isStarted} />

            {/* Action row */}
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
                            <span className="hover-underline">Start Microphone Check</span>
                        </Button>
                    ) : status === "listening" ? (
                        <Typography sx={{ color: "#0B6B63", fontWeight: 600, fontSize: 12 }}>
                            Speak Something
                        </Typography>
                    ) : status === "fail" ? (
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
                    {(status === "detected" || status === "pass") && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <CheckCircleOutline sx={{ color: "#0B6B63", fontSize: 16 }} />
                            <Typography sx={{ color: "#0B6B63", fontWeight: 700, fontSize: 12 }}>
                                Voice Detected
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
        </Box>
    );
};

export default MicrophoneTest;