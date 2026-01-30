import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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
 * Unwraps the response data and handles errors in a consistent way.
 */
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Extract a user-friendly error message
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    return Promise.reject(new Error(message));
  }
);

export { apiClient };
