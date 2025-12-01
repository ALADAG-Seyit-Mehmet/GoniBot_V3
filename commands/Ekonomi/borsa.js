const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('borsa')
        .setDescription('Finansal durumunu gösterir.'),

    async execute(interaction) {
        const para = db.fetch(`para_${interaction.user.id}`) || 0;
        const coin = db.fetch(`coin_${interaction.user.id}`) || 0;
        
        // Zenginlik Seviyesi Belirle
        let statu = "Fakir 🏚️";
        let renk = "Grey";
        if (para > 1000) { statu = "Orta Halli 🏠"; renk = "Blue"; }
        if (para > 10000) { statu = "Zengin 💸"; renk = "Gold"; }
        if (para > 100000) { statu = "Milyarder 👑"; renk = "LuminousVividPink"; }

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'GoniBank Finans Raporu', iconURL: 'https://cdn-icons-png.flaticon.com/512/2534/2534204.png' })
            .setDescription(`**Hesap Sahibi:** ${interaction.user}`)
            .addFields(
                { name: '💳 Nakit Bakiye', value: `\`\`\`yaml\n${para.toLocaleString()} TL\`\`\``, inline: true },
                { name: '🪙 Kripto Varlık', value: `\`\`\`fix\n${coin.toLocaleString()} GC\`\`\``, inline: true },
                { name: '📊 Ekonomik Statü', value: `> **${statu}**`, inline: false }
            )
            .setColor(renk)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({ text: 'GoniBot Economy System', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};