"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/docs/swagger.ts
const fs_1 = require("fs");
const js_yaml_1 = require("js-yaml");
const path_1 = __importDefault(require("path"));
const filePath = path_1.default.join(__dirname, "openapi.yaml");
const fileContents = (0, fs_1.readFileSync)(filePath, "utf8");
const swaggerDocument = (0, js_yaml_1.load)(fileContents);
exports.default = swaggerDocument;
// import swaggerJSDoc from "swagger-jsdoc";
// const options = {
//   definition: {
//     openapi: "3.0.3",
//     info: {
//       title: "Didsecplus API",
//       version: "1.0.0",
//       description: "Secure authentication and user management API",
//     },
//     servers: [
//       {
//         url: "http://localhost:5000/api/v1",
//         description: "Development server",
//       },
//       {
//         url: "https://api.didsecplus.com/api/v1",
//         description: "Production server",
//       },
//     ],
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: "http",
//           scheme: "bearer",
//           bearerFormat: "JWT",
//         },
//       },
//     },
//   },
//   apis: ["./src/features/**/*.ts", "./src/routes/*.ts"],
// };
// export const specs = swaggerJSDoc(options);
