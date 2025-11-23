const { SlashCommandBuilder } = require('discord.js');
const db = require('croxydb');
module.exports = {
    data: new SlashCommandBuilder().setName('borsa').setDescription('Bakiye'),
    async execute(i) { i.reply(`💰 **${db.fetch(`para_${i.user.id}`)||0} TL**`); }
};