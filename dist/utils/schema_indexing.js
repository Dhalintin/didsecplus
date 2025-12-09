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
            yield db.collection("User").createIndex({ email: "text", username: "text", name: "text" }, {
                name: "user_search_index",
                weights: { email: 10, username: 8, name: 5 },
            });
            console.log(`✅ Indexes created for Users`);
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
