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
exports.AuditService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AuditService {
    getTicketTrail(ticketId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.ticketHistory.findMany({
                where: { ticketId },
                // include: {
                //   changedBy: {
                //     select: { id: true, name: true, email: true },
                //   },
                // },
                orderBy: { createdAt: "asc" },
            });
        });
    }
    logTicketChange(ticketId, changedById, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.ticketHistory.createMany({
                data: changes.map((c) => ({
                    ticketId,
                    changedById,
                    field: c.field,
                    oldValue: c.oldValue !== undefined ? JSON.stringify(c.oldValue) : null,
                    newValue: c.newValue !== undefined ? JSON.stringify(c.newValue) : null,
                    comment: c.comment || null,
                })),
            });
        });
    }
    logAlertChange(alertId, changedById, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.alertHistory.createMany({
                data: changes.map((c) => ({
                    alertId,
                    changedById,
                    field: c.field,
                    oldValue: c.oldValue !== undefined ? JSON.stringify(c.oldValue) : null,
                    newValue: c.newValue !== undefined ? JSON.stringify(c.newValue) : null,
                    comment: c.comment || null,
                })),
            });
        });
    }
}
exports.AuditService = AuditService;
