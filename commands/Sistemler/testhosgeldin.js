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
            const bgPath = path.join(__dirname, '../../clean_bg.png');

            const card = new Welcomer()
                .setUsername(interaction.user.username)
                .setDiscriminator(' ') 
                .setMemberCount(interaction.guild.memberCount)
                .setGuildName(interaction.guild.name)
                .setAvatar(interaction.user.displayAvatarURL({ extension: 'png', forceStatic: true }))
                
                .setColor("title", "#3498db") 
                .setColor("username-box", "transparent") 
                .setColor("discriminator-box", "transparent")
                .setColor("message-box", "transparent")
                .setColor("border", "#3498db") 
                .setColor("avatar", "#3498db")
                
                .setText("title", "HOŞGELDİN")
                .setText("message", "SUNUCUYA KATILDI")
                .setText("member-count", "- Toplam Üye: {count} -")
                
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