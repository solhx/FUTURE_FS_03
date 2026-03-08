import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateToken = (id: mongoose.Types.ObjectId | string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  } as jwt.SignOptions);
};

export default generateToken;