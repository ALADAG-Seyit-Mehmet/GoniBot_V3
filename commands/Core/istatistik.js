const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('istatistik').setDescription('Bilgi'),
    async execute(i) {
        i.reply({embeds:[new EmbedBuilder().setTitle("GoniBot V3").addFields({name:"Sunucu", value:`${i.client.guilds.cache.size}`}, {name:"Kullanıcı", value:`${i.client.guilds.cache.reduce((a,b)=>a+b.memberCount,0)}`})]});
    }
};