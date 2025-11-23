const { SlashCommandBuilder } = require('discord.js');
const db = require('croxydb');
module.exports = {
    data: new SlashCommandBuilder().setName('klan').setDescription('Klan kur.').addSubcommand(s=>s.setName('kur').setDescription('1000 TL').addStringOption(o=>o.setName('ad').setDescription('İsim').setRequired(true))),
    async execute(i) {
        if((db.fetch(`para_${i.user.id}`)||0)<1000) return i.reply("1000 TL lazım.");
        db.add(`para_${i.user.id}`, -1000);
        db.set(`klan_${i.user.id}`, i.options.getString('ad'));
        i.reply(`🏰 **${i.options.getString('ad')}** klanı kuruldu!`);
    }
};