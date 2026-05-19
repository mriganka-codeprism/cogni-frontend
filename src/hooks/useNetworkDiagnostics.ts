import { useState, useCallback, useRef } from "react";
import {
  CheckStatus,
  DiagnosticCheck,
  DiagnosticCategory,
} from "../types/networkDiagnostics";

const API_URL = process.env.REACT_APP_API_URL || "";
const LIVEKIT_WS_URL = process.env.REACT_APP_LIVEKIT_WS_URL || "";

const SPEED_TEST_URL =
  process.env.REACT_APP_SPEED_TEST_URL ||
  "https://speed.cloudflare.com/__down?bytes=1048576"; // 1 MB

// --- Thresholds ---

const LATENCY_GREEN = 100;
const LATENCY_YELLOW = 200;
const LATENCY_RED = 500;

const JITTER_GREEN = 20;
const JITTER_YELLOW = 50;

const BANDWIDTH_GREEN = 10;
const BANDWIDTH_YELLOW = 5;

const WS_GREEN = 500;
const WS_YELLOW = 1000;
const WS_TIMEOUT = 5000;

const STUN_FAST = 2000;
const STUN_SLOW = 3000;
const STUN_TIMEOUT = 5000;

// --- Recommendations ---

const recommendations: Record<string, { fail: string; warn: string }> = {
  latency: {
    fail: "Network latency too high for real-time video. Check for proxy servers, VPN overhead, or congestion.",
    warn: "Latency is acceptable but may cause slight delays. Consider a wired connection.",
  },
  jitter: {
    fail: "Network jitter is too high. Audio/video will stutter. Check for network congestion or competing traffic.",
    warn: "Minor jitter detected. Video quality may fluctuate under load.",
  },
  bandwidth: {
    fail: "Internet speed below minimum. Need at least 5 Mbps download for video interviews.",
    warn: "Bandwidth is marginal. Close other streaming/download applications during interviews.",
  },
  networkType: {
    fail: "Very slow network detected (2G/slow-2G). Video interviews will not work. Use a faster connection.",
    warn: "3G network detected. Minimum 4G recommended for smooth video interviews.",
  },
  downloadSpeed: {
    fail: "Measured download speed is below 2 Mbps. Video streaming will not work reliably.",
    warn: "Download speed is marginal. Close other bandwidth-heavy applications during interviews.",
  },
  webrtc: {
    fail: "WebRTC is not supported in this browser. Video interviews require WebRTC. Use Chrome, Edge, or Firefox.",
    warn: "",
  },
  stun: {
    fail: "NAT traversal failed. Ask IT to allow outbound UDP on port 19302.",
    warn: "NAT traversal is slow. Video connection setup may be delayed.",
  },
  camera: {
    fail: "No camera found or permission denied. Connect a webcam and allow camera access in browser settings.",
    warn: "Camera detected but permission not yet granted. You will be prompted during the interview.",
  },
  microphone: {
    fail: "No microphone found or permission denied. Connect a mic and allow access in browser settings.",
    warn: "Microphone detected but permission not yet granted. You will be prompted during the interview.",
  },
  speaker: {
    fail: "No audio output device detected. Connect speakers or headphones to hear the AI interviewer.",
    warn: "",
  },
  browser: {
    fail: "Unsupported browser. Use Chrome 80+, Edge 80+, Firefox 75+, or Safari 14+.",
    warn: "Browser is supported but outdated. Update for the best experience.",
  },
  livekitWss: {
    fail: "Cannot reach video server. Ask IT to allow WSS on port 7882 and UDP 50000-60000.",
    warn: "Video server connection is slow. May cause delays during interview setup.",
  },
};

