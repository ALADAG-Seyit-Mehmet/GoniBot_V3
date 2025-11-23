const { SlashCommandBuilder } = require('discord.js');
const db = require('croxydb');
module.exports = {
    data: new SlashCommandBuilder().setName('global-kur').setDescription('Chat'),
    async execute(i) { db.set(`globalKanal_${i.guild.id}`, i.channel.id); i.reply("🌐 Global Chat!"); }
};