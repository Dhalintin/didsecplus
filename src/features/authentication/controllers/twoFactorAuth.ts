import { Request, Response, NextFunction } from "express";
import { TwoFactorAuthService } from "../services/twoFactorAuth";
import CustomeResponse from "../../../utils/helpers/response.util";
const twoFAService = new TwoFactorAuthService();

export const generate2FA = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user as { userId: string };
    const result = await twoFAService.generateSecret(userId);
    new CustomeResponse( 200, true, "2FA secret generated successfully", res, {
      qr: result.qr,
      otpauth_url: result.otpauth_url,

      base32: result.base32,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate 2FA" });
  }
};

export const verify2FA = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user as { userId: string };
    const { code } = req.body;
    if (!code) {
      new CustomeResponse(400, false, "Code is required", res);
    }
    const valid = await twoFAService.verifyCode(userId, code);
    new CustomeResponse(200, true, "2FA code verification successful", res, { valid });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to verify 2FA" });
  }
};

export const enable2FA = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user as { userId: string };
    const { code } = req.body;
    if (!code) {
      new CustomeResponse(400, false, "Code is required", res);
      // res.status(400).json({ error: "Code is required" });
    return
  }
    await twoFAService.enable2FA(userId, code);
    new CustomeResponse(200, true, "2FA enabled successfully", res, { enabled: true });
    // res.status(201).json({ enabled: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to enable 2FA" });
  }
};

export const disable2FA = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user as { userId: string };
    const { code } = req.body;
    if (!code) {
      new CustomeResponse(400, false, "Code is required", res);
      //  res.status(400).json({ error: "Code is required" });
        return;
    }
    await twoFAService.disable2FA(userId, code);
    new CustomeResponse(200, true, "2FA disabled successfully", res, { disabled: true });
    // res.status(200).json({ disabled: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to disable 2FA" });
  }
};
