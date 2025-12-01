const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rol-menusu')
        .setDescription('Kullanıcıların rol alması için menü kurar.'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({content:'Yetkin yok.', ephemeral:true});

        // Burada örnek olarak "Renk Rolleri" veya "Oyun Rolleri" yapıyoruz.
        // Gerçek kullanımda sunucudaki Rol ID'lerini buraya yazman gerekir.
        // Şimdilik görsel bir demo oluşturuyoruz.
        
        const menu = new StringSelectMenuBuilder()
            .setCustomId('rol_al_menu')
            .setPlaceholder('Rolünü Seç...')
            .addOptions(
                { label: 'Oyun Bildirimleri', value: 'rol_oyun', emoji: '🎮', description: 'Oyun duyurularını al.' },
                { label: 'Çekiliş Bildirimleri', value: 'rol_cekilis', emoji: '🎉', description: 'Çekilişlerden haberdar ol.' },
                { label: 'Sohbet Katılımcısı', value: 'rol_sohbet', emoji: '💬', description: 'Sohbet kanallarını gör.' }
            );

        await interaction.reply({ content: '**Rol Menüsü:** Aşağıdan almak istediğin rolleri seç.', components: [new ActionRowBuilder().addComponents(menu)] });
    }
};