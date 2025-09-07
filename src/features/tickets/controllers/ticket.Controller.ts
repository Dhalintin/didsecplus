import { Request, Response } from "express";
import { TicketService } from "../services/ticket";
import { ticketSchema } from "../../../validations/ticket.validation";
import CustomResponse from "../../../utils/helpers/response.util";
import { AuthService } from "../../authentication/services/registerUser";
import { CreateTicketDTO } from "../dtos/ticket.dto";
const ticketService = new TicketService();

export class TicketController {
  async createTicket(req: Request, res: Response) {
    try {
      const { error } = ticketSchema.validate(req.body);
      if (error) {
        new CustomResponse(400, res, error.details[0].message);
        return;
      }
      const alert_id = req.params.alert_id;
      const { title, description, priority, assigned_to } = req.body;
      const data: CreateTicketDTO = {
        title,
        description,
        priority,
        alert_id,
        assigned_to,
      };

      const result = await ticketService.createTicket(alert_id, data);
      new CustomResponse(201, res, "Ticket created successfully", result);
      return;
    } catch (error: any) {
      new CustomResponse(409, res, error.message);
      return;
    }
  }

  async getTicket(req: Request, res: Response) {
    try {
      const ticket = await ticketService.getTicket(req.params.id);
      new CustomResponse(200, res, "", ticket);
      return;
    } catch (error: any) {
      new CustomResponse(409, res, error.message);
      return;
    }
  }

  async getTickets(req: Request, res: Response) {
    try {
      const { page, page_size, status, assigned_to, created_by, alert_id } =
        req.query;

      const query = {
        page: typeof page === "string" ? parseInt(page, 10) : Number(page),
        page_size:
          typeof page_size === "string"
            ? parseInt(page_size, 10)
            : Number(page_size) || 20,
        status: typeof status === "string" ? status : null,
        assigned_to: typeof assigned_to === "string" ? assigned_to : null,
        created_by: typeof created_by === "string" ? created_by : null,
        alert_id: typeof alert_id === "string" ? alert_id : null,
      };

      const tickets = await ticketService.getTickets(query);
      new CustomResponse(200, res, "Ticket created successfully!", tickets);
      return;
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err);
      return;
    }
  }

  async updateTicket(req: Request, res: Response) {
    try {
      const result = await ticketService.updateTicket(req.params.id, req.body);
      new CustomResponse(200, res, "Ticket updated successfully", result);
      return;
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err);
      return;
    }
  }

  async deleteTicket(req: Request, res: Response) {
    try {
      const user = await AuthService.getUserById(req.user.userId);
      if (user.role !== "admin") {
        new CustomResponse(
          500,
          res,
          "You are not authorized to delete this alert"
        );
        return;
      }
      await ticketService.deleteTicket(req.params.id);
      new CustomResponse(200, res, "Ticket deleted successfully");
      return;
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err);
      return;
    }
  }
}
