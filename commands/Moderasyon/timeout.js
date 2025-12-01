const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder().setName('timeout').setDescription('Kullanıcıyı susturur.').addUserOption(o=>o.setName('user').setDescription('Kim?').setRequired(true)).addIntegerOption(o=>o.setName('dk').setDescription('Dakika').setRequired(true)),
    async execute(i) {
        const modRol = db.fetch(`modRol_${i.guild.id}`);
        const yetkiliMi = i.member.permissions.has(PermissionsBitField.Flags.ModerateMembers);
        const modMu = modRol ? i.member.roles.cache.has(modRol) : false;

        if(!yetkiliMi && !modMu) return i.reply({content: "❌ Yetkin yok.", ephemeral: true});

        const user = i.options.getMember('user');
        if(user && user.moderatable) { 
            await user.timeout(i.options.getInteger('dk')*60000); 
            i.reply(`😶 **${user.user.tag}** susturuldu.`); 
        } else i.reply("Susturamam.");
    }
};