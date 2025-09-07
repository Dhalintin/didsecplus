import { Request, Response, NextFunction } from "express";
import { tokenService } from "../utils/jwt";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token: string | undefined = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ success: false, message: "Token required" });
    return;
  }

  try {
    const payload = tokenService.verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const adminAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Unauthorized!",
    });
    return;
  }

  if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
    res.status(403).json({
      success: false,
      message: "Forbidden: Only admins are allowed",
    });
    return;
  }

  next();
};
