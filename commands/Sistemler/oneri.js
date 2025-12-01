const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('oneri')
        .setDescription('Sunucuya bir öneride bulun.')
        .addStringOption(o => o.setName('fikir').setDescription('Önerin nedir?').setRequired(true)),

    async execute(interaction) {
        const fikir = interaction.options.getString('fikir');

        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setTitle('💡 Yeni Öneri')
            .setDescription(fikir)
            .addFields(
                { name: '👍 Evet', value: '0', inline: true },
                { name: '👎 Hayır', value: '0', inline: true }
            )
            .setColor('Yellow')
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('oy_evet').setLabel('Katılıyorum').setStyle(ButtonStyle.Success).setEmoji('👍'),
            new ButtonBuilder().setCustomId('oy_hayir').setLabel('Katılmıyorum').setStyle(ButtonStyle.Danger).setEmoji('👎')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};