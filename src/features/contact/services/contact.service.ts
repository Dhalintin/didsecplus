import { PrismaClient } from "@prisma/client";
// import { ObjectId } from "bson";
import { ObjectId } from "mongodb";

// import { escapeRegExp } from "../../../utils/regex";

const prisma = new PrismaClient();

export class ContactService {
  async addContact(userId: string, contactUserIds: string[]): Promise<void> {
    if (contactUserIds.length === 0) {
      throw new Error("No contacts provided to add");
    }

    const uniqueContactIds = [...new Set(contactUserIds)].filter(
      (id) => id !== userId
    );

    if (uniqueContactIds.length === 0) {
      throw new Error(
        "No valid contacts to add (cannot add self or empty list)"
      );
    }

    const existingUsers = await prisma.user.findMany({
      where: { id: { in: uniqueContactIds } },
      select: { id: true },
    });

    const existingUserIds = existingUsers.map((u: any) => u.id);
    const missingIds = uniqueContactIds.filter(
      (id) => !existingUserIds.includes(id)
    );

    if (missingIds.length > 0) {
      throw new Error(`Target users not found: ${missingIds.join(", ")}`);
    }

    const existingContacts = await prisma.contact.findMany({
      where: {
        userId,
        contactUserId: { in: uniqueContactIds },
      },
      select: { contactUserId: true },
    });

    const alreadyAdded = existingContacts.map((c: any) => c.contactUserId);
    const newContactsToAdd = uniqueContactIds.filter(
      (id) => !alreadyAdded.includes(id)
    );

    if (newContactsToAdd.length === 0) {
      throw new Error("All selected contacts are already added");
    }

    await prisma.contact.createMany({
      data: newContactsToAdd.map((contactUserId) => ({
        userId,
        contactUserId,
      })),
    });
  }

