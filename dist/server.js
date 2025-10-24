"use strict";
// import app from "./app";
// import logger from "./middlewares/logger.middleware";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketService = exports.PORT = void 0;
// export const PORT = process.env.PORT || 9871;
// (async () => {
//   logger.info(`Attempting to run server on port ${PORT}`);
//   app.listen(PORT, () => {
//     logger.info(`Listening on port ${PORT}`);
//   });
// })();
// src/server.ts
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const logger_middleware_1 = __importDefault(require("./middlewares/logger.middleware"));
const socket_service_1 = __importDefault(require("./features/socket/socket.service"));
exports.PORT = process.env.PORT || 9871;
exports.socketService = null;
(() => __awaiter(void 0, void 0, void 0, function* () {
    logger_middleware_1.default.info(`Attempting to run server on port ${exports.PORT}`);
    const httpServer = (0, http_1.createServer)(app_1.default);
    exports.socketService = new socket_service_1.default(httpServer);
    httpServer.listen(exports.PORT, () => {
        logger_middleware_1.default.info(`Listening on port ${exports.PORT}`);
    });
}))();
