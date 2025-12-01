const { SlashCommandBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('biyografi')
        .setDescription('Profil kartına görünecek sözü ayarla.')
        .addStringOption(o => o.setName('yazi').setDescription('Kendini anlat (Max 100 karakter)').setRequired(true)),

    async execute(interaction) {
        const yazi = interaction.options.getString('yazi');
        
        if (yazi.length > 100) return interaction.reply({ content: '❌ Biyografi çok uzun! Maksimum 100 karakter.', ephemeral: true });

        db.set(`biyografi_${interaction.user.id}`, yazi);
        interaction.reply({ content: `✅ **Biyografin güncellendi!**\nArtık /istatistik komutunda şu yazacak:\n> *"${yazi}"*`, ephemeral: true });
    }
};