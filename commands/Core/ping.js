const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('ping').setDescription('Gecikme'),
    async execute(i) { i.reply(`🏓 Pong! ${i.client.ws.ping}ms`); }
};