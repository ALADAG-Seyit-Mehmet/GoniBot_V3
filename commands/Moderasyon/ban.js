const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('ban').setDescription('Yasakla').addUserOption(o=>o.setName('user').setDescription('Kim?').setRequired(true)),
    async execute(i) {
        if(!i.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return i.reply("Yetkin yok.");
        const user = i.options.getUser('user');
        try { await i.guild.members.ban(user); i.reply(`🔨 **${user.tag}** yasaklandı.`); } catch(e){ i.reply("Yetkim yetmedi."); }
    }
};