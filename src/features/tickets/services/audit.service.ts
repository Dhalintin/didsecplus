import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AuditService {
  async getTicketTrail(ticketId: string) {
    return await prisma.ticketHistory.findMany({
      where: { ticketId },
      // include: {
      //   changedBy: {
      //     select: { id: true, name: true, email: true },
      //   },
      // },
      orderBy: { createdAt: "asc" },
    });
  }
  async logTicketChange(
    ticketId: string,
    changedById: string | null,
    changes: {
      field: string;
      oldValue?: any;
      newValue?: any;
      comment?: string;
    }[]
  ) {
    await prisma.ticketHistory.createMany({
      data: changes.map((c) => ({
        ticketId,
        changedById,
        field: c.field,
        oldValue: c.oldValue !== undefined ? JSON.stringify(c.oldValue) : null,
        newValue: c.newValue !== undefined ? JSON.stringify(c.newValue) : null,
        comment: c.comment || null,
      })),
    });
  }

  async logAlertChange(
    alertId: string,
    changedById: string | null,
    changes: {
      field: string;
      oldValue?: any;
      newValue?: any;
      comment?: string;
    }[]
  ) {
    await prisma.alertHistory.createMany({
      data: changes.map((c) => ({
        alertId,
        changedById,
        field: c.field,
        oldValue: c.oldValue !== undefined ? JSON.stringify(c.oldValue) : null,
        newValue: c.newValue !== undefined ? JSON.stringify(c.newValue) : null,
        comment: c.comment || null,
      })),
    });
  }
}
