const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sunucu-bilgi')
        .setDescription('Sunucu hakkında detaylı bilgi verir.'),

    async execute(interaction) {
        const { guild } = interaction;
        const owner = await guild.fetchOwner();

        const embed = new EmbedBuilder()
            .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '👑 Sahibi', value: `${owner.user.tag}`, inline: true },
                { name: '📅 Kuruluş', value: `<t:${parseInt(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '👥 Üye Sayısı', value: `${guild.memberCount}`, inline: true },
                { name: '📺 Kanal Sayısı', value: `${guild.channels.cache.size}`, inline: true },
                { name: '🎭 Rol Sayısı', value: `${guild.roles.cache.size}`, inline: true },
                { name: '🚀 Boost Durumu', value: `Seviye: ${guild.premiumTier} (${guild.premiumSubscriptionCount} Boost)`, inline: true }
            )
            .setColor('Blue')
            .setFooter({ text: `ID: ${guild.id}` });

        if (guild.bannerURL()) {
            embed.setImage(guild.bannerURL({ size: 1024 }));
        }

        await interaction.reply({ embeds: [embed] });
    }
};