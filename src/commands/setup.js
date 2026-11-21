const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

const layout = [
  {
    name: "INFORMATION",
    channels: [
      ["welcome", "New members arrive here."],
      ["rules", "Read the server rules here."],
      ["announcements", "Important server updates."]
    ]
  },
  {
    name: "GENERAL",
    channels: [
      ["chat", "General community conversation."],
      ["media", "Share images, clips, and links."],
      ["suggestions", "Share ideas to improve the server."]
    ]
  },
  {
    name: "MODERATION",
    channels: [
      ["mod-logs", "Moderation activity and staff actions."],
      ["reports", "Report problems to the moderation team."]
    ]
  },
  {
    name: "VOICE",
    channels: [
      ["General Voice", null, "voice"],
      ["AFK", null, "voice"]
    ]
  },
  {
    name: "STAFF",
    private: true,
    channels: [
      ["staff-chat", "Private staff discussion."],
      ["staff-logs", "Private staff activity logs."]
    ]
  }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Create NexGuard's starter server categories and channels.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({ content: "Use this command inside a server.", ephemeral: true });
    }
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: "You need the Manage Server permission to use this command.", ephemeral: true });
    }

    const me = interaction.guild.members.me;
    if (!me?.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: "Please give NexGuard the Manage Channels permission, then run /setup again.", ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const existing = await guild.channels.fetch();
    const created = [];
    const skipped = [];

    for (const section of layout) {
      let category = existing.find(c => c && c.type === ChannelType.GuildCategory && c.name.toLowerCase() === section.name.toLowerCase());

      if (!category) {
        const options = {
          name: section.name,
          type: ChannelType.GuildCategory,
          reason: "NexGuard server setup"
        };
        if (section.private) {
          options.permissionOverwrites = [{
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
          }];
        }
        category = await guild.channels.create(options);
        created.push(`📁 ${section.name}`);
      } else {
        skipped.push(`📁 ${section.name}`);
      }

      for (const [name, topic, kind] of section.channels) {
        const type = kind === "voice" ? ChannelType.GuildVoice : ChannelType.GuildText;
        const found = existing.find(c => c && c.type === type && c.name.toLowerCase() === name.toLowerCase());
        if (found) {
          skipped.push(`# ${name}`);
          continue;
        }

        const options = {
          name,
          type,
          parent: category.id,
          reason: "NexGuard server setup"
        };
        if (topic && type === ChannelType.GuildText) options.topic = topic;
        if (section.private) {
          options.permissionOverwrites = [{
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
          }];
        }
        await guild.channels.create(options);
        created.push(type === ChannelType.GuildVoice ? `🔊 ${name}` : `# ${name}`);
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0x7c3aed)
      .setTitle("🛡️ NexGuard server setup complete")
      .setDescription("Your starter server layout is ready. The private STAFF category is hidden from @everyone; grant staff access by editing its permissions.")
      .addFields(
        { name: `Created (${created.length})`, value: created.length ? created.join("\n").slice(0, 1024) : "Nothing new was needed." },
        { name: `Already existed (${skipped.length})`, value: skipped.length ? skipped.join("\n").slice(0, 1024) : "None" }
      )
      .setFooter({ text: "You can safely run /setup again; existing matching channels are skipped." });

    return interaction.editReply({ embeds: [embed] });
  }
};
