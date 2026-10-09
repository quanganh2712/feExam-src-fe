import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.DEV
    ? "/api"
    : import.meta.env.VITE_API_URL || "/api",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("setupToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
