import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface AuthRequest extends Request {
  userId?: number;
  userEmail?: string;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error: AppError = new Error("No token provided");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: number;
        email: string;
      };

      (req as AuthRequest).userId = decoded.userId;
      (req as AuthRequest).userEmail = decoded.email;

      next();
    } catch (error) {
      const err: AppError = new Error("Invalid or expired token");
      err.statusCode = 401;
      throw err;
    }
  } catch (error) {
    next(error);
  }
};


