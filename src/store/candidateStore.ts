import { create } from 'zustand';
import { combine } from 'zustand/middleware';

type JwtPayload = Record<string, unknown>;

type CandidateState = {
  screenStream: MediaStream | null;
  videoStream: MediaStream | null;
  audioStream: MediaStream | null;
  userId: string | null;
  conversationId: string | null;
  tokenPayload: JwtPayload | null;
};

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const [, payload] = token.split('.');
    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload =
      typeof window !== 'undefined'
        ? decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
              .join(''),
          )
        : null;

    if (!jsonPayload) {
      return null;
    }

    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
};

const getInitialTokenPayload = (): JwtPayload | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = window.sessionStorage.getItem('access_token');
  if (!token) {
    return null;
  }

  return decodeJwtPayload(token);
};

const initialState: CandidateState = {
  screenStream: null,
  videoStream: null,
  audioStream: null,
  userId: null,
  conversationId: null,
  tokenPayload: getInitialTokenPayload(),
};

export const useCandidateStore = create(
  combine(initialState, (set) => ({
    setScreenStream: (screenStream: MediaStream | null) =>
      set({
        screenStream,
      }),
    setVideoStream: (videoStream: MediaStream | null) =>
      set({
        videoStream,
      }),
    setAudioStream: (audioStream: MediaStream | null) =>
      set({
        audioStream,
      }),
    setUserId: (userId: string | null) =>
      set({
        userId,
      }),
    setConversationId: (conversationId: string | null) =>
      set({
        conversationId,
      }),
    setTokenPayload: (token: string | null) =>
      set({
        tokenPayload: token ? decodeJwtPayload(token) : null,
      }),
  })),
); 