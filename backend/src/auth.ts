import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./db";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ["profile", "email"], // ← ЭНИЙГ НЭМСЭН
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails![0].value;
        const name = profile.displayName;

        // Хэрэглэгч байгаа эсэхийг шалгах
        let user = await prisma.user.findUnique({
          where: { email },
        });

        // Хэрэв байхгүй бол шинээр үүсгэх
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name,
            },
          });
        }

        done(null, user);
      } catch (err: unknown) {
        if (err instanceof Error) {
          done(err, undefined);
        } else {
          done(new Error(String(err)), undefined);
        }
      }
    }
  )
);

// Session serialization - зөвхөн user ID хадгална
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Session deserialization - ID ашиглаад бүтэн мэдээлэл татах
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (err) {
    if (err instanceof Error) {
      done(err, null);
    } else {
      done(new Error(String(err)), null);
    }
  }
});
