// backend/routes/authRoutes.ts
import express from "express";
import passport from "passport";
import { googleCallback, logout } from "../controllers/authController";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  googleCallback
);

// Logout route
router.post("/logout", logout);

export default router;
