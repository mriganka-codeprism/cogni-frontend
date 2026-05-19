import { apiClient, extractionServiceClient } from "./interceptor";
import { StreamSetting } from "../types/college";
import axios, { AxiosRequestConfig } from "axios";

// Helper function to handle API errors consistently
const handleApiError = (err: any, defaultMessage: string) => {
  let errorMessage = defaultMessage;
  
  // Try different ways to extract the error message
  if (err?.response?.data?.message) {
    errorMessage = err.response.data.message;
  } else if (err?.response?.data?.error) {
    errorMessage = err.response.data.error;
  } else if (typeof err?.response?.data === 'string') {
    errorMessage = err.response.data;
  } else if (err?.message) {
    errorMessage = err.message;
  }
  
  // Handle timeout errors specifically
  if (errorMessage.includes("Request timed out") || errorMessage.includes("timed out")) {
    errorMessage = "The request took too long to complete. Please try again.";
  }
  
  throw new Error(errorMessage);
};

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const isRequestCanceled = (err: any) =>
  axios.isCancel(err) ||
  err?.code === "ERR_CANCELED" ||
  err?.name === "CanceledError";

async function postWithForcedRetryAfterAbort(
  url: string,
  payload: unknown,
  config?: AxiosRequestConfig,
  label?: string
): Promise<any> {
  const controller = new AbortController();
  const requestLabel = label || url;

  const firstAttempt = apiClient
    .post(url, payload, {
      ...config,
      signal: controller.signal,
    })
    .then((response) => ({ status: "fulfilled" as const, response }))
    .catch((error) => ({ status: "rejected" as const, error }));

  await sleep(1000);
  controller.abort();

  const firstResult = await firstAttempt;
  if (firstResult.status === "rejected" && !isRequestCanceled(firstResult.error)) {
    console.warn(`First ${requestLabel} attempt failed before retrying`, firstResult.error);
  } else {
    console.log(`Retrying ${requestLabel} after aborting the first attempt`);
  }

  const secondResponse = await apiClient.post(url, payload, config);
  return secondResponse.data;
}

type RecordingAsset = {
  url: string;
  label: string;
  isObjectUrl?: boolean;
  sourceUrl?: string;
};

type RecordingUrlResponse = {
  url: string;
  urls: string[];
  recordings: RecordingAsset[];
  analysis?: any;
  source: "conversation" | "legacy";
};

type PlaybackSyncSegment = {
  id: string;
  recordingUrl: string;
  playbackUrl: string;
  startedAt?: string | null;
  endedAt?: string | null;
  roomId?: string | null;
  metadata?: any;
  createdAt?: string;
  localUrl?: string;
  label?: string;
  isObjectUrl?: boolean;
};

type PlaybackSyncResponse = {
  messages: any[];
  recordingSegments: PlaybackSyncSegment[];
  callDuration?: {
    durationMs: number;
    formatted: string;
  } | null;
};

const createRecordingAssetsFromSignedUrls = async (
  signedUrls: string[],
  signal?: AbortSignal
): Promise<RecordingAsset[]> => {
  const recordings: RecordingAsset[] = [];

  for (let index = 0; index < signedUrls.length; index += 1) {
    const signedUrl = signedUrls[index];
    if (!signedUrl) {
      recordings.push({
        url: "",
        label: `Recording ${index + 1}`,
        sourceUrl: "",
      });
      continue;
    }

    try {
      const response = await apiClient.get(signedUrl, {
        responseType: "blob",
        signal,
      });

      recordings.push({
        url: URL.createObjectURL(response.data),
        label: `Recording ${index + 1}`,
        isObjectUrl: true,
        sourceUrl: signedUrl,
      });
    } catch (error) {
      console.error(`Failed to load recording ${index + 1}:`, error);
      recordings.push({
        url: signedUrl,
        label: `Recording ${index + 1}`,
        isObjectUrl: false,
        sourceUrl: signedUrl,
      });
    }
  }

  return recordings;
};

