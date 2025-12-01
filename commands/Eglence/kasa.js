const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kasa-ac')
        .setDescription('Şans kasası aç (Bedel: 200 TL).'),

    async execute(interaction) {
        const bedel = 200;
        const para = db.fetch(`para_${interaction.user.id}`) || 0;

        if (para < bedel) return interaction.reply({ content: "💸 Paran yetmiyor (200 TL lazım).", ephemeral: true });

        db.add(`para_${interaction.user.id}`, -bedel);

        // Kasa İçerikleri
        const oduller = [
            { ad: "Çöp 🗑️", deger: 0, renk: "Grey", sans: 40 },
            { ad: "Az Para 💵", deger: 100, renk: "White", sans: 30 },
            { ad: "Güzel Para 💰", deger: 500, renk: "Blue", sans: 20 },
            { ad: "ALTIN KÜLÇE 👑", deger: 2000, renk: "Gold", sans: 8 },
            { ad: "EFSANEVİ ELMAS 💎", deger: 10000, renk: "LuminousVividPink", sans: 2 }
        ];

        // Şans Hesaplama
        const random = Math.random() * 100;
        let kazanilan = oduller[0];
        let toplamSans = 0;

        for (const odul of oduller) {
            toplamSans += odul.sans;
            if (random <= toplamSans) {
                kazanilan = odul;
                break;
            }
        }

        if (kazanilan.deger > 0) db.add(`para_${interaction.user.id}`, kazanilan.deger);

        const embed = new EmbedBuilder()
            .setTitle('📦 Kasa Açılıyor...')
            .setDescription(`
                ...Click
                ...Tıkırt
                
                🎉 **İÇİNDEN ÇIKAN:**
                # ${kazanilan.ad}
                
                **Değeri:** ${kazanilan.deger} TL
            `)
            .setColor(kazanilan.renk)
            .setFooter({ text: `${interaction.user.username} şansını denedi.` });

        await interaction.reply({ embeds: [embed] });
    }
};