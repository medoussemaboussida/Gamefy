const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const { headers, ...restOptions } = options;
  const jwt = localStorage.getItem("accessToken");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      ...headers,
    },
    ...restOptions,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};
