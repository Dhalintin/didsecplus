// @ts-nocheck
import { PrismaClient } from "@prisma/client";

import { eachDayOfInterval, format } from "date-fns";

const prisma = new PrismaClient();

export class AnalyticsService {
  static async getUserAnalytics(
    roleFilter: any = {},
    startDate: string = null,
    endDate: string = null
  ) {
    try {
      let dateRange: string[] = [];
      if (!startDate || !endDate) {
        const [earliestUser, earliestAlert, latestUser, latestAlert] =
          await Promise.all([
            prisma.user.findFirst({
              orderBy: { created_at: "asc" },
              select: { created_at: true },
            }),
            prisma.alert.findFirst({
              orderBy: { created_at: "asc" },
              select: { created_at: true },
            }),
            prisma.user.findFirst({
              orderBy: { created_at: "desc" },
              select: { created_at: true },
            }),
            prisma.alert.findFirst({
              orderBy: { created_at: "desc" },
              select: { created_at: true },
            }),
          ]);

        const earliest =
          earliestUser?.created_at || earliestAlert?.created_at || new Date(0);
        const latest =
          latestUser?.created_at || latestAlert?.created_at || new Date();
        dateRange = eachDayOfInterval({
          start: earliest,
          end: latest,
        }).map((date: Date) => format(date, "yyyy-MM-dd"));
      } else {
        dateRange = eachDayOfInterval({
          start: new Date(startDate),
          end: new Date(endDate),
        }).map((date: Date) => format(date, "yyyy-MM-dd"));
      }

      interface SignupGroup {
        created_at: Date;
        _count: { id: number };
      }

      interface ActiveUserGroup {
        created_at: Date;
        userId: number | string | null;
        _count: { id: number };
      }

      interface DeviceBreakdownGroup {
        source: string;
        _count: { id: number };
      }

      interface TopLocationGroup {
        state: string;
        lga: string;
        _count: { id: number };
      }

      // Build where clause dynamically
      const whereClause: Prisma.UserWhereInput = {};
      if (startDate && endDate) {
        whereClause.created_at = { gte: startDate, lte: endDate };
      }
      if (Object.keys(roleFilter).length > 0) {
        Object.assign(whereClause, roleFilter);
      }

      const signups = await prisma.user.groupBy({
        by: ["created_at"],
        where: whereClause,
        _count: { id: true },
      });

      const signupSeries = dateRange.reduce(
        (acc: Record<string, number>, date: string) => {
          const signup = signups.find(
            (s: SignupGroup) => format(s.created_at, "yyyy-MM-dd") === date
          );
          acc[date] = signup ? signup._count.id : 0;
          return acc;
        },
        {} as Record<string, number>
      );

      const activeUsers = await prisma.alert.groupBy({
        by: ["created_at", "userId"],
        where: whereClause,
        _count: { id: true },
      });

      const activeUserSeries = dateRange.reduce(
        (acc: Record<string, number>, date: string) => {
          const dailyUsers = activeUsers.filter(
            (a: ActiveUserGroup) =>
              format(a.created_at, "yyyy-MM-dd") === date && a.userId !== null
          );
          acc[date] = new Set(
            dailyUsers.map((a: ActiveUserGroup) =>
              typeof a.userId === "string" ? a.userId : String(a.userId)
            )
          ).size;
          return acc;
        },
        {} as Record<string, number>
      );

      const deviceBreakdown = await prisma.alert.groupBy({
        by: ["source"],
        where: whereClause,
        _count: { id: true },
      });

      const deviceSummary = {
        phone:
          deviceBreakdown.find(
            (d: DeviceBreakdownGroup) => d.source === "phone"
          )?._count.id || 0,
        app:
          deviceBreakdown.find((d: DeviceBreakdownGroup) => d.source === "app")
            ?._count.id || 0,
        web:
          deviceBreakdown.find((d: DeviceBreakdownGroup) => d.source === "web")
            ?._count.id || 0,
      };

      const topLocations = await prisma.alert.groupBy({
        by: ["state", "lga"],
        where: whereClause,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      });

      const response = {
        signups: signupSeries,
        activeUsers: activeUserSeries,
        deviceBreakdown,
        topLocations: topLocations.map((loc: TopLocationGroup) => ({
          state: loc.state,
          lga: loc.lga,
          alertCount: loc._count.id,
        })),
      };

      return response;
    } catch (error) {
      throw new Error(`Failed to get user analytics: ${error.message}`);
    }
  }

  // static async getAlertAnalytics(data: any) {
  //   const [startDate, endDate, state, lga] = data;

