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
            const alert = prisma.alert.create({
                data: Object.assign({ userId }, data),
            });
            const user = prisma.user.findUnique({
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
                    created_by: `Operator: ${user.phone}`,
                },
            });
            return alert;
        });
    }
    getAlerts(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { page, page_size, status, state, lga, from, to } = data;
            const limit = page_size || 20;
            const skip = page ? (page - 1) * limit : 0;
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
                    matchStage.created_at.$gte = { $date: new Date(from) };
                if (to)
                    matchStage.created_at.$lte = { $date: new Date(to) };
            }
            const pipeline = [
                { $match: matchStage },
                { $sort: { created_at: -1 } },
                { $skip: skip },
                { $limit: limit },
            ];
            const alerts = yield prisma.$runCommandRaw({
                aggregate: "Alert",
                pipeline,
                cursor: {},
            });
            const countPipeline = [{ $match: matchStage }, { $count: "total" }];
            const countResult = yield prisma.$runCommandRaw({
                aggregate: "Alert",
                pipeline: countPipeline,
                cursor: {},
            });
            const total = ((_b = (_a = countResult.cursor) === null || _a === void 0 ? void 0 : _a.firstBatch[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
            return {
                data: alerts.cursor.firstBatch,
                meta: {
                    total,
                    page: page || 1,
                    page_size: limit,
                },
            };
        });
    }
    getAlertById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.jobSeeker.findUnique({
                where: { id },
            });
        });
    }
    updateAlert(updatData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, data } = updatData;
            return yield prisma.application.update({
                where: { id },
                data,
            });
        });
    }
    deleteAlert(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.application.delete({
                where: { id },
            });
        });
    }
}
exports.AlertService = AlertService;
