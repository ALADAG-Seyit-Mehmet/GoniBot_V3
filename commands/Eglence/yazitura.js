const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yazi-tura')
        .setDescription('Havaya para atar.'),

    async execute(interaction) {
        const sonuc = Math.random() > 0.5 ? 'YAZI' : 'TURA';
        const resim = sonuc === 'YAZI' 
            ? 'https://upload.wikimedia.org/wikipedia/commons/6/64/1TL_obverse.png' 
            : 'https://upload.wikimedia.org/wikipedia/commons/c/cd/1TL_reverse.png';

        const embed = new EmbedBuilder()
            .setTitle('🪙 Para Atıldı!')
            .setDescription(`Sonuç: **${sonuc}**`)
            .setThumbnail(resim)
            .setColor('Yellow');

        await interaction.reply({ embeds: [embed] });
    }
};