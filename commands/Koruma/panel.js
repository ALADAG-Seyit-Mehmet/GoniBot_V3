const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Sunucu Yönetim Merkezi'),

    async execute(interaction) {
        // --- YETKİ KONTROLÜ ---
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ 
                content: '⛔ **Erişim Reddedildi!**\nBu paneli açmak için sunucuda **YÖNETİCİ** yetkisine sahip olmalısın.', 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.guild.name} Kontrol Merkezi`, iconURL: interaction.guild.iconURL() })
            .setDescription(`👋 **Hoş geldin Şef!**\nSunucunu yönetmek hiç bu kadar kolay olmamıştı. Aşağıdaki menüden işlem yapmak istediğin kategoriyi seç.`)
            .addFields(
                { name: '🛡️ Koruma Duvarı', value: '`Küfür`, `Reklam`, `Link` engellerini yönet.', inline: true },
                { name: '⚙️ Sistem Ayarları', value: '`Log`, `Global Chat` kanallarını ayarla.', inline: true },
                { name: '🔨 Moderasyon', value: '`Sil`, `Kilitle`, `Aç` işlemlerini yap.', inline: true }
            )
            .setImage('https://media.discordapp.net/attachments/1033464536838328391/1085611425624670268/panel_banner.png')
            .setColor('DarkButNotBlack')
            .setTimestamp();

        const menu = new StringSelectMenuBuilder()
            .setCustomId('panel_ana_menu')
            .setPlaceholder('⚡ İşlem Menüsünü Aç')
            .addOptions(
                { label: 'Koruma Ayarları', value: 'menu_koruma', emoji: '🛡️', description: 'Güvenlik filtrelerini aç/kapat.' },
                { label: 'Sistem Kurulumu', value: 'menu_sistem', emoji: '⚙️', description: 'Kanal ve log ayarları.' },
                { label: 'Moderasyon', value: 'menu_mod', emoji: '🔨', description: 'Sohbet yönetimi.' }
            );

        await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] });
    },
};