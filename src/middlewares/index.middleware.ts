// /// <reference path="../types/custom.d.ts" />
import { Application, json, urlencoded } from "express";
import { configDotenv } from "dotenv";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import errorHandler from "./errors.middleware";
import indexRoutes from "../features/appRoute";

export default (app: Application) => {
  // Logging middleware
  app.use(morgan("combined"));

  // CORS middleware
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // Configuration setup (dotenv)
  if (process.env.NODE_ENV !== "production") configDotenv();

  // Body parsing middleware
  app.use(json());
  app.use(urlencoded({ extended: true }));

  // Security middleware
  app.use(helmet());

  // Cookie parsing middleware
  app.use(cookieParser());

  // Custom error handling middleware
  app.use(errorHandler);

  // Mounting routes
  app.use("/api/v1", indexRoutes);
};

// import { Application, json, urlencoded } from "express";
// import { configDotenv } from "dotenv";
// import morgan from "morgan";
// import cors from "cors";
// import helmet from "helmet";
// import cookieParser from "cookie-parser";
// import errorHandler from "./errors.middleware";
// import indexRoutes from "../features/appRoute";

// export default (app: Application) => {
//   app.use(morgan("combined"));

//   // === DYNAMIC CORS (same logic as Socket.IO) ===
//   const parseCorsOrigins = (): (string | RegExp)[] => {
//     const raw = process.env.CORS_ORIGINS;
//     if (!raw) {
//       return [/^http:\/\/localhost:30(00|01|02)$/];
//     }
//     return raw.split(",").map((origin) => {
//       const trimmed = origin.trim();
//       if (trimmed.startsWith("/") && trimmed.endsWith("/")) {
//         return new RegExp(trimmed.slice(1, -1));
//       }
//       return trimmed;
//     });
//   };

//   const allowedOrigins = parseCorsOrigins();

//   app.use(
//     cors({
//       origin: (requestOrigin: string | undefined, callback: any) => {
//         if (!requestOrigin) return callback(null, true);

//         const isAllowed = allowedOrigins.some((pattern) =>
//           pattern instanceof RegExp
//             ? pattern.test(requestOrigin)
//             : pattern === requestOrigin
//         );

//         if (isAllowed) {
//           callback(null, requestOrigin);
//         } else {
//           callback(new Error(`CORS: Origin ${requestOrigin} not allowed`));
//         }
//       },
//       credentials: true,
//       methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//       allowedHeaders: ["Content-Type", "Authorization"],
//       preflightContinue: false,
//       optionsSuccessStatus: 204,
//     })
//   );

//   if (process.env.NODE_ENV !== "production") configDotenv();

//   app.use(json());
//   app.use(urlencoded({ extended: true }));
//   app.use(helmet());
//   app.use(cookieParser());
//   app.use(errorHandler);
//   app.use("/api/v1", indexRoutes);
// };

// import { Application, json, urlencoded } from "express";
// import { configDotenv } from "dotenv";
// import morgan from "morgan";
// import cors from "cors";
// import helmet from "helmet";
// import cookieParser from "cookie-parser";
// import errorHandler from "./errors.middleware";
// import indexRoutes from "../features/appRoute";

// export default (app: Application) => {
//   // Logging middleware
//   app.use(morgan("combined"));

//   // CORS middleware
//   app.use(
//     cors({
//       // origin: "*",
//       origin: [
//         "http://localhost:3000",
//         "http://localhost:3001",
//         "http://localhost:3002",
//       ],
//       methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//       allowedHeaders: ["Content-Type", "Authorization"],
//       credentials: true,
//     })
//   );

//   // Configuration setup (dotenv)
//   if (process.env.NODE_ENV !== "production") configDotenv();

//   // Body parsing middleware
//   app.use(json());
//   app.use(urlencoded({ extended: true }));

//   // Security middleware
//   app.use(helmet());

//   // Cookie parsing middleware
//   app.use(cookieParser());

//   // Custom error handling middleware
//   app.use(errorHandler);

//   // Mounting routes
//   app.use("/api/v1", indexRoutes);
// };
