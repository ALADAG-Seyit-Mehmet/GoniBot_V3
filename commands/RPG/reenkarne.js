const { SlashCommandBuilder } = require('discord.js');
const db = require('croxydb');
module.exports = {
    data: new SlashCommandBuilder().setName('reenkarne').setDescription('Sıfırlan ve güçlen.'),
    async execute(i) {
        db.delete(`xp_${i.user.id}`);
        db.delete(`para_${i.user.id}`);
        db.add(`reenkarnasyon_${i.user.id}`, 1);
        try { await i.member.setNickname(`[KADİM] ${i.user.username}`); } catch(e){}
        i.reply("✨ Yeniden doğdun! (Kadim Rütbesi)");
    }
};