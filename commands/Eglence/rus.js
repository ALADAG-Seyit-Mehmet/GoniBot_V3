const { SlashCommandBuilder } = require('discord.js');
const db = require('croxydb');
module.exports = {
    data: new SlashCommandBuilder().setName('rus-ruleti').setDescription('Bam!'),
    async execute(i) {
        if(Math.random()>0.8) { await i.member.timeout(60000); i.reply("💥 BAM! Susturuldun."); }
        else { db.add(`para_${i.user.id}`, 100); i.reply("💨 Yaşadın. +100 TL"); }
    }
};