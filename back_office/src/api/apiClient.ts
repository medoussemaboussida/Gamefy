import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
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

    // If error is 401 (Unauthorized) and not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        // Note: We use axios.post here to avoid the interceptor loop if refresh fails
        const refreshResponse = await axios.post(`${BASE_URL}/gamefy/auth/refresh`, {}, {
          withCredentials: true
        });

        const newAccessToken = refreshResponse.data.accessToken;

        // Store the new token
        localStorage.setItem("accessToken", newAccessToken);

        // Update the original request with the new token and retry
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        // If refresh fails, clear everything and redirect to login
        localStorage.removeItem("accessToken");
        window.location.href = "/";
        return Promise.reject(refreshError);
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
