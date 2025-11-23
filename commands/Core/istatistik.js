const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('istatistik')
        .setDescription('Botun teknik verilerini gösterir.'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('📊 GoniBot İstatistikleri')
            .addFields(
                { name: '💻 Sunucu Sayısı', value: `${interaction.client.guilds.cache.size}`, inline: true },
                { name: '👥 Kullanıcı Sayısı', value: `${interaction.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}`, inline: true },
                { name: '🧠 RAM Kullanımı', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
                { name: 'Ping', value: `${interaction.client.ws.ping}ms`, inline: true }
            )
            .setColor('Blue')
            .setFooter({ text: `GoniBot v3.0 • Discord.js v${version}` });

        await interaction.reply({ embeds: [embed] });
    },
};