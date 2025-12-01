const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gunluk')
        .setDescription('Günlük maaşını al (24 saatte bir).'),

    async execute(interaction) {
        const sonOdul = db.fetch(`gunlukSure_${interaction.user.id}`);
        const beklemeSuresi = 86400000; // 24 Saat (Milisaniye)

        if (sonOdul !== null && beklemeSuresi - (Date.now() - sonOdul) > 0) {
            const kalan = beklemeSuresi - (Date.now() - sonOdul);
            const saat = Math.floor(kalan / 3600000);
            const dakika = Math.floor((kalan % 3600000) / 60000);
            return interaction.reply({ content: `⏳ **Acele etme!** Maaşını almak için **${saat} saat ${dakika} dakika** beklemelisin.`, ephemeral: true });
        }

        // Rastgele Para (500 - 1000 arası)
        const odul = Math.floor(Math.random() * 500) + 500;
        
        db.add(`para_${interaction.user.id}`, odul);
        db.set(`gunlukSure_${interaction.user.id}`, Date.now());

        const embed = new EmbedBuilder()
            .setTitle('💸 Günlük Maaş Yattı!')
            .setDescription(`Bankana **${odul} TL** eklendi.\nYarın yine gel!`)
            .setColor('Green')
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/2489/2489296.png');

        await interaction.reply({ embeds: [embed] });
    },
};