  //   const filters: any = {
  //     created_at: { gte: startDate, lte: endDate },
  //   };
  //   if (state) filters.state = state as string;
  //   if (lga) filters.lga = lga as string;

  //   const dateRange = eachDayOfInterval({ start: startDate, end: endDate }).map(
  //     (date) => format(date, "yyyy-MM-dd")
  //   );

  //   const dailyAlerts = await prisma.alert.groupBy({
  //     by: ["created_at"],
  //     where: filters,
  //     _count: { id: true },
  //   });

  //   const dailyCounts = dateRange.reduce((acc, date) => {
  //     const alert: any = dailyAlerts.find(
  //       (a: any) => format(a.created_at, "yyyy-MM-dd") === date
  //     );
  //     acc[date] = alert ? alert._count.id : 0;
  //     return acc;
  //   }, {} as Record<string, number>);

  //   const polygonCounts = await prisma.alert.groupBy({
  //     by: ["state", "lga"],
  //     where: filters,
  //     _count: { id: true },
  //   });

  //   const lgas = await prisma.lga.findMany({
  //     where: {
  //       stateId: state
  //         ? {
  //             in: (
  //               await prisma.state.findMany({
  //                 where: { name: state as string },
  //               })
  //             ).map((s: any) => s.id),
  //           }
  //         : undefined,
  //       name: lga ? (lga as string) : undefined,
  //     },
  //     select: { id: true, name: true, stateId: true, geometry: true },
  //   });

  //   const polygonData = polygonCounts.map((count: any) => {
  //     const lgaData = lgas.find((l: any) => l.name === count.lga);
  //     return {
  //       state: count.state,
  //       lga: count.lga,
  //       alertCount: count._count.id,
  //       geometry: lgaData ? lgaData.geometry : null,
  //     };
  //   });

  //   const response = {
  //     dailyCounts,
  //     polygonCounts: polygonData,
  //   };

  //   return response;
  // }

  static async getAlertAnalytics(data: any) {
    const [startDate = null, endDate = null, state = null, lga = null] = data;
    let dateRange: string[] = [];
    if (!startDate || !endDate) {
      const [earliestAlert, latestAlert] = await Promise.all([
        prisma.alert.findFirst({
          orderBy: { created_at: "asc" },
          select: { created_at: true },
        }),
        prisma.alert.findFirst({
          orderBy: { created_at: "desc" },
          select: { created_at: true },
        }),
      ]);

      const earliest = earliestAlert?.created_at || new Date(0);
      const latest = latestAlert?.created_at || new Date();
      dateRange = eachDayOfInterval({
        start: earliest,
        end: latest,
      }).map((date: Date) => format(date, "yyyy-MM-dd"));
    } else {
      dateRange = eachDayOfInterval({
        start: new Date(startDate),
        end: new Date(endDate),
      }).map((date: Date) => format(date, "yyyy-MM-dd"));
    }

    const filters: Prisma.AlertWhereInput = {};
    if (startDate && endDate) {
      filters.created_at = { gte: startDate, lte: endDate };
    }
    if (state) filters.state = state as string;
    if (lga) filters.lga = lga as string;

    const dailyAlerts = await prisma.alert.groupBy({
      by: ["created_at"],
      where: filters,
      _count: { id: true },
    });

    const dailyCounts = dateRange.reduce(
      (acc: Record<string, number>, date: string) => {
        const alert = dailyAlerts.find(
          (a: any) => format(a.created_at, "yyyy-MM-dd") === date
        );
        acc[date] = alert ? alert._count.id : 0;
        return acc;
      },
      {} as Record<string, number>
    );

    const polygonCounts = await prisma.alert.groupBy({
      by: ["state", "lga"],
      where: filters,
      _count: { id: true },
    });

    const lgaQuery: Prisma.LgaWhereInput = {};
    if (state) {
      const states = await prisma.state.findMany({
        where: { name: state as string },
      });
      lgaQuery.stateId = { in: states.map((s: any) => s.id) };
    }
    if (lga) {
      lgaQuery.name = lga as string;
    }

    const lgas = await prisma.lga.findMany({
      where: lgaQuery,
      select: { id: true, name: true, stateId: true, geometry: true },
    });

    const polygonData = polygonCounts.map((count: any) => {
      const lgaData = lgas.find((l: any) => l.name === count.lga);
      return {
        state: count.state,
        lga: count.lga,
        alertCount: count._count.id,
        geometry: lgaData ? lgaData.geometry : null,
      };
    });

    const response = {
      dailyCounts,
      polygonCounts: polygonData,
    };

    return response;
  }
}
