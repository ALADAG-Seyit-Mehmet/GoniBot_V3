const { SlashCommandBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sat')
        .setDescription('Piyasaya varlık sat.')
        .addStringOption(o => o.setName('sembol').setDescription('Ne satacaksın?').setRequired(true).addChoices(
            {name:'Bitcoin (BTC)', value:'BTC'},
            {name:'Dolar (USD)', value:'USD'},
            {name:'Altın (GLD)', value:'GLD'},
            {name:'GoniHisse (GNI)', value:'GNI'}
        ))
        .addIntegerOption(o => o.setName('adet').setDescription('Kaç tane?').setRequired(true)),

    async execute(interaction) {
        const sembol = interaction.options.getString('sembol');
        const adet = interaction.options.getInteger('adet');
        
        if (adet <= 0) return interaction.reply({ content: '0\'dan büyük bir sayı gir.', ephemeral: true });

        // Varlık Kontrolü
        const sahipOlunan = db.fetch(`asset_${sembol}_${interaction.user.id}`) || 0;
        if (sahipOlunan < adet) {
            return interaction.reply({ content: `❌ **Yetersiz Varlık!**\nSende sadece **${sahipOlunan}** adet ${sembol} var.`, ephemeral: true });
        }

        // Fiyatı Çek
        let fiyat = db.fetch(`market_${sembol}`);
        const toplamKazanc = fiyat * adet;

        // Satış İşlemi
        db.add(`asset_${sembol}_${interaction.user.id}`, -adet);
        db.add(`para_${interaction.user.id}`, toplamKazanc);

        // --- ARZ TALEP ETKİSİ ---
        // Satış yapıldığı için fiyat düşer!
        const etki = Math.ceil(fiyat * (adet * 0.001)); 
        let yeniFiyat = fiyat - etki;
        if (yeniFiyat < 1) yeniFiyat = 1; // Asla 0 olmaz

        db.set(`market_${sembol}`, yeniFiyat);
        db.set(`trend_${sembol}`, 'down');

        interaction.reply(`✅ **Satış Gerçekleşti!**\n📦 **${adet}** adet **${sembol}** satıldı.\n💰 Kazanılan: **${toplamKazanc.toLocaleString()} TL**\n📉 **Piyasa Etkisi:** Fiyat **${yeniFiyat} TL** oldu! (Düştü)`);
    }
};