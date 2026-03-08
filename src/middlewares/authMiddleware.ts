import { Request, Response, NextFunction } from "express";
import { tokenService } from "../utils/jwt";

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
  const token: string | undefined = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ success: false, message: "Token required" });
    return;
  }

  try {
    const payload = tokenService.verifyToken(token);
    req.user = payload;
    if (payload.role !== "admin" && payload.role !== "superAdmin") {
      res.status(403).json({
        success: false,
        message: "Forbidden: you don't have clearance for this",
      });
      return;
    }
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token." });
    return;
  }
};
