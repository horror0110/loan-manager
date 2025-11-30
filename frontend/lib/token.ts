"use client";

/**
 * Tokens storage interface
 */
interface StoredTokens {
  token: string | null;
}

/**
 * Check if JWT token format is valid
 * @param {string} token - Token to check
 * @returns {boolean} True if token format is valid
 */
export const isValidTokenFormat = (token: string): boolean => {
  if (!token) return false;

  // JWT format: header.payload.signature
  const parts = token.split(".");
  return parts.length === 3;
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired or invalid
 */
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("⚠ Invalid JWT token format");
      return true;
    }

    const base64Url = parts[1];
    if (!base64Url) {
      console.error("⚠ Invalid token payload");
      return true;
    }

    // Decode base64 URL-safe
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const decodedToken: any = JSON.parse(jsonPayload);

    if (!decodedToken.exp) {
      console.error("⚠ 'exp' field not found in the JWT token");
      return true;
    }

    // Check if token is expired (with 10 second buffer)
    const expirationTime = decodedToken.exp * 1000;
    const currentTime = Date.now();

    return expirationTime < currentTime;
  } catch (error) {
    console.error("⚠ Error checking token expiration:", error);
    return true;
  }
};

/**
 * Decode JWT token payload
 * @param {string} token - JWT token
 * @returns {any | null} Decoded payload or null
 */
export const decodeToken = (token: string): any | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("⚠ Error decoding token:", error);
    return null;
  }
};

/**
 * Clear authentication token from localStorage
 */
export const clearTokens = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    console.log("🧹 Token cleared from localStorage");
  }
};

/**
 * Set authentication token in localStorage
 * @param {string} token - Authentication token
 */
export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    if (token && isValidTokenFormat(token)) {
      localStorage.setItem("token", token);
      console.log("✅ Token saved to localStorage");
    } else {
      console.error("⚠ Invalid token format, not saving");
    }
  }
};

/**
 * Get stored token from localStorage
 * @returns {StoredTokens} Object containing token
 */
export const getStoredTokens = (): StoredTokens => {
  if (typeof window === "undefined") {
    return { token: null };
  }

  return {
    token: localStorage.getItem("token"),
  };
};

/**
 * Get token directly from localStorage
 * @returns {string | null} Token or null
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("token");
};

/**
 * Check if user has valid token
 * @returns {boolean} True if token exists and is valid
 */
export const hasValidTokens = (): boolean => {
  const token = getToken();

  if (!token) {
    return false;
  }

  // Check format and expiration
  return isValidTokenFormat(token) && !isTokenExpired(token);
};

/**
 * Get user info from token
 * @returns {any | null} User info or null
 */
export const getUserFromToken = (): any | null => {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    return null;
  }
  return decodeToken(token);
};
