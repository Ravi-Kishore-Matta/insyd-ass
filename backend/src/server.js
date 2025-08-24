import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import notificationRoutes from "./routes/notifications.js";
import eventRoutes from "./routes/events.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/insyd";

// Routes
app.get("/", (req, res) => res.send("Insyd Notifications API ✅"));
app.use("/api/notifications", notificationRoutes);
app.use("/api/events", eventRoutes);

// DB + Server
mongoose.set("strictQuery", true);
mongoose.connect(MONGO_URI, { dbName: "insyd" })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 API running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error("❌ Mongo connect error:", err.message);
    process.exit(1);
  });