export const getPlaybackSync = async (
  conversationId: string,
  signal?: AbortSignal
): Promise<PlaybackSyncResponse> => {
  try {
    const response = await apiClient.get(
      `/communication/playbackSync/${conversationId}`,
      { signal }
    );

    const rawSegments = Array.isArray(response.data?.recordingSegments)
      ? response.data.recordingSegments
      : [];

    const recordingAssets = await createRecordingAssetsFromSignedUrls(
      rawSegments.map(
        (segment: PlaybackSyncSegment) =>
          segment.playbackUrl || segment.recordingUrl
      ),
      signal
    );

    const recordingSegments = rawSegments.map(
      (segment: PlaybackSyncSegment, index: number) => ({
        ...segment,
        localUrl:
          recordingAssets[index]?.url ||
          segment.playbackUrl ||
          segment.recordingUrl,
        label: recordingAssets[index]?.label || `Recording ${index + 1}`,
        isObjectUrl: recordingAssets[index]?.isObjectUrl || false,
      })
    );

    return {
      messages: Array.isArray(response.data?.messages)
        ? response.data.messages
        : [],
      recordingSegments,
      callDuration: response.data?.callDuration || null,
    };
  } catch (err: any) {
    handleApiError(err, "Failed to fetch playback sync data");
  }

  throw new Error("Failed to fetch playback sync data");
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await apiClient.post(`/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Login failed");
  }
};

export const logoutUser = async () => {
  try {
    const response = await apiClient.post(`/auth/logout`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Logout failed");
  }
};

export const refreshToken = async () => {
  try {
    const response = await apiClient.get(`/auth/refresh`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Refresh token failed");
  }
};

export const sendOtp = async (email: string) => {
  try {
    const response = await apiClient.post(`/auth/send-otp`, {
      email,
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to send OTP");
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const response = await apiClient.post(`/auth/verify-otp`, {
      email,
      otp,
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to verify OTP");
  }
};

export const uploadResume = async (
  file: File,
  collegeId: string,
  streamId: string
) => {
  const formData = new FormData();
  formData.append("document", file);

  try {
    const response = await apiClient.post(
      `/user-profile/upload?collegeId=${collegeId}&streamId=${streamId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Resume upload failed");
  }
};

export const uploadJobDescription = async (file: File, collegeId: string, streamId: string) => {
  const formData = new FormData();
  formData.append("document", file);

  try {
    const response = await apiClient.post(
      `/user-profile/jd/upload?collegeId=${collegeId}&streamId=${streamId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Job description upload failed");
  }
};

export const getJobDescription = async (collegeId: string, streamId: string) => {
  try {
    const response = await apiClient.get(`/user-profile/jd?collegeId=${collegeId}&streamId=${streamId}`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to get job description");
  }
};

export const copyJobDescription = async (collegeId: string, sourceStreamId: string, targetStreamIds: string[]) => {
  try {
    const response = await apiClient.post(`/user-profile/jd/copy`, {
      collegeId,
      sourceStreamId,
      targetStreamIds,
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to copy job description");
  }
};

export const uploadPPTwithUser = async (
  file: File,
  firstName: string,
  lastName: string,
  email: string,
  collegeId: string,
  streamId: string
) => {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("firstName", firstName);
  formData.append("lastName", lastName);
  formData.append("email", email);
  formData.append("college", collegeId);
  formData.append("stream", streamId);

  try {
    const response = await apiClient.post(
      `/user-profile/uploadpptwithuser`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    handleApiError(err, "PPT upload with user details failed");
  }
};

export const uploadPPT = async (file: File, userId: string) => {
  const formData = new FormData();
  formData.append("document", file);

  try {
    const response = await apiClient.post(
      `/user-profile/uploadppt?user_id=${userId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    handleApiError(err, "PPT upload failed");
  }
};

interface GetAllUsersParams {
  jobId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  collegeId?: string;
  collegeIds?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  lateral?: boolean;
}

export const getAllInterviews = async (
  params: GetAllUsersParams = {},
  signal?: AbortSignal
) => {
  try {
    const response = await apiClient.get(`/users/getAllInterviews`, {
      params,
      signal,
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to get users");
  }
};

export const getProctoringViolations = async (conversationId: string) => {
  try {
    const response = await apiClient.get(
      `/users/proctoring-violations/${conversationId}`,
    );
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch proctoring violations");
  }
};
export type ClientSideViolationPayload = {
  violation_type: string;
  reason: string;
  occurred_at: string;
  severity: string;
};

export const postClientViolations = async (
  conversationId: string,
  violations: ClientSideViolationPayload[],
): Promise<void> => {
  try {
    await apiClient.post(`/users/client-violations`, {
      conversationId,
      violations,
    });
  } catch (err) {
    console.error("Failed to post client-side violations:", err);
  }
};


export const getConversationDates = async (signal?: AbortSignal) => {
  try {
    const response = await apiClient.get(`/users/getConversationDates`, { signal });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch conversation dates");
  }
};

export const getCallDuration = async (conversationId: string) => {
  try {
    const response = await apiClient.get(
      `/users/callDuration/${conversationId}`
    );
    console.log("API response data:", response.data);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to get call duration");
  }
};

export const submitUserFeedback = async ({
  userId,
  conversationId,
  rating,
  comments,
}: {
  userId: any;
  conversationId: string;
  rating: number;
  comments: string;
}) => {
  try {
    const response = await apiClient.post(
      `/users/feedback/${userId}?conversationId=${conversationId}`,
      {
        userId,
        feedbackType: "user",
        rating,
        comments,
      }
    );
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to submit feedback");
  }
};

export const saveSetting = async ({
  settingValue,
  collegeId,
  streamId,
}: {
  settingValue: any;
  collegeId: string;
  streamId: string;
}) => {
  try {
    const res = await apiClient.post(`/users/saveSetting`, {
      settingValue,
      collegeId,
      streamId,
    });
    return res.data;
  } catch (err: any) {
    handleApiError(err, "Failed to save setting");
  }
};

export const createCollege = async (
  name: string,
  streams: {
    streamId: string;
    settingValue: StreamSetting;
  }[],
  framework?: string
) => {
  try {
    const response = await apiClient.post(`/users/createCollegeWithSettings`, {
      name,
      streams,
      framework,
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to create college");
  }
};

export const getStreams = async () => {
  try {
    const response = await apiClient.get(`/users/getStreams`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to get streams");
  }
};

export const getStreamById = async (streamId: string) => {
  try {
    const response = await apiClient.get(`/users/getStream/${streamId}`, {});
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to get stream by id");
  }
};

export const getColleges = async (
  page?: number,
  limit?: number,
  searchQuery?: string,
  sortBy?: 'created_at' | 'name',
  sortOrder?: 'ASC' | 'DESC',
) => {
  try {
    const res = await apiClient.get(`/users/getColleges`, {
      params: { page, limit, searchQuery, sortBy, sortOrder },
    });
    return res.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch colleges");
  }
};

export const getSetting = async (collegeId: string, streamId: string) => {
  try {
    const response = await apiClient.get(`/users/getSetting`, {
      params: { collegeId, streamId },
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch setting");
  }
};

export const updateSetting = async ({
  settingValue,
  collegeId,
  streamId,
}: {
  settingValue: any;
  collegeId: string;
  streamId: string;
}) => {
  try {
    const res = await apiClient.post(`/users/updateSetting`, {
      settingValue,
      collegeId,
      streamId,
    });
    return res.data;
  } catch (err: any) {
    handleApiError(err, "Failed to update setting");
  }
};

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: "candidate" | "admin";
  status: "active" | "inactive";
  stream: string;
  collegeId: string;
}

export const createUser = async (payload: CreateUserPayload) => {
  try {
    const response = await apiClient.post(`/users`, payload);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to create user");
  }
};

export const getAllSettings = async () => {
  try {
    const response = await apiClient.get(`/users/getAllSetting`);
    return response.data;
  } catch (err: any) {
    console.error("Failed to fetch settings:", err);
    handleApiError(err, "Failed to fetch settings");
    return [];
  }
};

export const getAllCategories = async () => {
  try {
    const response = await apiClient.get(`/users/getCategories`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch categories");
  }
};

export const createCategory = async (categoryName: string) => {
  try {
    const response = await apiClient.post(`/users/createCategory`, {
      categoryName: categoryName,
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to create category");
  }
};

export const createStream = async (streamName: string) => {
  try {
    const response = await apiClient.post(`/users/createStream`, {
      streamName: streamName,
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to create stream");
  }
};

export const updateCollegeWithSettings = async ({
  collegeId,
  name,
  streams,
  judgeFlow,
  framework,
}: {
  collegeId: string;
  name: string;
  judgeFlow?: string;
  framework?: string;
  streams: {
    streamId: string;
    settingValue: StreamSetting;
  }[];
}) => {
  try {
    const response = await apiClient.post(`/users/updateCollegeWithSettings`, {
      collegeId,
      name,
      streams,
      judgeFlow,
      framework,
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to update college with settings");
  }
};

export const getCollegeWithSettings = async (collegeId: string) => {
  try {
    const response = await apiClient.get(`/users/getCollegeWithSettings`, {
      params: { collegeId },
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch college settings");
  }
};

export const getUserFeedback = async (
  userId: string,
  conversationId: string
) => {
  try {
    const response = await apiClient.get(`/users/feedback`, {
      params: { userId, conversationId },
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch feedback");
  }
};

export const multifileUpload = async (
  collegeId: string,
  streamId: string,
  files: File[],
  signal?: AbortSignal
): Promise<any> => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("pdfs", file);
    });

    const response = await apiClient.post(
      `/user-profile/upload-multiple?collegeId=${collegeId}&streamId=${streamId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal,
      }
    );
    return response.data;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw err;
    }
    handleApiError(err, "Resume upload failed");
  }
};

export const uploadFileChunks = async (
  fileName: string,
  chunkIndex: number,
  chunkData: string,
  totalChunks: number,
  uploadId: string,
  fileSize: number,
  mimeType: string,
  signal?: AbortSignal
) => {
  try {
    const response = await apiClient.post(
      `/user-profile/upload-chunk`,
      {
        fileName,
        chunkIndex,
        chunkData,
        totalChunks,
        uploadId,
        fileSize,
        mimeType,
      },
      { signal }
    );
    return response.data;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw err;
    }
    handleApiError(err, "Failed to upload file chunk");
  }
};

export const finishUpload = async (
  uploadId: string,
  collegeId: string,
  streamId: string,
  files: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    totalChunks: number;
  }[],
  signal?: AbortSignal
) => {
  try {
    const response = await apiClient.post(
      `/user-profile/finish-upload`,
      {
        uploadId,
        collegeId,
        streamId,
        files,
      },
      { signal }
    );
    return response.data;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw err;
    }
    handleApiError(err, "Failed to finish upload");
  }
};

export const getProcessingStatus = async (
  processingId: string,
  signal?: AbortSignal
): Promise<any> => {
  try {
    const response = await apiClient.get(
      `/user-profile/processing-status/${processingId}`,
      { signal }
    );
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Error fetching processing status");
  }
};

export const getActiveProcessing = async (collegeId: string, streamId: string) => {
  try {
    const response = await apiClient.get(`/user-profile/active-processing`, {
      params: { collegeId, streamId },
    });
    return response.data;
  } catch {
    return null;
  }
};

export const validateInviteToken = async (token: string) => {
  const response = await apiClient.get(`/users/validate-invite-token/${token}`);
  return response.data;
};

export const sendInviteEmail = async (
  userId: string,
  link: string,
  jobId?: string,
  subject?: string,
  htmlBody?: string,
) => {
  try {
    const response = await apiClient.post(`/users/send-invite-email`, {
      userId,
      link,
      jobId,
      subject,
      htmlBody,
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to send invite email");
  }
};

export const regenerateInviteToken = async (userId: string, jobId: string) => {
  try {
    const response = await apiClient.post(`/users/regenerate-invite-token`, { userId, jobId });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to generate invite link");
  }
};

export const getResumeUsers = async (collegeId: string, streamId: string) => {
  try {
    const response = await apiClient.get(`/users/resumeUsers`, {
      params: {
        collegeId,
        streamId,
      },
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch resume users");
  }
};

export const getApprovedJobCandidates = async (jobId: string) => {
  try {
    const response = await apiClient.get(`/v1/ats/job/${jobId}/candidates/approved`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch approved job candidates");
  }
};

export const getConversationMessages = async (
  conversationId: string,
  signal?: AbortSignal
) => {
  try {
    const response = await apiClient.get(
      `/communication/messages/${conversationId}`,
      { signal }
    );
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch conversation messages");
  }
};

export const getAllConversation = async (userId: string, signal?: AbortSignal) => {
  try {
    const response = await apiClient.get(`/communication/getconversations`, { params: { userId }, signal });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to conversation for the user");
  }
};

export const getRecordingUrl = async (
  input: string | { roomName?: string; conversationId?: string },
  signal?: AbortSignal
): Promise<RecordingUrlResponse> => {
  const roomName = typeof input === "string" ? input : input.roomName;
  const conversationId =
    typeof input === "string" ? undefined : input.conversationId;

  if (conversationId) {
    try {
      const response = await apiClient.get(`/communication/recordingUrl`, {
        params: { conversationId },
        signal,
      });

      const urls = Array.isArray(response.data)
        ? response.data.filter((url: unknown): url is string => typeof url === "string" && url.trim().length > 0)
        : [];

      if (urls.length > 0) {
        const recordings = await createRecordingAssetsFromSignedUrls(
          urls,
          signal
        );

        if (recordings.length === 0) {
          throw new Error("Failed to fetch recording URL");
        }

        return {
          url: recordings[0].url,
          urls: recordings.map((recording) => recording.url),
          recordings,
          source: "conversation",
        };
      }
    } catch (error: any) {
      if (!roomName) {
        throw new Error(
          error?.response?.data?.message || "Failed to fetch recording URL"
        );
      }
    }
  }

  if (!roomName) {
    throw new Error("Failed to fetch recording URL");
  }

  try {
    const responseSignedUrl = await apiClient.post(
      `/azure-files/getsasurl`,
      {
        fileName: `${roomName}-room.mp4`,
        container: "recordings",
      },
      { signal }
    );

    const response = await apiClient.get(
      `${responseSignedUrl.data?.sasUrl?.sasUrl}`,
      {
        responseType: "blob",
        signal,
      }
    );

    const url = URL.createObjectURL(response.data);
    const analysis = responseSignedUrl.data?.sasUrl?.analysis;
    const recordings = [
      {
        url,
        label: "Recording 1",
        isObjectUrl: true,
      },
    ];

    return {
      url,
      urls: recordings.map((recording) => recording.url),
      recordings,
      analysis,
      source: "legacy",
    };
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch recording URL"
    );
  }
};

export const getEmotionEvents = async (
  conversationId: string,
  signal?: AbortSignal
) => {
  try {
    const response = await apiClient.post(
      `/azure-files/getBlob`,
      {
        url: `${conversationId}/session_data.json`,
        container: "proctoring-results",
      },
      { signal, responseType: "arraybuffer" }
    );
    // The blob comes back as binary (application/octet-stream).
    // Decode the ArrayBuffer to a UTF-8 string and parse as JSON.
    const text = new TextDecoder("utf-8").decode(response.data);
    return JSON.parse(text);
  } catch (err: any) {
    handleApiError(err, "Failed to fetch emotion events");
  }
};

export const getAlertFrames = async (url: string, signal?: AbortSignal) => {
  try {
    const response = await apiClient.post(
      `/azure-files/getBlob`,
      {
        url,
        container: "proctoring-results",
      },
      { signal, responseType: "blob" }
    );
    // Convert Blob to base64
    const blob = response.data as Blob;
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result is a data URL: "data:<type>;base64,<base64>"
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err: any) {
    handleApiError(err, "Failed to fetch alert frames");
  }
};

export const downloadResume = async (fileName: string, downloadBaseName?: string) => {
  try {
    const response = await apiClient.post(
      `/azure-files/getBlob`,
      {
        url: fileName,
        container: "mutalentpdfdocuments",
      },
      { responseType: "blob" }
    );
    const contentType = response.headers["content-type"];
    const blob = await response.data;

    // Determine file extension
    let extension = "";
    if (contentType === "application/pdf") {
      extension = ".pdf";
    } else if (
      contentType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      extension = ".docx";
    } else if (contentType === "application/msword") {
      extension = ".doc";
    } else {
      // fallback
      extension = "";
    }

    // Prefer provided base name (e.g., candidate email) for the saved file
    // Sanitize to a safe filename
    const safeBase = (downloadBaseName || fileName)
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    const downloadName = safeBase.endsWith(extension)
      ? safeBase
      : safeBase + extension;

    // Create a link and trigger download
    const url = window.URL.createObjectURL(new Blob([blob]));
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    console.error(err);
    handleApiError(err, "Failed to download resume");
  }
};

// Get a temporary Blob URL for previewing a resume in-browser (without forcing download)
export const getResumePreviewUrl = async (
  fileName: string
): Promise<{ url: string; contentType: string }> => {
  try {
    const response = await apiClient.post(
      `/azure-files/getBlob`,
      {
        url: fileName,
        container: "mutalentpdfdocuments",
      },
      { responseType: "blob" }
    );

    const contentType = response.headers["content-type"] as string;
    const blob = response.data as Blob;
    const url = window.URL.createObjectURL(blob);
    return { url, contentType };
  } catch (err: any) {
    handleApiError(err, "Failed to load resume preview");
    // The above throws; add a throw to satisfy type checker control flow
    throw new Error("Failed to load resume preview");
  }
};

export const getStatus = async () => {
  try {
    const response = await apiClient.get(`/users/status`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch status");
  }
};

export const getEvaluation = async (
  page: string,
  limit: string,
  collegeId?: string,
  search?: string,
  sortBy?: string,
  sortOrder?: string,
  evaluationStatus?: string,
  startDate?: string,
  endDate?: string,
  jobId?: string,
  lateral?: boolean
) => {
  try {
    const response = await apiClient.get(`/users/evaluation`, {
      params: {
        page,
        limit,
        collegeId,
        search,
        evaluationStatus,
        sortBy,
        sortOrder,
        startDate,
        endDate,
        jobId,
        lateral,
      },
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch evaluation");
  }
};

export const reEvaluateCandidate = async (
  conversationId: string,
  reason: string,
  evaluatedBy: string = "HR Manager"
) => {
  try {
    const response = await apiClient.post(`/users/re-evaluate`, {
      conversationId,
      reason,
      evaluatedBy,
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to re-evaluate candidate");
  }
};

export const changeEvaluationStatus = async (
  conversationId: string,
  newStatus: string,
  comments?: string,
  changedBy: string = "HR Manager"
) => {
  try {
    const response = await apiClient.post(`/users/change-status`, {
      conversationId,
      newStatus,
      comments,
      changedBy,
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to change evaluation status");
  }
};

// Delete only the evaluation (report)
export const deleteEvaluation = async (conversationId: string) => {
  try {
    const response = await apiClient.delete(`/users/evaluation/${conversationId}`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to delete evaluation");
  }
};

export const getReport = async (conversationId: string) => {
  try {
    const response = await apiClient.get(`/users/report/${conversationId}`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch report");
  }
};

export const getActiityLogs = async (conversationId: string) => {
  try {
    const response = await apiClient.get(`/users/logs/${conversationId}`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch activity logs");
  }
};

export const addUserComment = async (
  comment: string,
  conversationId: string
) => {
  try {
    const response = await apiClient.post(`/users/user-comment`, {
      comment,
      createActivityLogDto: {
        conversationId,
        actionType: "Added user comment",
        userAgent: "HR Manager",
      },
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to add user comment");
  }
};

export const generateEvaluationReport = async (
  collegeId: string,
  conversationIds?: string[]
) => {
  try {
    const payload: any = {
      college_id: collegeId,
    };
    
    // If specific conversation IDs are provided, include them to evaluate only those
    if (conversationIds && conversationIds.length > 0) {
      payload.conversation_ids = conversationIds;
    }
    
    const response = await apiClient.post(`/report/batch-analyze`, payload);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to generate evaluation report");
  }
};
export const generateSingleEvaluationReport = async (
  conversationId: string
) => {
  try {
    const response = await apiClient.post(`/report/analyze`, {
      conversation_id: conversationId,
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to generate single evaluation report");
  }
};

export const getBatchEvaluationProgress = async (
  collegeId: string,
  signal?: AbortSignal
) => {
  try {
    const response = await apiClient.get(
      `/report/batch-job-status/${collegeId}`,
      {
        signal,
      }
    );
    return response.data;
  } catch (err: any) {
    // Don't handle AbortError as an API error
    if (err.name === "AbortError") {
      throw err;
    }
    handleApiError(err, "Failed to get batch evaluation progress");
  }
};

export const getSingleEvaluationProgress = async (conversationId: string) => {
  try {
    const response = await apiClient.get(
      `/report/job-status/${conversationId}`
    );
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to get single evaluation progress");
  }
};

export const getAllFrameworks = async () => {
  try {
    const response = await apiClient.get(`/user-profile/all-frameworks`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to get all frameworks");
  }
};

export const exportCandidatesCsv = async (
  collegeId: string,
  startDate?: string,
  endDate?: string
) => {
  try {
    const response = await apiClient.get(`/users/${collegeId}/export-csv`, {
      responseType: "blob",
      params: {
        startDate,
        endDate,
      },
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to export candidates CSV");
  }
};

export const emailCandidateLink = async (
  candidateIds: string[],
  expiryMinutes: number,
  subject?: string,
  htmlBody?: string,
) => {
  try {
    const response = await apiClient.post("/users/create-candidate-link", {
      candidateIds,
      expiryMinutes,
      subject,
      htmlBody,
    });
    if (response.data?.status === "error") {
      throw new Error(response.data?.message);
    }
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to send email with candidate link");
  }
};

export const candidateSelectionUploadAptitude = async (formData: FormData) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_CANDIDATE_SELECTION_URL}/shortlist-candidates/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to upload aptitude");
  }
};

export const candidateSelectionUploadResumes = async (
  sessionId: string,
  formData: FormData
) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_CANDIDATE_SELECTION_URL}/upload-resume-chunk/${sessionId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to upload resumes");
  }
};

export const candidateSelectionUploadFinish = async (sessionId: string, formData: FormData) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_CANDIDATE_SELECTION_URL}/finish-resume-upload/${sessionId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to upload resumes");
  }
}

export const candidateSelectionUploadFinalSubmission = async (
  sessionId: string,
  formData: FormData
) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_CANDIDATE_SELECTION_URL}/upload-resumes-to-third-party/${sessionId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to upload final submission");
  }
};

export const getAllCandidates = async (sessionId: string) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_CANDIDATE_SELECTION_URL}/get-all-candidates/${sessionId}`
    );
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to get all candidates");
  }
};

export const downloadShortlistedCandidates = async (sessionId: string) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_CANDIDATE_SELECTION_URL}/download-report/${sessionId}`,
      { responseType: "blob" }
    );
    let filename = "shortlisted_candidates.xlsx";
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    handleApiError(err, "Failed to download shortlisted candidates");
  }
};

export const downloadedSelectedCandidates = async (sessionId: string) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_CANDIDATE_SELECTION_URL}/download-matched-resumes/${sessionId}`,
      {
        responseType: "blob",
      }
    );

    let filename = "selected_candidates.zip";

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    handleApiError(err, "Failed to download selected candidates");
  }
};

export const getUserModels = async () => {
  try {
    const response = await apiClient.get('/users/models');
    return response.data?.models;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch user models");
  }
};

// Delete a conversation by ID
export const deleteConversationById = async (conversationId: string) => {
  try {
    const response = await apiClient.delete(`/users/conversation/${conversationId}`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to delete conversation");
  }
};

// Delete a candidate/user by ID
export const deleteCandidate = async (userId: string) => {
  try {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to delete candidate");
  }
};

// Analytics API functions
export const getAnalyticsDashboardStats = async () => {
  try {
    const response = await apiClient.get('/analytics/dashboard-stats');
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch dashboard statistics");
  }
};

export const getAnalyticsCollegePerformance = async () => {
  try {
    const response = await apiClient.get('/analytics/college-performance');
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch college performance data");
  }
};

export const getAnalyticsDailyTrends = async (days: number = 30) => {
  try {
    const response = await apiClient.get(`/analytics/daily-trends?days=${days}`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch daily trends");
  }
};

export const getAnalyticsSelectionDistribution = async () => {
  try {
    const response = await apiClient.get('/analytics/selection-distribution');
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch selection distribution");
  }
};

export const getAnalyticsTopColleges = async (limit: number = 10) => {
  try {
    const response = await apiClient.get(`/analytics/top-colleges?limit=${limit}`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch top performing colleges");
  }
};

export const getAnalyticsCollegeAnalytics = async (collegeId: string) => {
  try {
    const response = await apiClient.get(`/analytics/college-analytics?collegeId=${collegeId}`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch college analytics");
  }
};

export const deleteCollege = async (collegeId: string) => {
  try {
    const response = await apiClient.delete(`/users/deleteCollege/${collegeId}`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to delete college");
  }
};

export const generateTraitLevels = async (
  jobDescription: string,
  criteriaTitle: string,
  token: string
) => {
  try {
    console.log(" Generating trait levels...");
    console.log("   Criteria Title:", criteriaTitle);
    console.log("   Job Description length:", jobDescription?.length);

    const payload = {
      traits: [],
      skills: [criteriaTitle],
      job_description: jobDescription,
      complexity: "easy"
    };

    console.log(" Sending payload to /report/generate-trait-levels");
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const responseData = await postWithForcedRetryAfterAbort(
      "/report/generate-trait-levels",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 60000, // ✅ Set timeout to 60 seconds for this long-running operation
      },
      "generate trait levels"
    );

    console.log("API response received!");
    console.log("   Full response data:", JSON.stringify(responseData, null, 2));

    // ✅ Return the full response so frontend can parse it
    if (!responseData) {
      throw new Error("API returned empty response");
    }

    return responseData;
  } catch (err: any) {
    console.error(" Generate trait levels error!");
    console.error("   Status:", err?.response?.status);
    console.error("   Status Text:", err?.response?.statusText);
    console.error("   Error Message:", err?.response?.data?.message || err?.message);
    console.error("   Full Response:", JSON.stringify(err?.response?.data, null, 2));
    console.error("   Stack:", err?.stack);

    handleApiError(err, "Failed to generate trait levels");
  }
};

export const uploadJd = async (file: File, token: string) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
      `${process.env.REACT_APP_API_URL}/v1/jd/upload?create_job=false`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to upload job description");
  }
};



export const createAtsJob = async (
  title: string,
  description: string,
  threshold: number,
  weights: {
    skills_required: number;
    skills_preferred: number;
    education_alignment: number;
    experience_alignment: number;
    responsibility_overlap: number;
  },
  interviewSetting: {
    role: string;
    category: string;
    duration: number;
    questionPersonalizer: string;
    interviewMode: string;
    avatar: string | null;
    avatarOptions: string[] | null;
    cutOff: number;
    proctoringEnabled?: boolean;
  },
  criteria: {
    criteriaTitle: string;
    criteriaDescription: {
      level1: string;
      level2: string;
      level3: string;
      level4: string;
      level5: string;
    };
  }[],
  frameworks?: {
    frameworkTitle: string;
    traits: {
      trait: string;
      definition: string;
      level1: string;
      level2: string;
      level3: string;
      level4: string;
      level5: string;
    }[];
  }[],
  jobType: string = "manual"
) => {
  try {
    const payload: any = {
      title,
      description,
      threshold: Number(threshold),
      parameterWeights: weights,
      interviewSetting,
      criteria,
      jobType: jobType,
    };

    if (frameworks) {
      payload.frameworks = frameworks;
    }

    const response = await apiClient.post("/v1/ats/job", payload);

    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to create ATS job");
  }
};

export const evaluateResume = async (
  file: File,
  jobId: string,
  isZipFile: boolean = false
) => {
  try {
    console.log("Preparing evaluate-files API call...");

    if (!file || !(file instanceof File)) {
      throw new Error("A valid file is required");
    }

    if (!jobId) {
      throw new Error("Job ID is required");
    }

    const formData = new FormData();
    formData.append("resume_or_zip_file", file);
    formData.append("job_id", jobId);

    // backend waits for completion
    formData.append("wait", "true");

    const response = await apiClient.post(
      "/v1/ats/evaluate-files",
      formData,
      {
        // timeout handling (keeping your existing logic)
        timeout: isZipFile ? 3700000 : 180000,
      }
    );

    console.log("Evaluation response:", response.data);

    if (!response.data) {
      throw new Error("Empty response from server");
    }

    return response.data;

  } catch (err: any) {
    console.error("ATS evaluation failed:", err);

    let errorMessage = "Failed to evaluate resume";

    if (err?.code === "ECONNABORTED") {
      errorMessage =
        "Processing is taking longer than expected. Large ZIP files may take several minutes.";
    } else if (err?.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err?.response?.status === 504) {
      errorMessage =
        "Gateway timeout while processing resumes. Try smaller batches.";
    } else if (err?.response?.status === 500) {
      errorMessage = "Internal server error";
    } else if (err?.message) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
};

export const getAtsJobStatus = async (jobId: string) => {
  const response = await apiClient.get(`/v1/ats/jobs/${jobId}`);
  return response.data;
};

export const getAtsJobs = async () => {
  try {
    const response = await apiClient.get("/v1/ats/jobs");
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Fetching ATS jobs failed");
  }
};

export const getAllJobs = async (
  page: number,
  limit: number,
  search?: string
) => {
  try {
    const response = await apiClient.get(`/v1/ats/jobs`, {
      params: { page, limit, search },
    });
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch jobs");
  }
};

export const getAtsEvaluations = async (jobId: string) => {
  try {
    const response = await apiClient.get(
      `/v1/ats/job/${jobId}/evaluations`
    );
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Fetching ATS evaluations failed");
  }
};

export const deleteAtsEvaluation = async (id: string) => {
  try {
    const response = await apiClient.delete(`/v1/ats/evaluations/${id}`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to delete evaluation");
  }
};

export const getAtsJobById = async (jobId: string) => {
  try {
    const response = await apiClient.get(
      `/v1/ats/jobs/${jobId}`
    );
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Fetching ATS job failed");
  }
};

//  Get ATS job by ID with all details including status - for drafts
export const fetchAtsJobWithStatus = async (jobId: string) => {
  try {
    const response = await apiClient.get(`/v1/ats/job/${jobId}`);
    console.log(" Fetched job with status:", response.data);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch job details");
  }
};

export const getSuggestedSkills = async (jobDescription: string) => {
  try {
    const payload = {
      job_description: jobDescription,
    };

    return await postWithForcedRetryAfterAbort(
      "/report/suggested-skills",
      payload,
      undefined,
      "suggested skills"
    );
  } catch (err: any) {
    handleApiError(err, "Failed to fetch suggested skills");
  }
};

export const deleteAtsJob = async (jobId: string) => {
  try {
    const response = await apiClient.delete(
      `/v1/ats/job/${jobId}`
    );

    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to delete ATS job");
  }
};

export const extractQuestions = async (file: File, token: string) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
      "/v1/questions/extract",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to extract questions");
  }
};

export const submitAtsJob = async (
  token: string,
  title: string,
  description: string,
  threshold: number,
  weights: {
    skills_required: number;
    skills_preferred: number;
    education_alignment: number;
    experience_alignment: number;
    responsibility_overlap: number;
  },
  interviewSetting: {
    role: string;
    category: string;
    duration: number;
    questionPersonalizer: string;
    interviewMode: string;
    avatar: string | null;
    avatarOptions: string[] | null;
    cutOff: number;
    proctoringEnabled?: boolean;
  },
  questions: {
    question: string;
    answer: string;
  }[]
) => {
  try {
    const payload = {
      title,
      description,
      threshold: Number(threshold),
      parameterWeights: weights,
      interviewSetting,
      jobType: "upload",
      predefinedQuestions: [
        {
          questions: questions.map((q) => ({
            question: q.question,
            answer: q.answer,
          })),
        },
      ],
    };

    const response = await apiClient.post(
      "/v1/ats/job",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to submit ATS job");
  }
};

export const getSettingsByConversationId = async (conversationId: string) => {
  try {
    const response = await apiClient.get(`/users/getInterviewType?conversationId=${conversationId}`);
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to fetch settings");
  }
};

export const updateAtsJobcriteria = async (
  token: string,
  jobId: string,
  title: string,
  description: string,
  threshold: number,
  weights: {
    skills_required: number;
    skills_preferred: number;
    education_alignment: number;
    experience_alignment: number;
    responsibility_overlap: number;
  },
  interviewSetting: {
    role: string;
    category: string;
    duration: number;
    questionPersonalizer: string;
    interviewMode: string;
    avatar: string | null;
    avatarOptions: string[] | null;
    cutOff: number;
    codingRound?: string;
    codingTimeLimit?: number;
    numberOfQuestions?: number;
    proctoringEnabled?: boolean;
    progress?: number;
    stoppedAt?: string;
  },
  frameworks: any[],
  criteria: any[],
  status?: string,
  jobType?: string
) => {
  try {
    // ✅ Only normalize to null when status is "draft" (user clicked continue)
    // For "active" status (publishing from ReviewSubmit), keep original values
    let finalInterviewSetting: any = interviewSetting;

    if (status === "draft") {
      // Convert empty strings and arrays to null for draft saves
      finalInterviewSetting = {
        ...interviewSetting,
        role: interviewSetting.role || null,
        category: interviewSetting.category || null,
        duration: interviewSetting.duration ?? null,
        questionPersonalizer: interviewSetting.questionPersonalizer || null,
        interviewMode: interviewSetting.interviewMode || null,
        avatar: interviewSetting.avatar || null,
        avatarOptions: (Array.isArray(interviewSetting.avatarOptions) && interviewSetting.avatarOptions.length > 0) ? interviewSetting.avatarOptions : null,
        cutOff: interviewSetting.cutOff ?? null,
        codingRound: interviewSetting.codingRound || null,
        codingTimeLimit: interviewSetting.codingTimeLimit ?? null,
        numberOfQuestions: interviewSetting.numberOfQuestions ?? null,
        proctoringEnabled: interviewSetting.proctoringEnabled ?? true,
      };
    }

    // ✅ Build payload matching the working edit API structure
    const payload: any = {
      title,
      description,
      ats_settings: {
        threshold: Number(threshold),
        parameterWeight: weights,
      },
      interviewSetting: finalInterviewSetting,
    };

    // ✅ Always include status
    if (status) {
      payload.status = status;
    }

    // ✅ Always send criteria (even if empty) - backend expects it
    payload.criteria = criteria && Array.isArray(criteria) ? criteria : [];

    // ✅ Only include frameworks if it exists and is not empty
    if (frameworks && (Array.isArray(frameworks) ? frameworks.length > 0 : true)) {
      payload.frameworks = frameworks;
    }

    console.log("✅ PUT criteria payload:", JSON.stringify(payload, null, 2));

    const response = await apiClient.put(
      `/v1/ats/job/${jobId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to update ATS job");
  }
};

export const updateAtsJobquestion = async (
  token: string,
  jobId: string,
  title: string,
  description: string,
  threshold: number,
  weights: {
    skills_required: number;
    skills_preferred: number;
    education_alignment: number;
    experience_alignment: number;
    responsibility_overlap: number;
  },
  interviewSetting: {
    role: string;
    category: string;
    duration: number;
    questionPersonalizer: string;
    interviewMode: string;
    avatar: string | null;
    avatarOptions: string[] | null;
    cutOff: number;
    codingRound?: string;
    codingTimeLimit?: number;
    numberOfQuestions?: number;
    proctoringEnabled?: boolean;
    progress?: number;
    stoppedAt?: string;
  },
  questions: {
    id?: string;
    question: string;
    answer: string;
  }[],
  status?: string,
  jobType?: string
) => {
  try {
    //  Only normalize to null when status is "draft" (user clicked continue)
    // For "active" status (publishing from ReviewSubmit), keep original values
    let finalInterviewSetting: any = interviewSetting;

    if (status === "draft") {
      // Convert empty strings and arrays to null for draft saves
      finalInterviewSetting = {
        ...interviewSetting,
        role: interviewSetting.role || null,
        category: interviewSetting.category || null,
        duration: interviewSetting.duration ?? null,
        questionPersonalizer: interviewSetting.questionPersonalizer || null,
        interviewMode: interviewSetting.interviewMode || null,
        avatar: interviewSetting.avatar || null,
        avatarOptions: (Array.isArray(interviewSetting.avatarOptions) && interviewSetting.avatarOptions.length > 0) ? interviewSetting.avatarOptions : null,
        cutOff: interviewSetting.cutOff ?? null,
        codingRound: interviewSetting.codingRound || null,
        codingTimeLimit: interviewSetting.codingTimeLimit ?? null,
        numberOfQuestions: interviewSetting.numberOfQuestions ?? null,
        proctoringEnabled: interviewSetting.proctoringEnabled ?? true,
      };
    }

    //  Build payload matching the working edit API structure
    const payload: any = {
      title,
      description,
      ats_settings: {
        threshold: Number(threshold),
        parameterWeight: weights,
      },
      interviewSetting: finalInterviewSetting,
    };

    //  Always include status
    if (status) {
      payload.status = status;
    }

    //  Always send predefinedQuestions (even if empty) - backend expects it
    if (questions && Array.isArray(questions) && questions.length > 0) {
      payload.predefinedQuestions = [
        {
          questions: questions.map((q) => ({
            id: q.id,
            question: q.question,
            answer: q.answer,
          })),
        },
      ];
    } else {
      // Send empty structure if no questions
      payload.predefinedQuestions = [{ questions: [] }];
    }

    console.log(" PUT question payload:", JSON.stringify(payload, null, 2));

    const response = await apiClient.put(
      `/v1/ats/job/${jobId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to update ATS job");
  }
};

export const submitAtsJobDraft = async (
  token: string,
  title?: string,
  description?: string,
  threshold?: number,
  weights?: any,
  interviewSetting?: any,
  questions?: any[],
  frameworks?: any,
  criteria?: any,
  jobId?: string,
  criteriaMode?: string
) => {
  try {
    // ✅ Build payload dynamically - only include meaningful, non-empty data
    const payload: any = {};

    if (title) payload.title = title;
    if (description) payload.description = description;
    if (threshold !== undefined && threshold !== null && threshold > 0) payload.threshold = Number(threshold);

    // ✅ Only include weights if they have non-zero values
    if (weights && Object.keys(weights).length > 0) {
      const hasNonZeroWeight = Object.values(weights).some((v: any) => Number(v) > 0);
      if (hasNonZeroWeight) {
        payload.parameterWeights = weights;
      }
    }

    // ✅ Clean up interviewSetting - remove empty strings and empty arrays
    if (interviewSetting && Object.keys(interviewSetting).length > 0) {
      const cleanedSetting: any = {};
      for (const [key, value] of Object.entries(interviewSetting)) {
        // Skip empty strings
        if (typeof value === 'string' && value === '') continue;
        // Skip empty arrays
        if (Array.isArray(value) && value.length === 0) continue;
        // Include everything else
        cleanedSetting[key] = value;
      }
      // Only add if we have actual cleaned data
      if (Object.keys(cleanedSetting).length > 0) {
        payload.interviewSetting = cleanedSetting;
      }
    }

    // ✅ Include questions only if they actually exist and have items
    if (questions && Array.isArray(questions) && questions.length > 0) {
      const validQuestions = questions
        .map((q) => ({
          question: q.question || "",
          answer: q.answer || null,
        }))
        .filter(q => q.question && q.question.trim()); // Only if question has text

      if (validQuestions.length > 0) {
        payload.predefinedQuestions = [
          {
            questions: validQuestions,
          },
        ];
      }
    }

    // ✅ Include criteria - always send it, even if empty, so backend knows which mode we're in
    if (criteria) {
      if (Array.isArray(criteria) && criteria.length > 0) {
        payload.criteria = criteria;
      }
    }

    // ✅ Include frameworks only if they actually exist and have items
    if (frameworks && Array.isArray(frameworks) && frameworks.length > 0) {
      payload.frameworks = frameworks;
    }

    // ✅ Determine and set jobType based on what data is present or criteriaMode
    // Priority: Explicit criteriaMode > Inferred from data
    console.log("DEBUG_JOBTYPE_LOGIC:", {
      criteriaMode,
      hasQuestions: questions && Array.isArray(questions) && questions.length > 0,
      hasFrameworks: frameworks && Array.isArray(frameworks) && frameworks.length > 0,
    });

    if (criteriaMode === "upload") {
      payload.jobType = "upload";
      console.log("SET_JOBTYPE_TO: upload (from criteriaMode)");
    } else if (criteriaMode === "framework") {
      payload.jobType = "framework";
      console.log("SET_JOBTYPE_TO: framework (from criteriaMode)");
    } else if (criteriaMode === "manual") {
      payload.jobType = "manual";
      console.log("SET_JOBTYPE_TO: manual (from criteriaMode)");
    } else if (questions && Array.isArray(questions) && questions.length > 0) {
      // Fallback: Infer from data if criteriaMode not provided
      payload.jobType = "upload";
      console.log("SET_JOBTYPE_TO: upload (from questions data)");
    } else if (frameworks && Array.isArray(frameworks) && frameworks.length > 0) {
      payload.jobType = "framework";
      console.log("SET_JOBTYPE_TO: framework (from frameworks data)");
    } else {
      payload.jobType = "manual";
      console.log("SET_JOBTYPE_TO: manual (default)");
    }

    console.log(" Draft payload:", JSON.stringify(payload, null, 2));
    console.log(" Criteria being saved:", criteria);
    console.log(" Questions being saved:", questions);
    console.log(" Frameworks being saved:", frameworks);
    console.log(" Criteria mode:", criteriaMode);
    console.log(" jobType being set:", payload.jobType);

    // ✅ Always save as draft via POST endpoint.
    // If jobId is provided, the backend will update the existing draft.
    let response;
    if (jobId) {
      console.log(`Updating existing draft with ID: ${jobId}`);
      payload.job_id = jobId;
    } else {
      console.log(" Creating new draft");
    }

    // ✅ IMPORTANT: Always keep status as "draft" when saving a draft
    payload.status = "draft";

    console.log("FINAL_PAYLOAD_BEFORE_SEND:", JSON.stringify(payload));

    response = await apiClient.post(
      "/v1/ats/job/draft",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(" Draft saved successfully:", response.data);
    return response.data;
  } catch (err: any) {
    console.error(" Draft API error:", err?.response?.data || err?.message);
    handleApiError(err, "Failed to save ATS job draft");
  }
};
export const deleteEvaluationById = async (evaluationId: string) => {
  try {
    const response = await apiClient.delete(
      `/v1/ats/evaluations/${evaluationId}`
    );
    return response.data;
  } catch (err: any) {
    handleApiError(err, "Failed to delete evaluation");
  }
};
