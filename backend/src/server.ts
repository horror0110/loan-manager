import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";

import "./auth";
import authRoutes from "./routes/authRoutes";
import loanRoutes from "./routes/loanRoutes";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/api/loans", loanRoutes);

app.get("/", (req, res) => {
  res.send("Hello from Loan Manager Backend!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
