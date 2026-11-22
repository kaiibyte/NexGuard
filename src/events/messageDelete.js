const { chatLog } = require("../utils/logger");

module.exports = {
  name: "messageDelete",
  async execute(message) {
    if (!message.guild || message.author?.bot) return;
    await chatLog(
      message.guild,
      "Message deleted",
      "Author: " + (message.author?.tag || "Unknown") +
      " (" + (message.author?.id || "unknown") + ")\n" +
      "Channel: <#" + message.channelId + ">\n" +
      "Content: " + (message.content || "[No cached content / attachment]"),
      0xdc2626
    );
  }
};