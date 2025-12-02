const { SlashCommandBuilder, AttachmentBuilder, PermissionsBitField } = require('discord.js');
const { Welcomer } = require('canvacord');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test-hosgeldin')
        .setDescription('Hoş geldin mesajını manuel olarak test eder.'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) 
            return interaction.reply({ content: '❌ Yetkin yok.', ephemeral: true });

        await interaction.reply("🔄 Test başlatılıyor... Lütfen bekleyin.");

        const welcomeChannelID = db.fetch(`hosgeldinKanal_${interaction.guild.id}`);
        if (!welcomeChannelID) {
            return interaction.editReply("❌ **HATA:** Hoş geldin kanalı veritabanında YOK. Önce `/hosgeldin-ayarla` kullan.");
        }

        try {
            const channel = await interaction.guild.channels.fetch(welcomeChannelID);
            if (!channel) return interaction.editReply("❌ **HATA:** Kanal bulunamadı (Silinmiş olabilir).");

            // İzin Kontrolü
            const botPerms = channel.permissionsFor(interaction.guild.members.me);
            if (!botPerms.has(PermissionsBitField.Flags.SendMessages)) 
                return interaction.editReply(`❌ **HATA:** <#${channel.id}> kanalına MESAJ ATMA yetkim yok!`);
            if (!botPerms.has(PermissionsBitField.Flags.AttachFiles)) 
                return interaction.editReply(`❌ **HATA:** <#${channel.id}> kanalına DOSYA/RESİM YÜKLEME yetkim yok!`);

            // Resim Oluştur
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
                .setText("title", "TEST MESAJI")
                .setText("message", "Simülasyon Başarılı!")
                .setBackground("https://wallpapers.com/images/featured/dark-orange-background-309k975769784k30.jpg");

            const buffer = await card.build();
            const attachment = new AttachmentBuilder(buffer, { name: 'welcome-test.png' });

            await channel.send({ content: `✅ **TEST BAŞARILI!** Kanal ayarları doğru.`, files: [attachment] });
            await interaction.editReply("✅ Test mesajı kanala gönderildi! Orayı kontrol et.");

        } catch (error) {
            console.log(error);
            await interaction.editReply(`💥 **KRİTİK HATA:**\n\`${error.message}\``);
        }
    }
};