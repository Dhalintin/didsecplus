"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class UserService {
    createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Cross 3");
            const user = yield prisma.user.create({
                data: Object.assign(Object.assign({}, data), { role: data.role || "user" }),
            });
            console.log("Cross 4");
            return user;
        });
    }
    getUsers(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const { page = 1, page_size = 20, role, q, location } = data;
            const limit = Math.max(1, page_size);
            const skip = Math.max(0, (page - 1) * limit);
            const matchStage = {};
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
            const usersResult = yield prisma.$runCommandRaw({
                aggregate: "User",
                pipeline,
                cursor: {},
            });
            const countPipeline = [{ $match: matchStage }, { $count: "total" }];
            const countResult = yield prisma.$runCommandRaw({
                aggregate: "User",
                pipeline: countPipeline,
                cursor: {},
            });
            const total = ((_b = (_a = countResult.cursor) === null || _a === void 0 ? void 0 : _a.firstBatch[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
            const users = ((_c = usersResult.cursor) === null || _c === void 0 ? void 0 : _c.firstBatch) || [];
            const formattedUsers = users.map((user) => ({
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
        });
    }
    getUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({
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
                ticketIds: user.tickets.map((t) => t.id),
                created_at: user.created_at.toISOString(),
                recentTickets: user.tickets.map((t) => ({
                    id: t.id,
                    title: t.title,
                    status: t.status,
                    created_at: t.created_at.toISOString(),
                })),
            };
            return response;
        });
    }
    updateUser(updatData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, data } = updatData;
            return yield prisma.user.update({
                where: { id },
                data,
            });
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.user.delete({
                where: { id },
            });
        });
    }
}
exports.UserService = UserService;
