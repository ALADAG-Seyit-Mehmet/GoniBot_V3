const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('sil').setDescription('Temizle').addIntegerOption(o=>o.setName('sayi').setDescription('1-100').setRequired(true)),
    async execute(i) {
        if(!i.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return i.reply("Yetkin yok.");
        await i.channel.bulkDelete(i.options.getInteger('sayi'), true);
        i.reply("🧹 Silindi.").then(m => setTimeout(()=>i.deleteReply(), 3000));
    }
};