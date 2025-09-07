import { Router } from "express";
import { TicketController } from "../controllers/ticket.Controller";
import { authMiddleware } from "../../../middlewares/authMiddleware";

const ticketRoutes = Router();
const controller = new TicketController();

ticketRoutes.get("/", authMiddleware, controller.getTickets);
ticketRoutes.get("/:id", authMiddleware, controller.getTicket);
ticketRoutes.post("/:alert_id", authMiddleware, controller.createTicket);
ticketRoutes.patch("/:id", authMiddleware, controller.updateTicket);
ticketRoutes.delete("/:id", authMiddleware, controller.deleteTicket);

export default ticketRoutes;
