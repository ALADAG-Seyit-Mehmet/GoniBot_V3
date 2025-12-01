const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avla')
        .setDescription('Zindana gir ve savaş.'),

    async execute(interaction) {
        // Cooldown
        /* (İstersen buraya cooldown ekleyebilirsin) */

        // Canavarlar ve Ganimetler
        const mobs = [
            { ad: "Goblin", hp: 50, img: "https://i.imgur.com/5hM4Wj1.png", xp: 10, drop: "Paslı Bıçak" },
            { ad: "Ork Reisi", hp: 150, img: "https://i.imgur.com/8Yk9XzM.png", xp: 30, drop: "Ork Dişi" },
            { ad: "Karanlık Ejderha", hp: 500, img: "https://i.imgur.com/pB5Kk1s.png", xp: 100, drop: "Ejderha Pulu" }
        ];

        // Rastgele Seç (%60 Goblin, %30 Ork, %10 Ejderha gibi ayarlanabilir, şimdilik rastgele)
        const mob = mobs[Math.floor(Math.random() * mobs.length)];
        
        // Verileri İşle
        db.add(`xp_${interaction.user.id}`, mob.xp);
        db.push(`envanter_${interaction.user.id}`, mob.drop);

        // Renk Belirle (Zorluğa göre)
        let renk = "Green";
        if (mob.hp > 100) renk = "Orange";
        if (mob.hp > 300) renk = "Red";

        const embed = new EmbedBuilder()
            .setTitle(`⚔️ SAVAŞ RAPORU: ${mob.ad}`)
            .setDescription(`
                Zindanın derinliklerinde vahşi bir **${mob.ad}** ile karşılaştın!
                Uzun süren bir dövüşten sonra onu alt ettin.
                
                🩸 **Canavar Canı:** ${mob.hp} HP
                ✨ **Kazanılan XP:** +${mob.xp}
                🎒 **Ganimet:** **${mob.drop}**
            `)
            .setThumbnail(mob.img) // Canavar resmi (Varsayılan linkler kırık olabilir, kendi linklerini koyabilirsin)
            .setColor(renk)
            .setFooter({ text: `${interaction.user.username} kahramanca savaştı.` });

        await interaction.reply({ embeds: [embed] });
    }
};