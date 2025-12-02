const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('borsa')
        .setDescription('Canlı piyasa verileri ve portföyün.'),

    async execute(interaction) {
        // Kullanıcı Varlıkları
        const para = db.fetch(`para_${interaction.user.id}`) || 0;
        const btc = db.fetch(`asset_BTC_${interaction.user.id}`) || 0;
        const usd = db.fetch(`asset_USD_${interaction.user.id}`) || 0;
        const gld = db.fetch(`asset_GLD_${interaction.user.id}`) || 0;
        const gni = db.fetch(`asset_GNI_${interaction.user.id}`) || 0;

        // Piyasa Fiyatları
        const pBTC = db.fetch('market_BTC');
        const pUSD = db.fetch('market_USD');
        const pGLD = db.fetch('market_GLD');
        const pGNI = db.fetch('market_GNI');

        // Trend Okları
        const trend = (asset) => db.fetch(`trend_${asset}`) === 'up' ? '📈' : '📉';

        // Toplam Servet Hesabı
        const toplamVarlik = para + (btc*pBTC) + (usd*pUSD) + (gld*pGLD) + (gni*pGNI);

        const embed = new EmbedBuilder()
            .setTitle('🏦 GoniBorsa Canlı Veriler')
            .setDescription(`**Cüzdan:** ${para.toLocaleString()} TL\n**Toplam Servet:** ${toplamVarlik.toLocaleString()} TL`)
            .addFields(
                { name: `Bitcoin (BTC) ${trend('BTC')}`, value: `Fiyat: **${pBTC} TL**\nSahip: ${btc}`, inline: true },
                { name: `Dolar (USD) ${trend('USD')}`, value: `Fiyat: **${pUSD} TL**\nSahip: ${usd}`, inline: true },
                { name: `Altın (GLD) ${trend('GLD')}`, value: `Fiyat: **${pGLD} TL**\nSahip: ${gld}`, inline: true },
                { name: `GoniHisse (GNI) ${trend('GNI')}`, value: `Fiyat: **${pGNI} TL**\nSahip: ${gni}`, inline: true }
            )
            .setColor('DarkBlue')
            .setFooter({ text: 'Fiyatlar işlem hacmine göre anlık değişir!' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};