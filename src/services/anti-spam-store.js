const { Redis } = require("@upstash/redis");

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const localRecent = new Map();
let warned = false;

const cleanupTimer = setInterval(() => {
  const cutoff = Date.now() - 60000;
  for (const [key, timestamps] of localRecent) {
    const fresh = timestamps.filter(timestamp => timestamp > cutoff);
    if (fresh.length) localRecent.set(key, fresh);
    else localRecent.delete(key);
  }
}, 60000);
cleanupTimer.unref?.();

const RECORD_MESSAGE_SCRIPT = `
  redis.call("ZREMRANGEBYSCORE", KEYS[1], "-inf", tonumber(ARGV[1]) - tonumber(ARGV[2]))
  redis.call("ZADD", KEYS[1], tonumber(ARGV[1]), ARGV[3])
  local count = redis.call("ZCARD", KEYS[1])
  redis.call("EXPIRE", KEYS[1], tonumber(ARGV[4]))
  if count >= tonumber(ARGV[5]) then
    redis.call("DEL", KEYS[1])
  end
  return count
`;

async function recordMessage(guildId, userId, messageId, windowMs, maxMessages) {
  const key = "nexguard:spam:" + guildId + ":" + userId;
  const now = Date.now();

  if (redis) {
    try {
      const count = await redis.eval(
        RECORD_MESSAGE_SCRIPT,
        [key],
        [now, windowMs, messageId, Math.max(10, Math.ceil(windowMs / 1000) * 2), maxMessages]
      );
      return { count: Number(count), backend: "upstash" };
    } catch (error) {
      if (!warned) {
        console.error("Upstash Redis unavailable; using temporary local anti-spam fallback:", error.message);
        warned = true;
      }
    }
  }

  const cutoff = now - windowMs;
  const timestamps = (localRecent.get(key) || []).filter(timestamp => timestamp > cutoff);
  timestamps.push(now);
  const count = timestamps.length;
  if (count >= maxMessages) localRecent.delete(key);
  else localRecent.set(key, timestamps);
  return { count, backend: "local" };
}

module.exports = { recordMessage };
