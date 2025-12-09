import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL as string;
const client = new MongoClient(uri);

export async function applyIndexes() {
  try {
    await client.connect();
    const db = client.db();

    await db.collection("User").createIndex(
      { email: "text", username: "text", name: "text" },
      {
        name: "user_search_index",
        weights: { email: 10, username: 8, name: 5 },
      }
    );

    console.log(`✅ Indexes created for Users`);

    console.log("\n🎯 All indexes applied successfully");
  } catch (error) {
    console.error("❌ Error applying indexes:", error);
  } finally {
    await client.close();
  }
}
