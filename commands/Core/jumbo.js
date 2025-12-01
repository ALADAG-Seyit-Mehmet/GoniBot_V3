const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jumbo')
        .setDescription('Bir emojinin büyük halini gösterir.')
        .addStringOption(o => o.setName('emoji').setDescription('Emojiyi buraya yapıştır').setRequired(true)),

    async execute(interaction) {
        const emojiInput = interaction.options.getString('emoji');

        // Emoji ID ve Animated kontrolü (Regex)
        // Formatlar: <a:name:id> veya <:name:id>
        const customEmoji = emojiInput.match(/<a?:.+:(\d+)>/);

        if (!customEmoji) {
            return interaction.reply({ content: "❌ Bu geçerli bir sunucu emojisi değil (Standart telefon emojileri büyütülemez).", ephemeral: true });
        }

        const emojiId = customEmoji[1];
        const isAnimated = emojiInput.startsWith('<a:');
        const extension = isAnimated ? '.gif' : '.png';
        const url = `https://cdn.discordapp.com/emojis/${emojiId}${extension}?size=1024`;

        const embed = new EmbedBuilder()
            .setTitle('🖼️ Emoji Büyütücü')
            .setImage(url)
            .setColor('Random')
            .setFooter({ text: 'Sağ tıkla indir!' });

        await interaction.reply({ embeds: [embed] });
    }
};