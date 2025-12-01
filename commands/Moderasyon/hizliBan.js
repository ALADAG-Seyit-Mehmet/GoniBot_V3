const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionsBitField } = require('discord.js');
module.exports = {
    data: new ContextMenuCommandBuilder().setName('Hızlı Ban').setType(ApplicationCommandType.User),
    async execute(i) {
        if(!i.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return i.reply({content:"Yetkin yok.", ephemeral:true});
        const target = i.targetUser;
        const mem = i.guild.members.cache.get(target.id);
        if(mem && !mem.bannable) return i.reply({content:"Banlanamaz.", ephemeral:true});
        await i.guild.members.ban(target);
        i.reply(`🚨 **${target.tag}** sağ tık ile banlandı.`);
    }
};