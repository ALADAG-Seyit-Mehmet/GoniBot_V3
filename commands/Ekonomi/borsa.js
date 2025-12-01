const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('borsa')
        .setDescription('Cüzdan durumunu ve piyasayı gösterir.'),

    async execute(interaction) {
        const para = db.fetch(`para_${interaction.user.id}`) || 0;
        const coin = db.fetch(`coin_${interaction.user.id}`) || 0;
        
        // Sayıları Güzelleştir (10000 -> 10.000)
        const formatPara = para.toLocaleString('tr-TR');
        const formatCoin = coin.toLocaleString('tr-TR');

        const embed = new EmbedBuilder()
            .setTitle('💳 Cüzdan Durumu')
            .addFields(
                { name: '💵 Nakit Para', value: `**${formatPara} TL**`, inline: true },
                { name: '🪙 Kripto Para', value: `**${formatCoin} GC**`, inline: true }
            )
            .setColor('Green')
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({ text: 'GoniBot Ekonomi A.Ş.' });

        interaction.reply({ embeds: [embed] });
    }
};