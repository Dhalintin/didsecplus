import { createServer } from "http";
import app from "./app";
import SocketService from "./features/socket/socket.service";

export const PORT = process.env.PORT || 9871;

export let socketService: SocketService | null = null;

(async () => {
  // logger.info(`Attempting to run server on port ${PORT}`);

  const httpServer = createServer(app);
  socketService = new SocketService(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    // logger.info(`Listening on port ${PORT}`);
  });
})();

// "start": "node dist/app.js",
