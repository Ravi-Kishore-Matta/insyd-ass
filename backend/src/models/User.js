import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true, index: true },
  username: String,
  email: String,
  followers: { type: [String], default: [] }, // simple follower list for POC
  preferences: {
    inApp: { type: Boolean, default: true },
    mute: { type: Boolean, default: false },
    rateLimitPerMin: { type: Number, default: 60 }
  }
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