// --- Helper: sleep ---
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// --- Helper: build initial categories ---
function buildInitialCategories(): DiagnosticCategory[] {
  return [
    {
      id: "network",
      title: "Network Performance",
      checks: [
        {
          id: "latency",
          name: "API Latency",
          description: "Round-trip time to API server",
          status: "pending",
          impactedFeature: "All real-time features",
          thresholds: "Green: <100ms | Yellow: <500ms | Red: >500ms",
        },
        {
          id: "jitter",
          name: "Jitter",
          description: "Variation in latency between requests",
          status: "pending",
          impactedFeature: "Audio/video smoothness",
          thresholds: "Green: <20ms | Yellow: <50ms | Red: >100ms",
        },
        {
          id: "bandwidth",
          name: "Bandwidth Estimate (Browser)",
          description: "Rough browser estimate via Network Information API (often inaccurate)",
          status: "pending",
          impactedFeature: "Video streaming",
          thresholds: "Informational only — see Download Speed for measured result",
        },
        {
          id: "networkType",
          name: "Network Type",
          description: "Effective connection type reported by browser",
          status: "pending",
          impactedFeature: "Overall experience",
          thresholds: "Green: 4g | Yellow: 3g | Red: 2g / slow-2g",
        },
        {
          id: "downloadSpeed",
          name: "Download Speed",
          description: "Measured download speed via timed 1 MB fetch",
          status: "pending",
          impactedFeature: "Video, avatar loading",
          thresholds: "Green: >10 Mbps | Yellow: >5 Mbps | Red: <2 Mbps",
        },
      ],
    },
    {
      id: "browser",
      title: "Browser & Device Capabilities",
      checks: [
        {
          id: "webrtc",
          name: "WebRTC Support",
          description: "Browser support for real-time communication",
          status: "pending",
          impactedFeature: "Video interview",
          thresholds: "Green: Available | Red: Missing",
        },
        {
          id: "stun",
          name: "STUN / NAT Traversal",
          description: "Ability to establish peer connections through firewalls",
          status: "pending",
          impactedFeature: "Video behind NAT/firewall",
          thresholds: "Green: srflx <2s | Yellow: srflx <3s | Red: No srflx in 5s",
        },
        {
          id: "camera",
          name: "Camera",
          description: "Camera device availability and permissions",
          status: "pending",
          impactedFeature: "Video",
          thresholds: "Green: Granted + device(s) | Yellow: Device(s), no permission | Red: None / denied",
        },
        {
          id: "microphone",
          name: "Microphone",
          description: "Microphone device availability and permissions",
          status: "pending",
          impactedFeature: "Audio interview",
          thresholds: "Green: Granted + device(s) | Yellow: Device(s), no permission | Red: None / denied",
        },
        {
          id: "speaker",
          name: "Speaker",
          description: "Audio output device availability",
          status: "pending",
          impactedFeature: "Hearing AI interviewer",
          thresholds: "Green: 1+ device | Red: 0 devices",
        },
        {
          id: "browser",
          name: "Browser Compatibility",
          description: "Browser version meets minimum requirements",
          status: "pending",
          impactedFeature: "Everything",
          thresholds: "Green: Latest supported | Yellow: Supported but old | Red: Unsupported",
        },
      ],
    },
    {
      id: "connections",
      title: "Connection Checks",
      checks: [
        {
          id: "livekitWss",
          name: "LiveKit WSS",
          description: "WebSocket connection to video interview server",
          status: "pending",
          impactedFeature: "Interview signaling + video",
          thresholds: "Green: <500ms | Yellow: <1000ms | Red: Timeout / failed",
        },
      ],
    },
  ];
}

// --- Individual test functions ---

interface LatencyResult {
  avg: number;
  min: number;
  max: number;
  jitter: number;
  rtts: number[];
}

async function measureLatency(): Promise<LatencyResult> {
  const rtts: number[] = [];

  // Warmup request
  try {
    await fetch(API_URL, { method: "HEAD", cache: "no-store", mode: "no-cors" });
  } catch {
    // ignore warmup errors
  }

  for (let i = 0; i < 10; i++) {
    const start = performance.now();
    try {
      await fetch(API_URL, { method: "HEAD", cache: "no-store", mode: "no-cors" });
      rtts.push(performance.now() - start);
    } catch {
      rtts.push(-1); // mark failed
    }
    if (i < 9) await sleep(200);
  }

  const valid = rtts.filter((r) => r >= 0);
  if (valid.length === 0) {
    return { avg: -1, min: -1, max: -1, jitter: -1, rtts };
  }

  const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
  const min = Math.min(...valid);
  const max = Math.max(...valid);

  // Jitter: average of absolute consecutive deltas
  let jitterSum = 0;
  for (let i = 1; i < valid.length; i++) {
    jitterSum += Math.abs(valid[i] - valid[i - 1]);
  }
  const jitter = valid.length > 1 ? jitterSum / (valid.length - 1) : 0;

  return { avg, min, max, jitter, rtts };
}

