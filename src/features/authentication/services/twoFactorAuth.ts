import { PrismaClient } from '@prisma/client';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

export class TwoFactorAuthService {
  async generateSecret(userId: string) {
    try {
      const secret = speakeasy.generateSecret({ name: `BiasFreeJob (${userId})` });
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorSecret: secret.base32, twoFactorEnabled: false },
      });
      const qr = await QRCode.toDataURL(secret.otpauth_url!);
      return { otpauth_url: secret.otpauth_url, qr, base32: secret.base32 };
    } catch (error) {
      throw new Error('Failed to generate 2FA secret');
    }
  }

  async verifyCode(userId: string, code: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user?.twoFactorSecret) return false;
      return speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 2, 
      });
    } catch (error) {
      throw new Error('Failed to verify 2FA code');
    }
  }

  async enable2FA(userId: string, code: string) {
    const valid = await this.verifyCode(userId, code);
    if (!valid) throw new Error('Invalid 2FA code');
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });
    return true;
  }

  async disable2FA(userId: string, code: string) {
    const valid = await this.verifyCode(userId, code);
    if (!valid) throw new Error('Invalid 2FA code');
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });
    return true;
  }
}