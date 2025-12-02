const { SlashCommandBuilder, AttachmentBuilder, PermissionsBitField } = require('discord.js');
const { Welcomer } = require('canvacord');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test-hosgeldin')
        .setDescription('Hoş geldin mesajını test eder.'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply("Yetkin yok.");
        
        await interaction.reply("🔄 Pro-Bot tasarımı oluşturuluyor...");

        try {
            const card = new Welcomer()
                .setUsername(interaction.user.username)
                .setDiscriminator(interaction.user.discriminator === '0' ? ' ' : interaction.user.discriminator)
                .setMemberCount(interaction.guild.memberCount)
                .setGuildName(interaction.guild.name)
                .setAvatar(interaction.user.displayAvatarURL({ extension: 'png', forceStatic: true }))
                
                // --- RENKLER ---
                .setColor("title", "#FF5500") // Turuncu Başlık
                .setColor("username-box", "transparent")
                .setColor("discriminator-box", "transparent")
                .setColor("message-box", "transparent")
                .setColor("border", "#FF5500") // Turuncu Kenar
                .setColor("avatar", "#FF5500")
                
                // --- METİNLER ---
                .setText("title", "HOŞGELDİN")
                .setText("message", "AVELLERE KATILDI")
                .setText("member-count", "- Toplam Üye: {count} -")
                
                // --- ARKA PLAN (Koyu Turuncu) ---
                .setBackground("https://wallpapers.com/images/hd/black-and-orange-background-1920-x-1080-4i32732950669273.jpg");

            const buffer = await card.build();
            const attachment = new AttachmentBuilder(buffer, { name: 'test.png' });

            await interaction.editReply({ content: "✅ İşte yeni tasarım:", files: [attachment] });

        } catch (error) {
            console.log(error);
            await interaction.editReply("❌ Hata: " + error.message);
        }
    }
};