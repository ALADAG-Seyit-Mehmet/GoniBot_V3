const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const db = require('croxydb');

module.exports = {
    name: 'messageDelete',
    async execute(message, client) {
        if (message.author?.bot || !message.guild) return;

        const logChannelID = db.fetch(`logKanal_${message.guild.id}`);
        if (!logChannelID) return;

        const channel = message.guild.channels.cache.get(logChannelID);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle('🗑️ Mesaj Silindi')
            .setColor('Red')
            .addFields(
                { name: 'Kullanıcı', value: `${message.author} (${message.author.id})`, inline: true },
                { name: 'Kanal', value: `${message.channel}`, inline: true },
                { name: 'İçerik', value: message.content ? message.content.substring(0, 1000) : '*(Görsel/Dosya)*' }
            )
            .setTimestamp();

        channel.send({ embeds: [embed] });
    }
};