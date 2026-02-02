"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mailController_1 = require("../controllers/mailController");
const mailRoutes = (0, express_1.Router)();
const controller = new mailController_1.MailController();
mailRoutes.post("/", controller.send);
exports.default = mailRoutes;
