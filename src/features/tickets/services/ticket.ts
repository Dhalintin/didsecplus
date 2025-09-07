import { PrismaClient, Prisma } from "@prisma/client";
import { CreateTicketDTO } from "../dtos/ticket.dto";

const prisma = new PrismaClient();

export class TicketService {
  async createTicket(alert_Id: string, data: CreateTicketDTO) {
    return await prisma.ticket.create({
      data: {
        alert_Id,
        ...data,
      },
    });
  }

  async getTicket(id: string) {
    return await prisma.ticket.findUnique({
      where: {
        id,
      },
    });
  }

  async getTickets(query: any) {
    const { page, page_size, status, assigned_to, created_by } = query;

    const limit = page_size || 20;
    const skip = page ? (page - 1) * limit : 0;

    const matchStage: any = {};
    if (status) matchStage.status = status;
    if (assigned_to) matchStage.assigned_to = assigned_to;
    if (created_by) matchStage.created_by = created_by;

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "Alert",
          localField: "alert_Id",
          foreignField: "_id",
          as: "alert",
        },
      },
      { $unwind: { path: "$alert", preserveNullAndEmptyArrays: true } },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const tickets = await prisma.$runCommandRaw({
      aggregate: "Ticket",
      pipeline,
      cursor: {},
    });

    const countPipeline = [{ $match: matchStage }, { $count: "total" }];
    if (Object.keys(matchStage).length === 0) {
      countPipeline.shift();
      countPipeline.unshift({ $match: {} });
    }
    const countResult = await prisma.$runCommandRaw({
      aggregate: "Ticket",
      pipeline: countPipeline,
      cursor: {},
    });

    const total = countResult.cursor?.firstBatch[0]?.total || 0;

    return {
      data: tickets.cursor.firstBatch,
      meta: {
        page: page || 1,
        page_size: limit,
        total,
      },
    };
  }

  async updateTicket(id: string, data: any) {
    return prisma.ticket.update({
      where: { id },
      data,
    });
  }

  async deleteTicket(id: string) {
    return prisma.ticket.delete({
      where: {
        id,
      },
    });
  }
}
