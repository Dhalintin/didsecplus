"use strict";
// // src/utils/logger.ts
// import pino from "pino";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const pino_1 = __importDefault(require("pino"));
const isDevelopment = process.env.NODE_ENV === "development";
const logger = (0, pino_1.default)(Object.assign({ level: "info" }, (isDevelopment && {
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
        },
    },
})));
exports.default = logger;
