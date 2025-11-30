"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const dotenv_1 = __importDefault(require("dotenv"));
require("./auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Session setup
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Google login routes
app.get("/auth/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/" }), (req, res) => {
    res.send("Амжилттай нэвтэрлээ!");
});
// Test route
app.get("/", (req, res) => {
    res.send("Hello from Loan Manager Backend!");
});
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
//# sourceMappingURL=server.js.map