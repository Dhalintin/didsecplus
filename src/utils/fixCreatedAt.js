const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://SoloTechNigeria:uche1nna34@cluster0.mqned1t.mongodb.net/BiasDb?retryWrites=true&w=majority";
const dbName = "BiasDb";
const collectionName = "user";

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const result = await collection.updateMany(
      {
        $or: [{ createdAt: null }, { createdAt: { $exists: false } }],
      },
      {
        $set: { createdAt: new Date() },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} user(s).`);
  } catch (error) {
    console.error("❌ Error updating documents:", error);
  } finally {
    await client.close();
    console.log("🔌 Connection closed.");
  }
}

run();
