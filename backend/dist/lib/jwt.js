"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_SECRET || "supersecret";
const signToken = (payload, expiresIn = "1d") => {
    const options = { expiresIn: expiresIn };
    return jsonwebtoken_1.default.sign(payload, SECRET, options);
};
exports.signToken = signToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, SECRET);
    }
    catch {
        return null;
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.js.map