const { chatLog } = require("../utils/logger");

module.exports = {
  name: "messageUpdate",
  async execute(oldMessage, newMessage) {
    if (!newMessage.guild || newMessage.author?.bot || oldMessage.content === newMessage.content) return;
    await chatLog(
      newMessage.guild,
      "Message edited",
      "Author: " + (newMessage.author?.tag || "Unknown") +
      " (" + (newMessage.author?.id || "unknown") + ")\n" +
      "Channel: <#" + newMessage.channelId + ">\n" +
      "Before: " + (oldMessage.content || "[uncached]") + "\n" +
      "After: " + (newMessage.content || "[empty]"),
      0xf59e0b
    );
  }
};