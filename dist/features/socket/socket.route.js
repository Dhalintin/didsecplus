"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const server_1 = require("../../server");
const response_util_1 = __importDefault(require("../../utils/helpers/response.util"));
const socketRoute = (0, express_1.Router)();
socketRoute.get("/trigger", (req, res) => {
    if (server_1.socketService) {
        server_1.socketService.emitNewAlert({
            alertId: "alert-id-123",
            message: "Message alert",
        }, "full");
        new response_util_1.default(201, res, "Triggered", {
            alertId: "alert-id-123",
            message: "Message alert",
        });
        return;
    }
    else {
        res.status(500).send("Socket service not available");
    }
});
exports.default = socketRoute;
