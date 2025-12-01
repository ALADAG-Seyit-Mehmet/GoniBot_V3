const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('siralama')
        .setDescription('Sunucunun en iyilerini gösterir.')
        .addStringOption(o => o.setName('tur').setDescription('Neye bakacaksın?').setRequired(true).addChoices({name:'Para (Zenginler)', value:'para'}, {name:'Level (Efsaneler)', value:'xp'})),

    async execute(interaction) {
        const tur = interaction.options.getString('tur');
        const all = db.all();
        if (!all) return interaction.reply("Veri yok.");

        // Veriyi Filtrele ve Sırala
        const sirali = Object.keys(all)
            .filter(key => key.startsWith(`${tur}_`)) // Sadece para_ veya xp_ olanları al
            .map(key => {
                return {
                    id: key.split('_')[1],
                    val: all[key]
                };
            })
            .sort((a, b) => b.val - a.val) // Büyükten küçüğe
            .slice(0, 10); // İlk 10

        if (sirali.length === 0) return interaction.reply("Henüz kimse kasılmamış.");

        // Listeyi Yazdır
        let desc = "";
        sirali.forEach((u, i) => {
            let madalya = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**${i+1}.**`;
            desc += `${madalya} <@${u.id}> : **${u.val.toLocaleString()}**\n`;
        });

        const title = tur === 'para' ? "💰 En Zengin 10 Kişi" : "✨ En Yüksek Leveller";
        
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setColor('Gold')
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({ text: 'Sıralama anlık güncellenir.' });

        await interaction.reply({ embeds: [embed] });
    }
};