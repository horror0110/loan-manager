"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.googleCallback = void 0;
const jwt_1 = require("../lib/jwt");
const googleCallback = async (req, res) => {
    const user = req.user;
    // Token-д id, email, name нэмэх
    const token = (0, jwt_1.signToken)({
        id: user.id,
        email: user.email,
        name: user.name,
    });
    // Token-ийг query parameter-ээр дамжуулах
    res.redirect(`http://localhost:3001/auth/callback?token=${token}`);
};
exports.googleCallback = googleCallback;
// Logout endpoint
const logout = async (req, res) => {
    try {
        console.log("✅ User logged out");
        res.status(200).json({
            success: true,
            message: "Амжилттай гарлаа",
        });
    }
    catch (error) {
        console.error("❌ Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Гарахад алдаа гарлаа",
        });
    }
};
exports.logout = logout;
//# sourceMappingURL=authController.js.map