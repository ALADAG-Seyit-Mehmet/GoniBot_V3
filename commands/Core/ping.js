const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun hızını (gecikmesini) ölçer.'),

    async execute(interaction) {
        const sent = await interaction.reply({ content: '🏓 Ölçülüyor...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const api = interaction.client.ws.ping;
        
        await interaction.editReply(`🏓 **Pong!**\n📶 **Bot Gecikmesi:** ${latency}ms\n🌐 **API Gecikmesi:** ${api}ms`);
    },
};