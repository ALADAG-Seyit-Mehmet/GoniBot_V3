const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yardım')
        .setDescription('GoniBot Komut Merkezi'),

    async execute(interaction) {
        // Banner Görseli (Değiştirebilirsin)
        const banner = "https://media.discordapp.net/attachments/1033464536838328391/1085611425624670268/panel_banner.png";
        
        const embed = new EmbedBuilder()
            .setTitle('🤖 GoniBot Yardım Merkezi')
            .setDescription(`
                > **Merhaba ${interaction.user}!**
                > GoniBot, sunucunu yönetmek ve eğlendirmek için tasarlandı.
                
                👇 **Aşağıdaki menüden bir kategori seçerek komutları incele.**
            `)
            .addFields(
                { name: '🔗 Bağlantılar', value: '[Destek Sunucusu](https://discord.gg) | [Beni Ekle](https://discord.com)', inline: false }
            )
            .setImage(banner)
            .setColor('DarkVividPink')
            .setThumbnail(interaction.client.user.displayAvatarURL());

        const menu = new StringSelectMenuBuilder()
            .setCustomId('yardim_menu')
            .setPlaceholder('📂 Bir Kategori Seç...')
            .addOptions(
                { label: 'Ekonomi & Ticaret', description: 'Para, borsa ve alışveriş.', value: 'help_eco', emoji: '💎' },
                { label: 'RPG & Savaş', description: 'Level, klan ve macera.', value: 'help_rpg', emoji: '⚔️' },
                { label: 'Moderasyon & Koruma', description: 'Sunucu güvenliği.', value: 'help_mod', emoji: '🛡️' },
                { label: 'Eğlence & Sosyal', description: 'Oyunlar ve etkileşim.', value: 'help_fun', emoji: '🎲' }
            );

        await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] });
    },
};