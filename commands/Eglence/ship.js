const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('İki kişi arasındaki aşk uyumunu ölçer.')
        .addUserOption(o => o.setName('kisi1').setDescription('İlk kişi').setRequired(true))
        .addUserOption(o => o.setName('kisi2').setDescription('İkinci kişi (Boş bırakırsan sen)')),

    async execute(interaction) {
        const user1 = interaction.options.getUser('kisi1');
        const user2 = interaction.options.getUser('kisi2') || interaction.user;

        // Rastgele Yüzde
        const ask = Math.floor(Math.random() * 101);
        
        // Bar Oluşturma (🟩🟩⬜⬜)
        const dolu = Math.floor(ask / 10);
        const bar = '🟩'.repeat(dolu) + '⬜'.repeat(10 - dolu);

        let yorum = "";
        let renk = "";

        if (ask < 20) { yorum = "💔 İmkansız... Sadece arkadaş kalın."; renk = "Red"; }
        else if (ask < 50) { yorum = "😐 Belki biraz zorlarsan olur."; renk = "Orange"; }
        else if (ask < 80) { yorum = "❤️ Güzel bir çift olabilirsiniz!"; renk = "Yellow"; }
        else { yorum = "💍 EVLENİN HEMEN! Ruh eşisiniz!"; renk = "Green"; }

        const embed = new EmbedBuilder()
            .setTitle('💘 Aşk Ölçer')
            .setDescription(`🔻 **${user1}** \n🔺 **${user2}**\n\n☁️ **Uyumluluk:** %${ask}\n${bar}\n\n💬 **Yorum:** ${yorum}`)
            .setColor(renk)
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/2589/2589175.png');

        await interaction.reply({ embeds: [embed] });
    }
};