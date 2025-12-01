const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mod-rol-ayarla')
        .setDescription('Panelde bulamadıysan Moderatör rolünü buradan ayarla.')
        .addRoleOption(option => option.setName('rol').setDescription('Hangi rol Yönetici sayılsın?').setRequired(true)),

    async execute(interaction) {
        // Sadece Yöneticiler
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) 
            return interaction.reply({ content: '❌ Sadece Yöneticiler ayarlayabilir.', ephemeral: true });

        const rol = interaction.options.getRole('rol');

        // Veritabanına kaydet
        db.set(`modRol_${interaction.guild.id}`, rol.id);

        await interaction.reply({ 
            content: `✅ **İşlem Başarılı!**\nModeratör Rolü: ${rol} olarak ayarlandı.\n\nArtık bu role sahip kullanıcılar (yetkileri olmasa bile) **Ban, Kick, Timeout, Sil** komutlarını kullanabilir.` 
        });
    }
};