import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Automatically adds the JWT token to the Authorization header if it exists.
 */
apiClient.interceptors.request.use(
  (config) => {
    const jwt = localStorage.getItem("accessToken");
    if (jwt) {
      config.headers.Authorization = `Bearer ${jwt}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// State for handling concurrent token refreshes
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Response Interceptor
 * Unwraps the response data and handles automatic token refresh on 401.
 */
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 or 403 (Unauthorized/Forbidden) and it's not a retry
    // Also skip if the failing request IS the refresh endpoint itself
    const isRefreshRequest = originalRequest.url?.includes("/gamefy/auth/refresh");
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry && !isRefreshRequest) {

      if (isRefreshing) {
        // If a refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("Access token expired, attempting refresh...");
        // Attempt to refresh the token
        const refreshResponse = await axios.post(`${BASE_URL}/gamefy/auth/refresh`, {}, {
          withCredentials: true
        });

        const { accessToken } = refreshResponse.data;
        console.log("Token refreshed successfully");

        // Store the new token
        localStorage.setItem("accessToken", accessToken);

        // Update the original request and retry
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process any queued requests with the new token
        processQueue(null, accessToken);

        return apiClient(originalRequest);

      } catch (refreshError) {
        console.error("Refresh token failed or expired", refreshError);

        // Reject everything in the queue
        processQueue(refreshError, null);

        // If refresh fails, clear everything and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Extract a user-friendly error message
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    return Promise.reject(new Error(message));
  }
);

export { apiClient };