interface BandwidthResult {
  downlink: number | null; // Mbps
  effectiveType: string | null;
  rtt: number | null;
  isEstimate: boolean;
}

function getBandwidthEstimate(): BandwidthResult {
  const conn = (navigator as any).connection;
  if (conn) {
    return {
      downlink: conn.downlink ?? null,
      effectiveType: conn.effectiveType ?? null,
      rtt: conn.rtt ?? null,
      isEstimate: true,
    };
  }
  return { downlink: null, effectiveType: null, rtt: null, isEstimate: false };
}

async function measureDownloadSpeed(): Promise<{
  speedMbps: number;
  durationMs: number;
  bytesTransferred: number;
  method: string;
}> {
  // Download a ~1 MB payload from SPEED_TEST_URL (default: Cloudflare speed
  // test endpoint which serves exact byte counts with CORS headers).
  // Cache-bust to avoid disk/CDN cache skewing the result.
  const url = SPEED_TEST_URL.includes("?")
    ? `${SPEED_TEST_URL}&_cb=${Date.now()}`
    : `${SPEED_TEST_URL}?_cb=${Date.now()}`;

  const start = performance.now();

  try {
    const response = await fetch(url, { cache: "no-store" });
    const buf = await response.arrayBuffer();
    const durationMs = performance.now() - start;
    const bytes = buf.byteLength;

    if (bytes > 0) {
      const speedMbps = (bytes * 8) / (durationMs / 1000) / 1_000_000;
      return { speedMbps, durationMs, bytesTransferred: bytes, method: "fetch" };
    }
  } catch {
    // fetch failed (CORS / network) — fall through to XHR
  }

  // Fallback: XHR (handles some edge cases fetch doesn't)
  try {
    const result = await new Promise<{
      speedMbps: number;
      durationMs: number;
      bytesTransferred: number;
      method: string;
    }>((resolve) => {
      const xhr = new XMLHttpRequest();
      const xhrStart = performance.now();

      xhr.open("GET", url, true);
      xhr.responseType = "arraybuffer";

      xhr.onload = () => {
        const dur = performance.now() - xhrStart;
        const bytes = xhr.response ? (xhr.response as ArrayBuffer).byteLength : 0;
        const speed = bytes > 0 ? (bytes * 8) / (dur / 1000) / 1_000_000 : 0;
        resolve({ speedMbps: speed, durationMs: dur, bytesTransferred: bytes, method: "xhr" });
      };

      xhr.onerror = () => {
        resolve({ speedMbps: 0, durationMs: performance.now() - xhrStart, bytesTransferred: 0, method: "xhr-failed" });
      };

      xhr.timeout = 15000;
      xhr.ontimeout = () => {
        resolve({ speedMbps: 0, durationMs: 15000, bytesTransferred: 0, method: "xhr-timeout" });
      };

      xhr.send();
    });

    return result;
  } catch {
    return { speedMbps: 0, durationMs: 0, bytesTransferred: 0, method: "failed" };
  }
}

/**
 * Test LiveKit server reachability via HTTPS fetch.
 *
 * LiveKit exposes a health-check at its root path that returns "OK".
 * A raw WebSocket to `/` won't upgrade (nginx returns 200 instead of 101),
 * and `/rtc` requires auth — so we use an HTTPS fetch instead.
 */
