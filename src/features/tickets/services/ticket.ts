import { PrismaClient, Prisma, Priority } from "@prisma/client";
import { CreateTicketDTO, GetTicketDTO } from "../dtos/ticket.dto";

const prisma = new PrismaClient();

export class TicketService {
  async createTicket(data: CreateTicketDTO) {
    const { alert_Id, ...rest } = data;
    return await prisma.ticket.create({
      data: {
        ...rest,
        alert: { connect: { id: alert_Id } },
      },
    });
  }

  async getTicket(id: string) {
    return await prisma.ticket.findUnique({
      where: {
        id,
      },
      include: {
        alert: true,
      },
    });
  }

  async getAllTicket(id: string) {
    const allTicket = await prisma.ticket.findMany({
      include: {
        alert: true,
      },
    });

    return { data: allTicket, meta: { total: allTicket.length } };
  }

  async countTicket(id: string) {
    const allTicket = await prisma.ticket.findMany({});
    return allTicket.length;
  }

  async getTickets(query: GetTicketDTO) {
    const {
      page = 1,
      page_size = 20,
      status,
      assigned_to,
      created_by,
      alert_Id,
    } = query;

    const limit = Math.min(page_size, 100); // safety cap
    const skip = (page - 1) * limit;

    // Build match stage
    const matchStage: any = {};
    if (status) matchStage.status = status;
    if (assigned_to) matchStage.assigned_to = assigned_to;
    if (created_by) matchStage.created_by = created_by;
    if (alert_Id) matchStage.alert_Id = alert_Id;

    const hasFilters = Object.keys(matchStage).length > 0;

    // === MAIN PIPELINE (with pagination) ===
    const pipeline = [
      ...(hasFilters ? [{ $match: matchStage }] : []),
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

    const ticketsResult: any = await prisma.$runCommandRaw({
      aggregate: "Ticket",
      pipeline,
      cursor: { batchSize: limit },
    });

    // === COUNT PIPELINE (total matching docs) ===
    const countPipeline = [
      ...(hasFilters ? [{ $match: matchStage }] : []),
      { $count: "total" },
    ];

    const countResult: any = await prisma.$runCommandRaw({
      aggregate: "Ticket",
      pipeline: countPipeline,
      cursor: {},
    });

    // Extract total safely
    const total = countResult.cursor?.firstBatch?.[0]?.total ?? 0;

    // Extract tickets
    const rawTickets = ticketsResult.cursor?.firstBatch ?? [];

    // Transform
    const transformedData = rawTickets.map((ticket: any) => ({
      id: ticket._id?.$oid || ticket._id,
      created_at: ticket.created_at?.$date || ticket.created_at,
      updated_at: ticket.updated_at?.$date || ticket.updated_at,
      alert_Id: ticket.alert_Id?.$oid || ticket.alert_Id,
      created_by: ticket.created_by?.$oid || ticket.created_by,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      alert: ticket.alert
        ? {
            id: ticket.alert._id?.$oid || ticket.alert._id,
            userId: ticket.alert.userId?.$oid || ticket.alert.userId,
            title: ticket.alert.title,
            description: ticket.alert.description,
            status: ticket.alert.status,
            source: ticket.alert.source,
            latitude: ticket.alert.latitude,
            longitude: ticket.alert.longitude,
            state: ticket.alert.state,
            lga: ticket.alert.lga,
            created_at:
              ticket.alert.created_at?.$date || ticket.alert.created_at,
            updated_at:
              ticket.alert.updated_at?.$date || ticket.alert.updated_at,
          }
        : null,
    }));

    return {
      data: transformedData,
      meta: {
        page: Number(page),
        page_size: transformedData.length || limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  // async getTickets(query: GetTicketDTO) {
  //   const { page, page_size, status, assigned_to, created_by, alert_Id } =
  //     query;

  //   const limit = page_size || 20;
  //   const skip = page ? (page - 1) * limit : 0;

  //   const matchStage: any = {};
  //   if (status) matchStage.status = status;
  //   if (assigned_to) matchStage.assigned_to = assigned_to;
  //   if (created_by) matchStage.created_by = created_by;
  //   if (alert_Id) matchStage.alert_Id = alert_Id; // Fixed: Should be alert_Id, not created_by

  //   const pipeline = [
  //     { $match: Object.keys(matchStage).length > 0 ? matchStage : {} },
  //     {
  //       $lookup: {
  //         from: "Alert",
  //         localField: "alert_Id",
  //         foreignField: "_id",
  //         as: "alert",
  //       },
  //     },
  //     { $unwind: { path: "$alert", preserveNullAndEmptyArrays: true } },
  //     { $sort: { created_at: -1 } },
  //     { $skip: skip },
  //     { $limit: limit },
  //   ];

  //   const tickets: any = await prisma.$runCommandRaw({
  //     aggregate: "Ticket",
  //     pipeline,
  //     cursor: {},
  //   });

  //   const countPipeline = [
  //     { $match: Object.keys(matchStage).length > 0 ? matchStage : {} },
  //     { $count: "total" },
  //   ];
  //   const countResult: any = await prisma.$runCommandRaw({
  //     aggregate: "Ticket",
  //     pipeline: countPipeline,
  //     cursor: {},
  //   });

  //   const total = countResult.cursor?.firstBatch[0]?.total || 0;

  //   // Transform the data to the desired format
  //   const transformedData = tickets.cursor.firstBatch.map((ticket: any) => ({
  //     id: ticket._id?.$oid || ticket._id,
  //     created_at: ticket.created_at?.$date || ticket.created_at,
  //     updated_at: ticket.updated_at?.$date || ticket.updated_at,
  //     alert_Id: ticket.alert_Id?.$oid || ticket.alert_Id,
  //     created_by: ticket.created_by?.$oid || ticket.created_by,
  //     title: ticket.title,
  //     status: ticket.status,
  //     priority: ticket.priority,
  //     alert: ticket.alert
  //       ? {
  //           id: ticket.alert._id?.$oid || ticket.alert._id,
  //           userId: ticket.alert.userId?.$oid || ticket.alert.userId,
  //           title: ticket.alert.title,
  //           description: ticket.alert.description,
  //           status: ticket.alert.status,
  //           source: ticket.alert.source,
  //           latitude: ticket.alert.latitude,
  //           longitude: ticket.alert.longitude,
  //           state: ticket.alert.state,
  //           lga: ticket.alert.lga,
  //           created_at:
  //             ticket.alert.created_at?.$date || ticket.alert.created_at,
  //           updated_at:
  //             ticket.alert.updated_at?.$date || ticket.alert.updated_at,
  //         }
  //       : null,
  //   }));

  //   return {
  //     data: transformedData,
  //     meta: {
  //       page: page || 1,
  //       page_size: limit,
  //       total,
  //     },
  //   };
  // }

  async updateTicket(id: string, data: any) {
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data,
    });

    if (data.status && data.status === "resolved") {
      await prisma.alert.updateMany({
        where: { id: updatedTicket.alert_Id },
        data: { status: "resolved" },
      });
    }

    return updatedTicket;
  }

  async deleteTicket(id: string) {
    return await prisma.ticket.delete({
      where: {
        id,
      },
    });
  }
}
