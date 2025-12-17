import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function checkAlertLimits(userId: string): Promise<{
  canCreate: boolean;
  reason?: string;
  dailyCount: number;
  weeklyCount: number;
}> {
  const now = new Date();

  // Start of today (00:00:00)
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  // Start of current week (Monday 00:00:00)
  const startOfWeek = new Date(now);
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust to get Monday
  startOfWeek.setDate(now.getDate() - diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  // Count alerts created today
  const dailyCount = await prisma.alert.count({
    where: {
      userId,
      created_at: {
        gte: startOfDay,
      },
    },
  });

  // Count alerts created this week
  const weeklyCount = await prisma.alert.count({
    where: {
      userId,
      created_at: {
        gte: startOfWeek,
      },
    },
  });

  if (dailyCount >= 2) {
    return {
      canCreate: false,
      reason: "You have reached the daily limit of 2 alerts.",
      dailyCount,
      weeklyCount,
    };
  }

  if (weeklyCount >= 8) {
    return {
      canCreate: false,
      reason: "You have reached the weekly limit of 8 alerts.",
      dailyCount,
      weeklyCount,
    };
  }

  return {
    canCreate: true,
    dailyCount,
    weeklyCount,
  };
}
