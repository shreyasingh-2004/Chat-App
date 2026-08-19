const DEFAULT_DEV_PORTS = Array.from({ length: 11 }, (_, index) => 5000 + index);
const API_URL_STORAGE_KEY = "realtalk-api-url";

let apiBaseUrlPromise;

const normalizeUrl = (url) => url?.replace(/\/$/, "");

const isHealthyBackend = async (baseUrl) => {
  try {
    const response = await fetch(`${baseUrl}/health`, {
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
};

const getDevCandidates = () => {
  const configuredUrl = normalizeUrl(import.meta.env.VITE_API_URL);
  const savedUrl = normalizeUrl(localStorage.getItem(API_URL_STORAGE_KEY));
  const localhostUrls = DEFAULT_DEV_PORTS.map((port) => `http://localhost:${port}`);

  // Prefer .env URL first (faster than scanning many ports)
  return [...new Set([configuredUrl, savedUrl, ...localhostUrls].filter(Boolean))];
};

const discoverApiBaseUrl = async () => {
  if (import.meta.env.PROD) {
    return window.location.origin;
  }

  for (const candidate of getDevCandidates()) {
    if (await isHealthyBackend(candidate)) {
      localStorage.setItem(API_URL_STORAGE_KEY, candidate);
      return candidate;
    }
  }

  throw new Error("Backend server not found on ports 5000-5010.");
};

export const getApiBaseUrl = () => {
  if (!apiBaseUrlPromise) {
    apiBaseUrlPromise = discoverApiBaseUrl();
  }

  return apiBaseUrlPromise;
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (token && token !== "undefined" && token !== "null") {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }
  return { "Content-Type": "application/json" };
};

export const apiFetch = async (path, options = {}) => {
  const baseUrl = await getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

  const authHeaders = getAuthHeaders();
  const mergedOptions = {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  };

  return fetch(url, mergedOptions);
};