async function testLiveKitReachability(
  rawUrl: string,
  timeout: number = WS_TIMEOUT
): Promise<{ reachable: boolean; latencyMs: number; error?: string }> {
  if (!rawUrl) {
    return { reachable: false, latencyMs: 0, error: "URL not configured" };
  }

  // Convert wss://host:port to https://host:port for the fetch
  const httpsUrl = rawUrl
    .replace(/^wss:\/\//i, "https://")
    .replace(/^ws:\/\//i, "http://");
  // If no scheme was present, prepend https://
  const url = /^https?:\/\//i.test(httpsUrl) ? httpsUrl : `https://${httpsUrl}`;

  const start = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    const latencyMs = performance.now() - start;
    // LiveKit root returns 200; any successful response means the server is reachable
    return { reachable: response.ok, latencyMs };
  } catch (err: any) {
    clearTimeout(timer);
    const latencyMs = performance.now() - start;
    if (err.name === "AbortError") {
      return { reachable: false, latencyMs: timeout, error: "Connection timed out" };
    }
    return { reachable: false, latencyMs, error: err?.message || "Connection failed" };
  }
}

function testStun(): Promise<{
  found: boolean;
  candidateType: string | null;
  durationMs: number;
}> {
  return new Promise((resolve) => {
    if (typeof RTCPeerConnection === "undefined") {
      resolve({ found: false, candidateType: null, durationMs: 0 });
      return;
    }

    const start = performance.now();
    let resolved = false;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        pc.close();
        resolve({ found: false, candidateType: null, durationMs: STUN_TIMEOUT });
      }
    }, STUN_TIMEOUT);

    pc.onicecandidate = (event) => {
      if (event.candidate && event.candidate.type === "srflx" && !resolved) {
        resolved = true;
        clearTimeout(timer);
        pc.close();
        resolve({
          found: true,
          candidateType: "srflx",
          durationMs: performance.now() - start,
        });
      }
    };

    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === "complete" && !resolved) {
        resolved = true;
        clearTimeout(timer);
        pc.close();
        resolve({
          found: false,
          candidateType: null,
          durationMs: performance.now() - start,
        });
      }
    };

    // Create a data channel and offer to trigger ICE gathering
    pc.createDataChannel("stun-test");
    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch(() => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          pc.close();
          resolve({ found: false, candidateType: null, durationMs: performance.now() - start });
        }
      });
  });
}

interface MediaResult {
  cameras: number;
  microphones: number;
  speakers: number;
  cameraGranted: boolean;
  micGranted: boolean;
  error?: string;
}

async function testMediaDevices(): Promise<MediaResult> {
  const result: MediaResult = {
    cameras: 0,
    microphones: 0,
    speakers: 0,
    cameraGranted: false,
    micGranted: false,
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    // Stop all tracks immediately
    stream.getTracks().forEach((t) => t.stop());
    result.cameraGranted = true;
    result.micGranted = true;
  } catch (err: any) {
    // Permission denied or no devices
    if (err.name === "NotAllowedError") {
      result.error = "Permission denied";
    } else if (err.name === "NotFoundError") {
      result.error = "No devices found";
    } else {
      result.error = err.message || "Failed to access media devices";
    }
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    result.cameras = devices.filter((d) => d.kind === "videoinput").length;
    result.microphones = devices.filter((d) => d.kind === "audioinput").length;
    result.speakers = devices.filter((d) => d.kind === "audiooutput").length;
  } catch {
    // enumerateDevices failed, counts stay 0
  }

  return result;
}

interface BrowserInfo {
  name: string;
  version: number;
  supported: boolean;
  current: boolean;
  raw: string;
}

