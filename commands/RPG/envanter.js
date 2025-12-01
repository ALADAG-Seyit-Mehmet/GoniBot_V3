const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('croxydb');
module.exports = {
    data: new SlashCommandBuilder().setName('envanter').setDescription('Çanta'),
    async execute(i) {
        const env = db.fetch(`envanter_${i.user.id}`) || [];
        if(env.length===0) return i.reply("Çantan boş.");
        const counts = {}; env.forEach(x => { counts[x] = (counts[x] || 0) + 1; });
        const list = Object.keys(counts).map(k => `▪️ **${k}** (x${counts[k]})`).join('\n');
        i.reply({embeds:[new EmbedBuilder().setTitle("🎒 Envanter").setDescription(list).setColor("Gold")]});
    }
};