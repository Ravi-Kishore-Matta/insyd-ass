import express from "express";
import Notification from "../models/Notification.js";
import { enqueue } from "../queue.js";

const router = express.Router();

// GET /api/notifications?userId=abc&cursor=...&limit=20
router.get("/", async (req, res) => {
  try {
    const { userId, cursor, limit = 20 } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const q = { userId };
    if (cursor) q._id = { $lt: cursor };

    const docs = await Notification.find(q)
      .sort({ _id: -1 })
      .limit(parseInt(limit, 10));

    const nextCursor = docs.length ? docs[docs.length - 1]._id : null;
    res.json({ notifications: docs, nextCursor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/simulate -> push an event through the queue quickly
router.post("/simulate", async (req, res) => {
  try {
    const { type, sourceUserId, targetUserId, data } = req.body;
    if (!type || !sourceUserId || !targetUserId) {
      return res.status(400).json({ error: "type, sourceUserId, targetUserId are required" });
    }
    const evt = { type, sourceUserId, targetUserId, data, createdAt: new Date() };
    enqueue(evt);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