function checkBrowser(): BrowserInfo {
  const ua = navigator.userAgent;
  let name = "Unknown";
  let version = 0;

  // Order matters: Edge before Chrome (Edge UA contains "Chrome")
  if (/Edg\/(\d+)/.test(ua)) {
    name = "Edge";
    version = parseInt(RegExp.$1);
  } else if (/Chrome\/(\d+)/.test(ua)) {
    name = "Chrome";
    version = parseInt(RegExp.$1);
  } else if (/Firefox\/(\d+)/.test(ua)) {
    name = "Firefox";
    version = parseInt(RegExp.$1);
  } else if (/Version\/(\d+).*Safari/.test(ua)) {
    name = "Safari";
    version = parseInt(RegExp.$1);
  }

  const minimums: Record<string, number> = {
    Chrome: 80,
    Edge: 80,
    Firefox: 75,
    Safari: 14,
  };

  const currentVersions: Record<string, number> = {
    Chrome: 130,
    Edge: 130,
    Firefox: 125,
    Safari: 18,
  };

  const minVersion = minimums[name];
  const supported = minVersion !== undefined && version >= minVersion;
  const currentMin = currentVersions[name] || 0;
  const current = supported && version >= currentMin - 5; // within 5 versions of latest

  return { name, version, supported, current, raw: ua };
}

// --- Main Hook ---

