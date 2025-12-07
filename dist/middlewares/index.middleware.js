"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
///  <reference path="../types/custom.d.ts" />
const express_1 = require("express");
const dotenv_1 = require("dotenv");
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errors_middleware_1 = __importDefault(require("./errors.middleware"));
const appRoute_1 = __importDefault(require("../features/appRoute"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
require("dotenv/config");
const fs_1 = require("fs");
const js_yaml_1 = require("js-yaml");
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const url = "https://didsecplus.onrender.com";
const interval = 10 * 60 * 1000;
require("dotenv").config();
exports.default = (app) => {
    app.use((0, morgan_1.default)("combined"));
    app.use((0, cors_1.default)({
        origin: "*",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    }));
    if (process.env.NODE_ENV !== "production")
        (0, dotenv_1.configDotenv)();
    app.use((0, express_1.json)());
    app.use((0, express_1.urlencoded)({ extended: true }));
    app.use((0, helmet_1.default)());
    app.use((0, cookie_parser_1.default)());
    app.use(errors_middleware_1.default);
    app.get("/health", (req, res) => {
        res.json({ status: "ok", message: "Didsecplus is live and functioning!" });
    });
    const yamlPath = path_1.default.join(__dirname, "../", "docs", "openapi.yaml");
    const yamlContent = (0, fs_1.readFileSync)(yamlPath, "utf8");
    const swaggerDocument = (0, js_yaml_1.load)(yamlContent);
    app.use("/api-docs", swagger_ui_express_1.default.serve);
    app.get("/api-docs", swagger_ui_express_1.default.setup(swaggerDocument, {
        swaggerOptions: {
            persistAuthorization: true,
            tryItOutEnabled: true,
        },
        customCss: `
    .swagger-ui .topbar { background: #1a1a2e !important; }
    .swagger-ui .btn.authorize { display: none !important; }
  `,
        customSiteTitle: "Didsecplus API Docs",
    }));
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
        axios_1.default
            .get(url)
            .then((response) => {
            console.log(`Keep-alive ping at ${new Date().toISOString()}: Status ${response.status}`);
        })
            .catch((error) => {
            console.error(`Keep-alive error at ${new Date().toISOString()}: ${error.message}`);
        });
    }
    setInterval(keepAlive, interval);
    app.use("/api/v1", appRoute_1.default);
};
