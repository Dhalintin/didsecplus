// // src/utils/logger.ts
// import pino from "pino";

// const logger = pino({
//   transport: {
//     target: "pino-pretty",
//     options: {
//       colorize: true,
//       translateTime: "SYS:standard",
//       ignore: "pid,hostname",
//     },
//   },
//   level: "info",
// });

// // export default logger;

// src/utils/logger.ts
import pino from "pino";

const isDevelopment = process.env.NODE_ENV === "development";

const logger = pino({
  level: "info",
  ...(isDevelopment && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  }),
});

export default logger;
