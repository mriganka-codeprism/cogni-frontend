const LOCAL_STORAGE_KEY = "resumeUploadStatus";

export const loadSessionStorageObject = <T>(key: string): T | null => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as T) : null;
  } catch {
    return null;
  }
};

export const getResumeStatusMap = (): { [collegeId: string]: string[] } => {
  try {
    const data = sessionStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const updateResumeStatusMap = (
  collegeId: string,
  streamId: string
): void => {
  const current = getResumeStatusMap();
  const updated = {
    ...current,
    [collegeId]: [...new Set([...(current[collegeId] || []), streamId])],
  };
  sessionStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
};

export const clearResumeStatusMap = () => {
  sessionStorage.removeItem(LOCAL_STORAGE_KEY);
};
