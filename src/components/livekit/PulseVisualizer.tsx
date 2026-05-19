import React, { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { RemoteAudioTrack } from "livekit-client";

interface PulseVisualizerProps {
  audioTrack?: RemoteAudioTrack;
  mediaElement?: HTMLMediaElement | null;
  width?: string;
  height?: string;

  /**
   * - "auto": uses audio level to decide speaking vs idle
   * - "listening"/"thinking": idle style
   * - "speaking": audio-reactive waveform bars
   */
  mode?: "auto" | "listening" | "thinking" | "speaking";
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

type UIMode = "listening" | "speaking";

export const PulseVisualizer: React.FC<PulseVisualizerProps> = ({
  audioTrack,
  mediaElement,
  width = "100%",
  height = "100%",
  mode = "auto",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode>();
  const audioContextRef = useRef<AudioContext>();
  const sourceRef = useRef<MediaStreamAudioSourceNode>();
  const mediaElementSourceRef = useRef<MediaElementAudioSourceNode>();

  // speaking detection smoothing
  const rmsSmoothRef = useRef<number>(0);
  const speakingHoldRef = useRef<number>(0);

  // bar smoothing
  const smoothBarsRef = useRef<number[]>([]);

  // UI mode for icon + palette (mic when listening, speaker when speaking)
  const [uiMode, setUiMode] = useState<UIMode>("listening");
  const uiModeRef = useRef<UIMode>("listening");

  // ---- palette to match the screenshots ----
  const COLORS = useMemo(
    () => ({
      bg: "#ffffff",
      border: "#E7ECEB",
      shadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
      grey: "#C8D1CF",
      greySoft: "#DEE5E3",

      // listening (green)
      green: "#3E6F62",
      greenSoft: "#6E9A8B",

      // speaking (dark red)
      red: "#8A3B34",
      redSoft: "#B67B75",
    }),
    []
  );

  const UI = useMemo(
    () => ({
      // central button
      centerSize: 140,
      centerTop: "40%",

      // rings
      ringInset: -18,
      glowInset: -40,

      // waveform region
      waveAreaHeightRatio: 0.28,
      wavePadX: 28,
      wavePadBottom: 22,

      // bars
      barWidth: 3,
      barGap: 3,
      minBarH: 2.5,
      maxBarH: 18,

      // speaking detection
      speakOn: 0.03,
      speakOff: 0.018,
      holdFrames: 10,
    }),
    []
  );

  const setupCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  useEffect(() => {
    setupCanvasSize();
    const ro = new ResizeObserver(() => setupCanvasSize());
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", setupCanvasSize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setupCanvasSize);
    };
  }, [setupCanvasSize]);

  const getPaletteFor = useCallback(
    (m: UIMode) => {
      const primary = m === "speaking" ? COLORS.red : COLORS.green;
      const primarySoft = m === "speaking" ? COLORS.redSoft : COLORS.greenSoft;
      return { primary, primarySoft };
    },
    [COLORS.green, COLORS.greenSoft, COLORS.red, COLORS.redSoft]
  );

  const drawIdle = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, which: UIMode) => {
      ctx.clearRect(0, 0, w, h);

      const { primary, primarySoft } = getPaletteFor(which);

      const waveAreaH = h * UI.waveAreaHeightRatio;
      const padX = UI.wavePadX;
      const padB = UI.wavePadBottom;

      const usableW = Math.max(1, w - padX * 2);
      const barW = UI.barWidth;
      const gap = UI.barGap;

      const count = Math.max(22, Math.floor((usableW + gap) / (barW + gap)));
      const baselineY = h - padB - waveAreaH * 0.35;

      const totalW = count * barW + (count - 1) * gap;
      let x = padX + (usableW - totalW) / 2;

      const t = performance.now() / 1000;
      const blink = (Math.sin(t * 2.2) + 1) / 2;

      const pCol = primarySoft;
      const gCol = COLORS.greySoft;

      const pick = (i: number) => {
        const mid = (count - 1) / 2;
        const d = Math.abs(i - mid) / mid;
        const centerBoost = 1 - clamp(d, 0, 1);
        const prob = clamp(0.15 + centerBoost * 0.55, 0, 0.75);
        const phase = (i % 6) / 6;
        const p = clamp(prob * 0.7 + phase * 0.15 + blink * 0.35, 0, 1);
        return p > 0.55 ? pCol : gCol;
      };

      const hBar = Math.max(6, Math.min(10, waveAreaH * 0.22));
      const topY = baselineY - hBar / 2;
      const radius = Math.max(1.5, barW / 2);

      ctx.globalAlpha = 1;
      for (let i = 0; i < count; i++) {
        ctx.fillStyle = pick(i);
        ctx.beginPath();
        // @ts-ignore
        ctx.roundRect(x, topY, barW, hBar, radius);
        ctx.fill();
        x += barW + gap;
      }

      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = primary;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(padX, baselineY);
      ctx.lineTo(w - padX, baselineY);
      ctx.stroke();
      ctx.globalAlpha = 1;
    },
    [
      COLORS.greySoft,
      UI.barGap,
      UI.barWidth,
      UI.waveAreaHeightRatio,
      UI.wavePadBottom,
      UI.wavePadX,
      getPaletteFor,
    ]
  );

  const drawSpeaking = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, bars: number[], which: UIMode) => {
      ctx.clearRect(0, 0, w, h);

      const { primary } = getPaletteFor(which);

      const waveAreaH = h * UI.waveAreaHeightRatio;
      const padX = UI.wavePadX;
      const padB = UI.wavePadBottom;

      const usableW = Math.max(1, w - padX * 2);
      const barW = UI.barWidth;
      const gap = UI.barGap;

      const count = Math.max(20, Math.floor((usableW + gap) / (barW + gap)));
      const centerY = h - padB - waveAreaH * 0.35;

      const maxH = Math.min(UI.maxBarH, waveAreaH * 0.52);
      const minH = UI.minBarH;

      const half = Math.floor(count / 2);
      const values: number[] = new Array(count).fill(0);

      for (let i = 0; i < half; i++) {
        const v = bars[i] ?? 0;
        values[half - 1 - i] = v;
        values[half + i] = v;
      }
      if (count % 2 === 1) values[half] = bars[0] ?? 0;

      const totalW = count * barW + (count - 1) * gap;
      let x = padX + (usableW - totalW) / 2;

      for (let i = 0; i < count; i++) {
        const amp = clamp(values[i], 0, 1);
        const hBar = minH + amp * maxH;

        const topY = centerY - hBar / 2;
        const radius = Math.max(1.5, barW / 2);

        const strong = amp > 0.16;
        ctx.fillStyle = strong ? primary : COLORS.greySoft;

        ctx.beginPath();
        // @ts-ignore
        ctx.roundRect(x, topY, barW, hBar, radius);
        ctx.fill();

        x += barW + gap;
      }
    },
    [
      COLORS.greySoft,
      UI.barGap,
      UI.barWidth,
      UI.maxBarH,
      UI.minBarH,
      UI.waveAreaHeightRatio,
      UI.wavePadBottom,
      UI.wavePadX,
      getPaletteFor,
    ]
  );

  useEffect(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = undefined;

    const cleanupAudio = () => {
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch { }
      }
      if (mediaElementSourceRef.current && analyserRef.current) {
        try {
          mediaElementSourceRef.current.disconnect(analyserRef.current);
        } catch { }
      }
      analyserRef.current = undefined;
      mediaElementSourceRef.current = undefined;
      sourceRef.current = undefined;
      audioContextRef.current = undefined;
    };

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const getWH = () => {
      const rect = wrap.getBoundingClientRect();
      return { w: rect.width, h: rect.height };
    };

    const setModeIfChanged = (next: UIMode) => {
      if (uiModeRef.current !== next) {
        uiModeRef.current = next;
        setUiMode(next);
      }
    };

    if (!audioTrack?.mediaStreamTrack && !mediaElement) {
      setModeIfChanged(mode === "speaking" ? "speaking" : "listening");
      const loopIdle = () => {
        const { w, h } = getWH();
        const forced: UIMode = mode === "speaking" ? "speaking" : "listening";
        drawIdle(ctx, w, h, forced);
        animationRef.current = requestAnimationFrame(loopIdle);
      };
      loopIdle();
      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }

    const audioContext = (window as any).__sharedAudioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
    (window as any).__sharedAudioContext = audioContext;
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.55;
    analyserRef.current = analyser;

    if (audioTrack?.mediaStreamTrack) {
      const stream = new MediaStream([audioTrack.mediaStreamTrack]);
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;
    } else if (mediaElement) {
      try {
        if (!(mediaElement as any).__sourceNode) {
          const source = audioContext.createMediaElementSource(mediaElement);
          (mediaElement as any).__sourceNode = source;
          source.connect(audioContext.destination);
        }
        const source = (mediaElement as any).__sourceNode;
        mediaElementSourceRef.current = source;
        source.connect(analyser);
      } catch (err) {
        console.warn("Could not create media element source", err);
      }
    }

    const tryResume = async () => {
      try {
        if (audioContextRef.current?.state === "suspended") {
          await audioContextRef.current.resume();
        }
      } catch { }
    };
    tryResume();

    const timeData = new Uint8Array(analyser.fftSize);
    const freqData = new Uint8Array(analyser.frequencyBinCount);

    const halfBarsTarget = 50;
    smoothBarsRef.current = new Array(halfBarsTarget).fill(0);

    const readHalfBars = () => {
      analyser.getByteFrequencyData(freqData);

      const n = freqData.length;
      const start = Math.floor(n * 0.03);
      const end = Math.floor(n * 0.40);
      const span = Math.max(1, end - start);

      const out = new Array(halfBarsTarget).fill(0);

      for (let b = 0; b < halfBarsTarget; b++) {
        const s = start + Math.floor((span * b) / halfBarsTarget);
        const e = start + Math.floor((span * (b + 1)) / halfBarsTarget);
        let sum = 0;
        let count = 0;
        for (let i = s; i < e; i++) {
          sum += freqData[i];
          count++;
        }
        const avg = count ? sum / count : 0;
        const norm = clamp(avg / 255, 0, 1);
        out[b] = Math.pow(norm, 0.85);
      }

      for (let i = 0; i < halfBarsTarget; i++) {
        smoothBarsRef.current[i] = smoothBarsRef.current[i] * 0.72 + out[i] * 0.28;
      }

      for (let i = 0; i < halfBarsTarget; i++) {
        smoothBarsRef.current[i] = clamp(smoothBarsRef.current[i] * 1.15 + 0.02, 0, 1);
      }

      return smoothBarsRef.current;
    };

    const loop = () => {
      const { w, h } = getWH();

      analyser.getByteTimeDomainData(timeData);
      let sumSq = 0;
      for (let i = 0; i < timeData.length; i++) {
        const v = (timeData[i] - 128) / 128;
        sumSq += v * v;
      }
      const rms = Math.sqrt(sumSq / timeData.length);
      rmsSmoothRef.current = rmsSmoothRef.current * 0.86 + rms * 0.14;

      if (rmsSmoothRef.current >= UI.speakOn) speakingHoldRef.current = UI.holdFrames;
      else if (rmsSmoothRef.current <= UI.speakOff)
        speakingHoldRef.current = Math.max(0, speakingHoldRef.current - 1);
      else speakingHoldRef.current = Math.max(0, speakingHoldRef.current - 1);

      const autoSpeaking = speakingHoldRef.current > 0;

      const effectiveMode: UIMode =
        mode === "speaking"
          ? "speaking"
          : mode === "listening" || mode === "thinking"
            ? "listening"
            : autoSpeaking
              ? "speaking"
              : "listening";

      setModeIfChanged(effectiveMode);

      if (effectiveMode === "listening") {
        drawIdle(ctx, w, h, "listening");
      } else {
        const bars = readHalfBars();
        drawSpeaking(ctx, w, h, bars, "speaking");
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    loop();

    const onVis = () => {
      if (document.visibilityState === "visible") tryResume();
    };
    document.addEventListener("visibilitychange", onVis);

    const onUserGesture = () => tryResume();
    wrap.addEventListener("pointerdown", onUserGesture);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      wrap.removeEventListener("pointerdown", onUserGesture);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      cleanupAudio();
      rmsSmoothRef.current = 0;
      speakingHoldRef.current = 0;
      smoothBarsRef.current = [];
    };
  }, [audioTrack, mediaElement, drawIdle, drawSpeaking, mode, UI.holdFrames, UI.speakOff, UI.speakOn]);

  const { primary, primarySoft } = getPaletteFor(uiMode);

  return (
    <div
      ref={wrapRef}
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        borderRadius: 14,
        border: `1px solid ${COLORS.border}`,
        background: "#ffffff",
        boxShadow: COLORS.shadow,
      }}
    >
      {/* Center icon + rings */}
      <div
        style={{
          position: "absolute",
          top: UI.centerTop,
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: UI.centerSize,
          height: UI.centerSize,
          pointerEvents: "none",
        }}
      >
        {/* Outer soft glow */}
        <div
          style={{
            position: "absolute",
            inset: UI.glowInset,
            borderRadius: "50%",
            background: `radial-gradient(circle at center, ${primary}1A, ${primary}12 35%, ${primary}00 70%)`,
            filter: "blur(0.2px)",
          }}
        />

        {/* Thin ring */}
        <div
          style={{
            position: "absolute",
            inset: UI.ringInset,
            borderRadius: "50%",
            border: `2px solid ${primary}20`,
            filter: "blur(0.3px)",
          }}
        />

        {/* Main white button */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            border: `1.5px solid ${primary}55`,
            display: "grid",
            placeItems: "center",
            boxShadow: "0 18px 30px rgba(15, 23, 42, 0.08)",
          }}
        >
          {uiMode === "speaking" ? (
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M11 5 6.5 8.5H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2.5L11 19V5Z"
                stroke={primary}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                d="M15.5 8.5a4 4 0 0 1 0 7"
                stroke={primary}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M18 6.7a7 7 0 0 1 0 10.6"
                stroke={primarySoft}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 14a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3Z"
                stroke={primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 11a7 7 0 0 1-14 0"
                stroke={primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 18v3"
                stroke={primarySoft}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 21h8"
                stroke={primarySoft}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Waveform canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
};
