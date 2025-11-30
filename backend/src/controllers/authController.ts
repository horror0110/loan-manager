// backend/src/controllers/authController.ts
import { Request, Response } from "express";
import { signToken } from "../lib/jwt";

export const googleCallback = async (req: Request, res: Response) => {
  const user = req.user as { id: number; email: string; name?: string };

  // Token-д id, email, name нэмэх
  const token = signToken({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  // Frontend URL-ийг environment variable-с авах
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";

  // Token-ийг query parameter-ээр дамжуулах
  res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
};

// Logout endpoint
export const logout = async (req: Request, res: Response) => {
  try {
    console.log("✅ User logged out");
    res.status(200).json({
      success: true,
      message: "Амжилттай гарлаа",
    });
  } catch (error) {
    console.error("❌ Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Гарахад алдаа гарлаа",
    });
  }
};
