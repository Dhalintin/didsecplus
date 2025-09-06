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
exports.applyIndexes = applyIndexes;
const mongodb_1 = require("mongodb");
const uri = process.env.DATABASE_URL;
const client = new mongodb_1.MongoClient(uri);
function applyIndexes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            const db = client.db();
            const collections = [
                { name: "Profile", prefix: "profile" },
                { name: "jobSeeker", prefix: "jobseeker" },
            ];
            for (const { name, prefix } of collections) {
                const col = db.collection(name);
                console.log(`\n📌 Applying indexes to ${name} collection...`);
                yield col.createIndex({ interestedRoles: 1 }, { background: true, name: `${prefix}_roles_idx` });
                yield col.createIndex({ experienceLevel: 1 }, { background: true, name: `${prefix}_experience_idx` });
                yield col.createIndex({ workMode: 1 }, { background: true, name: `${prefix}_workmode_idx` });
                yield col.createIndex({ jobType: 1 }, { background: true, name: `${prefix}_jobtype_idx` });
                yield col.createIndex({ skills: 1 }, { background: true, name: `${prefix}_skills_idx` });
                yield col.createIndex({ industry: 1 }, { background: true, name: `${prefix}_industry_idx` });
                yield col.createIndex({ interestedRoles: 1, experienceLevel: 1, "location.city": 1 }, { background: true, name: `${prefix}_role_exp_loc_idx` });
                yield col.createIndex({ skills: "text", interestedRoles: "text" }, { background: true, name: `${prefix}_skills_roles_text_idx` });
                yield col.createIndex({ userId: 1 }, { background: true, unique: true, name: `${prefix}_unique_userId` });
                console.log(`✅ Indexes created for ${name}`);
            }
            console.log("\n🎯 All indexes applied successfully");
        }
        catch (error) {
            console.error("❌ Error applying indexes:", error);
        }
        finally {
            yield client.close();
        }
    });
}
// applyIndexes();
// import { MongoClient } from "mongodb";
// const uri = process.env.DATABASE_URL!;
// const client = new MongoClient(uri);
// async function applyIndexes() {
//   try {
//     await client.connect();
//     const db = client.db();
//     const profiles = db.collection("Profile");
//     await profiles.createIndex({ interestedRoles: 1 });
//     await profiles.createIndex({ experienceLevel: 1 });
//     await profiles.createIndex({ workMode: 1 });
//     await profiles.createIndex({ jobType: 1 });
//     await profiles.createIndex({ skills: 1 });
//     await profiles.createIndex({ industry: 1 });
//     console.log("Indexes created successfully");
//   } catch (error) {
//     console.error("Error applying indexes:", error);
//   } finally {
//     await client.close();
//   }
// }
// applyIndexes();
