"use strict";
// import { Server, Socket } from "socket.io";
// import { Server as HttpServer } from "http";
// import logger from "../../middlewares/logger.middleware";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
// export class SocketService {
//   private io: Server;
//   private adminSockets: Set<string> = new Set();
//   constructor(server: HttpServer) {
//     this.io = new Server(server, {
//       cors: {
//         origin: [
//           "http://localhost:3002",
//           "http://localhost:3001",
//           "http://localhost:3000",
//         ],
//         methods: ["GET", "POST"],
//         credentials: true,
//       },
//     });
//     this.setupSocketEvents();
//   }
//   private setupSocketEvents() {
//     this.io.on("connection", (socket: Socket) => {
//       // logger.info(`New client connected: ${socket.id}`);
//       socket.on("registerAdmin", () => {
//         this.adminSockets.add(socket.id);
//         // logger.info(`Admin registered: ${socket.id}`);
//       });
//       socket.on("disconnect", () => {
//         this.adminSockets.delete(socket.id);
//         // logger.info(`Client disconnected: ${socket.id}`);
//       });
//     });
//   }
//   public emitNewAlert(alert: any, mode: "full" | "fetch" = "full") {
//     if (mode === "full") {
//       this.io.to([...this.adminSockets]).emit("newAlert", alert);
//     } else {
//       this.io
//         .to([...this.adminSockets])
//         .emit("newAlert", { alertId: alert._id });
//     }
//   }
// }
// export default SocketService;
const socket_io_1 = require("socket.io");
const logger_middleware_1 = __importDefault(require("../../middlewares/logger.middleware"));
class SocketService {
    constructor(server) {
        this.adminSockets = new Set();
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: (requestOrigin, callback) => {
                    // Allow requests with no origin (e.g., non-browser clients like Postman)
                    if (!requestOrigin) {
                        return callback(null, true);
                    }
                    // Define allowed origins
                    const allowedOrigins = [
                        /^http:\/\/localhost:3000$/, // Updated to match your frontend port
                        /^https:\/\/.*\.onrender\.com$/, // Render-hosted frontend (adjust if needed)
                        // Add your production frontend URL, e.g., /^https:\/\/your-frontend\.com$/
                    ];
                    // Check if the request origin matches any allowed pattern
                    const isAllowed = allowedOrigins.some((pattern) => pattern instanceof RegExp
                        ? pattern.test(requestOrigin)
                        : pattern === requestOrigin);
                    if (isAllowed) {
                        callback(null, requestOrigin); // Reflect the request origin
                    }
                    else {
                        callback(new Error(`CORS policy: Origin ${requestOrigin} not allowed`), false);
                    }
                },
                methods: ["GET", "POST"],
                credentials: true, // Allow credentials
            },
        });
        this.setupSocketEvents();
    }
    setupSocketEvents() {
        this.io.on("connection", (socket) => {
            logger_middleware_1.default.info(`New client connected: ${socket.id}, origin: ${socket.handshake.headers.origin || "unknown"}`);
            socket.on("registerAdmin", () => {
                this.adminSockets.add(socket.id);
                logger_middleware_1.default.info(`Admin registered: ${socket.id}`);
            });
            socket.on("disconnect", () => {
                this.adminSockets.delete(socket.id);
                logger_middleware_1.default.info(`Client disconnected: ${socket.id}`);
            });
        });
    }
    emitNewAlert(alert, mode = "full") {
        if (mode === "full") {
            this.io.to([...this.adminSockets]).emit("newAlert", alert);
        }
        else {
            this.io
                .to([...this.adminSockets])
                .emit("newAlert", { alertId: alert._id });
        }
    }
}
exports.SocketService = SocketService;
exports.default = SocketService;
