const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder().setName('kick').setDescription('Kullanıcıyı atar.').addUserOption(o=>o.setName('user').setDescription('Kim?').setRequired(true)),
    async execute(i) {
        const modRol = db.fetch(`modRol_${i.guild.id}`);
        const yetkiliMi = i.member.permissions.has(PermissionsBitField.Flags.KickMembers);
        const modMu = modRol ? i.member.roles.cache.has(modRol) : false;

        if(!yetkiliMi && !modMu) return i.reply({content: "❌ Yetkin yok.", ephemeral: true});

        const user = i.options.getMember('user');
        if(user && user.kickable) { await user.kick(); i.reply(`🦶 **${user.user.tag}** atıldı.`); } else i.reply("Atılamıyor.");
    }
};