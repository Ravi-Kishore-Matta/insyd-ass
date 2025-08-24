import { nanoid } from "nanoid";
import Notification from "./models/Notification.js";
import Event from "./models/Event.js";
import { buildContent } from "./utils/buildContent.js";

/**
 * In-memory queue + background worker (POC).
 * Replace with Kafka/RabbitMQ/Redis Streams for production.
 */

const _q = [];
const perMinuteCount = new Map();
let RATE_LIMIT_PER_MIN = 120;
let workerTimer = null;
let intervalMs = 50; // 20 events/sec

export function enqueue(evt) {
  _q.push(evt);
  return _q.length;
}

export function enqueueMany(events = []) {
  if (!Array.isArray(events)) return enqueue(events);
  for (const e of events) _q.push(e);
  return _q.length;
}

export function size() { return _q.length; }
export function setRateLimit(perMinute = 120) { RATE_LIMIT_PER_MIN = Number(perMinute) || RATE_LIMIT_PER_MIN; }
export function setThroughput(perSecond = 20) {
  const ms = Math.max(1, Math.floor(1000 / perSecond));
  if (ms === intervalMs) return;
  intervalMs = ms;
  if (workerTimer) {
    clearInterval(workerTimer);
    workerTimer = setInterval(tick, intervalMs);
  }
}

function withinRate(userId) {
  const now = Date.now();
  const bucket = Math.floor(now / 60000);
  const cur = perMinuteCount.get(userId) || { minuteBucket: bucket, count: 0 };
  if (cur.minuteBucket !== bucket) {
    perMinuteCount.set(userId, { minuteBucket: bucket, count: 1 });
    return true;
  }
  if (cur.count < RATE_LIMIT_PER_MIN) {
    cur.count += 1;
    perMinuteCount.set(userId, cur);
    return true;
  }
  return false;
}

async function processOne(evt) {
  try {
    if (!evt?.targetUserId || !evt?.type) {
      await Event.updateOne({ _id: evt._id }, { $set: { status: 'FAILED', reason: 'BAD_EVENT' } });
      return;
    }
    const allowed = withinRate(evt.targetUserId);
    if (!allowed) {
      await Event.updateOne({ _id: evt._id }, { $set: { status: 'FAILED', reason: 'RATE_LIMIT' } });
      return;
    }
    const content = buildContent(evt);
    await Notification.create({
      notificationId: nanoid(),
      userId: evt.targetUserId,
      type: evt.type,
      content
    });
    await Event.updateOne({ _id: evt._id }, { $set: { status: 'PROCESSED' } });
  } catch (err) {
    console.error("Process error:", err?.message || err);
    try { await Event.updateOne({ _id: evt._id }, { $set: { status: 'FAILED', reason: 'EXCEPTION' } }); } catch {}
  }
}

async function tick() {
  if (_q.length === 0) return;
  const evt = _q.shift();
  await processOne(evt);
}

export function startWorker() {
  if (workerTimer) return;
  workerTimer = setInterval(tick, intervalMs);
  console.log(`🧵 Notification worker started (interval ${intervalMs}ms)`);
}

export function stopWorker() {
  if (workerTimer) {
    clearInterval(workerTimer);
    workerTimer = null;
    console.log("🧵 Notification worker stopped");
  }
}

// Auto-start
startWorker();

if (typeof process !== "undefined" && process.on) {
  process.on("SIGINT", async () => { stopWorker(); process.exit(0); });
  process.on("SIGTERM", async () => { stopWorker(); process.exit(0); });
}
