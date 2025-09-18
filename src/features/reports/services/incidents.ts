import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class IncidentService {
  async getIncident() {
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(currentWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(currentWeekStart);

    const total = await prisma.ticket.count();

    const currentWeekTickets = await prisma.ticket.count({
      where: {
        created_at: {
          gte: currentWeekStart,
          lte: now,
        },
      },
    });
    const lastWeekTickets = await prisma.ticket.count({
      where: {
        created_at: {
          gte: lastWeekStart,
          lte: lastWeekEnd,
        },
      },
    });
    const totalPercent =
      lastWeekTickets > 0
        ? ((currentWeekTickets - lastWeekTickets) / lastWeekTickets) * 100
        : currentWeekTickets > 0
        ? 100
        : 0;

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const openTickets = await prisma.ticket.count({
      where: {
        status: "open",
        created_at: {
          gte: today,
          lte: now,
        },
      },
    });

    const currentWeekOpenTickets = await prisma.ticket.count({
      where: {
        status: "open",
        created_at: {
          gte: currentWeekStart,
          lte: now,
        },
      },
    });
    const lastWeekOpenTickets = await prisma.ticket.count({
      where: {
        status: "open",
        created_at: {
          gte: lastWeekStart,
          lte: lastWeekEnd,
        },
      },
    });
    const openTicketsPercent =
      lastWeekOpenTickets > 0
        ? ((currentWeekOpenTickets - lastWeekOpenTickets) /
            lastWeekOpenTickets) *
          100
        : currentWeekOpenTickets > 0
        ? 100
        : 0;

    const resolvedToday = await prisma.ticket.count({
      where: {
        status: "resolved",
        updated_at: {
          gte: today,
          lte: now,
        },
      },
    });

    const currentWeekResolved = await prisma.ticket.count({
      where: {
        status: "resolved",
        updated_at: {
          gte: currentWeekStart,
          lte: now,
        },
      },
    });
    const lastWeekResolved = await prisma.ticket.count({
      where: {
        status: "resolved",
        updated_at: {
          gte: lastWeekStart,
          lte: lastWeekEnd,
        },
      },
    });
    const resolvedPercentage =
      lastWeekResolved > 0
        ? ((currentWeekResolved - lastWeekResolved) / lastWeekResolved) * 100
        : currentWeekResolved > 0
        ? 100
        : 0;

    const responseTimes = await prisma.ticket.findMany({
      where: {
        status: "resolved",
      },
      select: {
        created_at: true,
        updated_at: true,
      },
    });
    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce(
            (sum: number, ticket: { updated_at: Date; created_at: Date }) =>
              sum +
              (ticket.updated_at.getTime() - ticket.created_at.getTime()) /
                (1000 * 3600),
            0
          ) / responseTimes.length
        : 0;

    const assignedAgents = await prisma.ticket.groupBy({
      by: ["assigned_to"],
      where: {
        assigned_to: {
          not: null,
        },
      },
      _count: {
        assigned_to: true,
      },
    });
    const assignedAgentsCount = assignedAgents.length;

    const resolutionPercentage =
      total > 0 ? Math.round((resolvedToday / total) * 10000) / 100 : 0;

    return {
      total,
      totalPercent: Number(totalPercent.toFixed(2)),
      openTickets,
      openTicketsPercent: Number(openTicketsPercent.toFixed(2)),
      resolved: resolvedToday,
      resolvedPercentage: Number(resolvedPercentage.toFixed(2)),
      avgResponseTime: Number(avgResponseTime.toFixed(2)),
      assignedAgents: assignedAgentsCount,
      resolutionPercentage,
    };
  }
}
