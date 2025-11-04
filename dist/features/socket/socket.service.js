"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const logger_middleware_1 = __importDefault(require("../../middlewares/logger.middleware"));
const jwt_1 = require("../../utils/jwt");
class SocketService {
    constructor(server) {
        this.adminSockets = new Set();
        const allowedOrigins = this.parseAllowedOrigins();
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                credentials: true,
            },
        });
        // this.io = new Server(server, {
        //   cors: {
        //     origin: (requestOrigin: string | undefined, callback: any) => {
        //       if (!requestOrigin) return callback(null, true);
        //       const isAllowed = allowedOrigins.some((origin) => {
        //         if (origin instanceof RegExp) return origin.test(requestOrigin);
        //         return origin === requestOrigin;
        //       });
        //       if (isAllowed) {
        //         callback(null, requestOrigin);
        //       } else {
        //         logger.warn(`CORS blocked: ${requestOrigin}`);
        //         callback(new Error("Not allowed"), false);
        //       }
        //     },
        //     methods: ["GET", "POST"],
        //     credentials: true,
        //   },
        // });
        this.setupSocketEvents();
    }
    parseAllowedOrigins() {
        const raw = process.env.CORS_ORIGINS;
        if (!raw) {
            return [
                /^http:\/\/localhost:30(00|01|02)$/,
                /^https:\/\/.*\.vercel\.app$/,
                /^https:\/\/.*\.netlify\.app$/,
                /^https:\/\/yourdomain\.com$/,
            ];
        }
        return raw
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean);
    }
    setupSocketEvents() {
        // AUTH MIDDLEWARE
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token)
                return next(new Error("No token"));
            try {
                const user = jwt_1.tokenService.verifyToken(token);
                if (user.role !== "superAdmin" || user.role !== "admin")
                    return next(new Error("Not admin"));
                socket.userId = user.userId;
                next();
            }
            catch (_a) {
                next(new Error("Invalid token"));
            }
        });
        this.io.on("connection", (socket) => {
            logger_middleware_1.default.info(`Admin connected: ${socket.id}`);
            // Auto-register all authenticated admins
            this.adminSockets.add(socket.id);
            socket.on("disconnect", () => {
                this.adminSockets.delete(socket.id);
                logger_middleware_1.default.info(`Admin disconnected: ${socket.id}`);
            });
        });
    }
    emitNewAlert(alert, mode = "full") {
        const event = mode === "full" ? { alert } : { alertId: alert._id };
        this.io.to([...this.adminSockets]).emit("newAlert", event);
    }
    getIo() {
        return this.io;
    }
}
exports.SocketService = SocketService;
// import { Server, Socket } from "socket.io";
// import { Server as HttpServer } from "http";
// import logger from "../../middlewares/logger.middleware";
// export class SocketService {
//   private io: Server;
//   private adminSockets: Set<string> = new Set();
//   constructor(server: HttpServer) {
//     const allowedOrigins = this.parseAllowedOrigins();
//     this.io = new Server(server, {
//       cors: {
//         origin: (requestOrigin: string | undefined, callback: any) => {
//           if (!requestOrigin) {
//             return callback(null, true);
//           }
//           const isAllowed = allowedOrigins.some((origin) => {
//             if (origin instanceof RegExp) {
//               return origin.test(requestOrigin);
//             }
//             return origin === requestOrigin;
//           });
//           if (isAllowed) {
//             callback(null, requestOrigin); // Reflect exact origin
//           } else {
//             logger.warn(`CORS blocked origin: ${requestOrigin}`);
//             callback(new Error(`Origin ${requestOrigin} not allowed`), false);
//           }
//         },
//         methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//         credentials: true,
//       },
//     });
//     this.setupSocketEvents();
//   }
//   private parseAllowedOrigins(): (string | RegExp)[] {
//     const raw = process.env.CORS_ORIGINS;
//     if (!raw) {
//       // Default for local dev
//       return [
//         /^http:\/\/localhost:30(00|01|02)$/,
//         /^https:\/\/.*\.vercel\.app$/,
//         /^https:\/\/.*\.netlify\.app$/,
//       ];
//     }
//     return raw.split(",").map((origin) => {
//       const trimmed = origin.trim();
//       if (trimmed.startsWith("/") && trimmed.endsWith("/")) {
//         return new RegExp(trimmed.slice(1, -1));
//       }
//       return trimmed;
//     });
//   }
//   private setupSocketEvents() {
//     this.io.on("connection", (socket: Socket) => {
//       const origin = socket.handshake.headers.origin || "unknown";
//       logger.info(`New client connected: ${socket.id}, origin: ${origin}`);
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
//     const rooms = [...this.adminSockets];
//     if (mode === "full") {
//       this.io.to(rooms).emit("newAlert", alert);
//     } else {
//       this.io.to(rooms).emit("newAlert", { alertId: alert._id });
//     }
//   }
//   public getIo() {
//     return this.io;
//   }
// }
exports.default = SocketService;
