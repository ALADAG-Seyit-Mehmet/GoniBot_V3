const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('panel').setDescription('Yönetim Paneli'),
    async execute(i) {
        if(!i.member.permissions.has(PermissionsBitField.Flags.Administrator)) return i.reply("Yetkin yok.");
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("dash_koruma").setLabel("Koruma").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("dash_sistem").setLabel("Sistemler").setStyle(ButtonStyle.Primary)
        );
        i.reply({content: "🎛️ **GoniBot Paneli**", components: [row]});
    }
};