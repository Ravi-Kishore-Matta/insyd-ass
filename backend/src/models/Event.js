import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  eventId: { type: String, index: true },
  type: { type: String, enum: ['LIKE','COMMENT','FOLLOW','POST_CREATE','MESSAGE'], required: true },
  sourceUserId: { type: String, required: true },
  targetUserId: { type: String, required: true },
  data: { type: Object },
  status: { type: String, enum: ['QUEUED','PROCESSED','FAILED'], default: 'QUEUED' },
  reason: { type: String }
}, { timestamps: true });

EventSchema.index({ createdAt: -1 });

export default mongoose.model("Event", EventSchema);
