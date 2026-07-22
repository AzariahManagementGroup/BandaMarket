const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const getApiUrl = (endpoint: string) => {
  if (API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/$/, "")}${endpoint}`;
  }
  // If running locally, return endpoint directly so Vite proxy / public static server routes to /api/index.php
  if (typeof window !== "undefined") {
    const port = window.location.port;
    if (port === "8080" || port === "5173" || window.location.hostname === "localhost") {
      return endpoint;
    }
  }
  return endpoint;
};
