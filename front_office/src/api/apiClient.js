import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const apiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const jwt = localStorage.getItem("accessToken");
        if (jwt) {
            config.headers.Authorization = `Bearer ${jwt}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;
        // If error is 401 or 403 (Unauthorized/Forbidden) and not a retry
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                console.log("Access token expired, attempting refresh...");
                const refreshResponse = await axios.post(`${BASE_URL}/gamefy/auth/refresh`, {}, {
                    withCredentials: true
                });
                const { accessToken } = refreshResponse.data;
                console.log("Token refreshed successfully");

                localStorage.setItem("accessToken", accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error("Refresh token failed or expired", refreshError);
                localStorage.removeItem("accessToken");
                window.location.href = "/"; // Redirect to landing/login
                return Promise.reject(refreshError);
            }
        }
        const message = error.response?.data?.message ||
            (error.response?.status === 403 ? "Access Denied. Please check your credentials." :
                (error.response?.status === 409 ? "This email is already registered." : error.message)) ||
            "A connection error occurred. Please try again.";
        return Promise.reject(new Error(message));
    }
);

export { apiClient };
