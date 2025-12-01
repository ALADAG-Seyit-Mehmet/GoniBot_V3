const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cekilis')
        .setDescription('Ödüllü çekiliş başlatır.')
        .addStringOption(o => o.setName('odul').setDescription('Ne veriyorsun?').setRequired(true))
        .addIntegerOption(o => o.setName('sure').setDescription('Kaç dakika sürecek?').setRequired(true)),

    async execute(interaction) {
        const odul = interaction.options.getString('odul');
        const sure = interaction.options.getInteger('sure');
        const bitis = Date.now() + (sure * 60000);
        const cekilisID = Date.now(); // Benzersiz ID

        const embed = new EmbedBuilder()
            .setTitle('🎉 ÇEKİLİŞ BAŞLADI!')
            .setDescription(`**Ödül:** ${odul}\n**Süre:** ${sure} Dakika\n\n👇 **Katılmak için butona bas!**`)
            .setColor('Gold')
            .setFooter({ text: `Bitiş: ${new Date(bitis).toLocaleTimeString()}` });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`cekilis_katil_${cekilisID}`).setLabel('Çekilişe Katıl (0)').setStyle(ButtonStyle.Success).setEmoji('🎉')
        );

        await interaction.reply({ embeds: [embed], components: [row] });

        // Veritabanına kaydet
        db.set(`cekilis_${cekilisID}`, { odul: odul, kanal: interaction.channel.id, mesaj: null, katilanlar: [] });

        // Süre bitimini ayarla
        setTimeout(async () => {
            const data = db.fetch(`cekilis_${cekilisID}`);
            if (!data) return;
            
            const list = data.katilanlar;
            const kazanan = list.length > 0 ? list[Math.floor(Math.random() * list.length)] : null;
            
            const sonEmbed = new EmbedBuilder()
                .setTitle('🎉 ÇEKİLİŞ SONA ERDİ')
                .setDescription(`**Ödül:** ${odul}\n\n👑 **Kazanan:** ${kazanan ? `<@${kazanan}>` : "Kimse katılmadı..."}`)
                .setColor(kazanan ? 'Green' : 'Red');

            await interaction.channel.send({ content: kazanan ? `Tebrikler <@${kazanan}>!` : "Kazanan yok.", embeds: [sonEmbed] });
            db.delete(`cekilis_${cekilisID}`);
        }, sure * 60000);
    }
};