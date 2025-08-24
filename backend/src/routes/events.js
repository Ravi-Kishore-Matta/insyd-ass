import express from "express";
import Event from "../models/Event.js";
import User from "../models/User.js";
import { enqueueMany } from "../queue.js";

const router = express.Router();

// Create a domain event and fan-out to recipients
// POST /api/events
router.post("/", async (req, res) => {
  try {
    const { type, sourceUserId, targetUserId, data } = req.body;
    if (!type || !sourceUserId) {
      return res.status(400).json({ error: "type and sourceUserId are required" });
    }

    const event = new Event({ type, sourceUserId, targetUserId, data, status: "QUEUED" });
    await event.save();

    let recipients = [];

    switch (type) {
      case "FOLLOW":
        if (targetUserId) recipients = [targetUserId];
        break;
      case "LIKE":
      case "COMMENT":
      case "MESSAGE":
        if (targetUserId) recipients = [targetUserId];
        break;
      case "POST_CREATE":
        // notify all followers of source user (POC: simple list on User doc)
        const actor = await User.findOne({ userId: sourceUserId });
        if (actor && Array.isArray(actor.followers)) recipients = actor.followers;
        break;
      default:
        break;
    }

    if (recipients.length) {
      const jobs = recipients.map(rid => ({
        _id: event._id, // to allow status updates
        type,
        sourceUserId,
        targetUserId: rid,
        data
      }));
      enqueueMany(jobs);
    }

    res.status(201).json({ message: "Event created", event, recipients });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
