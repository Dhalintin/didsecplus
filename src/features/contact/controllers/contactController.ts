import { Request, Response } from "express";
import { ContactService } from "../services/contact.service";

import CustomResponse from "../../../utils/helpers/response.util";
const contactService = new ContactService();

export class ContactController {
  async addContact(req: Request, res: Response) {
    const userId = req.user.userId;
    const { contactUserId } = req.body;

    if (!contactUserId) {
      return res.status(400).json({ error: "contactUserId required" });
    }

    try {
      await contactService.addContact(userId, contactUserId);
      res.status(201).json({ message: "Contact added" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async removeContact(req: Request, res: Response) {
    const userId = req.user.userId;
    const { contactUserId } = req.body;

    if (!contactUserId) {
      return res.status(400).json({ error: "contactUserId required" });
    }

    try {
      await contactService.removeContact(userId, contactUserId);
      res.json({ message: "Contact removed" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getContacts(req: Request, res: Response) {
    const userId = req.user.userId;

    try {
      const contacts = await contactService.getContacts(userId);
      res.json({ contacts });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async searchContact(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const query = req.query.q as string;
      console.log(query);
      const users = await contactService.searchUsers(query, userId, {
        limit: 10,
        skip: 0,
      } as any);

      new CustomResponse(201, res, "User retrieved successfully", users);
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err);
    }
  }
}
