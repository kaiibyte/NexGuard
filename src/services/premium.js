const db = require("../database");
function requirePremium(interaction, feature) {
  if (db.hasPremium(interaction.guildId)) return true;
  interaction.reply({ content: `🔒 **${feature}** is a NexGuard Premium feature.`, ephemeral: true }).catch(() => {});
  return false;
}
module.exports = { requirePremium };
