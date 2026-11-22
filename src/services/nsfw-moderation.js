const { log } = require("../utils/logger");
const db = require("../database");

const ENDPOINT = "https://nsfw.sptrnd.id/v1/moderate";
const MAX_BYTES = 10 * 1024 * 1024;
const CONFIDENCE_THRESHOLD = 0.92;

async function inspectAttachment(attachment) {
  if (!attachment.contentType || !/^image\/(jpeg|png|webp)$/i.test(attachment.contentType)) {
    return { status: "skip" };
  }
  if (attachment.size > MAX_BYTES) return { status: "skip", reason: "Image exceeds the free API's 10 MB limit." };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(attachment.url, { signal: controller.signal });
    if (!response.ok) return { status: "error", reason: "Discord attachment download failed (" + response.status + ")." };
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length || bytes.length > MAX_BYTES) return { status: "skip", reason: "Image is empty or exceeds 10 MB." };

    const result = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": attachment.contentType },
      body: bytes,
      signal: controller.signal
    });
    if (!result.ok) return { status: "error", reason: "Moderation service returned HTTP " + result.status + "." };
    const data = await result.json();
    const verdict = data?.result;
    if (typeof verdict?.is_nsfw !== "boolean" || typeof verdict?.confidence !== "number") {
      return { status: "error", reason: "Moderation service returned an unexpected response." };
    }
    if (verdict.is_nsfw && verdict.confidence >= CONFIDENCE_THRESHOLD) {
      return { status: "flag", confidence: verdict.confidence };
    }
    if (verdict.is_nsfw || verdict.confidence < 0.75) {
      return { status: "review", confidence: verdict.confidence };
    }
    return { status: "clean", confidence: verdict.confidence };
  } catch (error) {
    return { status: "error", reason: error.name === "AbortError" ? "Moderation check timed out." : error.message };
  } finally {
    clearTimeout(timer);
  }
}

async function moderateMessage(message) {
  const cfg = require("./guild-settings").get(message.guild.id);
  if (!cfg.nsfwEnabled) return;
  const attachments = [...message.attachments.values()].filter(item =>
    item.contentType && /^image\/(jpeg|png|webp)$/i.test(item.contentType)
  );
  if (!attachments.length) return;

  for (const attachment of attachments) {
    const check = await inspectAttachment(attachment);
    if (check.status === "error") {
      await log(message.guild, "NSFW scan unavailable", "Message: " + message.id + "\nUser: <@" + message.author.id + ">\n" + check.reason + "\nNo punishment was applied.", 0xf59e0b);
      continue;
    }
    if (check.status === "skip") continue;
    if (check.status === "clean") continue;
    if (check.status === "review") {
      await log(message.guild, "NSFW image needs review", "Message: " + message.id + "\nUser: <@" + message.author.id + ">\nConfidence: " + Math.round(check.confidence * 100) + "%\nNo strike or punishment was applied. Please review manually.", 0xf59e0b);
      continue;
    }

    await message.delete().catch(() => null);
    const strike = db.recordNsfwStrike(message.guild.id, message.author.id, message.id);
    let sanction = "No automatic sanction: strike recorded, but action failed.";
    try {
      if (strike === 1) {
        await message.member.timeout(10 * 60 * 1000, "NexGuard: confirmed explicit image (first offense)");
        sanction = "10-minute timeout";
      } else if (strike === 2) {
        await message.member.timeout(24 * 60 * 60 * 1000, "NexGuard: confirmed explicit image (second offense)");
        sanction = "24-hour timeout";
      } else {
        await message.guild.members.ban(message.author.id, { reason: "NexGuard: third confirmed explicit-image offense" });
        sanction = "Permanent ban";
      }
    } catch (error) {
      sanction = "FAILED: " + error.message;
    }

    await log(
      message.guild,
      "NSFW incident report",
      "Module: Image NSFW moderation\nUser: <@" + message.author.id + "> (" + message.author.tag + ")\nChannel: <#" + message.channelId + ">\nMessage: " + message.id + "\nStrike: " + strike + "\nConfidence: " + Math.round(check.confidence * 100) + "%\nSanction: " + sanction + "\nImage removed: attempted",
      sanction.startsWith("FAILED") ? 0xf59e0b : 0xdc2626
    );
  }
}

module.exports = { moderateMessage };