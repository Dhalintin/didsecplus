"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const analyticsRoute = (0, express_1.Router)();
analyticsRoute.get("/users", authMiddleware_1.authMiddleware, controller_1.AnalyticsController.getUserAnalytics);
analyticsRoute.get("/alerts", authMiddleware_1.authMiddleware, controller_1.AnalyticsController.getAlertAnalytics);
exports.default = analyticsRoute;
