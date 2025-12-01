const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gonder')
        .setDescription('Başka birine para gönder.')
        .addUserOption(o => o.setName('kisi').setDescription('Kime?').setRequired(true))
        .addIntegerOption(o => o.setName('miktar').setDescription('Kaç para?').setRequired(true)),

    async execute(interaction) {
        const alici = interaction.options.getUser('kisi');
        const miktar = interaction.options.getInteger('miktar');
        const gonderenPara = db.fetch(`para_${interaction.user.id}`) || 0;

        if (alici.id === interaction.user.id) return interaction.reply({ content: 'Kendine para gönderemezsin (Keşke olsa).', ephemeral: true });
        if (alici.bot) return interaction.reply({ content: 'Botların paraya ihtiyacı yok.', ephemeral: true });
        if (miktar <= 0) return interaction.reply({ content: 'Lütfen 0\'dan büyük bir sayı gir.', ephemeral: true });
        if (gonderenPara < miktar) return interaction.reply({ content: '💸 **Yetersiz Bakiye!** Fakirsin...', ephemeral: true });

        // İşlemi Yap
        db.add(`para_${interaction.user.id}`, -miktar);
        db.add(`para_${alici.id}`, miktar);

        const embed = new EmbedBuilder()
            .setTitle('📤 Para Transferi Başarılı')
            .addFields(
                { name: 'Gönderen', value: `${interaction.user}`, inline: true },
                { name: 'Alan', value: `${alici}`, inline: true },
                { name: 'Tutar', value: `**${miktar.toLocaleString()} TL**`, inline: true }
            )
            .setColor('Gold')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};