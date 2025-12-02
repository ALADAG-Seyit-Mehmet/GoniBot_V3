const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('borsa')
        .setDescription('Piyasa verileri ve işlem menüsü.'),

    async execute(interaction) {
        // Varlıklar
        const para = db.fetch(`para_${interaction.user.id}`) || 0;
        const btc = db.fetch(`asset_BTC_${interaction.user.id}`) || 0;
        const usd = db.fetch(`asset_USD_${interaction.user.id}`) || 0;
        const gld = db.fetch(`asset_GLD_${interaction.user.id}`) || 0;
        const gni = db.fetch(`asset_GNI_${interaction.user.id}`) || 0;

        // Fiyatlar
        const pBTC = db.fetch('market_BTC') || 50000;
        const pUSD = db.fetch('market_USD') || 30;
        const pGLD = db.fetch('market_GLD') || 2000;
        const pGNI = db.fetch('market_GNI') || 100;

        // Trend Okları
        const trend = (asset) => db.fetch(`trend_${asset}`) === 'up' ? '📈' : '📉';

        const embed = new EmbedBuilder()
            .setTitle('🏦 GoniBorsa İşlem Merkezi')
            .setDescription(`**Cüzdan:** ${para.toLocaleString()} TL`)
            .addFields(
                { name: `Bitcoin (BTC) ${trend('BTC')}`, value: `💵 **${pBTC} TL**\n🎒 Sahip: ${btc}`, inline: true },
                { name: `Dolar (USD) ${trend('USD')}`, value: `💵 **${pUSD} TL**\n🎒 Sahip: ${usd}`, inline: true },
                { name: `Altın (GLD) ${trend('GLD')}`, value: `💵 **${pGLD} TL**\n🎒 Sahip: ${gld}`, inline: true },
                { name: `GoniHisse (GNI) ${trend('GNI')}`, value: `💵 **${pGNI} TL**\n🎒 Sahip: ${gni}`, inline: true }
            )
            .setColor('DarkGreen')
            .setFooter({ text: 'İşlem yapmak için butonları kullan.' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_borsa_al').setLabel('Satın Al').setStyle(ButtonStyle.Success).setEmoji('📥'),
            new ButtonBuilder().setCustomId('btn_borsa_sat').setLabel('Sat').setStyle(ButtonStyle.Danger).setEmoji('📤'),
            new ButtonBuilder().setCustomId('btn_yenile_borsa').setLabel('Yenile').setStyle(ButtonStyle.Secondary).setEmoji('🔄')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};