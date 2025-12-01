const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('matematik')
        .setDescription('Hızlı olan kazanır!'),

    async execute(interaction) {
        // Rastgele İşlem
        const s1 = Math.floor(Math.random() * 50) + 10;
        const s2 = Math.floor(Math.random() * 20) + 5;
        const islemTipi = Math.random() > 0.5 ? '+' : '-'; // Basit tutalım
        const cevap = islemTipi === '+' ? s1 + s2 : s1 - s2;
        const odul = 150;

        await interaction.reply(`🧮 **İLK BİLEN KAZANIR!**\n\n# ${s1} ${islemTipi} ${s2} = ?`);

        const filter = m => !m.author.bot && m.content == cevap;
        const collector = interaction.channel.createMessageCollector({ filter, time: 15000, max: 1 });

        collector.on('collect', m => {
            m.reply(`🎉 **Tebrikler!** Doğru cevap: **${cevap}**. Hesabına **${odul} TL** yattı.`);
            db.add(`para_${m.author.id}`, odul);
        });

        collector.on('end', collected => {
            if (collected.size === 0) interaction.followUp(`⏰ Süre doldu! Cevap **${cevap}** idi.`);
        });
    }
};