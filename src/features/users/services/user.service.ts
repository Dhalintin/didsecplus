import { PrismaClient } from "@prisma/client";
import { GetUserDTO, UserResponse } from "../dtos/alert.dto";
import { User } from "../../authentication/dtos/registerUserDto";

const prisma = new PrismaClient();

export class UserService {
  async createUser(data: any) {
    const user = await prisma.user.create({
      data: {
        ...data,
        role: data.role || "user",
      },
    });

    return user;
  }

  async getUsers(data: GetUserDTO) {
    const { page = 1, page_size = 20, role, q, location } = data;

    const limit = Math.max(1, page_size);
    const skip = Math.max(0, (page - 1) * limit);

    const matchStage: any = {};
    if (role) {
      if (!["superAdmin", "admin", "citizen"].includes(role)) {
        throw new Error("Invalid role");
      }
      matchStage.role = role;
    }
    if (location) {
      matchStage.location = { $regex: location, $options: "i" };
    }
    if (q) {
      matchStage.$or = [
        { username: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
      ];
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "Ticket",
          localField: "_id",
          foreignField: "created_by",
          as: "tickets",
        },
      },
      {
        $project: {
          // id: "$_id",
          id: { $toString: "$_id" },
          username: { $ifNull: ["$username", ""] },
          name: { $ifNull: ["$name", ""] },
          role: 1,
          location: { $ifNull: ["$location", ""] },
          device: { $ifNull: ["$device", "Unknown"] },
          // ticketIds: {
          //   $map: { input: "$tickets", as: "ticket", in: "$$ticket._id" },
          // },
          ticketIds: {
            $map: {
              input: "$tickets",
              as: "ticket",
              in: { $toString: "$$ticket._id" },
            },
          },
          created_at: { $toString: "$created_at" },
          _id: 0,
        },
      },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const usersResult: any = await prisma.$runCommandRaw({
      aggregate: "User",
      pipeline,
      cursor: {},
    });

    const countPipeline = [{ $match: matchStage }, { $count: "total" }];
    const countResult: any = await prisma.$runCommandRaw({
      aggregate: "User",
      pipeline: countPipeline,
      cursor: {},
    });

    const total = countResult.cursor?.firstBatch[0]?.total || 0;
    const users = usersResult.cursor?.firstBatch || [];

    const formattedUsers: UserResponse[] = users.map((user: any) => ({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      location: user.location,
      device: user.device,
      ticketIds: user.ticketIds || [],
      created_at: user.created_at,
    }));

    return {
      data: formattedUsers,
      meta: {
        total,
        page,
        page_size: limit,
      },
    };
  }

  async getUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        location: true,
        device: true,
        created_at: true,
        tickets: {
          select: { id: true, title: true, status: true, created_at: true },
          orderBy: { created_at: "desc" },
          take: 5,
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const response = {
      id: user.id,
      username: user.username || "",
      name: user.name || "",
      role: user.role,
      location: user.location || "",
      device: user.device || "Unknown",
      ticketIds: user.tickets.map((t: any) => t.id),
      created_at: user.created_at.toISOString(),
      recentTickets: user.tickets.map((t: any) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        created_at: t.created_at.toISOString(),
      })),
    };
    return response;
  }

  async updateUser(updatData: any) {
    const { id, data } = updatData;

    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }
}
