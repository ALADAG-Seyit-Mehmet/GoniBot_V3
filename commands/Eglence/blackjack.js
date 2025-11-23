const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const db = require('croxydb');
module.exports = {
    data: new SlashCommandBuilder().setName('blackjack').setDescription('21 Oyna').addIntegerOption(o=>o.setName('bahis').setDescription('Miktar').setRequired(true)),
    async execute(i) {
        const bahis = i.options.getInteger('bahis');
        if((db.fetch(`para_${i.user.id}`)||0) < bahis) return i.reply("Paran yok.");
        db.add(`para_${i.user.id}`, -bahis);
        let p=Math.floor(Math.random()*10)+5, d=Math.floor(Math.random()*10)+5;
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('bj_al').setLabel('Kart').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId('bj_dur').setLabel('Dur').setStyle(ButtonStyle.Danger));
        const msg = await i.reply({content:`Sen: ${p} | Kasa: ?`, components:[row], fetchReply:true});
        const col = msg.createMessageComponentCollector({time:30000});
        col.on('collect', async btn => {
            if(btn.user.id!==i.user.id) return;
            if(btn.customId==='bj_al') {
                p+=Math.floor(Math.random()*10)+1;
                if(p>21) { col.stop(); btn.update({content:`Patladın (${p})! Kaybettin.`, components:[]}); }
                else btn.update({content:`Sen: ${p} | Kasa: ?`});
            } else {
                while(d<17) d+=Math.floor(Math.random()*10)+1;
                col.stop();
                const w = (d>21||p>d);
                if(w) db.add(`para_${i.user.id}`, bahis*2);
                btn.update({content:`Sen: ${p} | Kasa: ${d} -> ${w?"Kazandın":"Kaybettin"}`, components:[]});
            }
        });
    }
};