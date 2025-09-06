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
exports.AnalyticsService = void 0;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
class AnalyticsService {
    static getUserAnalytics(roleFilter, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const dateRange = (0, date_fns_1.eachDayOfInterval)({
                    start: new Date(startDate),
                    end: new Date(endDate),
                }).map((date) => (0, date_fns_1.format)(date, "yyyy-MM-dd"));
                const signups = yield prisma.user.groupBy({
                    by: ["created_at"],
                    where: Object.assign({ created_at: { gte: startDate, lte: endDate } }, roleFilter),
                    _count: { id: true },
                });
                const signupSeries = dateRange.reduce((acc, date) => {
                    const signup = signups.find((s) => (0, date_fns_1.format)(s.created_at, "yyyy-MM-dd") === date);
                    acc[date] = signup ? signup._count.id : 0;
                    return acc;
                }, {});
                const activeUsers = yield prisma.alert.groupBy({
                    by: ["created_at", "userId"],
                    where: {
                        created_at: { gte: startDate, lte: endDate },
                        user: roleFilter,
                    },
                    _count: { id: true },
                });
                const activeUserSeries = dateRange.reduce((acc, date) => {
                    const dailyUsers = activeUsers.filter((a) => (0, date_fns_1.format)(a.created_at, "yyyy-MM-dd") === date);
                    acc[date] = new Set(dailyUsers.map((a) => a.userId)).size;
                    return acc;
                }, {});
                const deviceBreakdown = yield prisma.alert.groupBy({
                    by: ["source"],
                    where: {
                        created_at: { gte: startDate, lte: endDate },
                        user: roleFilter,
                    },
                    _count: { id: true },
                });
                const deviceSummary = {
                    phone: ((_a = deviceBreakdown.find((d) => d.source === "phone")) === null || _a === void 0 ? void 0 : _a._count.id) || 0,
                    app: ((_b = deviceBreakdown.find((d) => d.source === "app")) === null || _b === void 0 ? void 0 : _b._count.id) || 0,
                    web: ((_c = deviceBreakdown.find((d) => d.source === "web")) === null || _c === void 0 ? void 0 : _c._count.id) || 0,
                };
                const topLocations = yield prisma.alert.groupBy({
                    by: ["state", "lga"],
                    where: {
                        created_at: { gte: startDate, lte: endDate },
                        user: roleFilter,
                    },
                    _count: { id: true },
                    orderBy: { _count: { id: "desc" } },
                    take: 5,
                });
                const response = {
                    signups: signupSeries,
                    activeUsers: activeUserSeries,
                    deviceBreakdown,
                    topLocations: topLocations.map((loc) => ({
                        state: loc.state,
                        lga: loc.lga,
                        alertCount: loc._count.id,
                    })),
                };
                return response;
            }
            catch (error) {
                throw new Error(`Failed to get user details: ${error}`);
            }
        });
    }
    static getAlertAnalytics(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const [startDate, endDate, state, lga] = data;
            const filters = {
                created_at: { gte: startDate, lte: endDate },
            };
            if (state)
                filters.state = state;
            if (lga)
                filters.lga = lga;
            const dateRange = (0, date_fns_1.eachDayOfInterval)({ start: startDate, end: endDate }).map((date) => (0, date_fns_1.format)(date, "yyyy-MM-dd"));
            const dailyAlerts = yield prisma.alert.groupBy({
                by: ["created_at"],
                where: filters,
                _count: { id: true },
            });
            const dailyCounts = dateRange.reduce((acc, date) => {
                const alert = dailyAlerts.find((a) => (0, date_fns_1.format)(a.created_at, "yyyy-MM-dd") === date);
                acc[date] = alert ? alert._count.id : 0;
                return acc;
            }, {});
            const polygonCounts = yield prisma.alert.groupBy({
                by: ["state", "lga"],
                where: filters,
                _count: { id: true },
            });
            const lgas = yield prisma.lga.findMany({
                where: {
                    stateId: state
                        ? {
                            in: (yield prisma.state.findMany({
                                where: { name: state },
                            })).map((s) => s.id),
                        }
                        : undefined,
                    name: lga ? lga : undefined,
                },
                select: { id: true, name: true, stateId: true, geometry: true },
            });
            const polygonData = polygonCounts.map((count) => {
                const lgaData = lgas.find((l) => l.name === count.lga);
                return {
                    state: count.state,
                    lga: count.lga,
                    alertCount: count._count.id,
                    geometry: lgaData ? lgaData.geometry : null,
                };
            });
            const response = {
                dailyCounts,
                polygonCounts: polygonData,
            };
            return response;
        });
    }
}
exports.AnalyticsService = AnalyticsService;
