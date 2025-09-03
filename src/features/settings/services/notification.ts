import { PrismaClient } from "@prisma/client";
import { NotificationSettingDto } from "../dtos/settingDto";
const prisma = new PrismaClient();
export class NotificationService {
  static async getNotification(userId: string) {
    const existingSetting = await prisma.notificationSetting.findUnique({
      where: { userId },
    });

    if (existingSetting) return existingSetting;

    const newSetting = await prisma.notificationSetting.create({
      data: {
        userId,
      },
    });

    return newSetting;
  }

  static async updateNotification(
    userId: string,
    data: NotificationSettingDto
  ) {
    return await prisma.notificationSetting.update({
      where: { userId },
      data,
    });
  }
}
