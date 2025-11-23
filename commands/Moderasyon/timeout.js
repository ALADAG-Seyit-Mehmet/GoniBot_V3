const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('timeout').setDescription('Sustur').addUserOption(o=>o.setName('user').setDescription('Kim?').setRequired(true)).addIntegerOption(o=>o.setName('dk').setDescription('Dakika').setRequired(true)),
    async execute(i) {
        if(!i.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return i.reply("Yetkin yok.");
        const user = i.options.getMember('user');
        await user.timeout(i.options.getInteger('dk')*60000);
        i.reply(`😶 **${user.user.tag}** susturuldu.`);
    }
};