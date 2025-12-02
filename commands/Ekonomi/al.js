const { SlashCommandBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('al')
        .setDescription('Piyasadan varlık satın al.')
        .addStringOption(o => o.setName('sembol').setDescription('Ne alacaksın?').setRequired(true).addChoices(
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

        // Fiyatı Çek
        let fiyat = db.fetch(`market_${sembol}`);
        const toplamTutar = fiyat * adet;
        const cuzdan = db.fetch(`para_${interaction.user.id}`) || 0;

        if (cuzdan < toplamTutar) {
            return interaction.reply({ content: `💸 **Yetersiz Bakiye!**\nBu işlem için **${toplamTutar.toLocaleString()} TL** lazım.`, ephemeral: true });
        }

        // Satın Alma İşlemi
        db.add(`para_${interaction.user.id}`, -toplamTutar);
        db.add(`asset_${sembol}_${interaction.user.id}`, adet);

        // --- ARZ TALEP ETKİSİ ---
        // Alım yapıldığı için fiyat artar! (Her 1 birim alım, fiyatı %0.1 artırır - Örnek)
        // Büyük alımlarda "Balina Etkisi" oluşur.
        const etki = Math.ceil(fiyat * (adet * 0.001)); 
        const yeniFiyat = fiyat + etki;
        db.set(`market_${sembol}`, yeniFiyat);
        db.set(`trend_${sembol}`, 'up');

        interaction.reply(`✅ **İşlem Başarılı!**\n📦 **${adet}** adet **${sembol}** alındı.\n💰 Ödenen: **${toplamTutar.toLocaleString()} TL**\n📈 **Piyasa Etkisi:** Fiyat **${yeniFiyat} TL** oldu! (Arttı)`);
    }
};