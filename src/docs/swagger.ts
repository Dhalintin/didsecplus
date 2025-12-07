// src/docs/swagger.ts
import { readFileSync } from "fs";
import { load } from "js-yaml";
import path from "path";

const filePath = path.join(__dirname, "openapi.yaml");
const fileContents = readFileSync(filePath, "utf8");
const swaggerDocument = load(fileContents) as Record<string, unknown>;

export default swaggerDocument;
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
