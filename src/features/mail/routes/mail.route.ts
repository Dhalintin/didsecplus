import { Router } from "express";
import { MailController } from "../controllers/mailController";

const mailRoutes = Router();
const controller = new MailController();

mailRoutes.post("/", controller.send);

export default mailRoutes;
