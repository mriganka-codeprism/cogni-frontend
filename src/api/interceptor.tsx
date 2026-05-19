import axios, { AxiosError, AxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";

// Different timeout configurations for different types of requests
const TIMEOUT_CONFIGS = {
  default: 10000, // 10 seconds for regular requests
  upload: 30000,  // 10 seconds for file uploads
  download: 300000, // 60 seconds for file downloads
  longPolling: 10000 // 10 seconds for long polling requests
};

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

const onRrefreshed = (token: string | null) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: TIMEOUT_CONFIGS.default,
});

// Configure retry logic
axiosRetry(apiClient, { 
  retries: 2, // Number of retries
  retryDelay: (retryCount: number) => {
    return retryCount * 1000; // Progressive delay between retries
  },
  retryCondition: (error: AxiosError): boolean => {
    // Retry on network errors or 5xx server errors
    return Boolean(
      axiosRetry.isNetworkOrIdempotentRequestError(error) || 
      (error.response && error.response.status >= 500)
    );
  }
});

apiClient.interceptors.request.use(
  (config) => {
    config.headers["ngrok-skip-browser-warning"] = "true";

    const accessToken = sessionStorage.getItem("access_token");
    const refreshToken = sessionStorage.getItem("refresh_token");

    if (config.responseType !== "blob") {
      if (config.url?.includes("/auth/refresh") && refreshToken) {
        config.headers.Authorization = `Bearer ${refreshToken}`;
      } else if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    // Set appropriate timeout based on request type
    if (config.url?.includes("upload")) {
      config.timeout = TIMEOUT_CONFIGS.upload;
    } else if (config.responseType === "blob") {
      config.timeout = TIMEOUT_CONFIGS.download;
    } else if (config.url?.includes("processing-status")) {
      config.timeout = TIMEOUT_CONFIGS.longPolling;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
   
// Add response interceptor to handle timeouts, retries and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.code === "ECONNABORTED") {
      return Promise.reject({
        response: {
          data: {
            message: "Request timed out. Please try again."
          }
        }
      });
    }

    const { response, config } = error;
    const originalRequest = config as AxiosRequestConfig & { _retry?: boolean };

    if (
      response?.status === 401 &&
      !originalRequest?._retry &&
      originalRequest?.url &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      if (!sessionStorage.getItem("refresh_token")) {
        sessionStorage.removeItem("access_token");
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (!token) {
              reject(error);
              return;
            }
            if (!originalRequest.headers) {
              originalRequest.headers = {};
            }
            (originalRequest.headers as any).Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = sessionStorage.getItem("refresh_token");

        if (!refreshToken) {
          isRefreshing = false;
          sessionStorage.removeItem("access_token");
          return Promise.reject(error);
        }

        const baseURL = process.env.REACT_APP_API_URL;
        const refreshResponse = await axios.get(
          `${baseURL}/auth/refresh`,
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        const data: any = refreshResponse.data || {};
        const newAccessToken: string | undefined = data.accessToken;
        const newRefreshToken: string | undefined = data.refreshToken || refreshToken;

        if (newAccessToken) {
          sessionStorage.setItem("access_token", newAccessToken);
          if (newRefreshToken) {
            sessionStorage.setItem("refresh_token", newRefreshToken);
          }
        } else {
          sessionStorage.removeItem("access_token");
          sessionStorage.removeItem("refresh_token");
        }

        onRrefreshed(newAccessToken || null);
        isRefreshing = false;

        if (!newAccessToken) {
          return Promise.reject(error);
        }

        if (!originalRequest.headers) {
          originalRequest.headers = {};
        }
        (originalRequest.headers as any).Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        onRrefreshed(null);
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Direct client for extraction service API (bypasses API gateway's RabbitMQ layer)
const extractionServiceClient = axios.create({
  baseURL: process.env.REACT_APP_EXTRACTION_SERVICE_URL || 'http://localhost:8000',
  timeout: TIMEOUT_CONFIGS.upload,
});

export {
    apiClient,
    extractionServiceClient,
    TIMEOUT_CONFIGS
};