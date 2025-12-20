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
exports.checkAlertLimits = checkAlertLimits;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function checkAlertLimits(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        // Start of today (00:00:00)
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        // Start of current week (Monday 00:00:00)
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust to get Monday
        startOfWeek.setDate(now.getDate() - diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);
        // Count alerts created today
        const dailyCount = yield prisma.alert.count({
            where: {
                userId,
                created_at: {
                    gte: startOfDay,
                },
            },
        });
        // Count alerts created this week
        const weeklyCount = yield prisma.alert.count({
            where: {
                userId,
                created_at: {
                    gte: startOfWeek,
                },
            },
        });
        if (dailyCount >= 2) {
            return {
                canCreate: false,
                reason: "You have reached the daily limit of 2 alerts.",
                dailyCount,
                weeklyCount,
            };
        }
        if (weeklyCount >= 8) {
            return {
                canCreate: false,
                reason: "You have reached the weekly limit of 8 alerts.",
                dailyCount,
                weeklyCount,
            };
        }
        return {
            canCreate: true,
            dailyCount,
            weeklyCount,
        };
    });
}
