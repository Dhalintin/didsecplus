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
exports.ContactController = void 0;
const contact_service_1 = require("../services/contact.service");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const contactService = new contact_service_1.ContactService();
class ContactController {
    addContact(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.user.userId;
            const { contactUserId } = req.body;
            if (!contactUserId) {
                return res.status(400).json({ error: "contactUserId required" });
            }
            try {
                yield contactService.addContact(userId, contactUserId);
                res.status(201).json({ message: "Contact added" });
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    removeContact(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.user.userId;
            const { contactUserId } = req.body;
            if (!contactUserId) {
                return res.status(400).json({ error: "contactUserId required" });
            }
            try {
                yield contactService.removeContact(userId, contactUserId);
                res.json({ message: "Contact removed" });
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    getContacts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.user.userId;
            try {
                const contacts = yield contactService.getContacts(userId);
                res.json({ contacts });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    searchContact(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.userId;
                const query = req.query.q;
                console.log(query);
                const users = yield contactService.searchUsers(query, userId, {
                    limit: 10,
                    skip: 0,
                });
                new response_util_1.default(201, res, "User retrieved successfully", users);
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err);
            }
        });
    }
}
exports.ContactController = ContactController;
