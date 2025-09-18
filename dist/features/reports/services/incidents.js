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
exports.IncidentService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class IncidentService {
    getIncident() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const currentWeekStart = new Date(now);
            currentWeekStart.setDate(now.getDate() - now.getDay());
            currentWeekStart.setHours(0, 0, 0, 0);
            const lastWeekStart = new Date(currentWeekStart);
            lastWeekStart.setDate(currentWeekStart.getDate() - 7);
            const lastWeekEnd = new Date(currentWeekStart);
            const total = yield prisma.ticket.count();
            const currentWeekTickets = yield prisma.ticket.count({
                where: {
                    created_at: {
                        gte: currentWeekStart,
                        lte: now,
                    },
                },
            });
            const lastWeekTickets = yield prisma.ticket.count({
                where: {
                    created_at: {
                        gte: lastWeekStart,
                        lte: lastWeekEnd,
                    },
                },
            });
            const totalPercent = lastWeekTickets > 0
                ? ((currentWeekTickets - lastWeekTickets) / lastWeekTickets) * 100
                : currentWeekTickets > 0
                    ? 100
                    : 0;
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);
            const openTickets = yield prisma.ticket.count({
                where: {
                    status: "open",
                    created_at: {
                        gte: today,
                        lte: now,
                    },
                },
            });
            const currentWeekOpenTickets = yield prisma.ticket.count({
                where: {
                    status: "open",
                    created_at: {
                        gte: currentWeekStart,
                        lte: now,
                    },
                },
            });
            const lastWeekOpenTickets = yield prisma.ticket.count({
                where: {
                    status: "open",
                    created_at: {
                        gte: lastWeekStart,
                        lte: lastWeekEnd,
                    },
                },
            });
            const openTicketsPercent = lastWeekOpenTickets > 0
                ? ((currentWeekOpenTickets - lastWeekOpenTickets) /
                    lastWeekOpenTickets) *
                    100
                : currentWeekOpenTickets > 0
                    ? 100
                    : 0;
            const resolvedToday = yield prisma.ticket.count({
                where: {
                    status: "resolved",
                    updated_at: {
                        gte: today,
                        lte: now,
                    },
                },
            });
            const currentWeekResolved = yield prisma.ticket.count({
                where: {
                    status: "resolved",
                    updated_at: {
                        gte: currentWeekStart,
                        lte: now,
                    },
                },
            });
            const lastWeekResolved = yield prisma.ticket.count({
                where: {
                    status: "resolved",
                    updated_at: {
                        gte: lastWeekStart,
                        lte: lastWeekEnd,
                    },
                },
            });
            const resolvedPercentage = lastWeekResolved > 0
                ? ((currentWeekResolved - lastWeekResolved) / lastWeekResolved) * 100
                : currentWeekResolved > 0
                    ? 100
                    : 0;
            const responseTimes = yield prisma.ticket.findMany({
                where: {
                    status: "resolved",
                },
                select: {
                    created_at: true,
                    updated_at: true,
                },
            });
            const avgResponseTime = responseTimes.length > 0
                ? responseTimes.reduce((sum, ticket) => sum +
                    (ticket.updated_at.getTime() - ticket.created_at.getTime()) /
                        (1000 * 3600), 0) / responseTimes.length
                : 0;
            const assignedAgents = yield prisma.ticket.groupBy({
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
            const resolutionPercentage = total > 0 ? Math.round((resolvedToday / total) * 10000) / 100 : 0;
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
        });
    }
}
exports.IncidentService = IncidentService;
