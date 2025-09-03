import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL!;
const client = new MongoClient(uri);

export async function applyIndexes() {
  try {
    await client.connect();
    const db = client.db();

    const collections = [
      { name: "Profile", prefix: "profile" },
      { name: "jobSeeker", prefix: "jobseeker" },
    ];

    for (const { name, prefix } of collections) {
      const col = db.collection(name);

      console.log(`\n📌 Applying indexes to ${name} collection...`);

      await col.createIndex(
        { interestedRoles: 1 },
        { background: true, name: `${prefix}_roles_idx` }
      );
      await col.createIndex(
        { experienceLevel: 1 },
        { background: true, name: `${prefix}_experience_idx` }
      );
      await col.createIndex(
        { workMode: 1 },
        { background: true, name: `${prefix}_workmode_idx` }
      );
      await col.createIndex(
        { jobType: 1 },
        { background: true, name: `${prefix}_jobtype_idx` }
      );
      await col.createIndex(
        { skills: 1 },
        { background: true, name: `${prefix}_skills_idx` }
      );
      await col.createIndex(
        { industry: 1 },
        { background: true, name: `${prefix}_industry_idx` }
      );

      await col.createIndex(
        { interestedRoles: 1, experienceLevel: 1, "location.city": 1 },
        { background: true, name: `${prefix}_role_exp_loc_idx` }
      );

      await col.createIndex(
        { skills: "text", interestedRoles: "text" },
        { background: true, name: `${prefix}_skills_roles_text_idx` }
      );

      await col.createIndex(
        { userId: 1 },
        { background: true, unique: true, name: `${prefix}_unique_userId` }
      );

      console.log(`✅ Indexes created for ${name}`);
    }

    console.log("\n🎯 All indexes applied successfully");
  } catch (error) {
    console.error("❌ Error applying indexes:", error);
  } finally {
    await client.close();
  }
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