export function useNetworkDiagnostics() {
  const [categories, setCategories] = useState<DiagnosticCategory[]>(
    buildInitialCategories
  );
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef(false);

  const totalChecks = categories.reduce((sum, c) => sum + c.checks.length, 0);

  // Update a single check by id
  const updateCheck = useCallback(
    (checkId: string, updates: Partial<DiagnosticCheck>) => {
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          checks: cat.checks.map((ch) =>
            ch.id === checkId ? { ...ch, ...updates } : ch
          ),
        }))
      );
    },
    []
  );

  const setCheckRunning = useCallback(
    (id: string) => updateCheck(id, { status: "running" }),
    [updateCheck]
  );

  const completeCheck = useCallback(
    (id: string, status: CheckStatus, value: string, details?: string, customRecommendation?: string) => {
      const rec = recommendations[id];
      const recommendation =
        customRecommendation ??
        (status === "fail" ? rec?.fail : status === "warn" ? rec?.warn : undefined);
      updateCheck(id, { status, value, details, recommendation });
      setProgress((p) => p + 1);
    },
    [updateCheck]
  );

  const runAllTests = useCallback(async () => {
    abortRef.current = false;
    setIsRunning(true);
    setProgress(0);
    setCategories(buildInitialCategories());

    // 1. Browser compatibility (instant)
    {
      setCheckRunning("browser");
      const info = checkBrowser();
      let status: CheckStatus = "fail";
      if (info.supported && info.current) status = "pass";
      else if (info.supported) status = "warn";
      completeCheck(
        "browser",
        status,
        `${info.name} ${info.version}`,
        info.current
          ? "Latest supported version"
          : info.supported
          ? "Supported but outdated"
          : `Unsupported browser`
      );
    }
    if (abortRef.current) return;

    // 2. API Latency + Jitter (~4s)
    {
      setCheckRunning("latency");
      setCheckRunning("jitter");
      const result = await measureLatency();

      if (result.avg < 0) {
        completeCheck("latency", "fail", "Unreachable", "All requests to API server failed");
        completeCheck("jitter", "fail", "N/A", "Cannot measure — API unreachable");
      } else {
        const avgMs = Math.round(result.avg);
        const latStatus: CheckStatus =
          avgMs <= LATENCY_GREEN ? "pass" : avgMs <= LATENCY_RED ? "warn" : "fail";
        completeCheck(
          "latency",
          latStatus,
          `${avgMs}ms avg`,
          `min ${Math.round(result.min)}ms, max ${Math.round(result.max)}ms`
        );

        const jitterMs = Math.round(result.jitter);
        const jitStatus: CheckStatus =
          jitterMs <= JITTER_GREEN ? "pass" : jitterMs <= JITTER_YELLOW ? "warn" : "fail";
        completeCheck(
          "jitter",
          jitStatus,
          `${jitterMs}ms`,
          `Average variation between consecutive requests`
        );
      }
    }
    if (abortRef.current) return;

    // 3. Bandwidth estimate (Network Info API)
    {
      setCheckRunning("bandwidth");
      setCheckRunning("networkType");
      const bw = getBandwidthEstimate();

      if (bw.downlink !== null) {
        // Network Information API is unreliable — capped at 10 Mbps by spec,
        // often reports 1.5–2.5 Mbps on 100+ Mbps connections. Show it as
        // informational only; never fail/warn based on this value alone.
        completeCheck(
          "bandwidth",
          "pass",
          `~${bw.downlink} Mbps`,
          `Browser estimate (Network Information API — may be inaccurate). See Download Speed for measured result.`
        );
      } else {
        completeCheck(
          "bandwidth",
          "pass",
          "Not available",
          "Network Information API not supported in this browser. See Download Speed test."
        );
      }

      if (bw.effectiveType) {
        const typeMap: Record<string, CheckStatus> = {
          "4g": "pass",
          "3g": "warn",
          "2g": "fail",
          "slow-2g": "fail",
        };
        completeCheck(
          "networkType",
          typeMap[bw.effectiveType] || "warn",
          bw.effectiveType.toUpperCase(),
          bw.rtt !== null ? `Browser-estimated RTT: ${bw.rtt}ms` : undefined
        );
      } else {
        completeCheck(
          "networkType",
          "warn",
          "Not available",
          "Network Information API not supported in this browser"
        );
      }
    }
    if (abortRef.current) return;

    // 3b. Download speed (timed fetch — always run as supplementary measurement)
    {
      setCheckRunning("downloadSpeed");
      const dl = await measureDownloadSpeed();

      if (dl.speedMbps > 0) {
        const sampleNote =
          dl.bytesTransferred < 50_000
            ? " (small sample — rough estimate)"
            : "";
        const dlStatus: CheckStatus =
          dl.speedMbps >= BANDWIDTH_GREEN
            ? "pass"
            : dl.speedMbps >= BANDWIDTH_YELLOW
            ? "warn"
            : "fail";
        completeCheck(
          "downloadSpeed",
          dlStatus,
          `${dl.speedMbps.toFixed(1)} Mbps`,
          `Transferred ${(dl.bytesTransferred / 1024).toFixed(0)} KB in ${Math.round(dl.durationMs)}ms${sampleNote}`
        );
      } else {
        completeCheck(
          "downloadSpeed",
          "fail",
          "Could not measure",
          `Download test failed (${dl.method}). Server may be unreachable or blocking requests.`
        );
      }
    }
    if (abortRef.current) return;

    // 4. WebRTC + STUN (up to 5s)
    {
      setCheckRunning("webrtc");
      if (typeof RTCPeerConnection !== "undefined") {
        completeCheck("webrtc", "pass", "Supported", "RTCPeerConnection available");
      } else {
        completeCheck("webrtc", "fail", "Not supported", "RTCPeerConnection missing");
      }

      setCheckRunning("stun");
      const stun = await testStun();
      if (stun.found) {
        const stunStatus: CheckStatus =
          stun.durationMs < STUN_FAST ? "pass" : stun.durationMs < STUN_SLOW ? "warn" : "fail";
        completeCheck(
          "stun",
          stunStatus,
          `OK (${Math.round(stun.durationMs)}ms)`,
          `srflx candidate found`
        );
      } else {
        completeCheck(
          "stun",
          "fail",
          "Failed",
          `No srflx candidate found within ${STUN_TIMEOUT / 1000}s`
        );
      }
    }
    if (abortRef.current) return;

    // 5. LiveKit server reachability
    {
      setCheckRunning("livekitWss");

      const lk = await testLiveKitReachability(LIVEKIT_WS_URL);

      if (lk.reachable) {
        const lkStatus: CheckStatus =
          lk.latencyMs < WS_GREEN ? "pass" : lk.latencyMs < WS_YELLOW ? "warn" : "fail";
        completeCheck(
          "livekitWss",
          lkStatus,
          `Reachable (${Math.round(lk.latencyMs)}ms)`,
          "LiveKit server responded successfully"
        );
      } else if (!LIVEKIT_WS_URL) {
        completeCheck(
          "livekitWss",
          "fail",
          "Not configured",
          "Video server URL is not configured. Contact your administrator.",
          "Video server connection is not set up. Please contact your IT administrator to configure the video interview server."
        );
      } else {
        completeCheck(
          "livekitWss",
          "fail",
          "Failed",
          lk.error || "Could not reach LiveKit server"
        );
      }
    }
    if (abortRef.current) return;

    // 6. Media devices (last — triggers permission prompt)
    {
      setCheckRunning("camera");
      setCheckRunning("microphone");
      setCheckRunning("speaker");

      const media = await testMediaDevices();

      // Camera
      if (media.cameraGranted && media.cameras > 0) {
        completeCheck("camera", "pass", `${media.cameras} device(s)`, "Permission granted");
      } else if (media.cameras > 0) {
        completeCheck(
          "camera",
          "warn",
          `${media.cameras} device(s)`,
          media.error || "Permission not yet granted"
        );
      } else {
        completeCheck("camera", "fail", "None", media.error || "No camera detected");
      }

      // Microphone
      if (media.micGranted && media.microphones > 0) {
        completeCheck("microphone", "pass", `${media.microphones} device(s)`, "Permission granted");
      } else if (media.microphones > 0) {
        completeCheck(
          "microphone",
          "warn",
          `${media.microphones} device(s)`,
          media.error || "Permission not yet granted"
        );
      } else {
        completeCheck("microphone", "fail", "None", media.error || "No microphone detected");
      }

      // Speaker
      if (media.speakers > 0) {
        completeCheck("speaker", "pass", `${media.speakers} device(s)`, undefined);
      } else {
        completeCheck("speaker", "fail", "None", "No audio output device detected");
      }
    }

    setIsRunning(false);
  }, [setCheckRunning, completeCheck]);

  // --- Report generation ---

  const generateReport = useCallback((): string => {
    const now = new Date();
    const dateStr = now.toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    const browserInfo = checkBrowser();

    let passCount = 0;
    let warnCount = 0;
    let failCount = 0;
    const totalCount = categories.reduce((s, c) => s + c.checks.length, 0);
    const allChecks: DiagnosticCheck[] = [];

    categories.forEach((cat) =>
      cat.checks.forEach((ch) => {
        allChecks.push(ch);
        if (ch.status === "pass") passCount++;
        else if (ch.status === "warn") warnCount++;
        else if (ch.status === "fail") failCount++;
      })
    );

    const overall =
      failCount > 0 ? "FAIL" : warnCount > 0 ? "WARNING" : "PASS";

    const lines: string[] = [
      "muTalent Network Diagnostics Report",
      "=====================================",
      `Date: ${dateStr}`,
      `Browser: ${browserInfo.name} ${browserInfo.version} / ${navigator.platform}`,
      "",
      `OVERALL: ${overall} (${passCount}/${totalCount} passed${warnCount > 0 ? `, ${warnCount} warning(s)` : ""}${failCount > 0 ? `, ${failCount} failed` : ""})`,
      "",
    ];

    categories.forEach((cat) => {
      lines.push(`--- ${cat.title} ---`);
      cat.checks.forEach((ch) => {
        const tag =
          ch.status === "pass"
            ? "PASS"
            : ch.status === "warn"
            ? "WARN"
            : ch.status === "fail"
            ? "FAIL"
            : "----";
        lines.push(`[${tag}] ${ch.name}: ${ch.value || "Not tested"}${ch.details ? ` (${ch.details})` : ""}`);
        if (ch.recommendation) {
          lines.push(`  -> ${ch.recommendation}`);
        }
      });
      lines.push("");
    });

    // Action items
    const actions = allChecks
      .filter((ch) => ch.status === "fail" || ch.status === "warn")
      .map((ch) => ch.recommendation)
      .filter(Boolean);

    if (actions.length > 0) {
      lines.push("ACTIONS FOR IT TEAM:");
      actions.forEach((a, i) => lines.push(`${i + 1}. ${a}`));
    }

    return lines.join("\n");
  }, [categories]);

  return {
    categories,
    isRunning,
    progress,
    totalChecks,
    runAllTests,
    generateReport,
  };
}
