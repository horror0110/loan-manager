"use client";
import { isTokenExpired, isValidTokenFormat, decodeToken } from "./token";

/**
 * Token payload interface (for JWT tokens)
 */
interface TokenPayload {
  id?: string | number;
  email?: string;
  name?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Current user interface derived from token
 */
interface CurrentUser {
  id: string | number;
  email?: string;
  name?: string;
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("token");

  if (!token) {
    return false;
  }

  return isValidTokenFormat(token) && !isTokenExpired(token);
};

/**
 * Get access token
 * @returns {Promise<string | null>} Token or null if unavailable
 */
export const getAccessToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");

  if (!token) {
    console.log("❌ Token missing");
    return null;
  }

  if (!isValidTokenFormat(token)) {
    console.log("❌ Invalid token format");
    return null;
  }

  if (isTokenExpired(token)) {
    console.log("❌ Token expired");
    return null;
  }

  return token;
};

/**
 * Get current user information from JWT token
 * @returns {Promise<CurrentUser | null>} User information or null if unavailable
 */
export const getCurrentUserFromToken =
  async (): Promise<CurrentUser | null> => {
    if (typeof window === "undefined") return null;

    try {
      const token = await getAccessToken();
      if (!token) {
        return null;
      }

      // Decode JWT token
      const payload = decodeToken(token) as TokenPayload;
      if (!payload) {
        return null;
      }

      // Extract user information from payload
      const userId = payload.id;

      if (!userId) {
        console.error("Token payload missing user ID");
        return null;
      }

      // Return user information
      return {
        id: userId,
        email: payload.email,
        name: payload.name,
      };
    } catch (error) {
      console.error("Error getting current user from token:", error);
      return null;
    }
  };

/**
 * Check if token exists in localStorage
 * @returns {boolean} True if token exists
 */
export const hasToken = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("token") !== null;
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date | null} Expiration date or null if invalid
 */
export const getTokenExpirationDate = (token: string): Date | null => {
  try {
    if (!isValidTokenFormat(token)) {
      return null;
    }

    const payload = decodeToken(token) as TokenPayload;
    if (!payload || !payload.exp) {
      return null;
    }

    // Convert Unix timestamp to JavaScript Date
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error("Error getting token expiration:", error);
    return null;
  }
};

/**
 * Get time until token expires in milliseconds
 * @param {string} token - JWT token
 * @returns {number | null} Milliseconds until expiration or null if invalid
 */
export const getTokenTimeToExpiry = (token: string): number | null => {
  const expirationDate = getTokenExpirationDate(token);
  if (!expirationDate) {
    return null;
  }

  const timeRemaining = expirationDate.getTime() - Date.now();
  return timeRemaining > 0 ? timeRemaining : 0;
};
