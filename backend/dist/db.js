"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.prisma = new client_1.PrismaClient({
    log: ["query", "error", "warn"],
});
exports.prisma
    .$connect()
    .then(() => console.log("PostgreSQL холбогдлоо!"))
    .catch((err) => console.error("PostgreSQL холболт амжилтгүй:", err));
//# sourceMappingURL=db.js.map