const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yardım')
        .setDescription('GoniBot Komut Merkezi'),

    async execute(interaction) {
        const banner = "https://media.discordapp.net/attachments/1033464536838328391/1085611425624670268/panel_banner.png";
        
        const embed = new EmbedBuilder()
            .setTitle('🤖 GoniBot Yardım Merkezi')
            .setDescription(`
                > **Merhaba ${interaction.user}!**
                > Kategoriler arasında geçiş yapmak için aşağıdaki butonları kullan.
            `)
            .addFields(
                { name: '🔗 Bağlantılar', value: '[Destek Sunucusu](https://discord.gg) | [Beni Ekle](https://discord.com)', inline: false }
            )
            .setImage(banner)
            .setColor('DarkVividPink')
            .setThumbnail(interaction.client.user.displayAvatarURL());

        // BUTONLAR (Dropdown yerine)
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('help_eco').setLabel('Ekonomi').setStyle(ButtonStyle.Success).setEmoji('💎'),
            new ButtonBuilder().setCustomId('help_rpg').setLabel('RPG & Savaş').setStyle(ButtonStyle.Danger).setEmoji('⚔️'),
            new ButtonBuilder().setCustomId('help_mod').setLabel('Moderasyon').setStyle(ButtonStyle.Secondary).setEmoji('🛡️'),
            new ButtonBuilder().setCustomId('help_fun').setLabel('Eğlence').setStyle(ButtonStyle.Primary).setEmoji('🎲')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};