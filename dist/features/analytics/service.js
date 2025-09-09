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
// @ts-nocheck
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
class AnalyticsService {
    static getUserAnalytics() {
        return __awaiter(this, arguments, void 0, function* (roleFilter = {}, startDate = null, endDate = null) {
            var _a, _b, _c;
            try {
                let dateRange = [];
                if (!startDate || !endDate) {
                    const [earliestUser, earliestAlert, latestUser, latestAlert] = yield Promise.all([
                        prisma.user.findFirst({
                            orderBy: { created_at: "asc" },
                            select: { created_at: true },
                        }),
                        prisma.alert.findFirst({
                            orderBy: { created_at: "asc" },
                            select: { created_at: true },
                        }),
                        prisma.user.findFirst({
                            orderBy: { created_at: "desc" },
                            select: { created_at: true },
                        }),
                        prisma.alert.findFirst({
                            orderBy: { created_at: "desc" },
                            select: { created_at: true },
                        }),
                    ]);
                    const earliest = (earliestUser === null || earliestUser === void 0 ? void 0 : earliestUser.created_at) || (earliestAlert === null || earliestAlert === void 0 ? void 0 : earliestAlert.created_at) || new Date(0);
                    const latest = (latestUser === null || latestUser === void 0 ? void 0 : latestUser.created_at) || (latestAlert === null || latestAlert === void 0 ? void 0 : latestAlert.created_at) || new Date();
                    dateRange = (0, date_fns_1.eachDayOfInterval)({
                        start: earliest,
                        end: latest,
                    }).map((date) => (0, date_fns_1.format)(date, "yyyy-MM-dd"));
                }
                else {
                    dateRange = (0, date_fns_1.eachDayOfInterval)({
                        start: new Date(startDate),
                        end: new Date(endDate),
                    }).map((date) => (0, date_fns_1.format)(date, "yyyy-MM-dd"));
                }
                // Build where clause dynamically
                const whereClause = {};
                if (startDate && endDate) {
                    whereClause.created_at = { gte: startDate, lte: endDate };
                }
                if (Object.keys(roleFilter).length > 0) {
                    Object.assign(whereClause, roleFilter);
                }
                const signups = yield prisma.user.groupBy({
                    by: ["created_at"],
                    where: whereClause,
                    _count: { id: true },
                });
                const signupSeries = dateRange.reduce((acc, date) => {
                    const signup = signups.find((s) => (0, date_fns_1.format)(s.created_at, "yyyy-MM-dd") === date);
                    acc[date] = signup ? signup._count.id : 0;
                    return acc;
                }, {});
                const activeUsers = yield prisma.alert.groupBy({
                    by: ["created_at", "userId"],
                    where: whereClause,
                    _count: { id: true },
                });
                const activeUserSeries = dateRange.reduce((acc, date) => {
                    const dailyUsers = activeUsers.filter((a) => (0, date_fns_1.format)(a.created_at, "yyyy-MM-dd") === date && a.userId !== null);
                    acc[date] = new Set(dailyUsers.map((a) => typeof a.userId === "string" ? a.userId : String(a.userId))).size;
                    return acc;
                }, {});
                const deviceBreakdown = yield prisma.alert.groupBy({
                    by: ["source"],
                    where: whereClause,
                    _count: { id: true },
                });
                const deviceSummary = {
                    phone: ((_a = deviceBreakdown.find((d) => d.source === "phone")) === null || _a === void 0 ? void 0 : _a._count.id) || 0,
                    app: ((_b = deviceBreakdown.find((d) => d.source === "app")) === null || _b === void 0 ? void 0 : _b._count.id) || 0,
                    web: ((_c = deviceBreakdown.find((d) => d.source === "web")) === null || _c === void 0 ? void 0 : _c._count.id) || 0,
                };
                const topLocations = yield prisma.alert.groupBy({
                    by: ["state", "lga"],
                    where: whereClause,
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
                throw new Error(`Failed to get user analytics: ${error.message}`);
            }
        });
    }
    // static async getAlertAnalytics(data: any) {
    //   const [startDate, endDate, state, lga] = data;
    //   const filters: any = {
    //     created_at: { gte: startDate, lte: endDate },
    //   };
    //   if (state) filters.state = state as string;
    //   if (lga) filters.lga = lga as string;
    //   const dateRange = eachDayOfInterval({ start: startDate, end: endDate }).map(
    //     (date) => format(date, "yyyy-MM-dd")
    //   );
    //   const dailyAlerts = await prisma.alert.groupBy({
    //     by: ["created_at"],
    //     where: filters,
    //     _count: { id: true },
    //   });
    //   const dailyCounts = dateRange.reduce((acc, date) => {
    //     const alert: any = dailyAlerts.find(
    //       (a: any) => format(a.created_at, "yyyy-MM-dd") === date
    //     );
    //     acc[date] = alert ? alert._count.id : 0;
    //     return acc;
    //   }, {} as Record<string, number>);
    //   const polygonCounts = await prisma.alert.groupBy({
    //     by: ["state", "lga"],
    //     where: filters,
    //     _count: { id: true },
    //   });
    //   const lgas = await prisma.lga.findMany({
    //     where: {
    //       stateId: state
    //         ? {
    //             in: (
    //               await prisma.state.findMany({
    //                 where: { name: state as string },
    //               })
    //             ).map((s: any) => s.id),
    //           }
    //         : undefined,
    //       name: lga ? (lga as string) : undefined,
    //     },
    //     select: { id: true, name: true, stateId: true, geometry: true },
    //   });
    //   const polygonData = polygonCounts.map((count: any) => {
    //     const lgaData = lgas.find((l: any) => l.name === count.lga);
    //     return {
    //       state: count.state,
    //       lga: count.lga,
    //       alertCount: count._count.id,
    //       geometry: lgaData ? lgaData.geometry : null,
    //     };
    //   });
    //   const response = {
    //     dailyCounts,
    //     polygonCounts: polygonData,
    //   };
    //   return response;
    // }
    static getAlertAnalytics(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const [startDate = null, endDate = null, state = null, lga = null] = data;
            let dateRange = [];
            if (!startDate || !endDate) {
                const [earliestAlert, latestAlert] = yield Promise.all([
                    prisma.alert.findFirst({
                        orderBy: { created_at: "asc" },
                        select: { created_at: true },
                    }),
                    prisma.alert.findFirst({
                        orderBy: { created_at: "desc" },
                        select: { created_at: true },
                    }),
                ]);
                const earliest = (earliestAlert === null || earliestAlert === void 0 ? void 0 : earliestAlert.created_at) || new Date(0);
                const latest = (latestAlert === null || latestAlert === void 0 ? void 0 : latestAlert.created_at) || new Date();
                dateRange = (0, date_fns_1.eachDayOfInterval)({
                    start: earliest,
                    end: latest,
                }).map((date) => (0, date_fns_1.format)(date, "yyyy-MM-dd"));
            }
            else {
                dateRange = (0, date_fns_1.eachDayOfInterval)({
                    start: new Date(startDate),
                    end: new Date(endDate),
                }).map((date) => (0, date_fns_1.format)(date, "yyyy-MM-dd"));
            }
            const filters = {};
            if (startDate && endDate) {
                filters.created_at = { gte: startDate, lte: endDate };
            }
            if (state)
                filters.state = state;
            if (lga)
                filters.lga = lga;
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
            const lgaQuery = {};
            if (state) {
                const states = yield prisma.state.findMany({
                    where: { name: state },
                });
                lgaQuery.stateId = { in: states.map((s) => s.id) };
            }
            if (lga) {
                lgaQuery.name = lga;
            }
            const lgas = yield prisma.lga.findMany({
                where: lgaQuery,
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
