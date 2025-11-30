"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const db_1 = require("./db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        // Хэрэглэгч байгаа эсэхийг шалгах
        let user = await db_1.prisma.user.findUnique({
            where: { email },
        });
        // Хэрэв байхгүй бол шинээр үүсгэх
        if (!user) {
            user = await db_1.prisma.user.create({
                data: {
                    email,
                    name,
                },
            });
        }
        done(null, user);
    }
    catch (err) {
        if (err instanceof Error) {
            done(err, undefined);
        }
        else {
            done(new Error(String(err)), undefined);
        }
    }
}));
// Session serialization - зөвхөн user ID хадгална
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
// Session deserialization - ID ашиглаад бүтэн мэдээлэл татах
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await db_1.prisma.user.findUnique({
            where: { id },
        });
        done(null, user);
    }
    catch (err) {
        if (err instanceof Error) {
            done(err, null);
        }
        else {
            done(new Error(String(err)), null);
        }
    }
});
//# sourceMappingURL=auth.js.map