const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hosgeldin-ayarla')
        .setDescription('Panelde çıkmayan kanalları buradan manuel ayarla.')
        .addChannelOption(option => 
            option.setName('kanal')
            .setDescription('Hoş geldin mesajları nereye gitsin?')
            .setRequired(true)),

    async execute(interaction) {
        // Sadece Yönetici
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) 
            return interaction.reply({ content: '❌ Sadece Yöneticiler ayarlayabilir.', ephemeral: true });

        const kanal = interaction.options.getChannel('kanal');

        // Kanal Yazı Kanalı mı? (Ses kanalına resim atamaz)
        if (!kanal.isTextBased()) {
            return interaction.reply({ content: '❌ Lütfen bir **Yazı Kanalı** seç. Ses kanalına mesaj atamam.', ephemeral: true });
        }

        // Veritabanına kaydet (Paneldekiyle aynı anahtarı kullanıyoruz)
        db.set(`hosgeldinKanal_${interaction.guild.id}`, kanal.id);

        await interaction.reply({ 
            content: `✅ **İşlem Tamam!**\nHoş Geldin kanalı başarıyla ${kanal} olarak ayarlandı.\nArtık gelenler buraya resimli şekilde düşecek.` 
        });
    }
};