"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketController = void 0;
const ticket_1 = require("../services/ticket");
const ticket_validation_1 = require("../../../validations/ticket.validation");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const registerUser_1 = require("../../authentication/services/registerUser");
const ticketService = new ticket_1.TicketService();
class TicketController {
    createTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = ticket_validation_1.ticketSchema.validate(req.body);
                if (error) {
                    new response_util_1.default(400, res, error.details[0].message);
                    return;
                }
                const alert_id = req.params.alert_id;
                const { title, description, priority, assigned_to } = req.body;
                const data = {
                    title,
                    description,
                    priority,
                    alert_id,
                    assigned_to,
                };
                const result = yield ticketService.createTicket(alert_id, data);
                new response_util_1.default(201, res, "Ticket created successfully", result);
                return;
            }
            catch (error) {
                new response_util_1.default(409, res, error.message);
                return;
            }
        });
    }
    getTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ticket = yield ticketService.getTicket(req.params.id);
                new response_util_1.default(200, res, "", ticket);
                return;
            }
            catch (error) {
                new response_util_1.default(409, res, error.message);
                return;
            }
        });
    }
    getTickets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page, page_size, status, assigned_to, created_by, alert_id } = req.query;
                const query = {
                    page: typeof page === "string" ? parseInt(page, 10) : Number(page),
                    page_size: typeof page_size === "string"
                        ? parseInt(page_size, 10)
                        : Number(page_size) || 20,
                    status: typeof status === "string" ? status : null,
                    assigned_to: typeof assigned_to === "string" ? assigned_to : null,
                    created_by: typeof created_by === "string" ? created_by : null,
                    alert_id: typeof alert_id === "string" ? alert_id : null,
                };
                const tickets = yield ticketService.getTickets(query);
                new response_util_1.default(200, res, "Ticket created successfully!", tickets);
                return;
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err);
                return;
            }
        });
    }
    updateTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield ticketService.updateTicket(req.params.id, req.body);
                new response_util_1.default(200, res, "Ticket updated successfully", result);
                return;
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err);
                return;
            }
        });
    }
    deleteTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield registerUser_1.AuthService.getUserById(req.user.userId);
                if (user.role !== "admin") {
                    new response_util_1.default(500, res, "You are not authorized to delete this alert");
                    return;
                }
                yield ticketService.deleteTicket(req.params.id);
                new response_util_1.default(200, res, "Ticket deleted successfully");
                return;
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err);
                return;
            }
        });
    }
}
exports.TicketController = TicketController;
