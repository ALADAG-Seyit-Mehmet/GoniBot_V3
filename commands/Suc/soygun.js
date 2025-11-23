const { SlashCommandBuilder } = require('discord.js');
const db = require('croxydb');
module.exports = {
    data: new SlashCommandBuilder().setName('soygun').setDescription('Çal').addUserOption(o=>o.setName('user').setDescription('Kim?').setRequired(true)),
    async execute(i) {
        if(Math.random()>0.6) { db.add(`para_${i.user.id}`, 200); i.reply("🥷 Soydun! +200 TL"); }
        else { db.set(`hapis_${i.user.id}`, Date.now()+300000); i.reply("🚨 HAPİS! (5 dk)"); }
    }
};