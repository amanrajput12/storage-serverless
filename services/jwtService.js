import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRY = "7d"; // 7 days

export const generateToken = (userId, rootDirId) => {
  return jwt.sign(
    {
      userId,
      rootDirId,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRY,
    }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};
