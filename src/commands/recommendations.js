const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const settings = require("../services/guild-settings");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("recommendations")
    .setDescription("Get a security score and personalized server protection recommendations.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const guild = interaction.guild;
    const cfg = settings.get(guild.id);
    const everyone = guild.roles.everyone;
    const risky = [
      ["Administrator", PermissionFlagsBits.Administrator],
      ["Manage Server", PermissionFlagsBits.ManageGuild],
      ["Manage Channels", PermissionFlagsBits.ManageChannels],
      ["Manage Roles", PermissionFlagsBits.ManageRoles],
      ["Ban Members", PermissionFlagsBits.BanMembers]
    ].filter(([, permission]) => everyone.permissions.has(permission));

    const checks = [
      { ok: cfg.antiNukeEnabled, points: 25, title: "Enable anti-nuke protection", why: "Detects repeated destructive actions by an untrusted administrator." },
      { ok: cfg.autoLockdown, points: 15, title: "Enable automatic lockdown", why: "Lets NexGuard attempt emergency containment after an anti-nuke threshold is reached." },
      { ok: cfg.antiRaid, points: 15, title: "Keep anti-raid protection enabled", why: "Helps protect the server during suspicious join waves." },
      { ok: Boolean(cfg.logChannelId || config.logChannelId), points: 10, title: "Set a security log channel", why: "Gives moderators one place to review NexGuard security alerts." },
      { ok: risky.length === 0, points: 20, title: "Review @everyone permissions", why: "Remove powerful server-management permissions from @everyone." },
      { ok: Boolean(guild.members.me?.permissions.has(PermissionFlagsBits.ViewAuditLog)), points: 10, title: "Grant View Audit Log to NexGuard", why: "Required to attribute many security actions to the responsible account." },
      { ok: Boolean(guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)), points: 5, title: "Grant Manage Roles to NexGuard", why: "Needed for role and permission-based containment tasks." }
    ];

    const score = checks.reduce((total, check) => total + (check.ok ? check.points : 0), 0);
    const recommendations = checks.filter(check => !check.ok).map(check =>
      `• **${check.title}** (+${check.points} points)\n  ${check.why}`
    );
    if (risky.length) recommendations.push(`• **Dangerous @everyone permissions**\n  Currently granted: ${risky.map(([name]) => name).join(", ")}. Review these in Server Settings → Roles.`);

    const embed = new EmbedBuilder()
      .setColor(score >= 80 ? 0x16a34a : score >= 50 ? 0xf59e0b : 0xdc2626)
      .setTitle("🛡️ NexGuard Security Recommendations")
      .setDescription(`**Security score: ${score}/100**\n\n${recommendations.length ? recommendations.join("\n\n") : "✨ Great work! No issues were found in the checks NexGuard can currently inspect."}`)
      .addFields({ name: "Automatic setup", value: "Use the button below to enable NexGuard's safe built-in protections. Server permissions and channel settings are never changed automatically." })
      .setFooter({ text: "NexGuard Security Advisor • Review every change" })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("nexguard:recommendations:apply:" + guild.id)
        .setLabel("Apply safe recommendations")
        .setEmoji("🛡️")
        .setStyle(ButtonStyle.Success)
        .setDisabled(cfg.antiNukeEnabled && cfg.antiRaid)
    );
    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
