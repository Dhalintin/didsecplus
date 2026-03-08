"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthMiddleware = exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const authMiddleware = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(401).json({ success: false, message: "Token required" });
        return;
    }
    try {
        const payload = jwt_1.tokenService.verifyToken(token);
        req.user = payload;
        next();
    }
    catch (_b) {
        res.status(401).json({ success: false, message: "Invalid token" });
    }
};
exports.authMiddleware = authMiddleware;
const adminAuthMiddleware = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(401).json({ success: false, message: "Token required" });
        return;
    }
    try {
        const payload = jwt_1.tokenService.verifyToken(token);
        req.user = payload;
        if (payload.role !== "admin" && payload.role !== "superAdmin") {
            res.status(403).json({
                success: false,
                message: "Forbidden: you don't have clearance for this",
            });
            return;
        }
        next();
    }
    catch (_b) {
        res.status(401).json({ success: false, message: "Invalid token." });
        return;
    }
};
exports.adminAuthMiddleware = adminAuthMiddleware;
