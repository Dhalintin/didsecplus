// import app from "./app";
// import logger from "./middlewares/logger.middleware";

// export const PORT = process.env.PORT || 9871;

// (async () => {
//   logger.info(`Attempting to run server on port ${PORT}`);

//   app.listen(PORT, () => {
//     logger.info(`Listening on port ${PORT}`);
//   });
// })();

// src/server.ts
import { createServer } from "http";
import app from "./app";
import logger from "./middlewares/logger.middleware";
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
