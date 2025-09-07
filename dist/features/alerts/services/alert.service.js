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
exports.AlertService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AlertService {
    createAlert(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const alert = yield prisma.alert.create({
                data: Object.assign({ userId }, data),
            });
            const user = yield prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!user) {
                return alert;
            }
            yield prisma.ticket.create({
                data: {
                    alert_Id: alert.id,
                    title: `Follow up: ${data.title}`,
                    created_by: userId,
                },
            });
            return alert;
        });
    }
    getAlerts(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { page, page_size, status, state, lga, from, to } = data;
            // Ensure page and page_size are numbers
            const limit = Number(page_size) || 20;
            const skip = Number(page - 1) * limit || 0;
            // Build match stage
            const matchStage = {};
            if (status)
                matchStage.status = status;
            if (state)
                matchStage.state = state;
            if (lga)
                matchStage.lga = lga;
            if (from || to) {
                matchStage.created_at = {};
                if (from)
                    matchStage.created_at.$gte = new Date(from);
                if (to)
                    matchStage.created_at.$lte = new Date(to);
            }
            // Aggregation pipelines
            const pipeline = [
                { $match: matchStage },
                { $sort: { created_at: -1 } },
                { $skip: skip },
                { $limit: limit },
            ];
            const countPipeline = [{ $match: matchStage }, { $count: "total" }];
            // Execute queries
            const alertsResult = (yield prisma.alert.aggregateRaw({ pipeline }));
            const countResult = (yield prisma.alert.aggregateRaw({
                pipeline: countPipeline,
            }));
            // Transform data
            const transformedData = (alertsResult || []).map((alert) => {
                var _a, _b, _c, _d;
                return ({
                    id: ((_a = alert._id) === null || _a === void 0 ? void 0 : _a.$oid) || alert._id,
                    userId: ((_b = alert.userId) === null || _b === void 0 ? void 0 : _b.$oid) || alert.userId || null,
                    title: alert.title,
                    description: alert.description || null,
                    status: alert.status,
                    source: alert.source,
                    latitude: alert.latitude,
                    longitude: alert.longitude,
                    state: alert.state,
                    lga: alert.lga,
                    assigned_unit: alert.assigned_unit || null,
                    created_at: ((_c = alert.created_at) === null || _c === void 0 ? void 0 : _c.$date) || alert.created_at,
                    updated_at: ((_d = alert.updated_at) === null || _d === void 0 ? void 0 : _d.$date) || alert.updated_at,
                });
            });
            const total = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
            return {
                data: transformedData,
                meta: {
                    total,
                    page: Number(page) || 1,
                    page_size: transformedData.length,
                    limit,
                },
            };
            // const { page, page_size, status, state, lga, from, to } = data;
            // // Ensure page and page_size are numbers
            // const limit = Number(page_size) || 20;
            // const skip = Number(page - 1) * limit || 0;
            // // Build match stage
            // const matchStage: any = {};
            // if (status) matchStage.status = status;
            // if (state) matchStage.state = state;
            // if (lga) matchStage.lga = lga;
            // if (from || to) {
            //   matchStage.created_at = {};
            //   if (from) matchStage.created_at.$gte = new Date(from);
            //   if (to) matchStage.created_at.$lte = new Date(to);
            // }
            // // Aggregation pipelines
            // const pipeline = [
            //   { $match: matchStage },
            //   { $sort: { created_at: -1 } },
            //   { $skip: skip },
            //   { $limit: limit },
            // ];
            // const countPipeline = [{ $match: matchStage }, { $count: "total" }];
            // // Execute queries
            // const alertsResult = (await prisma.alert.aggregateRaw({ pipeline })) as any;
            // const countResult = (await prisma.alert.aggregateRaw({
            //   pipeline: countPipeline,
            // })) as any;
            // // Transform data
            // const transformedData: Alert[] = (alertsResult || []).map((alert: any) => ({
            //   id: alert._id?.$oid || alert._id,
            //   userId: alert.userId?.$oid || alert.userId || null,
            //   title: alert.title,
            //   description: alert.description || null,
            //   status: alert.status,
            //   source: alert.source,
            //   latitude: alert.latitude,
            //   longitude: alert.longitude,
            //   state: alert.state,
            //   lga: alert.lga,
            //   assigned_unit: alert.assigned_unit || null,
            //   created_at: alert.created_at?.$date || alert.created_at,
            //   updated_at: alert.updated_at?.$date || alert.updated_at,
            // }));
            // const total = countResult[0]?.total || 0;
            // return {
            //   data: transformedData,
            //   meta: { total, page, page_size: limit },
            // };
        });
    }
    getAlertById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.alert.findUnique({
                where: { id },
            });
        });
    }
    updateAlert(updatData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, data } = updatData;
            return yield prisma.alert.update({
                where: { id },
                data,
            });
        });
    }
    deleteAlert(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.alert.delete({
                where: { id },
            });
        });
    }
}
exports.AlertService = AlertService;
