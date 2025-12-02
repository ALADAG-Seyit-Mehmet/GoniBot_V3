const { SlashCommandBuilder, AttachmentBuilder, PermissionsBitField } = require('discord.js');
const { Welcomer } = require('canvacord');
const db = require('croxydb');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test-hosgeldin')
        .setDescription('Hoş geldin mesajını test eder.'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply("Yetkin yok.");
        
        await interaction.reply("🔄 Yerel dosya ile oluşturuluyor...");

        try {
            // Yerel resim yolunu belirle (commands/Sistemler/../../background.png)
            const bgPath = path.join(__dirname, '../../background.png');

            const card = new Welcomer()
                .setUsername(interaction.user.username)
                .setDiscriminator(false) 
                .setMemberCount(interaction.guild.memberCount)
                .setGuildName(interaction.guild.name)
                .setAvatar(interaction.user.displayAvatarURL({ extension: 'png', forceStatic: true }))
                
                .setColor("title", "#FF5500") 
                .setColor("username-box", "#00000000") 
                .setColor("discriminator-box", "#00000000")
                .setColor("message-box", "#00000000")
                .setColor("border", "#FF5500") 
                .setColor("avatar", "#FF5500")
                
                .setText("title", "HOŞGELDİN")
                .setText("message", "AVELLERE KATILDI")
                .setText("member-count", "- Üye Sayısı: {count} -")
                
                // Yerel Dosya
                .setBackground(bgPath);

            const buffer = await card.build();
            const attachment = new AttachmentBuilder(buffer, { name: 'test.png' });

            await interaction.editReply({ content: "✅ İşte sonuç:", files: [attachment] });

        } catch (error) {
            console.log(error);
            await interaction.editReply("❌ Hata: " + error.message);
        }
    }
};