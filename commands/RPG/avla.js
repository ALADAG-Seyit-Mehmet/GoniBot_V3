const { SlashCommandBuilder } = require('discord.js');
const db = require('croxydb');
module.exports = {
    data: new SlashCommandBuilder().setName('avla').setDescription('Avlan'),
    async execute(i) {
        db.add(`xp_${i.user.id}`, 50);
        i.reply("⚔️ Avlandın! +50 XP");
    }
};