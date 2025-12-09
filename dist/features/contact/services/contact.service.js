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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const client_1 = require("@prisma/client");
// import { escapeRegExp } from "../../../utils/regex";
const prisma = new client_1.PrismaClient();
class ContactService {
    addContact(userId, contactUserIds) {
        return __awaiter(this, void 0, void 0, function* () {
            if (contactUserIds.length === 0) {
                throw new Error("No contacts provided to add");
            }
            const uniqueContactIds = [...new Set(contactUserIds)].filter((id) => id !== userId);
            if (uniqueContactIds.length === 0) {
                throw new Error("No valid contacts to add (cannot add self or empty list)");
            }
            const existingUsers = yield prisma.user.findMany({
                where: { id: { in: uniqueContactIds } },
                select: { id: true },
            });
            const existingUserIds = existingUsers.map((u) => u.id);
            const missingIds = uniqueContactIds.filter((id) => !existingUserIds.includes(id));
            if (missingIds.length > 0) {
                throw new Error(`Target users not found: ${missingIds.join(", ")}`);
            }
            const existingContacts = yield prisma.contact.findMany({
                where: {
                    userId,
                    contactUserId: { in: uniqueContactIds },
                },
                select: { contactUserId: true },
            });
            const alreadyAdded = existingContacts.map((c) => c.contactUserId);
            const newContactsToAdd = uniqueContactIds.filter((id) => !alreadyAdded.includes(id));
            if (newContactsToAdd.length === 0) {
                throw new Error("All selected contacts are already added");
            }
            yield prisma.contact.createMany({
                data: newContactsToAdd.map((contactUserId) => ({
                    userId,
                    contactUserId,
                })),
            });
        });
    }
    getContacts(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const contacts = yield prisma.contact.findMany({
                where: { userId },
                include: {
                    contactUser: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            phone: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
            return contacts.map((c) => c.contactUser);
        });
    }
    removeContact(userId, contactUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.contact.delete({
                where: {
                    userId_contactUserId: { userId, contactUserId },
                },
            });
        });
    }
    searchUsers(query, currentUserId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!query || query.trim().length < 2 || !currentUserId) {
                return [];
            }
            const searchTerm = query.trim();
            // const regex = new RegExp(`^${escapeRegExp(searchTerm)}`, "i");
            // console.log(regex);
            const result = yield prisma.user.findMany({
                where: {
                    AND: [
                        { id: { not: currentUserId } },
                        {
                            OR: [
                                { name: { contains: searchTerm, mode: "insensitive" } },
                                { username: { contains: searchTerm, mode: "insensitive" } },
                                { email: { contains: searchTerm, mode: "insensitive" } },
                            ],
                        },
                    ],
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    username: true,
                    phone: true,
                    isVerified: true,
                },
                orderBy: [
                    {
                        name: "asc",
                    },
                    {
                        username: "asc",
                    },
                    {
                        email: "asc",
                    },
                ],
                take: Math.min((options === null || options === void 0 ? void 0 : options.limit) || 20, 100),
                skip: (options === null || options === void 0 ? void 0 : options.skip) || 0,
            });
            return result.map((user) => {
                var _a, _b, _c;
                return ({
                    id: user.id,
                    email: user.email,
                    name: (_a = user.name) !== null && _a !== void 0 ? _a : null,
                    username: (_b = user.username) !== null && _b !== void 0 ? _b : null,
                    phone: (_c = user.phone) !== null && _c !== void 0 ? _c : null,
                    isVerified: user.isVerified,
                });
            });
        });
    }
}
exports.ContactService = ContactService;
