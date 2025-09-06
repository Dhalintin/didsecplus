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
exports.TicketService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class TicketService {
    createTicket(alert_Id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.ticket.create({
                data: Object.assign({ alert_Id }, data),
            });
        });
    }
    getTicket(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.ticket.findUnique({
                where: {
                    id,
                },
            });
        });
    }
    getTickets(query) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { page, page_size, status, assigned_to, created_by } = query;
            const limit = page_size || 20;
            const skip = page ? (page - 1) * limit : 0;
            const matchStage = {};
            if (status)
                matchStage.status = status;
            if (assigned_to)
                matchStage.assigned_to = assigned_to;
            if (created_by)
                matchStage.created_by = created_by;
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
            const tickets = yield prisma.$runCommandRaw({
                aggregate: "Ticket",
                pipeline,
                cursor: {},
            });
            const countPipeline = [{ $match: matchStage }, { $count: "total" }];
            if (Object.keys(matchStage).length === 0) {
                countPipeline.shift();
                countPipeline.unshift({ $match: {} });
            }
            const countResult = yield prisma.$runCommandRaw({
                aggregate: "Ticket",
                pipeline: countPipeline,
                cursor: {},
            });
            const total = ((_b = (_a = countResult.cursor) === null || _a === void 0 ? void 0 : _a.firstBatch[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
            return {
                data: tickets.cursor.firstBatch,
                meta: {
                    page: page || 1,
                    page_size: limit,
                    total,
                },
            };
        });
    }
    updateTicket(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.ticket.update({
                where: { id },
                data,
            });
        });
    }
    deleteTicket(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.ticket.delete({
                where: {
                    id,
                },
            });
        });
    }
}
exports.TicketService = TicketService;
