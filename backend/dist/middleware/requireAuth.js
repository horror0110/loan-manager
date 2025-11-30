"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jwt_1 = require("../lib/jwt");
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split(" ")[1];
    const payload = (0, jwt_1.verifyToken)(token);
    if (!payload)
        return res.status(401).json({ error: "Unauthorized" });
    req.user = payload;
    next();
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=requireAuth.js.map