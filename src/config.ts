const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const getApiUrl = (endpoint: string) => {
  if (API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/$/, "")}${endpoint}`;
  }
  // Fallback: If deployed in production and VITE_API_URL isn't explicitly set, default to relative path /api
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return endpoint;
  }
  // Local development fallback
  return `http://localhost:5000${endpoint}`;
};
