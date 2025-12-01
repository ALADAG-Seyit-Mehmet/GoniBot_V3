const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('GoniBot Ana Kontrol Merkezi (Dashboard)'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ Bu paneli sadece Yöneticiler kullanabilir.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('🎛️ GoniBot Kontrol Merkezi')
            .setDescription('Sunucu ayarlarını yönetmek için aşağıdaki menüden bir kategori seçin.')
            .addFields(
                { name: '🛡️ Koruma', value: 'Küfür, Reklam, Link Engel', inline: true },
                { name: '⚙️ Sistemler', value: 'Log, Global Chat, Starboard', inline: true },
                { name: '🛠️ Moderasyon', value: 'Sohbet Temizle, Kilitle', inline: true }
            )
            .setColor('DarkVividPink')
            .setImage('https://media.discordapp.net/attachments/100000000000000000/110000000000000000/banner.png?width=960&height=540') // İstersen buraya banner koyabilirsin
            .setFooter({ text: 'GoniBot v3.0 Ultimate Panel' });

        const menu = new StringSelectMenuBuilder()
            .setCustomId('panel_ana_menu')
            .setPlaceholder('Bir kategori seçin...')
            .addOptions(
                { label: 'Koruma Ayarları', description: 'Güvenlik duvarlarını yönet.', value: 'menu_koruma', emoji: '🛡️' },
                { label: 'Sistem Ayarları', description: 'Log ve kanal kurulumları.', value: 'menu_sistem', emoji: '⚙️' },
                { label: 'Moderasyon', description: 'Sohbet işlemleri.', value: 'menu_mod', emoji: '🔨' }
            );

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};