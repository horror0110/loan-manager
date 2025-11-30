// lib/auth/logout.ts
import axiosInstance from "../axios";
import { clearTokens } from "../token";

/**
 * Perform logout - Clear local storage and call backend logout API
 * @returns {Promise<boolean>} Success status
 */
export const performLogout = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem("token");

    // Backend руу logout request илгээх
    if (token) {
      try {
        const response = await axiosInstance.post("/auth/logout");

        if (response.data?.success) {
          console.log("✅ Backend logout successful");
        }
      } catch (apiError) {
        console.error("⚠️ Error calling logout API:", apiError);
        // API алдаа гарсан ч local cleanup үргэлжлүүлнэ
      }
    }

    // Local storage цэвэрлэх
    clearTokens();

    console.log("✅ Logout completed successfully");
    return true;
  } catch (error) {
    console.error("❌ Error during logout:", error);
    // Алдаа гарсан ч local storage цэвэрлэх
    clearTokens();
    return false;
  }
};