  async getContacts(userId: string): Promise<any[]> {
    const contacts = await prisma.contact.findMany({
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

    return contacts.map((c: any) => c.contactUser);
  }

  async removeContact(userId: string, contactUserId: string): Promise<void> {
    await prisma.contact.delete({
      where: {
        userId_contactUserId: { userId, contactUserId },
      },
    });
  }

  async searchUsers(
    query: string,
    currentUserId: string,
    options?: {
      limit?: number;
      skip?: number;
    }
  ): Promise<
    Array<{
      email: string;
      name: string | null;
      username: string | null;
      phone: string | null;
      isVerified: boolean;
    }>
  > {
    if (!query || query.trim().length < 2 || !currentUserId) {
      return [];
    }

    const searchTerm = query.trim();
    // const regex = new RegExp(`^${escapeRegExp(searchTerm)}`, "i");
    // console.log(regex);

    const result = await prisma.user.findMany({
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
      take: Math.min(options?.limit || 20, 100),
      skip: options?.skip || 0,
    });

    return result.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      username: user.username ?? null,
      phone: user.phone ?? null,
      isVerified: user.isVerified,
    }));
  }

  // async searchUsers(
  //   query: string,
  //   currentUserId: string,
  //   options?: {
  //     limit?: number;
  //     cursor?: string; // optional cursor pagination
  //   }
  // ) {
  //   if (!query || query.trim().length < 2) return [];

  //   const limit = Math.min(options?.limit || 20, 50);
  //   const searchTerm = query.trim();

  //   // Cursor pagination support
  //   const cursorFilter = options?.cursor
  //     ? { _id: { $gt: new ObjectId(options.cursor) } }
  //     : {};

  //   const baseMatch = {
  //     _id: { $ne: new ObjectId(currentUserId) },
  //     ...cursorFilter,
  //   };

  //   // -----------------------------
  //   // 1) TEXT SEARCH (fastest, use if hits)
  //   // -----------------------------
  //   const textResults = await prisma.user.aggregateRaw({
  //     pipeline: [
  //       {
  //         $match: {
  //           ...baseMatch,
  //           $text: { $search: searchTerm },
  //         },
  //       },
  //       {
  //         $project: {
  //           email: 1,
  //           name: 1,
  //           username: 1,
  //           phone: 1,
  //           isVerified: 1,
  //           score: { $meta: "textScore" },
  //         },
  //       },
  //       { $sort: { score: -1, _id: 1 } },
  //       { $limit: limit },
  //     ],
  //   });

  //   // if (textResults.length > 0) {
  //   //   return textResults.map((u: any) => ({
  //   //     id: u._id.toString(),
  //   //     email: u.email,
  //   //     name: u.name ?? null,
  //   //     username: u.username ?? null,
  //   //     phone: u.phone ?? null,
  //   //     isVerified: u.isVerified,
  //   //     cursor: u._id.toString(),
  //   //   }));
  //   // }
  //   if (Array.isArray(textResults) && textResults.length > 0) {
  //     return textResults.map((u: any) => ({
  //       id: u.id,
  //       email: u.email,
  //       name: u.name,
  //       username: u.username,
  //       phone: u.phone,
  //       isVerified: u.isVerified,
  //       cursor: u._id,
  //     }));
  //   }
  //   // -----------------------------
  //   // 2) REGEX FALLBACK (for substring match)
  //   // -----------------------------
  //   const regex = new RegExp(searchTerm, "i");

  //   // const regexResults = await prisma.user.aggregateRaw({
  //   //   pipeline: [
  //   //     {
  //   //       $match: {
  //   //         ...baseMatch,
  //   //         $or: [
  //   //           { email: regex },
  //   //           { username: regex },
  //   //           { name: regex },
  //   //         ],
  //   //       },
  //   //     },
  //   //     {
  //   //       $project: {
  //   //         email: 1,
  //   //         name: 1,
  //   //         username: 1,
  //   //         phone: 1,
  //   //         isVerified: 1,
  //   //       },
  //   //     },
  //   //     { $sort: { _id: 1 } },
  //   //     { $limit: limit },
  //   //   ],
  //   // });
  //   const regexResults = await prisma.user.aggregateRaw({
  //     pipeline: [
  //       {
  //         $match: {
  //           ...baseMatch,
  //           $text: { $search: searchTerm },
  //         },
  //       },
  //       {
  //         $project: {
  //           id: 1,
  //           email: 1,
  //           name: 1,
  //           username: 1,
  //           phone: 1,
  //           isVerified: 1,
  //           score: { $meta: "textScore" },
  //         },
  //       },
  //       { $sort: { score: -1, _id: 1 } },
  //       { $limit: limit },
  //     ],
  //   });

  //   // return regexResults.map((u: any) => ({
  //   //   id: u._id.toString(),
  //   //   email: u.email,
  //   //   name: u.name ?? null,
  //   //   username: u.username ?? null,
  //   //   phone: u.phone ?? null,
  //   //   isVerified: u.isVerified,
  //   //   cursor: u._id.toString(),
  //   // }));
  //   return Array.isArray(regexResults)
  //     ? regexResults.map((u: any) => ({
  //         id: u._id.toString(),
  //         email: u.email,
  //         name: u.name,
  //         username: u.username,
  //         phone: u.phone,
  //         isVerified: u.isVerified,
  //         cursor: u._id,
  //       }))
  //     : [];
  // }

  // async searchUsers(
  //   query: string,
  //   currentUserId: string,
  //   options?: {
  //     limit?: number;
  //     cursor?: string; // optional cursor pagination
  //   }
  // ) {
  //   if (!query || query.trim().length < 2) return [];

  //   const limit = Math.min(options?.limit || 20, 50);
  //   const searchTerm = query.trim();

  //   // Cursor pagination support
  //   const cursorFilter = options?.cursor
  //     ? { _id: { $gt: new ObjectId(options.cursor) } }
  //     : {};

  //   const baseMatch = {
  //     _id: { $ne: new ObjectId(currentUserId) },
  //     ...cursorFilter,
  //   };

  //   // -----------------------------
  //   // 1) TEXT SEARCH (fastest, use if hits)
  //   // -----------------------------
  //   const textResults = await prisma.user.aggregateRaw({
  //     pipeline: [
  //       {
  //         $match: {
  //           ...baseMatch,
  //           $text: { $search: searchTerm },
  //         },
  //       },
  //       {
  //         $project: {
  //           _id: 0,
  //           id: { $toString: "$_id" },
  //           email: 1,
  //           name: 1,
  //           username: 1,
  //           phone: 1,
  //           isVerified: 1,
  //           score: { $meta: "textScore" },
  //         },
  //       },
  //       { $sort: { score: -1, _id: 1 } },
  //       { $limit: limit },
  //     ],
  //   });

  //   if (Array.isArray(textResults) && textResults.length > 0) {
  //     return textResults.map((u: any) => ({
  //       id: u.id,
  //       email: u.email,
  //       name: u.name ?? null,
  //       username: u.username ?? null,
  //       phone: u.phone ?? null,
  //       isVerified: u.isVerified,
  //       cursor: u._id.toString(),
  //     }));
  //   }

  //   // -----------------------------
  //   // 2) REGEX FALLBACK (for substring match)
  //   // -----------------------------
  //   const regexResults = await prisma.user.aggregateRaw({
  //     pipeline: [
  //       {
  //         $match: {
  //           ...baseMatch,
  //           $or: [
  //             { email: { $regex: searchTerm, $options: "i" } },
  //             { username: { $regex: searchTerm, $options: "i" } },
  //             { name: { $regex: searchTerm, $options: "i" } },
  //           ],
  //         },
  //       },
  //       {
  //         $project: {
  //           email: 1,
  //           name: 1,
  //           username: 1,
  //           phone: 1,
  //           isVerified: 1,
  //         },
  //       },
  //       { $sort: { _id: 1 } },
  //       { $limit: limit },
  //     ],
  //   });

  //   return Array.isArray(regexResults)
  //     ? regexResults.map((u: any) => ({
  //         id: u._id.toString(),
  //         email: u.email,
  //         name: u.name ?? null,
  //         username: u.username ?? null,
  //         phone: u.phone ?? null,
  //         isVerified: u.isVerified,
  //         cursor: u._id.toString(),
  //       }))
  //     : [];
  // }

  // }

  // async searchUsers(
  //   query: string,
  //   currentUserId: string,
  //   options?: {
  //     limit?: number;
  //     cursor?: string;
  //   }
  // ) {
  //   if (!query || query.trim().length < 2) return [];

  //   const limit = Math.min(options?.limit || 20, 50);
  //   const searchTerm = query.trim();

  //   const cursorFilter = options?.cursor
  //     ? { _id: { $gt: new ObjectId(options.cursor) } }
  //     : {};

  //   const baseMatch = {
  //     _id: { $ne: new ObjectId(currentUserId) },
  //     ...cursorFilter,
  //   };

  //   // --- 1) TEXT SEARCH (Try first)
  //   const textResults = await prisma.user.aggregateRaw({
  //     pipeline: [
  //       {
  //         $match: {
  //           ...baseMatch,
  //           $text: { $search: searchTerm },
  //         },
  //       },
  //       {
  //         $project: {
  //           id: 1,
  //           email: 1,
  //           name: 1,
  //           username: 1,
  //           phone: 1,
  //           isVerified: 1,
  //           score: { $meta: "textScore" },
  //         },
  //       },
  //       { $sort: { score: -1, _id: 1 } },
  //       { $limit: limit },
  //     ],
  //   });

  //   // If text search matched → return quickly
  //   if (Array.isArray(textResults) && textResults.length > 0) {
  //     return textResults.map((u: any) => ({
  //       id: u.id,
  //       email: u.email,
  //       name: u.name,
  //       username: u.username,
  //       phone: u.phone,
  //       isVerified: u.isVerified,
  //       cursor: u._id,
  //     }));
  //   }

  //   // --- 2) REGEX FALLBACK for substring search (Prince, Dominic, Lincoln)
  //   const regex = new RegExp(searchTerm, "i");

  //   const regexResults = await prisma.user.aggregateRaw({
  //     pipeline: [
  //       {
  //         $match: {
  //           ...baseMatch,
  //           $or: [
  //             { email: { $regex: searchTerm, $options: "i" } },
  //             { username: { $regex: searchTerm, $options: "i" } },
  //             { name: { $regex: searchTerm, $options: "i" } },
  //           ],
  //         },
  //       },
  //       {
  //         $project: {
  //           email: 1,
  //           name: 1,
  //           username: 1,
  //           phone: 1,
  //           isVerified: 1,
  //         },
  //       },
  //       { $sort: { _id: 1 } },
  //       { $limit: limit },
  //     ],
  //   });

  //   return Array.isArray(regexResults)
  //     ? regexResults.map((u: any) => ({
  //         id: u._id.toString(),
  //         email: u.email,
  //         name: u.name,
  //         username: u.username,
  //         phone: u.phone,
  //         isVerified: u.isVerified,
  //         cursor: u._id,
  //       }))
  //     : [];
  // }
}
