const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('croxydb');
module.exports = {
    data: new SlashCommandBuilder().setName('evlen').setDescription('Teklif et').addUserOption(o=>o.setName('kisi').setDescription('Kim?').setRequired(true)),
    async execute(i) {
        const k = i.options.getUser('kisi');
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('evet').setLabel('EVET').setStyle(ButtonStyle.Success));
        const msg = await i.reply({content:`${k}, **${i.user.username}** evlenmek istiyor!`, components:[row], fetchReply:true});
        msg.createMessageComponentCollector({filter:b=>b.user.id===k.id, time:30000}).on('collect', b=>{
            db.set(`partner_${i.user.id}`, k.id); db.set(`partner_${k.id}`, i.user.id);
            b.update({content:"💍 Evlendiler!", components:[]});
        });
    }
};