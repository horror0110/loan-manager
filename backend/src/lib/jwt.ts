import jwt, { SignOptions } from "jsonwebtoken";

const SECRET: string = process.env.JWT_SECRET || "supersecret";

export const signToken = (
  payload: object,
  expiresIn: string | number = "1d"
): string => {
  const options: SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign(payload, SECRET, options);
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
};
