import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import logger from "../../middlewares/logger.middleware";

export class SocketService {
  private io: Server;
  private adminSockets: Set<string> = new Set();

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: [
          "http://localhost:3002",
          "http://localhost:3001",
          "http://localhost:3000",
        ],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.setupSocketEvents();
  }

  private setupSocketEvents() {
    this.io.on("connection", (socket: Socket) => {
      logger.info(`New client connected: ${socket.id}`);

      socket.on("registerAdmin", () => {
        this.adminSockets.add(socket.id);
        logger.info(`Admin registered: ${socket.id}`);
      });

      socket.on("disconnect", () => {
        this.adminSockets.delete(socket.id);
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  public emitNewAlert(alert: any, mode: "full" | "fetch" = "full") {
    if (mode === "full") {
      this.io.to([...this.adminSockets]).emit("newAlert", alert);
    } else {
      this.io
        .to([...this.adminSockets])
        .emit("newAlert", { alertId: alert._id });
    }
  }
}

export default SocketService;

// import { Server, Socket } from "socket.io";
// import { Server as HttpServer } from "http";
// import logger from "../../middlewares/logger.middleware";

// export class SocketService {
//   private io: Server;
//   private adminSockets: Set<string> = new Set(); // Store admin socket IDs

//   constructor(server: HttpServer) {
//     this.io = new Server(server, {
//       cors: {
//         origin: "*",
//         methods: ["GET", "POST"],
//         credentials: true,
//       },
//     });

//     this.setupSocketEvents();
//   }

//   private setupSocketEvents() {
//     this.io.on("connection", (socket: Socket) => {
//       logger.info(`New client connected: ${socket.id}`);

//       // Register admin clients
//       socket.on("registerAdmin", () => {
//         this.adminSockets.add(socket.id);
//         logger.info(`Admin registered: ${socket.id}`);
//       });

//       // Handle disconnection
//       socket.on("disconnect", () => {
//         this.adminSockets.delete(socket.id);
//         logger.info(`Client disconnected: ${socket.id}`);
//       });
//     });
//   }

//   // Emit new alert to all connected admins
//   public emitNewAlert(alert: any, mode: "full" | "fetch" = "full") {
//     if (mode === "full") {
//       // Send full alert data
//       this.io.to([...this.adminSockets]).emit("newAlert", alert);
//     } else {
//       // Send only alert ID to trigger fetch
//       this.io
//         .to([...this.adminSockets])
//         .emit("newAlert", { alertId: alert._id });
//     }
//   }
// }

// export default SocketService;
