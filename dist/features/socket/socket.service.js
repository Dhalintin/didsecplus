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
//         origin: (
//           requestOrigin: string | undefined,
//           callback: (err: Error | null, allow?: boolean | string) => void
//         ) => {
//           // Allow requests with no origin (e.g., non-browser clients like Postman)
//           if (!requestOrigin) {
//             return callback(null, true);
//           }
//           // Define allowed origins
//           const allowedOrigins = [
//             /^http:\/\/localhost:3000$/, // Updated to match your frontend port
//             /^https:\/\/.*\.onrender\.com$/, // Render-hosted frontend (adjust if needed)
//             // Add your production frontend URL, e.g., /^https:\/\/your-frontend\.com$/
//           ];
//           // Check if the request origin matches any allowed pattern
//           const isAllowed = allowedOrigins.some((pattern) =>
//             pattern instanceof RegExp
//               ? pattern.test(requestOrigin)
//               : pattern === requestOrigin
//           );
//           if (isAllowed) {
//             callback(null, requestOrigin); // Reflect the request origin
//           } else {
//             callback(
//               new Error(`CORS policy: Origin ${requestOrigin} not allowed`),
//               false
//             );
//           }
//         },
//         methods: ["GET", "POST"],
//         credentials: true, // Allow credentials
//       },
//     });
//     this.setupSocketEvents();
//   }
//   private setupSocketEvents() {
//     this.io.on("connection", (socket: Socket) => {
//       logger.info(
//         `New client connected: ${socket.id}, origin: ${
//           socket.handshake.headers.origin || "unknown"
//         }`
//       );
//       socket.on("registerAdmin", () => {
//         this.adminSockets.add(socket.id);
//         logger.info(`Admin registered: ${socket.id}`);
//       });
//       socket.on("disconnect", () => {
//         this.adminSockets.delete(socket.id);
//         logger.info(`Client disconnected: ${socket.id}`);
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
        const allowedOrigins = this.parseAllowedOrigins();
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: (requestOrigin, callback) => {
                    if (!requestOrigin) {
                        return callback(null, true);
                    }
                    const isAllowed = allowedOrigins.some((origin) => {
                        if (origin instanceof RegExp) {
                            return origin.test(requestOrigin);
                        }
                        return origin === requestOrigin;
                    });
                    if (isAllowed) {
                        callback(null, requestOrigin); // Reflect exact origin
                    }
                    else {
                        logger_middleware_1.default.warn(`CORS blocked origin: ${requestOrigin}`);
                        callback(new Error(`Origin ${requestOrigin} not allowed`), false);
                    }
                },
                methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
                credentials: true,
            },
        });
        this.setupSocketEvents();
    }
    parseAllowedOrigins() {
        const raw = process.env.CORS_ORIGINS;
        if (!raw) {
            // Default for local dev
            return [/^http:\/\/localhost:30(00|01|02)$/];
        }
        return raw.split(",").map((origin) => {
            const trimmed = origin.trim();
            if (trimmed.startsWith("/") && trimmed.endsWith("/")) {
                return new RegExp(trimmed.slice(1, -1));
            }
            return trimmed;
        });
    }
    setupSocketEvents() {
        this.io.on("connection", (socket) => {
            const origin = socket.handshake.headers.origin || "unknown";
            logger_middleware_1.default.info(`New client connected: ${socket.id}, origin: ${origin}`);
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
        const rooms = [...this.adminSockets];
        if (mode === "full") {
            this.io.to(rooms).emit("newAlert", alert);
        }
        else {
            this.io.to(rooms).emit("newAlert", { alertId: alert._id });
        }
    }
    getIo() {
        return this.io;
    }
}
exports.SocketService = SocketService;
exports.default = SocketService;
