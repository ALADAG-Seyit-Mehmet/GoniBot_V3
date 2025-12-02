const { SlashCommandBuilder, AttachmentBuilder, PermissionsBitField } = require('discord.js');
const { Welcomer } = require('canvacord');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test-hosgeldin')
        .setDescription('Hoş geldin mesajını test eder.'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply("Yetkin yok.");
        
        await interaction.reply("🔄 Resim oluşturuluyor (Tenor)...");

        try {
            const card = new Welcomer()
                .setUsername(interaction.user.username)
                .setDiscriminator(interaction.user.discriminator === '0' ? ' ' : interaction.user.discriminator)
                .setMemberCount(interaction.guild.memberCount)
                .setGuildName(interaction.guild.name)
                .setAvatar(interaction.user.displayAvatarURL({ extension: 'png', forceStatic: true }))
                .setColor("title", "#ffffff")
                .setColor("username-box", "transparent")
                .setColor("discriminator-box", "transparent")
                .setColor("message-box", "transparent")
                .setColor("border", "#ff5500")
                .setColor("avatar", "#ff5500")
                .setText("title", "TEST BAŞARILI")
                .setText("message", "Görsel Çalışıyor!")
                // SENİN VERDİĞİN LİNK
                .setBackground("https://media.tenor.com/6yWED-oo_sUAAAAd/welcome-anime.gif");

            const buffer = await card.build();
            const attachment = new AttachmentBuilder(buffer, { name: 'test.png' });

            await interaction.editReply({ content: "✅ İşte sonuç:", files: [attachment] });

        } catch (error) {
            console.log(error);
            await interaction.editReply("❌ Hata: " + error.message);
        }
    }
};