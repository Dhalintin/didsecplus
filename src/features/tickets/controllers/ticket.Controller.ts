import { Request, Response } from "express";
import { TicketService } from "../services/ticket";
import { ticketSchema } from "../../../validations/ticket.validation";
import CustomResponse from "../../../utils/helpers/response.util";
import { AuthService } from "../../authentication/services/registerUser";
import { AuditService } from "../services/audit.service";
import {
  CreateTicketDTO,
  GetTicketDTO,
  UpdateTicketDTO,
} from "../dtos/ticket.dto";
const ticketService = new TicketService();
const ticketAuditService = new AuditService();

export class TicketController {
  async createTicket(req: Request, res: Response) {
    try {
      const { error } = ticketSchema.validate(req.body);
      if (error) {
        new CustomResponse(400, res, error.details[0].message);
        return;
      }

      const { title, description, priority, assigned_to, alert_Id } = req.body;
      const data: CreateTicketDTO = {
        title,
        description,
        priority,
        alert_Id,
        assigned_to,
      };

      const result = await ticketService.createTicket(data);
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
      const { page, page_size, status, assigned_to, alert_id, created_by } =
        req.query;

      const query: GetTicketDTO = {
        // page: typeof page === "string" ? parseInt(page, 10) : Number(page),
        page: page && typeof page === "string" ? parseInt(page, 10) : 1,
        page_size:
          typeof page_size === "string"
            ? parseInt(page_size, 10)
            : Number(page_size) || 20,
        status: typeof status === "string" ? status : undefined,
        assigned_to: typeof assigned_to === "string" ? assigned_to : undefined,
        created_by: typeof created_by === "string" ? created_by : undefined,
        alert_Id: typeof alert_id === "string" ? alert_id : undefined,
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

  async getTicketsDetails(req: Request, res: Response) {
    try {
      const tickets = await ticketService.getTicketStatusCounts();
      new CustomResponse(200, res, "Successful", tickets);
      return;
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err);
      return;
    }
  }

  async trailTicket(req: Request, res: Response) {
    try {
      const ticketTrail = await ticketAuditService.getTicketTrail(
        req.params.ticketId
      );
      new CustomResponse(200, res, "Successful", ticketTrail);
      return;
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err);
      return;
    }
  }

  async updateTicket(req: Request, res: Response) {
    try {
      const userId = req.body.userId;
      const UpdateData: UpdateTicketDTO = req.body;
      const result = await ticketService.updateTicket(
        req.params.id,
        UpdateData,
        userId
      );
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
