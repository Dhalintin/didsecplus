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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class TicketService {
    createTicket(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { alert_Id } = data, rest = __rest(data, ["alert_Id"]);
            return yield prisma.ticket.create({
                data: Object.assign(Object.assign({}, rest), { alert: { connect: { id: alert_Id } } }),
            });
        });
    }
    getTicket(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.ticket.findUnique({
                where: {
                    id,
                },
                include: {
                    alert: true,
                },
            });
        });
    }
    getTickets(query) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { page, page_size, status, assigned_to, created_by, alert_Id } = query;
            const limit = page_size || 20;
            const skip = page ? (page - 1) * limit : 0;
            const matchStage = {};
            if (status)
                matchStage.status = status;
            if (assigned_to)
                matchStage.assigned_to = assigned_to;
            if (created_by)
                matchStage.created_by = created_by;
            if (alert_Id)
                matchStage.alert_Id = alert_Id; // Fixed: Should be alert_Id, not created_by
            const pipeline = [
                { $match: Object.keys(matchStage).length > 0 ? matchStage : {} },
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
            const countPipeline = [
                { $match: Object.keys(matchStage).length > 0 ? matchStage : {} },
                { $count: "total" },
            ];
            const countResult = yield prisma.$runCommandRaw({
                aggregate: "Ticket",
                pipeline: countPipeline,
                cursor: {},
            });
            const total = ((_b = (_a = countResult.cursor) === null || _a === void 0 ? void 0 : _a.firstBatch[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
            // Transform the data to the desired format
            const transformedData = tickets.cursor.firstBatch.map((ticket) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                return ({
                    id: ((_a = ticket._id) === null || _a === void 0 ? void 0 : _a.$oid) || ticket._id,
                    created_at: ((_b = ticket.created_at) === null || _b === void 0 ? void 0 : _b.$date) || ticket.created_at,
                    updated_at: ((_c = ticket.updated_at) === null || _c === void 0 ? void 0 : _c.$date) || ticket.updated_at,
                    alert_Id: ((_d = ticket.alert_Id) === null || _d === void 0 ? void 0 : _d.$oid) || ticket.alert_Id,
                    created_by: ((_e = ticket.created_by) === null || _e === void 0 ? void 0 : _e.$oid) || ticket.created_by,
                    title: ticket.title,
                    status: ticket.status,
                    priority: ticket.priority,
                    alert: ticket.alert
                        ? {
                            id: ((_f = ticket.alert._id) === null || _f === void 0 ? void 0 : _f.$oid) || ticket.alert._id,
                            userId: ((_g = ticket.alert.userId) === null || _g === void 0 ? void 0 : _g.$oid) || ticket.alert.userId,
                            title: ticket.alert.title,
                            description: ticket.alert.description,
                            status: ticket.alert.status,
                            source: ticket.alert.source,
                            latitude: ticket.alert.latitude,
                            longitude: ticket.alert.longitude,
                            state: ticket.alert.state,
                            lga: ticket.alert.lga,
                            created_at: ((_h = ticket.alert.created_at) === null || _h === void 0 ? void 0 : _h.$date) || ticket.alert.created_at,
                            updated_at: ((_j = ticket.alert.updated_at) === null || _j === void 0 ? void 0 : _j.$date) || ticket.alert.updated_at,
                        }
                        : null,
                });
            });
            return {
                data: transformedData,
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
            return yield prisma.ticket.update({
                where: { id },
                data,
            });
        });
    }
    deleteTicket(id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Deleting ticket with id:", id);
            // return prisma.ticket.delete({
            //   where: {
            //     id,
            //   },
            // });
        });
    }
}
exports.TicketService = TicketService;
