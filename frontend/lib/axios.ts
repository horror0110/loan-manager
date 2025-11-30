import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { getAccessToken } from "./getAccessToken";
import { performLogout } from "./auth/logout";

// Extend InternalAxiosRequestConfig to include _retry flag
interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = ["/auth/google", "/auth/google/callback"] as const;

// Create Axios instance with base configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  timeout: 15000, // 15 second timeout
  withCredentials: true, // Cookies илгээх (session-д шаардлагатай)
});

/**
 * Request interceptor - Automatically add authentication token
 */
axiosInstance.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> => {
    try {
      // Check if endpoint is public
      const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) =>
        config.url?.includes(endpoint)
      );

      // Add token for non-public endpoints
      if (!isPublicEndpoint) {
        const token = await getAccessToken();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      // Set Content-Type based on data type
      if (config.data instanceof FormData) {
        // Don't set Content-Type for FormData
        // Browser will automatically set multipart/form-data with boundary
        delete config.headers["Content-Type"];
      } else if (!config.headers["Content-Type"]) {
        // Set JSON content type for regular data
        config.headers["Content-Type"] = "application/json";
      }

      return config;
    } catch (error) {
      console.error("Request interceptor error:", error);
      return Promise.reject(error);
    }
  },
  (error: AxiosError): Promise<never> => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle 401 errors
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Return successful response
    return response;
  },
  async (error: AxiosError): Promise<never> => {
    const originalRequest = error.config as RetryAxiosRequestConfig;

    // Handle 401 Unauthorized error - logout user
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      console.error("401 Unauthorized - Token expired or invalid");

      // Perform logout and wait for completion
      try {
        await performLogout();
      } catch (logoutError) {
        console.error("Logout error:", logoutError);
      }

      if (typeof window !== "undefined") {
        window.location.href = "/";
      }

      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
    } else if (error.response.status >= 500) {
      console.error("Server error:", error.response.status);
    }

    return Promise.reject(error);
  }
);

/**
 * Request/Response logging for development mode
 */
if (process.env.NODE_ENV === "development") {
  // Request logging
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
      );

      if (config.data instanceof FormData) {
        console.log("📎 FormData detected - File upload request");

        // Log FormData contents for debugging
        for (const [key, value] of config.data.entries()) {
          if (value instanceof File) {
            console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
          } else {
            console.log(`  ${key}: ${value}`);
          }
        }
      }

      return config;
    }
  );

  // Response logging
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error: AxiosError): Promise<never> => {
      console.log(
        `❌ API Error: ${error.response?.status} ${error.config?.url}`,
        error.response?.data
      );
      return Promise.reject(error);
    }
  );
}

export default axiosInstance;
