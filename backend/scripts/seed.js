import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/insyd";

async function run() {
  await mongoose.connect(MONGO_URI, { dbName: "insyd" });
  console.log("Connected");

  await User.deleteMany({});

  await User.create([
    { userId: "alice", username: "Alice", followers: ["bob", "carol"] },
    { userId: "bob", username: "Bob", followers: ["alice"] },
    { userId: "carol", username: "Carol", followers: [] }
  ]);

  console.log("Seeded users");
  await mongoose.disconnect();
  console.log("Done");
}

run().catch(e => { console.error(e); process.exit(1); });
