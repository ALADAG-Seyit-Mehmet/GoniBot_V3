const { EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        if (oldMessage.author?.bot || !oldMessage.guild) return;
        if (oldMessage.content === newMessage.content) return; // Sadece link önizlemesi ise geç

        const logChannelID = db.fetch(`logKanal_${oldMessage.guild.id}`);
        if (!logChannelID) return;

        const channel = oldMessage.guild.channels.cache.get(logChannelID);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle('✏️ Mesaj Düzenlendi')
            .setColor('Yellow')
            .setDescription(`**Mesaj Sahibi:** ${oldMessage.author} - [Mesaja Git](${newMessage.url})`)
            .addFields(
                { name: 'Eski Hali', value: oldMessage.content ? oldMessage.content.substring(0, 1000) : '*(Yok)*' },
                { name: 'Yeni Hali', value: newMessage.content ? newMessage.content.substring(0, 1000) : '*(Yok)*' }
            )
            .setTimestamp();

        channel.send({ embeds: [embed] });
    }
};