"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const logger_middleware_1 = __importDefault(require("../../middlewares/logger.middleware"));
class SocketService {
    constructor(server) {
        this.adminSockets = new Set(); // Store admin socket IDs
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: "*", // Adjust based on your frontend URL
                methods: ["GET", "POST"],
                credentials: true,
            },
        });
        this.setupSocketEvents();
    }
    setupSocketEvents() {
        this.io.on("connection", (socket) => {
            logger_middleware_1.default.info(`New client connected: ${socket.id}`);
            // Register admin clients
            socket.on("registerAdmin", () => {
                this.adminSockets.add(socket.id);
                logger_middleware_1.default.info(`Admin registered: ${socket.id}`);
            });
            // Handle disconnection
            socket.on("disconnect", () => {
                this.adminSockets.delete(socket.id);
                logger_middleware_1.default.info(`Client disconnected: ${socket.id}`);
            });
        });
    }
    // Emit new alert to all connected admins
    emitNewAlert(alert, mode = "full") {
        if (mode === "full") {
            // Send full alert data
            this.io.to([...this.adminSockets]).emit("newAlert", alert);
        }
        else {
            // Send only alert ID to trigger fetch
            this.io
                .to([...this.adminSockets])
                .emit("newAlert", { alertId: alert._id });
        }
    }
}
exports.SocketService = SocketService;
exports.default = SocketService;
