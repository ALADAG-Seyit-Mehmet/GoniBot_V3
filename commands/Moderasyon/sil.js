const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder().setName('sil').setDescription('Mesajları temizler.').addIntegerOption(o=>o.setName('sayi').setDescription('1-100').setRequired(true)),
    async execute(i) {
        const modRol = db.fetch(`modRol_${i.guild.id}`);
        const yetkiliMi = i.member.permissions.has(PermissionsBitField.Flags.ManageMessages);
        const modMu = modRol ? i.member.roles.cache.has(modRol) : false;

        if(!yetkiliMi && !modMu) return i.reply({content: "❌ Yetkin yok.", ephemeral: true});

        await i.channel.bulkDelete(i.options.getInteger('sayi'), true);
        i.reply({content: "🧹 Silindi.", ephemeral: true});
    }
};