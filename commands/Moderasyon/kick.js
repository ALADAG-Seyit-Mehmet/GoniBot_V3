const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('kick').setDescription('At').addUserOption(o=>o.setName('user').setDescription('Kim?').setRequired(true)),
    async execute(i) {
        if(!i.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return i.reply("Yetkin yok.");
        const user = i.options.getMember('user');
        if(user && user.kickable) { await user.kick(); i.reply(`🦶 **${user.user.tag}** atıldı.`); } else i.reply("Atılamıyor.");
    }
};