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

  // async getTickets(query: GetTicketDTO) {
  //   const {
  //     page = 1,
  //     page_size = 20,
  //     status,
  //     assigned_to,
  //     created_by,
  //     alert_Id,
  //   } = query;

  //   const limit = Math.min(page_size, 100); // safety cap
  //   const skip = (page - 1) * limit;

  //   // Build match stage
  //   const matchStage: any = {};
  //   if (status) matchStage.status = status;
  //   if (assigned_to) matchStage.assigned_to = assigned_to;
  //   if (created_by) matchStage.created_by = created_by;
  //   if (alert_Id) matchStage.alert_Id = alert_Id;

  //   const hasFilters = Object.keys(matchStage).length > 0;

  //   // === MAIN PIPELINE (with pagination) ===
  //   const pipeline = [
  //     ...(hasFilters ? [{ $match: matchStage }] : []),
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

  //   const ticketsResult: any = await prisma.$runCommandRaw({
  //     aggregate: "Ticket",
  //     pipeline,
  //     cursor: { batchSize: limit },
  //   });

  //   // === COUNT PIPELINE (total matching docs) ===
  //   const countPipeline = [
  //     ...(hasFilters ? [{ $match: matchStage }] : []),
  //     { $count: "total" },
  //   ];

  //   const countResult: any = await prisma.$runCommandRaw({
  //     aggregate: "Ticket",
  //     pipeline: countPipeline,
  //     cursor: {},
  //   });

  //   // Extract total safely
  //   const total = countResult.cursor?.firstBatch?.[0]?.total ?? 0;

  //   // Extract tickets
  //   const rawTickets = ticketsResult.cursor?.firstBatch ?? [];

  //   // Transform
  //   const transformedData = rawTickets.map((ticket: any) => ({
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
  //       page: Number(page),
  //       page_size: transformedData.length || limit,
  //       total,
  //       total_pages: Math.ceil(total / limit),
  //     },
  //   };
  // }

  async getTickets(query: GetTicketDTO) {
    const {
      page = 1,
      page_size = 20,
      status,
      assigned_to,
      created_by,
      alert_Id,
    } = query;

    const limit = Math.min(page_size, 100);
    const skip = (page - 1) * limit;

    // Build match stage
    const matchStage: any = {};
    if (status) matchStage.status = status;
    if (assigned_to) matchStage.assigned_to = { $oid: assigned_to };
    if (created_by) matchStage.created_by = { $oid: created_by };
    if (alert_Id) matchStage.alert_Id = { $oid: alert_Id };

    const hasFilters = Object.keys(matchStage).length > 0;

    // === MAIN PIPELINE ===
    const pipeline = [
      ...(hasFilters ? [{ $match: matchStage }] : []),

      // Lookup Alert
      {
        $lookup: {
          from: "Alert",
          localField: "alert_Id",
          foreignField: "_id",
          as: "alert",
        },
      },
      { $unwind: { path: "$alert", preserveNullAndEmptyArrays: true } },

      // Lookup Created By User
      {
        $lookup: {
          from: "User",
          localField: "created_by",
          foreignField: "_id",
          as: "createdByUser",
        },
      },
      { $unwind: { path: "$createdByUser", preserveNullAndEmptyArrays: true } },

      // Lookup Assigned To User
      {
        $lookup: {
          from: "User",
          localField: "assigned_to",
          foreignField: "_id",
          as: "assignedToUser",
        },
      },
      {
        $unwind: { path: "$assignedToUser", preserveNullAndEmptyArrays: true },
      },

      // Sort & Paginate
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit },

      // Project final shape
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          status: 1,
          priority: 1,
          note: 1,
          created_at: 1,
          updated_at: 1,
          alert_Id: 1,
          created_by: 1,
          assigned_to: 1,

          alert: {
            id: "$alert._id",
            userId: "$alert.userId",
            title: "$alert.title",
            description: "$alert.description",
            status: "$alert.status",
            source: "$alert.source",
            latitude: "$alert.latitude",
            longitude: "$alert.longitude",
            state: "$alert.state",
            lga: "$alert.lga",
            created_at: "$alert.created_at",
            updated_at: "$alert.updated_at",
          },

          createdBy: {
            id: "$createdByUser._id",
            name: "$createdByUser.name",
            username: "$createdByUser.username",
            email: "$createdByUser.email",
            role: "$createdByUser.role",
            phone: "$createdByUser.phone",
          },
        },
      },
    ];

    const ticketsResult: any = await prisma.$runCommandRaw({
      aggregate: "Ticket",
      pipeline,
      cursor: { batchSize: limit },
    });

    const countPipeline = [
      ...(hasFilters ? [{ $match: matchStage }] : []),
      { $count: "total" },
    ];

    const countResult: any = await prisma.$runCommandRaw({
      aggregate: "Ticket",
      pipeline: countPipeline,
      cursor: {},
    });

    const total = countResult.cursor?.firstBatch?.[0]?.total ?? 0;
    const rawTickets = ticketsResult.cursor?.firstBatch ?? [];

    // Transform dates & ObjectIds safely
    const transformedData = rawTickets.map((ticket: any) => ({
      id: ticket._id?.$oid || ticket._id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      note: ticket.note,
      created_at: ticket.created_at?.$date || ticket.created_at,
      updated_at: ticket.updated_at?.$date || ticket.updated_at,
      alert_Id: ticket.alert_Id?.$oid || ticket.alert_Id,
      created_by: ticket.created_by?.$oid || ticket.created_by,
      assigned_to: ticket.assigned_to?.$oid || ticket.assigned_to,

      alert: ticket.alert
        ? {
            id: ticket.alert.id?.$oid || ticket.alert.id,
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

      createdBy: ticket.createdBy
        ? {
            id: ticket.createdBy.id?.$oid || ticket.createdBy.id,
            name: ticket.createdBy.name,
            email: ticket.createdBy.email,
            role: ticket.createdBy.role,
          }
        : null,

      assignedTo: ticket.assignedTo
        ? {
            id: ticket.assignedTo.id?.$oid || ticket.assignedTo.id,
            name: ticket.assignedTo.name,
            email: ticket.assignedTo.email,
            role: ticket.assignedTo.role,
          }
        : null,
    }));

    return {
      data: transformedData,
      meta: {
        page: Number(page),
        page_size: transformedData.length,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getTicketStatusCounts(): Promise<{
    live: number;
    resolved: number;
    open: number;
    in_progress: number;
    cached: boolean;
    // refreshed_at: Date;
  }> {
    // const cache = await prisma.ticketStatusSummary.findFirst({
    //   select: {
    //     live: true,
    //     resolved: true,
    //     open: true,
    //     in_progress: true,
    //     refreshed_at: true,
    //   },
    // });

    // if (cache) {
    //   return {
    //     ...cache,
    //     live: Number(cache.live),
    //     resolved: Number(cache.resolved),
    //     open: Number(cache.open),
    //     in_progress: Number(cache.in_progress),
    //     cached: true,
    //     refreshed_at: cache.refreshed_at,
    //   };
    // }

    // Step 2: Fallback to Prisma groupBy (translates to MongoDB $group aggregation)
    // This is a single aggregation pipeline: [{ $group: { _id: "$status", count: { $sum: 1 } } }]
    const grouped = await prisma.ticket.groupBy({
      by: ["status"],
      _count: {
        id: true, // Counts documents per status group
      },
      // No where/orderBy/having needed for full counts
    });

    // Transform results (O(1) since only 3 possible statuses)
    const counts = {
      open: 0,
      in_progress: 0,
      resolved: 0,
    };

    for (const group of grouped) {
      if (group.status in counts) {
        counts[group.status as keyof typeof counts] = group._count.id;
      }
    }

    const live = counts.open + counts.in_progress;

    return {
      live,
      resolved: counts.resolved,
      open: counts.open,
      in_progress: counts.in_progress,
      cached: false,
      // refreshed_at: new Date(),
    };
  }

  async updateTicket(ticketId: string, data: any, userId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch old ticket (for comparison)
      const oldTicket = await tx.ticket.findUnique({
        where: { id: ticketId },
        select: {
          id: true,
          alert_Id: true,
          status: true,
          assigned_to: true,
          note: true,
          priority: true,
        },
      });

      if (!oldTicket) {
        throw new Error("Ticket not found");
      }

      // 2. Update the ticket
      const updatedTicket = await tx.ticket.update({
        where: { id: ticketId },
        data,
      });

      // 3. Detect what actually changed
      const changes: Array<{
        field: string;
        oldValue: any;
        newValue: any;
        comment?: string;
      }> = [];

      if (data.status && oldTicket.status !== data.status) {
        changes.push({
          field: "status",
          oldValue: oldTicket.status,
          newValue: data.status,
          comment:
            data.status === "in_progress"
              ? "Investigation started"
              : data.status === "resolved"
              ? "Ticket resolved"
              : undefined,
        });
      }

      if (
        data.assigned_to !== undefined &&
        oldTicket.assigned_to !== data.assigned_to
      ) {
        changes.push({
          field: "assigned_to",
          oldValue: oldTicket.assigned_to,
          newValue: data.assigned_to,
          comment: data.assigned_to ? "Reassigned" : "Unassigned",
        });
      }

      if (data.note !== undefined && oldTicket.note !== data.note) {
        changes.push({
          field: "note",
          oldValue: oldTicket.note,
          newValue: data.note,
        });
      }

      if (data.priority && oldTicket.priority !== data.priority) {
        changes.push({
          field: "priority",
          oldValue: oldTicket.priority,
          newValue: data.priority,
        });
      }

      // 4. Log history if anything changed
      if (changes.length > 0) {
        await tx.ticketHistory.createMany({
          data: changes.map((c) => ({
            ticketId,
            changedById: userId,
            field: c.field,
            oldValue: c.oldValue ? JSON.stringify(c.oldValue) : null,
            newValue:
              c.newValue !== undefined ? JSON.stringify(c.newValue) : null,
            comment: c.comment || null,
          })),
        });
      }

      if (data.status) {
        let newAlertStatus: "active" | "investigating" | "resolved" = "active";

        if (data.status === "in_progress") {
          newAlertStatus = "investigating";
        } else if (data.status === "resolved") {
          // Optional: Only resolve alert if ALL tickets are resolved
          const openTickets = await tx.ticket.count({
            where: {
              alert_Id: oldTicket.alert_Id,
              status: { not: "resolved" },
            },
          });

          newAlertStatus = openTickets === 1 ? "resolved" : "investigating";
        }

        await tx.alert.update({
          where: { id: oldTicket.alert_Id },
          data: { status: newAlertStatus },
        });

        // Optional: Log alert change too
        await tx.alertHistory.create({
          data: {
            alertId: oldTicket.alert_Id,
            changedById: userId,
            field: "status",
            oldValue: null, // you could fetch old alert status if needed
            newValue: newAlertStatus,
            comment: `Auto-updated from ticket #${ticketId}`,
          },
        });
      }

      return updatedTicket;
    });
  }

  async deleteTicket(id: string) {
    return await prisma.ticket.delete({
      where: {
        id,
      },
    });
  }
}
