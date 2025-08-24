import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  notificationId: { type: String, index: true },
  userId: { type: String, index: true, required: true },
  type: { type: String, required: true },
  content: { type: Object, required: true },
  status: { type: String, enum: ['UNREAD','READ','ARCHIVED'], default: 'UNREAD', index: true },
  readAt: { type: Date, default: null }
}, { timestamps: true });

NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Notification", NotificationSchema);
