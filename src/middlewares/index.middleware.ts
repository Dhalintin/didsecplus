/// <reference path="../types/custom.d.ts" />

import { Application, json, urlencoded, Request, Response } from "express";
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

  // Explicitly handle OPTIONS requests for preflight
  app.options("*", cors({
    origin: true, // Reflects the request's origin (or set to specific origin like 'http://localhost:3000')
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }));

  // CORS middleware
  app.use(
    cors({
      origin: true, // Use true to reflect the request's origin, or specify e.g., 'http://localhost:3000'
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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
};  app.use(cookieParser());

  // Custom error handling middleware
  app.use(errorHandler);

  // Mounting routes
  app.use("/api/v1", indexRoutes);
};
