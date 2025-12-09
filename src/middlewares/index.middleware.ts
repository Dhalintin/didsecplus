///  <reference path="../types/custom.d.ts" />
import { Application, json, urlencoded } from "express";
import { configDotenv } from "dotenv";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import errorHandler from "./errors.middleware";
import indexRoutes from "../features/appRoute";
import swaggerUi from "swagger-ui-express";
import "dotenv/config";

import { readFileSync } from "fs";
import { load } from "js-yaml";
import path from "path";

import axios from "axios";
import { applyIndexes } from "../utils/schema_indexing";
const url = "https://didsecplus.onrender.com";
const interval = 10 * 60 * 1000;

require("dotenv").config();

export default (app: Application) => {
  app.use(morgan("combined"));

  app.use(
    cors({
      origin: "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    })
  );

  if (process.env.NODE_ENV !== "production") configDotenv();

  app.use(json());

  app.use(urlencoded({ extended: true }));

  app.use(helmet());

  app.use(cookieParser());

  app.use(errorHandler);

  app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Didsecplus is live and functioning!" });
  });

  const yamlPath = path.join(__dirname, "../", "docs", "openapi.yaml");
  const yamlContent = readFileSync(yamlPath, "utf8");
  const swaggerDocument = load(yamlContent) as Record<string, unknown>;

  app.use("/api-docs", swaggerUi.serve);

  app.get(
    "/api-docs",
    swaggerUi.setup(swaggerDocument, {
      swaggerOptions: {
        persistAuthorization: true,
        tryItOutEnabled: true,
      },
      customCss: `
    .swagger-ui .topbar { background: #1a1a2e !important; }
    .swagger-ui .btn.authorize { display: none !important; }
  `,
      customSiteTitle: "Didsecplus API Docs",
    })
  );

  // app.use(
  //   "/api-docs",
  //   swaggerUi.serve,
  //   swaggerUi.setup(swaggerDocument, {
  //     swaggerOptions: {
  //       persistAuthorization: true,
  //       displayRequestDuration: true,
  //       tryItOutEnabled: true,
  //       supportedSubmitMethods: ["get", "post", "put", "patch", "delete"],
  //     },
  //     customCss:
  //       ".swagger-ui .topbar { background: #1a1a2e; } .swagger-ui .btn.authorize { display: none !important; }", // Hides Authorize button completely
  //     customSiteTitle: "Didsecplus – Frontend API Docs",
  //   })
  // );

  function keepAlive() {
    axios
      .get(url)
      .then((response) => {
        console.log(
          `Keep-alive ping at ${new Date().toISOString()}: Status ${
            response.status
          }`
        );
      })
      .catch((error) => {
        console.error(
          `Keep-alive error at ${new Date().toISOString()}: ${error.message}`
        );
      });
  }

  setInterval(keepAlive, interval);

  app.use("/api/v1", indexRoutes);
};
